# ELECTRA
### Global Election Intelligence & Civic Navigation Platform

> *"Transforming the complexity of democracy into accessible, trustworthy civic guidance."*

---

## What is ELECTRA?

**ELECTRA** (Electoral Learning and Education Civic Tracking Assistant) is an AI-powered civic guidance platform that helps users understand, prepare for, and navigate elections through region-aware, interactive, and trustworthy guidance.

ELECTRA is not a chatbot. It is a **Deterministic Civic Journey Platform** — converting the world's most fragmented election systems into structured, persona-specific action pathways.

Built for the **Virtual Prompt War Challenge 2** — Google for Developers × Hack2Skill.

---

## Repository Structure

```
ELECTRA/
│
├── docs/
│   ├── product_overview.md        ← Vision, mission, personas, scope, MVP definition
│   ├── mvp_scope.md               ← 5 countries, 4 personas, 10 features, explicit non-goals
│   └── knowledge_dictionary.md    ← Standardized terminology for all development work
│
├── research/
│   └── research_index.md          ← All research classified by category + build use
│
├── architecture/
│   ├── system_domains.md          ← 5 system modules with responsibilities and interfaces
│   └── data_hierarchy.md          ← 14-level data hierarchy with JSON schema examples
│
├── planning/
│   ├── feature_matrix.md          ← 3-tier feature priority matrix (P1/P2/P3)
│   └── tech_stack.md              ← Full technology decision log
│
├── database/                      ← Static JSON civic data files (built during development)
├── prompts/                       ← Modular prompt files for AI agent orchestration
├── frontend/                      ← Next.js + Tailwind CSS application
└── submission/                    ← Blog post, LinkedIn copy, Antigravity artifacts
```

---

## Foundation Architecture Stage — Deliverables

| Document | Status |
|---|---|
| `/docs/product_overview.md` | ✅ Complete |
| `/research/research_index.md` | ✅ Complete |
| `/docs/knowledge_dictionary.md` | ✅ Complete |
| `/architecture/system_domains.md` | ✅ Complete |
| `/architecture/data_hierarchy.md` | ✅ Complete |
| `/docs/mvp_scope.md` | ✅ Complete |
| `/planning/feature_matrix.md` | ✅ Complete |
| `/planning/tech_stack.md` | ✅ Complete |

---

## 5 MVP Countries

🇮🇳 India · 🇺🇸 USA · 🇬🇧 UK · 🇨🇦 Canada · 🇦🇺 Australia

## 4 MVP Personas

First-Time Voter · Student Away From Home · Lost Voter ID · Registration Confusion

## Core System Modules

1. **Civic Intelligence Engine** — Electoral data, country schemas, timelines, verified sources
2. **User Guidance Engine** — Personas, scenarios, action pathways, checklists
3. **Trust & Safety Engine** — RAG constraints, neutrality, citation engine, hallucination prevention
4. **UX Interaction Engine** — Progressive disclosure, timeline tracker, Voter Readiness Score
5. **Submission & Demonstration Layer** — Challenge optimization, prompt architecture, narrative

---

## Tech Stack

| Layer | Technology |
|---|---|
| IDE | Google Antigravity (Gemini 3 Pro) |
| Frontend | React + Next.js + Tailwind CSS |
| Data | Static JSON (Civic Axiom Data Structure) |
| Deployment | Vercel |
| Prompts | Modular markdown files in `/prompts/` |

---

> **Internal Note:** This stage is formally titled "Foundation Architecture" or "Core Systems Initialization."
> Never referred to as "Phase 0" in any documentation, code, or communication.

---

*Built with Google Antigravity · Virtual Prompt War 2026 · India*
