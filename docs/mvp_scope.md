# ELECTRA — MVP Scope Definition

> **Document Class:** Foundation Architecture | MVP Scoping
> **Rule:** Do NOT build all countries first. Do NOT build all features first. Ship what matters now.
> **Last Updated:** 2026-04-28

---

## Core Scoping Principle

> **Build depth before breadth.**

ELECTRA's value is not in covering 20 countries with shallow data. It is in delivering an experience so well-designed for 5 countries that any user in those jurisdictions can navigate their election with zero confusion.

Features not in this document **do not exist** in MVP. They go to the Feature Priority Matrix.

---

## MVP Countries

### Priority 1 — Required

| Country | Rationale | Election System | MVP Focus |
|---|---|---|---|
| 🇮🇳 **India** | Competition context (India-restricted event), 991M voters, highest complexity | FPTP (Lok Sabha), STV (Rajya Sabha) | ECI forms (6/6A/7/8), NVSP portal, BLO routing, EVM/VVPAT explainer, NOTA |
| 🇺🇸 **USA** | Globally referenced, highest edge-case density, most researched | Electoral College, FPTP/RCV, Mail-in variants | Provisional ballot (HAVA), Voter ID patchwork, mail-in vs. in-person, state-level decision trees |
| 🇬🇧 **UK** | Unified FPTP system, accessible data, large English-speaking diaspora | FPTP (Commons) | Electoral Commission, registration deadlines, overseas postal voting |
| 🇨🇦 **Canada** | Federal FPTP, Elections Canada model authority, clean data | FPTP (fixed 4-year) | Elections Canada portal, mail-in ballot, student away-from-home guidance |
| 🇦🇺 **Australia** | Compulsory voting (unique UX scenario), STV Senate, AEC model | Instant-Runoff (House), STV (Senate) | Compulsory voting explainer, fine avoidance, postal vote for remote regions |

---

## MVP Voter Personas

The following 4 personas represent the highest-friction, highest-impact user types. All MVP flows must support at least these 4 personas in all 5 MVP countries.

| Persona | Why MVP-Critical |
|---|---|
| **First-Time Voter** | Highest abandonment risk, lowest institutional knowledge, largest addressable base |
| **Student Away From Home** | Complex dual-residency rules in all 5 countries, high confusion density |
| **Lost / Missing Voter ID** | Emergency flow — Election Day crisis, immediate action required, highest distress signal |
| **Registration Confusion** | Broadest application across all personas and countries — baseline of all civic guidance |

---

## MVP Features

### MUST SHIP in MVP

| Feature | Description | Domain Owner |
|---|---|---|
| **Country Selector** | Opens the Progressive Disclosure Engine. User selects from 5 MVP countries. | UX Interaction Engine |
| **Election Type Selector** | Filters by election type relevant to the selected country and current/upcoming event. | Civic Intelligence Engine |
| **Voter Persona Selection** | Self-identification step for the 4 MVP personas. Routes to persona-specific pathway. | User Guidance Engine |
| **Registration Guide** | Step-by-step registration flow, jurisdiction-specific. Includes form router (India: Form 6 via NVSP; USA: state portal or Motor-Voter; UK: gov.uk; Canada: Elections Canada; Australia: AEC). | User Guidance Engine + Civic Intelligence Engine |
| **Electoral Lifecycle Tracker** | Visual, interactive timeline of all active election stages for the selected country. Clickable nodes trigger contextual sidebar explanations. | UX Interaction Engine + Civic Intelligence Engine |
| **Voter Readiness Score Checklist** | Dynamic 0–100% checklist of tasks the user must complete. Updates in real-time as tasks are confirmed. | UX Interaction Engine + User Guidance Engine |
| **Emergency Troubleshooter** | Triggered by keyword detection or direct selection. Crisis Resolution Decision Trees for: Lost ID, Name Missing from Roll, Wrong Precinct. | User Guidance Engine |
| **Jargon-Buster** | Click any civic term in the UI to receive a plain-language analogy. | UX Interaction Engine |
| **FAQ Module** | 10 most common questions per country, pre-answered with citations. | Civic Intelligence Engine + Trust & Safety Engine |
| **Citation Engine** | Every factual output appends the official `.gov` or equivalent source URL. | Trust & Safety Engine |

### NOT IN MVP (moved to Feature Priority Matrix)

- Live polling wait times (requires real-time API)
- Voting Journey Simulator (visual polling station walkthrough)
- Voice-first IVR (requires telecom API integration)
- Mythbuster Module (requires live disinformation feed)
- Phase 2+ countries (Germany, France, Brazil, Japan, South Africa)
- SMS integration
- Candidate comparison or ballot measure analysis

---

## MVP Data Requirements

### Minimum Data Coverage per Country

| Country | Required Data |
|---|---|
| India | ECI electoral authority, Lok Sabha + Vidhan Sabha election types, Forms 6/7/8 with NVSP URLs, Voting age 18, Opt-in registration, NOTA explanation, EVM/VVPAT process, Model Code of Conduct summary |
| USA | State-by-state registration deadlines (50 states), Voter ID law classification per state, Mail-in eligibility per state, HAVA Section 302 provisional ballot process, Electoral College explainer |
| UK | Electoral Commission portal, registration deadline (15 days before polling), Postal vote application, Overseas voter (FPCA-equivalent), Polling card vs. ID requirements |
| Canada | Elections Canada portal, Voter information card, Mail-in ballot process, Registration deadline (same-day registration available), Student address guidance |
| Australia | AEC portal, Compulsory voting explainer with fine avoidance, Postal vote process for remote voters, How-to-vote cards explainer, Preference voting explainer |

---

## MVP Non-Goals (Explicit)

These are explicitly out of scope for MVP to prevent scope creep:

1. **Do not build** live election results tracking
2. **Do not build** candidate profiles or party comparison tools
3. **Do not build** campaign finance tracking
4. **Do not build** down-ballot race analysis
5. **Do not build** voice/IVR interface
6. **Do not build** SMS gateway integration
7. **Do not build** any database beyond the static JSON civic data structure
8. **Do not build** user accounts or saved sessions
9. **Do not build** real-time API connections to electoral authorities
10. **Do not build** country #6 through #20

---

## MVP Success Metrics

| Metric | Definition | Target |
|---|---|---|
| Voter Readiness Score completion rate | % of users who start a Civic Action Pathway and complete the checklist | > 60% |
| Emergency flow trigger-to-resolution time | Time from distress signal to first actionable step displayed | < 3 seconds |
| Citation coverage | % of factual outputs with verified citation appended | 100% |
| Persona routing accuracy | % of users correctly routed to their matching Civic Action Pathway | > 85% |
| Page load time (low-bandwidth) | Load time on 3G simulated connection | < 3 seconds |

---

*Maintained under ELECTRA Foundation Architecture — Core Systems Initialization.*
