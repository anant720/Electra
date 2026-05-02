// =============================================================================
// ELECTRA — Jargon Buster Service
// Blueprint: /ai_engine/jargon_buster_engine.md
// Fully implements: complexity scoring, persona thresholds, master dictionary
// =============================================================================

import { Injectable } from '@nestjs/common';
import { PersonaCode } from '@electra/types';

interface JargonEntry {
  plainLanguage: string;
  complexity: number; // 1-10
  class: 'TRANSPARENT' | 'SPECIALIZED' | 'OPAQUE';
  country?: string; // IND | USA | GBR | CAN | AUS | ALL
}

interface JargonThresholdConfig {
  mode: 'AGGRESSIVE' | 'MODERATE' | 'NONE';
  substituteInline: boolean;
  footnoteAll: boolean;
  keepAcronymsAbove: number | null;
}

// ─── Master Jargon Dictionary ──────────────────────────────────────────────
const JARGON_DICTIONARY: Record<string, JargonEntry> = {
  // India
  EPIC:   { plainLanguage: 'Voter ID card', complexity: 9, class: 'OPAQUE', country: 'IND' },
  ECI:    { plainLanguage: 'Election Commission of India', complexity: 5, class: 'SPECIALIZED', country: 'IND' },
  CEO:    { plainLanguage: 'Chief Electoral Officer (state-level)', complexity: 6, class: 'SPECIALIZED', country: 'IND' },
  ERO:    { plainLanguage: 'Electoral Registration Officer', complexity: 8, class: 'OPAQUE', country: 'IND' },
  BLO:    { plainLanguage: 'Booth Level Officer', complexity: 8, class: 'OPAQUE', country: 'IND' },
  NVSP:   { plainLanguage: 'National Voter Services Portal (the voter registration website)', complexity: 8, class: 'OPAQUE', country: 'IND' },
  EVM:    { plainLanguage: 'Electronic Voting Machine', complexity: 6, class: 'SPECIALIZED', country: 'IND' },
  VVPAT:  { plainLanguage: 'Voter Verified Paper Audit Trail (the paper receipt for your vote)', complexity: 10, class: 'OPAQUE', country: 'IND' },
  NOTA:   { plainLanguage: 'None of the Above', complexity: 4, class: 'TRANSPARENT', country: 'IND' },
  MCC:    { plainLanguage: 'Model Code of Conduct (election rules)', complexity: 7, class: 'SPECIALIZED', country: 'IND' },
  NRI:    { plainLanguage: 'Non-Resident Indian', complexity: 3, class: 'TRANSPARENT', country: 'IND' },
  OCI:    { plainLanguage: 'Overseas Citizen of India', complexity: 7, class: 'SPECIALIZED', country: 'IND' },

  // USA
  NVRA:   { plainLanguage: 'National Voter Registration Act (Motor Voter law)', complexity: 10, class: 'OPAQUE', country: 'USA' },
  HAVA:   { plainLanguage: 'Help America Vote Act', complexity: 10, class: 'OPAQUE', country: 'USA' },
  UOCAVA: { plainLanguage: 'Uniformed and Overseas Citizens Absentee Voting Act', complexity: 10, class: 'OPAQUE', country: 'USA' },
  FPCA:   { plainLanguage: 'Federal Post Card Application (overseas registration form)', complexity: 10, class: 'OPAQUE', country: 'USA' },
  FWAB:   { plainLanguage: 'Federal Write-In Absentee Ballot (emergency overseas ballot)', complexity: 10, class: 'OPAQUE', country: 'USA' },
  FVAP:   { plainLanguage: 'Federal Voting Assistance Program', complexity: 9, class: 'OPAQUE', country: 'USA' },

  // UK
  VAC:    { plainLanguage: 'Voter Authority Certificate (Free Photo ID for voting)', complexity: 9, class: 'OPAQUE', country: 'GBR' },
  IER:    { plainLanguage: 'Individual Electoral Registration (registering to vote yourself)', complexity: 8, class: 'OPAQUE', country: 'GBR' },
  AMS:    { plainLanguage: 'Additional Member System (proportional representation system)', complexity: 10, class: 'OPAQUE', country: 'GBR' },

  // Cross-country
  FPTP:   { plainLanguage: 'First Past the Post (whoever gets the most votes wins)', complexity: 7, class: 'SPECIALIZED', country: 'ALL' },
  STV:    { plainLanguage: 'Single Transferable Vote (ranking candidates in preference order)', complexity: 9, class: 'OPAQUE', country: 'ALL' },
};

// ─── Persona Thresholds (from blueprint) ──────────────────────────────────
const JARGON_THRESHOLDS: Record<PersonaCode, JargonThresholdConfig> = {
  P01: { mode: 'AGGRESSIVE', substituteInline: true,  footnoteAll: true,  keepAcronymsAbove: null },
  P02: { mode: 'MODERATE',   substituteInline: false, footnoteAll: false, keepAcronymsAbove: 6 },
  P03: { mode: 'MODERATE',   substituteInline: false, footnoteAll: false, keepAcronymsAbove: 5 },
  P04: { mode: 'AGGRESSIVE', substituteInline: true,  footnoteAll: true,  keepAcronymsAbove: null },
  P05: { mode: 'AGGRESSIVE', substituteInline: true,  footnoteAll: false, keepAcronymsAbove: null },
  P06: { mode: 'NONE',       substituteInline: false, footnoteAll: false, keepAcronymsAbove: 0 },
};

@Injectable()
export class JargonBusterService {
  // ─── Main: Simplify jargon in a response text ────────────────────────────
  simplify(text: string, personaCode: PersonaCode): string {
    const config = JARGON_THRESHOLDS[personaCode] ?? JARGON_THRESHOLDS['P01'];
    if (config.mode === 'NONE') return text; // P06: crisis mode — no changes

    let result = text;
    const footnotes: string[] = [];

    for (const [acronym, entry] of Object.entries(JARGON_DICTIONARY)) {
      const regex = new RegExp(`\\b${acronym}\\b`, 'g');
      if (!regex.test(result)) continue;

      if (config.mode === 'AGGRESSIVE') {
        // Replace entirely with plain language
        result = result.replace(new RegExp(`\\b${acronym}\\b`, 'g'), entry.plainLanguage);
        if (config.footnoteAll) {
          footnotes.push(`${acronym}: ${entry.plainLanguage}`);
        }
      } else if (config.mode === 'MODERATE') {
        // Keep above threshold, expand once
        if (config.keepAcronymsAbove !== null && entry.complexity <= config.keepAcronymsAbove) {
          // Expand on first use: "EPIC (Voter ID card)"
          result = result.replace(
            new RegExp(`\\b${acronym}\\b`), // First occurrence only
            `${acronym} (${entry.plainLanguage})`,
          );
        } else {
          result = result.replace(new RegExp(`\\b${acronym}\\b`, 'g'), entry.plainLanguage);
        }
      }
    }

    if (footnotes.length > 0) {
      result += `\n\n---\n**Terms explained:** ${footnotes.join(' | ')}`;
    }

    return result;
  }

  // ─── Jargon Query Mode: Full Definition Response ─────────────────────────
  defineJargon(term: string): string {
    const key = term.toUpperCase().trim();
    const entry = JARGON_DICTIONARY[key];

    if (!entry) {
      return `ELECTRA doesn't have a specific definition for "${term}" in its civic glossary. Please verify at the official electoral authority for your country.`;
    }

    return [
      `**${key}** = ${entry.plainLanguage}`,
      '',
      `**Full name:** ${entry.plainLanguage}`,
      `**Complexity level:** ${entry.class}`,
      ...(entry.country && entry.country !== 'ALL' ? [`**Used in:** ${entry.country}`] : []),
    ].join('\n');
  }

  // ─── Extract all detected jargon terms from a query ──────────────────────
  extractTerms(query: string): string[] {
    const q = query.toUpperCase();
    return Object.keys(JARGON_DICTIONARY).filter((term) => {
      const regex = new RegExp(`\\b${term}\\b`);
      return regex.test(q);
    });
  }
}
