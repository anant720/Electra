# ELECTRA — Knowledge Dictionary

> **Document Class:** Foundation Architecture | Knowledge Normalization Layer
> **Purpose:** Standardize all terminology across the ELECTRA platform. Eliminate duplication, strategic language, and ambiguity. Convert to implementation-ready vocabulary.
> **Last Updated:** 2026-04-28

---

## Guiding Principle

Every term in this dictionary represents a **technical implementation concept**, not a strategy phrase. When writing code, prompts, documentation, or architecture, all team members must use these terms — never informal, vague, or marketing equivalents.

---

## Core Platform Terms

| Deprecated / Informal Term | Standardized ELECTRA Term | Definition |
|---|---|---|
| "Voting helper" | **Election Guidance Workflow Engine** | The module that routes users through persona-specific, region-aware action pathways toward successful civic participation |
| "AI chatbot" | **Civic Navigation Interface** | The conversational layer of ELECTRA — constrained by RAG to the internal Civic Data Structure, never a free-range LLM |
| "Election info" | **Electoral Intelligence Data** | Structured, jurisdiction-specific, verified data about election systems, rules, deadlines, and procedures |
| "User journey" | **Civic Action Pathway** | The complete sequence of guided steps a specific voter persona takes from initial confusion to successful participation |
| "Simple language" | **Plain Language Civic Output** | AI-generated content that complies with the Plain Writing Act 2010: active voice, single-idea sentences, if-then conditionals |
| "Quiz or form" | **Progressive Disclosure Engine** | The 3-question onboarding mechanism (location, age, citizenship) that filters irrelevant data before routing users |
| "Score" | **Voter Readiness Score** | A quantified 0–100% metric reflecting the completion status of a user's Civic Action Pathway checklist |
| "Timeline" | **Electoral Lifecycle Tracker** | Visual representation of the 11-stage election event timeline, personalized to the user's jurisdiction and voting method |
| "Chatbot guardrail" | **Neutrality Constraint Layer** | Explicit negative constraints injected into the system prompt preventing partisan outputs, prediction, or political opinion |
| "Fake info" | **Civic Hallucination Risk** | The specific failure mode where an LLM generates confident but factually incorrect electoral information (deadlines, IDs, polling locations) |
| "Neutral AI" | **Maximum Equal Approval Framework** | A systematic approach to representing competing viewpoints equitably — approximating political neutrality by design |
| "Trusted sources" | **Verified Civic Source Allow-list** | A curated registry of official `.gov`, `.eci.gov.in`, `.aec.gov.au` and equivalent institutional domains used exclusively for data citation |
| "Voting simulator" | **Voting Journey Simulator** | An interactive, visual module that walks users through the physical polling station experience step-by-step |
| "Emergency help" | **Crisis Resolution Decision Tree** | An instant-override flow triggered by distress signals (lost ID, wrong precinct, name missing) that bypasses standard onboarding |
| "Registration forms" | **Civic Form Router** | The module that identifies a user's specific bureaucratic need and fetches the exact required form with processing time + required documents |

---

## Taxonomy: Core Data Entities

These are the canonical structural units of all ELECTRA data — used consistently across the database schema, prompt engineering, and UI labels.

### Geographic Hierarchy

```
WORLD
  └── REGION              (e.g., Asia, Europe, Americas)
        └── COUNTRY       (e.g., India, USA, UK)
              └── STATE / PROVINCE    (e.g., Maharashtra, California)
                    └── DISTRICT / COUNTY
                          └── CONSTITUENCY / PRECINCT
```

### Electoral Hierarchy

```
ELECTION CATEGORY
  └── ELECTION TYPE       (e.g., General, Assembly, Local, Referendum)
        └── ELECTION EVENT (specific scheduled instance)
              └── ELECTION STAGE (one of 11 lifecycle phases)
```

### User Hierarchy

```
USER TYPE / VOTER PERSONA
  └── SCENARIO            (e.g., Lost Voter ID, Just Moved, First Time)
        └── ACTION STEPS  (ordered, jurisdiction-specific tasks)
              └── OFFICIAL RESOURCE (form, URL, phone number)
```

---

## Standardized Terminology by Domain

### Domain 1 — Electoral Intelligence

| Term | Standardized Definition |
|---|---|
| **Country** | A sovereign state with a defined electoral authority (e.g., ECI for India, EAC for USA) |
| **Region** | A supranational geographic grouping (Asia, Europe, Sub-Saharan Africa, Americas) |
| **Election Type** | The category of democratic exercise: Presidential, Parliamentary, Assembly, Local, Referendum, Primary, By-election |
| **Electoral System** | The vote-to-seat translation mechanism: FPTP, List PR, MMP, Two-Round System (TRS), RCV, STV, SNTV |
| **Registration Model** | How voters enter the electoral roll: Opt-in, Automatic, Biometric, Motor-Voter |
| **Compulsory Voting** | Legal mandate requiring participation (Australia, Brazil, Turkey) vs. voluntary systems |
| **Electoral Authority** | The official constitutional body managing elections (ECI, AEC, Elections Canada, Electoral Commission UK) |
| **Timeline** | The 11-stage electoral lifecycle from eligibility definition through government formation |
| **Constituency** | A defined geographic unit for which one or more representatives are elected |
| **Delimitation** | The process of redrawing constituency boundaries based on census data |

### Domain 2 — User Guidance

| Term | Standardized Definition |
|---|---|
| **Voter Persona** | A defined user archetype with documented emotional barriers, logistical blockers, and UX needs |
| **Civic Action Pathway** | The complete, ordered set of steps a persona must complete to participate in an election |
| **Action Step** | A single, discrete task within a Civic Action Pathway (e.g., "Download Form 6 from NVSP") |
| **Scenario** | A specific real-world situation a voter persona faces (e.g., Lost Voter ID, Relocated Student) |
| **Registration Window** | The legally defined period during which voter registration is accepted before an election |
| **Official Resource** | A verified form, portal URL, or phone number from the Verified Civic Source Allow-list |
| **Provisional Ballot** | A fail-safe ballot issued to voters whose eligibility cannot be confirmed at the polling station (US: HAVA Section 302) |
| **Ballot Curing** | The post-election process by which a voter proves their identity to have a provisional ballot counted |
| **Absentee Ballot** | A mail-in ballot mechanism available to voters who cannot attend in person |
| **FPCA / FWAB** | Federal Post Card Application / Federal Write-in Absentee Ballot — US overseas voter mechanisms |

### Domain 3 — Trust & Safety

| Term | Standardized Definition |
|---|---|
| **Trust Layer** | The complete set of architectural mechanisms ensuring ELECTRA outputs are accurate, neutral, and verifiable |
| **RAG Constraint** | Retrieval-Augmented Generation restricted exclusively to the internal Civic Data Structure — prevents free-range hallucination |
| **Civic Axiom** | A hardcoded, verified fact in the Civic Data Structure that the LLM cannot override or extrapolate from |
| **Confidence Boundary** | An explicit output pattern where ELECTRA states "I do not have verified information" rather than guessing |
| **Neutrality Constraint** | A negative prompt instruction preventing partisan opinion, prediction, or candidate endorsement |
| **Information Environment Asymmetry** | The structural bias risk where LLMs over-represent political actors with high open-source digital footprints |
| **Institutional UX** | A design language (stark minimalism, high-contrast, authoritative typography) that communicates government-grade reliability |
| **WCAG 2.1 AA** | Web Content Accessibility Guidelines — the non-negotiable baseline for ELECTRA's interface accessibility |

### Domain 4 — UX Interaction

| Term | Standardized Definition |
|---|---|
| **Progressive Disclosure** | UI pattern revealing information incrementally — starting with 3 questions, expanding only as needed |
| **Micro-Moment** | A small, reinforcing interactive event (checkmark, progress bar update) that builds psychological momentum |
| **Decision Tree** | A structured branching logic flow that routes users based on their answers to binary or categorical questions |
| **Jargon-Buster** | A feature that allows users to click any civic term to receive a plain-language analogy |
| **Voter Readiness Score** | The 0–100% gamified progress metric reflecting checklist completion status |
| **Low-Bandwidth Mode** | A text-only, PWA-based interface optimized for 2G/3G networks and feature phones |
| **IVR** | Interactive Voice Response — phone-based guidance system enabling civic navigation without internet |
| **Missed-Call Trigger** | Architecture where a user drops a call to a toll-free number to automatically receive an SMS with their polling details |

### Domain 5 — Submission & Demonstration

| Term | Standardized Definition |
|---|---|
| **Dual Submission** | The Prompt War requirement: source code + live URL + technical blog + LinkedIn post |
| **Prompt Architecture** | The complete, layered system of instructions directing ELECTRA's AI agents — not a single monolithic prompt |
| **Agentic Orchestration** | Using Google Antigravity's Manager View to run parallel autonomous agents with distinct roles |
| **Civic Axiom Injection** | The technique of hardcoding verified civic facts into the system prompt as a reference dictionary for the LLM |
| **Chain-of-Thought Structuring** | Forcing the AI to reason chronologically before generating output (e.g., map election stages before writing JSON) |
| **Build-in-Public Narrative** | The technical blog + LinkedIn post documenting the prompt engineering methodology and agentic workflow |

---

## Prohibited Terms

The following terms must never appear in ELECTRA documentation, code comments, UI labels, or prompts:

| Prohibited | Use Instead |
|---|---|
| Phase 0 | Foundation Architecture / Core Systems Initialization |
| Chatbot | Civic Navigation Interface |
| AI helper | Election Guidance Workflow Engine |
| Voting guide | Civic Action Pathway |
| Fake news | Civic Hallucination / Information Environment Asymmetry |
| Simple | Plain Language |
| User journey | Civic Action Pathway |
| Guardrail | Neutrality Constraint Layer |

---

*Maintained under ELECTRA Foundation Architecture — Core Systems Initialization.*
