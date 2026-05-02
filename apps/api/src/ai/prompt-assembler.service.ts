import { Injectable } from '@nestjs/common';
import {
  CivicQueryContext, QueryClassification, RoutingDecision, PersonaCode,
} from '@electra/types';
import { PERSONA_PROFILES } from '@electra/types';

@Injectable()
export class PromptAssemblerService {
  // ─── Master Prompt Assembly ──────────────────────────────────────────────
  assemble(
    context: CivicQueryContext,
    classification: QueryClassification,
    axioms: any[],
    routing: RoutingDecision,
  ): string {
    const persona = PERSONA_PROFILES[routing.personaCode as PersonaCode] ?? PERSONA_PROFILES['P01'];
    const axiomBlock = this.formatAxioms(axioms);
    const jargonBlock = classification.jargonTerms.length
      ? `\nJARGON TO SIMPLIFY: ${classification.jargonTerms.join(', ')}\n`
      : '';

    const countrySpecificInstructions: Record<string, string> = {
      IND: "- Mention 'Election Commission of India (ECI)' as the authority.\n- Note that voting is via EVM + VVPAT.\n- Emphasize that Voter ID (EPIC) is standard but alternative IDs are allowed.\n- State that voting is a constitutional right but not compulsory.",
      USA: "- Emphasize that election rules and Voter ID laws vary heavily by STATE.\n- Remind the user to check their specific state's Secretary of State portal.\n- Elections are decentralized.\n- Remind that voter registration deadlines differ by state.",
      GBR: "- Mention the 'Electoral Commission' as the authority.\n- Emphasize that Photo ID (Voter Authority Certificate) is now REQUIRED to vote in person.\n- Mention proxy voting and postal voting options.",
      CAN: "- Mention 'Elections Canada' as the authority.\n- Remind the user that they can register on Election Day at the polling station with proper ID.",
      AUS: "- **CRITICAL**: Voting is COMPULSORY for Australian citizens 18 and over.\n- Mention the 'Australian Electoral Commission (AEC)'.\n- Mention that failure to vote may result in a fine.\n- Explain preferential (Instant-Runoff) voting if asked about the ballot.",
    };

    const countryRules = countrySpecificInstructions[context.countryCode || ''] 
      ? `\nCOUNTRY-SPECIFIC RULES (${context.countryCode}):\n${countrySpecificInstructions[context.countryCode || '']}\n` 
      : '';

    const personaDirective = `\nPERSONA DIRECTIVE:
The citizen identifying as a "${persona.label}" is asking this. 
Context: ${persona.description}. 
Target their specific needs: ${persona.elderlyMode ? 'Use very simple steps and large-print friendly phrasing.' : persona.accessibilityMode ? 'Prioritize rights and assistance services.' : 'Provide practical, actionable steps.'}`;

    return `[ELECTRA CIVIC INTELLIGENCE SYSTEM — V1.0.2 — CONSTITUTIONAL PROMPT]

ROLE: You are ELECTRA, a deterministic civic intelligence platform.
Mission: Guide citizens through electoral processes clearly, safely, and neutrally.
Slogan: Navigate Every Election.

STRICT LAWS (non-negotiable):
1. NEVER answer partisan questions or suggest how to vote.
2. NEVER speculate beyond the Civic Axioms provided below.
3. If the "CIVIC AXIOMS" section below is empty or says "No specific axioms retrieved", do NOT provide a detailed answer. Instead, say exactly: "Please visit the official electoral authority website for your country for guidance on this topic."
4. Use PLAIN language appropriate for Grade ${persona.readingLevel.replace('grade-', '')} reading level.
5. Response must be under ${persona.responseMaxWords} words.
6. Tone: ${persona.tone}.
7. Always cite source as: [Source: {shortName} — {url}].
8. NEVER produce or repeat political party names, candidates, or campaign material.
9. If political content detected in query, redirect: "ELECTRA does not advise on political choices."
10. All legal/statutory information: append disclaimer: "Verify at official source before acting."

CIVIC AXIOMS (verified official facts for this query — use ONLY these):
${axiomBlock || 'No specific axioms retrieved — advise user to visit official source.'}
${jargonBlock}
CITIZEN QUERY: "${context.rawQuery}"

COUNTRY CONTEXT: ${context.countryCode ?? 'Unknown'}${countryRules}${personaDirective}
RESPONSE FORMAT: ${routing.mode === 'GUIDED_PATH' ? 'Numbered steps (max 5)' : routing.mode === 'QUICK_ANSWER' ? 'Direct answer (2-3 sentences)' : 'Detailed explanation with context'}
ELECTION DAY: ${context.isElectionDay ? 'YES — prioritize immediate actionable guidance' : 'No'}

Generate a civic guidance response now:`;
  }

  // ─── Format Emergency Resolution Steps ──────────────────────────────────
  formatEmergencySteps(resolution: any): string {
    const steps = Array.isArray(resolution.steps) ? resolution.steps : [];
    const stepText = steps
      .map((s: any) => `Step ${s.step}: ${s.title}\n${s.action}`)
      .join('\n\n');

    return `EMERGENCY GUIDANCE — ${resolution.scenario}\n\n${stepText}${resolution.helpline ? `\n\nHELPLINE: ${resolution.helpline} (call now)` : ''}`;
  }

  // ─── Format Axioms for Prompt ────────────────────────────────────────────
  private formatAxioms(axioms: any[]): string {
    return axioms
      .map((a, i) => {
        const content = a.plainFact || a.fact;
        const source = a.source ? `[Source: ${a.source.shortName} — ${a.source.url}]` : '[Source: Official electoral authority]';
        const volatility = a.volatilityClass !== 'STABLE' ? ` ⚠️ Volatility: ${a.volatilityClass} — remind user to verify.` : '';
        return `AXIOM ${i + 1} [${a.category}]${volatility}\n${content}\n${source}`;
      })
      .join('\n\n');
  }
}
