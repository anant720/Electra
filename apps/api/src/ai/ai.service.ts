// =============================================================================
// ELECTRA — AI Engine Service
// Operationalizes Phase 5: 18-system intelligence architecture
// =============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerativeModel } from '@google/generative-ai';
import { createHash } from 'crypto';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CivicQueryContext, QueryClassification, RoutingDecision, ElectraAIResponse,
  ResponseMode, VolatilityClass, PersonaCode,
} from '@electra/types';
import { PERSONA_PROFILES } from '@electra/types';
import { QueryClassifierService } from './query-classifier.service';
import { PromptAssemblerService } from './prompt-assembler.service';
import { SafetyMiddlewareService } from './safety-middleware.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly geminiKeys: string[];
  private currentKeyIndex = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly classifier: QueryClassifierService,
    private readonly promptAssembler: PromptAssemblerService,
    private readonly safety: SafetyMiddlewareService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    const keysEnv = this.config.get<string>('GEMINI_API_KEY', '');
    this.geminiKeys = keysEnv.split(',').map(k => k.trim()).filter(k => k.length > 0);
    if (this.geminiKeys.length === 0) {
      this.logger.warn('No GEMINI_API_KEY provided. AI operations will fail.');
    }
  }

  // ─── Main Query Entry Point ───────────────────────────────────────────────
  async query(context: CivicQueryContext): Promise<ElectraAIResponse> {
    this.logger.log(`📥 AI Query Received: "${context.rawQuery}" (Country: ${context.countryCode}, Persona: ${context.personaCode})`);
    const startTime = Date.now();

    // 1. Safety pre-check
    const safetyCheck = this.safety.preCheck(context.rawQuery);
    if (safetyCheck.blocked) {
      return this.buildSafetyBlockedResponse(safetyCheck.reason, startTime);
    }

    // 2. Classify query
    const classification = await this.classifier.classify(context);

    // 3. Emergency fast-path: bypass AI
    if (classification.isEmergency && classification.scenario) {
      return this.emergencyFastPath(context, classification, startTime);
    }

    // 4. Route to response mode
    const routing = await this.buildRoutingDecision(context, classification);

    // 5. Retrieve civic axioms
    const axioms = await this.retrieveAxioms(routing.axiomKeys, context.countryCode!);

    // 6. Build prompt
    const prompt = this.promptAssembler.assemble(context, classification, axioms, routing);
    const promptHash = createHash('sha256').update(prompt).digest('hex');

    // 7. Cache check
    const cached = await this.cache.get<ElectraAIResponse>(promptHash);
    if (cached && routing.mode !== 'EMERGENCY_MODE') {
      this.logger.debug(`Cache HIT: ${promptHash.substring(0, 8)}`);
      return cached;
    }

    // 8. AI inference (deterministic settings)
    let aiContent = '';
    try {
      aiContent = await this.callGemini(prompt);
    } catch (err) {
      this.logger.error('Gemini inference failed', err);
      return this.buildFallbackResponse(context, axioms, startTime, promptHash);
    }

    // 9. Safety post-check
    const postCheck = this.safety.postCheck(aiContent);
    if (postCheck.hallucination) {
      this.logger.warn(`Hallucination detected: ${promptHash.substring(0, 8)}`);
      await this.logQuery(context, promptHash, classification, startTime, true, false);
      return this.buildFallbackResponse(context, axioms, startTime, promptHash);
    }

    // 10. Build response
    const volatility = this.determineVolatility(axioms);
    const response: ElectraAIResponse = {
      content: aiContent,
      mode: routing.mode,
      confidenceScore: this.computeConfidence(axioms, classification),
      volatility,
      sources: this.buildSourceRefs(axioms),
      hasLegalCaution: classification.intent === 'ELIGIBILITY' || volatility === 'HIGH',
      verifyUrl: axioms[0]?.source?.url,
      disclaimer: this.buildDisclaimer(volatility, context.countryCode),
      promptHash,
      latencyMs: Date.now() - startTime,
    };

    // 11. Cache response
    const ttl = this.cacheTtl(volatility);
    if (ttl > 0) await this.cache.set(promptHash, response, ttl);

    // 12. Log query
    await this.logQuery(context, promptHash, classification, startTime, false, false, response);

    return response;
  }

  // ─── Emergency Fast Path ──────────────────────────────────────────────────
  private async emergencyFastPath(
    context: CivicQueryContext,
    classification: QueryClassification,
    startTime: number,
  ): Promise<ElectraAIResponse> {
    // Use ResolutionPath for emergency fast-path (emergencyResolution doesn't exist in schema)
    const paths = await this.prisma.resolutionPath.findMany({
      where: {
        scenario: { code: classification.scenario! },
        country: { code: context.countryCode! },
      },
      orderBy: { stepNumber: 'asc' },
    });

    const content = paths.length
      ? paths.map((p, i) => `${i + 1}. ${p.stepText}`).join('\n')
      : `Contact the official voter helpline for ${context.countryCode} immediately. This is an election emergency.`;

    return {
      content,
      mode: 'EMERGENCY_MODE',
      confidenceScore: 1.0, // Deterministic — maximum confidence
      volatility: 'STABLE',
      sources: [],
      hasLegalCaution: false,
      disclaimer: 'Emergency guidance — verify with official helpline.',
      promptHash: `emergency_${classification.scenario}_${context.countryCode}`,
      latencyMs: Date.now() - startTime,
    };
  }

  // ─── Gemini API Call with Key Rotation ─────────────────────────────────────
  private async callGemini(prompt: string, attempt = 1): Promise<string> {
    if (this.geminiKeys.length === 0) {
      throw new Error('No Gemini API keys configured');
    }

    const currentKey = this.geminiKeys[this.currentKeyIndex];
    const geminiClient = new GoogleGenerativeAI(currentKey);

    const modelName = this.config.get<string>('GEMINI_MODEL', 'gemini-flash-latest');
    const model = geminiClient.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: parseFloat(this.config.get<string>('GEMINI_TEMPERATURE', '0.1')),
        maxOutputTokens: parseInt(this.config.get<string>('GEMINI_MAX_TOKENS', '1024')),
        topP: 0.8,
        topK: 20,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
    });

    try {
      this.logger.debug(`Calling Gemini (${modelName}) with key index ${this.currentKeyIndex}...`);
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      this.logger.error(`Gemini Error [${modelName}]: ${error?.message || error}`, error?.stack);
      
      // 429: Rate Limit, 403: Quota, 400: Invalid Model/Request
      const status = error?.status || error?.response?.status;
      const isRetryable = status === 429 || status === 403 || status === 400 || 
                         error?.message?.includes('quota') || error?.message?.includes('limit') ||
                         error?.message?.includes('model') || error?.message?.includes('not found');
      
      if (isRetryable && attempt <= this.geminiKeys.length) {
        this.logger.warn(`Gemini key index ${this.currentKeyIndex} failed (Status: ${status}). Rotating to next key...`);
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.geminiKeys.length;
        return this.callGemini(prompt, attempt + 1);
      }
      
      throw error;
    }
  }

  // ─── Retrieve Civic Axioms from DB ────────────────────────────────────────
  private async retrieveAxioms(keys: string[], countryCode: string) {
    if (!keys.length) return [];
    return this.prisma.civicAxiom.findMany({
      where: {
        country: { code: countryCode },
        code: { in: keys },
        isActive: true,
      },
      include: { source: true },
      take: 5,
    });
  }

  // ─── Build Routing Decision ───────────────────────────────────────────────
  private async buildRoutingDecision(
    context: CivicQueryContext,
    classification: QueryClassification,
  ): Promise<RoutingDecision> {
    const intentToAxiomMap: Record<string, string[]> = {
      REGISTRATION: [
        `${context.countryCode}_FORM6`,
        `${context.countryCode}_REGISTRATION`,
        `${context.countryCode}_IER`,
        `${context.countryCode}_AUTO_REG`,
        `${context.countryCode}_ENROLMENT`,
      ],
      ELIGIBILITY: [
        `${context.countryCode}_VOTING_AGE`,
        `${context.countryCode}_CITIZENSHIP`,
        `${context.countryCode}_COMPULSORY`,
      ],
      PROCESS: [
        `${context.countryCode}_ALT_ID`,
        `${context.countryCode}_VOTER_ID`,
        `${context.countryCode}_PHOTO_ID`,
        `${context.countryCode}_NO_ID`,
        `${context.countryCode}_EPIC`,
      ],
      EMERGENCY: [
        `${context.countryCode}_HELPLINE`,
        `${context.countryCode}_SUPPLEMENTARY_ROLL`,
        `${context.countryCode}_PROVISIONAL_BALLOT`,
        `${context.countryCode}_DECLARATION_VOTE`,
      ],
      JARGON: [
        `${context.countryCode}_EPIC`,
        `${context.countryCode}_EVM`,
        `${context.countryCode}_MCC`,
        `${context.countryCode}_ELECTORAL_COLLEGE`,
        `${context.countryCode}_FPTP`,
        `${context.countryCode}_RIDING`,
      ],
      MYTH_BUSTING: [
        `${context.countryCode}_NOTA`,
        `${context.countryCode}_VOUCHING`,
        `${context.countryCode}_PREFERENTIAL`,
      ],
      GENERAL: [`${context.countryCode}_VOTING_AGE`],
      TROUBLESHOOTING: [`${context.countryCode}_HELPLINE`],
    };

    const modeMap: Record<string, ResponseMode> = {
      EMERGENCY: 'EMERGENCY_MODE', TROUBLESHOOTING: 'GUIDED_PATH',
      REGISTRATION: 'GUIDED_PATH', JARGON: 'QUICK_ANSWER',
      ELIGIBILITY: 'QUICK_ANSWER', MYTH_BUSTING: 'DEEP_EXPLAIN',
      PROCESS: 'GUIDED_PATH', GENERAL: 'QUICK_ANSWER',
    };

    return {
      mode: modeMap[classification.intent] ?? 'QUICK_ANSWER',
      countryCode: context.countryCode!,
      personaCode: context.personaCode ?? 'P01',
      axiomKeys: intentToAxiomMap[classification.intent] ?? [],
      useEmergencyPath: classification.isEmergency,
      skipAI: false,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private determineVolatility(axioms: any[]): VolatilityClass {
    if (axioms.some((a) => a.volatility === 'HIGH')) return 'HIGH';
    if (axioms.some((a) => a.volatility === 'MEDIUM')) return 'MEDIUM';
    return 'STABLE';
  }

  private computeConfidence(axioms: any[], classification: QueryClassification): number {
    if (!axioms.length) return 0.4;
    
    // We have verified axioms, start with a high base
    const baseConfidence = 0.85; 
    
    // Extra boost if we have multiple cross-referencing axioms
    const axiomBonus = Math.min(axioms.length * 0.05, 0.15);
    
    // Check if the axioms are fresh (verified in last 180 days)
    const isFresh = axioms.every((a) => {
      const verifiedAt = a.lastVerifiedAt || a.updatedAt;
      if (!verifiedAt) return false;
      const daysOld = (Date.now() - new Date(verifiedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysOld < 180;
    });
    
    const freshBonus = isFresh ? 0.05 : 0;
    
    return Math.min(baseConfidence + axiomBonus + freshBonus, 1.0);
  }

  private buildSourceRefs(axioms: any[]) {
    const seen = new Set<string>();
    return axioms
      .filter((a) => a.source && !seen.has(a.source.id) && seen.add(a.source.id))
      .map((a) => ({
        name: a.source.name,
        shortName: a.source.shortName,
        url: a.source.url,
        category: a.source.category,
        verifiedAt: a.source.verifiedAt?.toISOString() ?? null,
      }));
  }

  private buildDisclaimer(volatility: VolatilityClass, countryCode: string | null): string {
    const verbs: Record<VolatilityClass, string> = {
      STABLE: 'Information is generally stable — verify before important decisions.',
      MEDIUM: 'This information may change. Verify at the official source before acting.',
      HIGH: 'This is time-sensitive civic information. VERIFY at the official source before any action.',
    };
    return `ELECTRA provides civic guidance, not legal advice. ${verbs[volatility]}`;
  }

  private cacheTtl(volatility: VolatilityClass): number {
    return { STABLE: 86400, MEDIUM: 3600, HIGH: 300 }[volatility];
  }

  private buildSafetyBlockedResponse(reason: string, startTime: number): ElectraAIResponse {
    return {
      content: 'ELECTRA only answers questions about voter registration, eligibility, and election processes. For other questions, please consult appropriate resources.',
      mode: 'QUICK_ANSWER',
      confidenceScore: 1.0,
      volatility: 'STABLE',
      sources: [],
      hasLegalCaution: false,
      disclaimer: 'ELECTRA — Civic guidance only.',
      promptHash: `blocked_${Date.now()}`,
      latencyMs: Date.now() - startTime,
    };
  }

  private buildFallbackResponse(context: CivicQueryContext, axioms: any[], startTime: number, promptHash: string): ElectraAIResponse {
    const fallback = axioms.length
      ? axioms.map((a) => a.plainContent || a.content).join('\n\n')
      : 'Please visit the official electoral authority website for your country for guidance on this topic.';

    return {
      content: fallback,
      mode: 'QUICK_ANSWER',
      confidenceScore: 0.6,
      volatility: 'HIGH',
      sources: this.buildSourceRefs(axioms),
      hasLegalCaution: true,
      disclaimer: 'AI inference unavailable — showing verified source content only. Verify at official source.',
      promptHash,
      latencyMs: Date.now() - startTime,
    };
  }

  private async logQuery(
    context: CivicQueryContext, promptHash: string, classification: QueryClassification,
    startTime: number, hallucination: boolean, safetyBlocked: boolean, response?: ElectraAIResponse,
  ) {
    try {
      // Map internal intents to DB-allowed values for the check constraint
      const dbIntentMap: Record<string, string> = {
        REGISTRATION: 'REGISTRATION',
        ELIGIBILITY: 'REGISTRATION',
        PROCESS: 'FAQ',
        TROUBLESHOOTING: 'TROUBLESHOOT',
        EMERGENCY: 'EMERGENCY',
        JARGON: 'JARGON',
        MYTH_BUSTING: 'MYTH_CHECK',
        DEADLINE: 'TIMELINE',
        VERIFICATION: 'FAQ',
        INFORMATIONAL: 'FAQ',
        GENERAL: 'FAQ',
      };
      const dbIntent = dbIntentMap[classification.intent] || 'FAQ';

      await this.prisma.queryLog.create({
        data: {
          sessionHash: context.sessionId || 'anon',
          userId: context.userId,
          countryCode: context.countryCode,
          personaCode: context.personaCode,
          queryIntent: dbIntent,
          confidenceScore: response?.confidenceScore ?? 0,
          safetyPassed: !safetyBlocked,
          modelUsed: this.config.get<string>('GEMINI_MODEL', 'gemini-flash-latest'),
          responseMs: Date.now() - startTime,
          emergencyMode: response?.mode === 'EMERGENCY_MODE',
          wasHallucination: hallucination,
        },
      });
    } catch (err) {
      this.logger.error('Failed to log query', err);
    }
  }
}
