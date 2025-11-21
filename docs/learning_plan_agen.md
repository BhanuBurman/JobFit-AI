# 🤖 Learning Plan Agent — Production Guide

## 📋 Table of Contents

1. [Purpose and Principles](#purpose-and-principles)
2. [Input/Output Contracts](#inputoutput-contracts)
3. [Deterministic Orchestration Pipeline](#deterministic-orchestration-pipeline)
4. [Gap Analysis and Prioritization](#gap-analysis-and-prioritization)
5. [Plan Synthesis](#plan-synthesis)
6. [RAG: When and How To Use It](#rag-when-and-how-to-use-it)
7. [Reliability: Idempotency, Retries, Fallbacks](#reliability-idempotency-retries-fallbacks)
8. [Observability and Quality](#observability-and-quality)
9. [Security, Privacy, and Compliance](#security-privacy-and-compliance)
10. [Deployment and Scaling](#deployment-and-scaling)
11. [Testing Strategy](#testing-strategy)
12. [Common Pitfalls](#common-pitfalls)
13. [LangGraph Orchestration and LLM Usage](#langgraph-orchestration-and-llm-usage)

---

## 🎯 Purpose and Principles

The Learning Plan Agent produces production-grade, job-targeted learning plans by aligning a candidate’s current capabilities with a specific job’s requirements. It avoids generic recommendations and emphasizes relevance, explainability, and repeatability.

Guiding principles:

- Relevance first: prioritize skills explicitly required in the target job over generic or unrelated gaps.
- Deterministic core: use rule-based gap analysis before any generative step.
- Minimal necessary AI: employ LLMs to summarize, rank, or draft modules; use RAG only to attach trustworthy resources.
- Traceability: every module must be traceable to a requirement, evidence from the resume, and prioritization logic.

---

## 🔗 Input/Output Contracts

This guide assumes two inputs similar to your provided objects: a job object (e.g., Autopilot, Full Stack Engineer) and a resume review object.

### Request (minimal fields)

```json
{
  "resume_text": "... optional raw text ...",
  "resume_analysis": { "review": { "skills_score": 8, "experience_score": 7, "clarity_score": 6, "missing_skills": ["Machine Learning", "Cloud Computing"], "strong_points": ["Docker", "Kubernetes"], "role_fit_analysis": "..." }},
  "job_match": { "job_id": "3891248915", "title": "Full Stack Engineer", "company": "Autopilot", "location": "Irvine, CA", "full_description": "React, Next.js, TypeScript, NestJS ...", "salary_range": "USD 150,000 - 200,000 yearly" },
  "timeline_months": 3,
  "experience_level": "intermediate"
}
```

Notes:

- Keep job fields minimal: `title`, `company`, `full_description` are enough for extraction.
- `resume_text` is optional if `resume_analysis.review` already includes skills/strengths.

### Response (stable schema)

```json
{
  "basic_plan": [ /* concise, timeboxed modules */ ],
  "advanced_plan": [ /* deeper or stretch modules */ ],
  "priority_analysis": {
    "critical": ["Next.js", "NestJS", "TypeScript", "React"],
    "supporting": ["Testing", "System Design"],
    "deferred": ["ML", "Cloud Computing"],
    "rationale": "Derived from JD requirements vs. resume evidence"
  },
  "score_improvements": { "skills_target": 9, "experience_target": 8, "clarity_target": 8 },
  "estimated_duration": "~12 weeks"
}
```

---

## 🧭 Deterministic Orchestration Pipeline

End-to-end flow kept deterministic until final text generation:

1. Input validation and normalization
   - Validate presence of `job_match.title`, `job_match.full_description`, and `resume_analysis.review`.
   - Normalize casing, strip boilerplate, collapse whitespace.

2. Skill extraction (rule-first, AI-assisted)
   - Parse job description for explicit technologies and frameworks (e.g., React, Next.js, TypeScript, NestJS).
   - Map synonyms to a canonical taxonomy (e.g., React.js → React). Maintain a lightweight skills dictionary.
   - Use an LLM only if rules fail, with a strict extraction prompt to return a JSON list of skills.

3. Resume capability grounding
   - From `resume_analysis.review`: derive existing skills, strengths, and constraints (e.g., clarity_score=6 implies communication module).
   - De-emphasize generic missing skills that are irrelevant to the target JD (e.g., ML for a pure Full Stack role) unless explicitly requested.

4. Gap computation
   - Present = skills evidenced in resume.
   - Required = skills extracted from JD.
   - Gaps = Required − Present, with weights by JD emphasis and seniority.

5. Prioritization and scheduling
   - Convert weighted gaps into a ranked backlog.
   - Fit into `timeline_months` with realistic study cadence and prerequisites.

6. Plan assembly
   - Compose modules with clear outcomes, assessment criteria, and suggested resources (if available).
   - Produce both basic and advanced variants.

7. Result packaging and persistence
   - Attach rationales for every priority decision for transparency.

---

## 📉 Gap Analysis and Prioritization

Define a simple, explainable scoring model. Example weights (tune for your domain):

- JD emphasis (explicit mention > repeated mention > implied): 0.5
- Skill presence in resume (strong_points reduces gap): 0.2
- Experience level adjustment (beginner needs more foundation): 0.1
- Timeline tightness (short timelines focus on critical path): 0.2

Small scoring sketch (illustrative only):

```text
gapScore(skill) = 0.5*jdWeight + 0.2*(1 - resumeEvidence) + 0.1*levelAdj + 0.2*timePressure
```

For your Autopilot Full Stack Engineer example:

- Critical: Next.js, React, TypeScript, NestJS (explicit JD requirements)
- Supporting: Testing strategy, performance optimization, CI/CD
- Deferred: ML, Cloud Computing (present in resume missing list but not central to JD)

This ensures the plan is job-targeted and avoids misleading detours.

---

## 🧩 Plan Synthesis

Each learning module should include:

- Title and objective (linked to a target skill)
- Duration and schedule window (fit to `timeline_months`)
- Prerequisites (ensure feasible ordering)
- Assessment criteria (what proves proficiency)
- Optional resources (attach only trusted, versioned materials)

Two variants:

- Basic plan: essential modules to achieve job readiness.
- Advanced plan: deeper topics, performance and scalability, production patterns.

Minimal example snippet:

```json
{
  "title": "Next.js fundamentals",
  "duration": "2 weeks",
  "outcome": "Build SSR/ISR pages with TypeScript",
  "assessment": "Ship a small SSR app with auth"
}
```

---

## 📚 RAG: When and How To Use It

RAG is optional. Use it to attach resources, not to decide priorities.

- Index only curated, stable sources (official docs, internal playbooks).
- Embed concise chunks with clear metadata (skill, version, difficulty).
- Retrieve top-k per module to suggest links; never let noisy retrieval override deterministic priorities.
- Cache retrieval for popular skills (React, Next.js, NestJS, TypeScript) and pin versions.

Small retrieval policy (conceptual):

```text
if skill in curatedIndex: attach top 2 version-pinned links; else: attach none
```

---

## 🛡️ Reliability: Idempotency, Retries, Fallbacks

- Idempotency key: deduplicate repeated requests per (userId, jobId, resumeHash).
- Timeouts: bound LLM calls; degrade gracefully to template-based modules.
- Retries: exponential backoff for transient failures (network, vector store).
- Fallbacks: if extraction fails, use a minimal baseline plan per role family (e.g., Full Stack baseline).

---

## 🔎 Observability and Quality

- Structured logs: include traceId, userId (hashed), jobId, timings, decisions.
- Tracing: capture spans for extract → analyze → prioritize → synthesize.
- Prompt/event logging: store prompts and outputs with PII redaction and retention controls.
- Product metrics: completion rate of modules, time-to-first-plan, user edits per plan, acceptance rate.
- Offline evaluation: create golden pairs (job, resume) → expected priorities/modules; track regression.
- Online evaluation: A/B test alternative prioritization weights; guard with feature flags.

Minimal acceptance checks (non-blocking):

```text
assert critical.contains(all_explicit_JD_skills)
assert deferred.does_not_include(explicit_JD_skills)
```

---

## 🔐 Security, Privacy, and Compliance

- PII handling: hash or redact names, emails, phone numbers in logs and prompts.
- Data minimization: store derived features, not full resumes, where possible.
- Secrets: use a vault; never hardcode API keys.
- Access control: scope plans by owner; audit all access.
- Rate limiting and abuse prevention: per-IP and per-user quotas.
- Compliance: document data flows; define retention and deletion policies.

---

## 🚀 Deployment and Scaling

- Service boundaries: keep generation async (worker queue) with a synchronous request that returns a `plan_id`.
- Concurrency: provision LLM client pool and set per-tenant budgets.
- Cost control: short prompts; deterministic core reduces token usage.
- Caching: memoize extraction results for identical JDs; cache popular module templates.
- Configuration: feature flags for RAG-on/off, model selection, and weights.

Small API shape (concept only):

```text
POST /api/v1/learning-plan/generate → 202 Accepted { plan_id }
GET  /api/v1/learning-plan/{plan_id} → 200 { plan }
```

---

## 🧪 Testing Strategy

- Unit tests: extraction, taxonomy mapping, gap scoring, scheduling.
- Contract tests: request/response schemas with real job/resume samples.
- Golden datasets: hand-labeled expectations for representative roles (Full Stack, Data, Mobile).
- Load tests: sustained concurrent generations; ensure stable latency and cost.
- Prompt tests: snapshot key prompts with expected structured outputs.

---

## ⚠️ Common Pitfalls

- Overfitting to resume missing skills that are irrelevant to the target job (e.g., ML) — always anchor on JD.
- Letting RAG decide priorities — keep priorities deterministic.
- Unbounded timelines — always fit to `timeline_months` with explicit trade-offs.
- No rationales — every module must include why it exists.

---

## 📝 Worked Example (Your Objects)

- Job (Autopilot Full Stack Engineer): React, Next.js, TypeScript, NestJS are explicitly required.
- Resume review: strong backend/frontend exposure; missing ML/Cloud/DevOps; clarity_score=6.

Outcome:

- Critical: Next.js, React, TypeScript, NestJS.
- Supporting: Testing, performance, CI/CD basics.
- Deferred: ML, Cloud Computing, DevOps (not central to this JD).
- Include a communication/clarity module (because clarity_score=6) at the end of basic plan.

This produces a concise, job-aligned plan that maximizes interview readiness for the Autopilot role.

---

## 🧩 LangGraph Orchestration and LLM Usage

The Learning Plan Agent uses LangGraph to orchestrate a pipeline that combines LLM-powered reasoning with deterministic data processing. The workflow is designed for maximum accuracy by leveraging LLM capabilities throughout critical reasoning steps while maintaining structured data flow.

### LangGraph Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Learning Plan Agent                          │
│                       LangGraph Workflow                            │
└─────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   START         │
                    └─────────────────┘
                            │
                            ▼
                    ┌─────────────────┐
                    │ generate_plan() │
                    │ - Init state    │
                    │ - Call pipeline │
                    └─────────────────┘
                            │
                            ▼
                    ┌─────────────────┐
                    │ _run_pipeline() │
                    │ Orchestrator     │
                    └─────────────────┘
                            │
                            ▼
┌───────────────────┼───────────────────┬───────────────────┬─────────────────┐
│                   │                   │                   │                 │
▼                   ▼                   ▼                   ▼                 ▼

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│load_resume_data │ │load_job_data    │ │extract_job_skills│ │ground_resume    │ │compute_gaps     │
│                 │ │                 │ │_llm             │ │_capabilities     │ │_and_priorities  │
│• Get critique   │ │• Get best job   │ │• LLM extraction  │ │• Parse resume   │ │• Gap analysis   │
│  from DB        │ │  from analysis  │ │  only            │ │  skills         │ │• Prioritization │
│• Validate       │ │• Fetch details  │ │• No fallback     │ │• Normalize      │ │• Critical/      │
│                 │ │                 │ │                  │ │                  │ │  Supporting/    │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ │  Deferred       │
                                                                                └─────────────────┘
                                                                                        │
                                                                                        ▼
                                                                                ┌─────────────────┐
                                                                                │synthesize_modules│
                                                                                │                 │
                                                                                │• LLM basic plan │
                                                                                │• LLM advanced   │
                                                                                │• No fallback    │
                                                                                └─────────────────┘
                                                                                        │
                                                                                        ▼
                                                                                ┌─────────────────┐
                                                                                │ Conditional Edge │
                                                                                │                 │
                                                                                │ if rag_enabled: │
                                                                                │   -> attach_res │
                                                                                │ else:           │
                                                                                │   -> package_res │
                                                                                └─────────────────┘
                                                                                        │
                                                                                ┌───────┴───────┐
                                                                                │               │
                                                                                ▼               ▼
                                                                    ┌─────────────────┐ ┌─────────────────┐
                                                                    │attach_resources │ │package_response │
                                                                    │                 │ │                 │
                                                                    │• RAG resources  │ │• Score estimates│
                                                                    │• Curated links  │ │• Final packaging│
                                                                    │                 │ │• Response build │
                                                                    └─────────────────┘ └─────────────────┘
                                                                                │               │
                                                                                └───────┬───────┘
                                                                                        │
                                                                                        ▼
                                                                                ┌─────────────────┐
                                                                                │   END           │
                                                                                │                 │
                                                                                │Return response  │
                                                                                └─────────────────┘
```

### Node map and LLM usage (by step)

- **load_resume_data** — LLM: no (Deterministic)
  - Purpose: Fetch resume critique from database
  - Input: `resume_id`
  - Output: `resume_critique` (structured analysis)
  - Error Handling: Returns error if no critique found

- **load_job_data** — LLM: no (Deterministic)
  - Purpose: Get best matching job from job fit analysis
  - Input: `job_analysis_id` (optional)
  - Output: `selected_job` (best match by similarity score)
  - Logic: Uses latest analysis if no specific ID provided

- **extract_job_skills_llm** — LLM: **required** (No fallback)
  - Purpose: Extract skills from job description using LLM only
  - Input: `selected_job.full_description`
  - Output: `extracted_skills` (comprehensive list)
  - LLM Prompt: Comprehensive skill extraction with examples
  - Error Handling: Fails if insufficient skills extracted
  - Example input:
    ```json
    { "full_description": "... expertise in React, Next.js, TypeScript, NestJS ..." }
    ```
  - Example output:
    ```json
    { "skills": ["React", "Next.js", "TypeScript", "NestJS", "Node.js", "Docker", "AWS"] }
    ```

- **ground_resume_capabilities** — LLM: no (Deterministic)
  - Purpose: Parse current skills from resume critique
  - Input: `resume_critique`
  - Output: `present_skills` (normalized list)
  - Logic: Combines strong_points, skills, and inferred skills

- **compute_gaps_and_priorities** — LLM: no (Deterministic)
  - Purpose: Analyze gaps and prioritize learning focus
  - Input: `extracted_skills`, `present_skills`
  - Output: `priorities` (critical/supporting/deferred)
  - Logic: Set operations + job-type-based categorization

- **synthesize_modules** — LLM: **required** (No fallback)
  - Purpose: Generate learning modules using LLM
  - Input: `priorities`, `timeline_months`, `experience_level`
  - Output: `basic_plan`, `advanced_plan`
  - LLM Prompts: Separate prompts for basic vs advanced modules
  - Error Handling: Fails if LLM generation fails
  - Example input:
    ```json
    {
      "critical": ["React", "Next.js", "TypeScript", "NestJS"],
      "supporting": ["Testing", "CI/CD"],
      "timeline_months": 3,
      "experience_level": "intermediate"
    }
    ```
  - Example output:
    ```json
    {
      "basic_plan": [
        { "title": "React Fundamentals", "duration": "2 weeks", "outcome": "Build interactive UIs", "assessment": "Create a todo app" }
      ],
      "advanced_plan": [
        { "title": "Performance Optimization", "duration": "1 week", "outcome": "Optimize React apps", "assessment": "Achieve 90+ Lighthouse score" }
      ]
    }
    ```

- **Conditional: RAG Check**
  - Condition: `rag_enabled` flag
  - True: → attach_resources
  - False: → package_response

- **attach_resources** — LLM: optional (Simplified)
  - Purpose: Add curated resources to modules
  - Input: `basic_plan` modules
  - Output: Enhanced modules with `resources` field
  - Logic: Simple keyword matching with curated resource DB

- **package_response** — LLM: no (Deterministic)
  - Purpose: Final response assembly
  - Input: All processed data
  - Output: Complete `LearningPlanResponse`
  - Logic: Score projections, duration estimates, final packaging

### Key Design Principles

1. **No Fallbacks**: All critical LLM steps are required - pipeline fails if LLM calls fail
2. **LLM-First for Complex Reasoning**: Use LLM for skill extraction and module synthesis where accuracy matters most
3. **Deterministic Data Processing**: Keep data validation, gap analysis, and response packaging deterministic
4. **Structured State Management**: Use TypedDict for type-safe state management throughout the pipeline
5. **Error Propagation**: Fail fast on critical errors rather than degrading gracefully

### Prompts and parsing (keep strict and small)

- **Skill Extraction Prompt**: Comprehensive extraction with specific examples and clear instructions
  - Input: JD text only; no resume to avoid leakage
  - Output: `{ "skills": string[] }` with validation for minimum skills

- **Module Synthesis Prompts**: Separate prompts for basic vs advanced modules
  - Input: Structured priorities, timeline, and experience level
  - Output: JSON with `title`, `duration`, `outcome`, `assessment` fields only

This ensures maximum accuracy by leveraging LLM capabilities throughout critical reasoning steps while maintaining structured data flow and error handling.
