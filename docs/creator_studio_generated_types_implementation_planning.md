# Creator Studio Generated Types Implementation Planning

## 1. Status and Scope

| Field | Value |
|---|---|
| Gate type | Implementation planning only |
| Generated types | NO — not created in this slice |
| Package changes | NO — not made in this slice |
| Runtime / backend integration | NO-GO in this slice |
| UI API calls | NO-GO in this slice |
| OpenAPI YAML changes | NO-GO in this slice |
| Code generation | NO-GO in this slice |

This document closes B-GC-1 and B-GC-2 at the planning level and defines the exact implementation scope, command draft, output boundary, and verification plan for the future Creator Studio Generated Types Implementation Slice.

---

## 2. Source Documents Reviewed

| Document | Role |
|---|---|
| `docs/nashir_v1_openapi.yaml` | Contract to generate from; `openapi: 3.1.0` |
| `docs/creator_studio_generated_client_tooling_decision.md` | Tooling decision: `openapi-typescript`, types-only |
| `docs/creator_studio_generated_client_planning_gate.md` | Scope, risks, pre-generation checklist |
| `docs/creator_studio_openapi_fix_review_gate.md` | B-1–B-4 closed; B-5 withdrawn |
| `package.json` | React 19 / Vite 8 / ESM / JSX — no TypeScript source files |

---

## 3. Planning Objective

The future implementation slice must:

- Generate Creator Studio OpenAPI types only (`.d.ts` artifact) using `openapi-typescript`.
- Use `docs/nashir_v1_openapi.yaml` as the sole source of truth.
- Keep the generated artifact fully isolated in `src/generated/creator-studio-openapi-types/`.
- Not introduce a runtime fetch client.
- Not connect UI to any API.
- Not imply a backend exists.
- Not trigger any API calls during generation or at test time.

---

## 4. B-GC-1 Closure — JSX Type Consumption Strategy

### Context

The repo uses React/Vite JSX (`src/` contains `.jsx` files only). No `.ts`/`.tsx` source files exist. No `tsconfig.json` or `jsconfig.json` exists in the repo.

### Resolved strategy

Generated TypeScript type definitions (`.d.ts` output) may be consumed in JSX files via **JSDoc imports** only, without converting JSX to TSX:

```js
/** @type {import('../generated/creator-studio-openapi-types').CreatorStudioSession} */
const session = ...;
```

This approach requires no app-wide TypeScript migration and no source file conversion.

### Constraints recorded

- The future generated types slice must not convert any JSX files to TSX.
- The future generated types slice must not add a mandatory `tsconfig.json` or `jsconfig.json` — those changes belong to a separate approved UI typing slice.
- If a type-check step is added alongside generation, it must be scoped to the generated path only, not the full `src/` tree.
- Generated types must not be imported into prototype UI until a backend and runtime integration gate are separately approved.

### B-GC-1 Decision: CLOSED at planning level

The consumption strategy is recorded. Actual `jsconfig.json`/`tsconfig.json` changes remain deferred to a separate slice. The implementation slice may proceed with types-only generation without a type-check step, or may add a scoped type-check step as long as it does not affect `src/pages/`, `src/components/`, or `src/utils/`.

---

## 5. B-GC-2 Closure — `openapi-typescript` Compatibility Verification Strategy

### Package metadata verified (read-only, no install)

```
openapi-typescript@7.13.0
Description: Convert OpenAPI 3.0 & 3.1 schemas to TypeScript
```

This confirms documented OpenAPI 3.1 support. This is metadata evidence only — the full output has not been generated. The implementation slice must validate actual generated output before committing generated files.

### Mandatory verification requirements for the implementation slice

The implementation slice must complete all of the following before committing generated output:

| Check | Method |
|---|---|
| Null union output | Inspect generated type for `CreatorTransferPayloadSummary.contentId` — expect `string \| null`, not `any` or `string` |
| `allOf` output | Inspect generated type for `CreatorContentStudioTransferDraftCreateRequest` — expect intersection or merged type with `draftId` and `promptVersionId` both typed |
| Closed object behavior | Inspect generated type for `CreatorManualContext` — expect no index signature (`[key: string]: unknown`) |
| Enum output | Inspect generated types for `CreatorStudioSessionStatus`, `CreatorContextDraftStatus`, `CreatorTransferDraftStatus` — expect string literal unions |
| Coverage | Confirm `CreatorStudioSession`, `CreatorContextDraft`, `CreatorTransferDraft`, `CreatorReadinessAssessment`, all four transfer create request schemas appear in the generated output |
| No runtime code | Confirm generated output contains no `fetch(`, `axios`, `XMLHttpRequest`, or HTTP import |
| Generator version | Record the exact version used (`openapi-typescript@7.13.0` or later pinned version) |

### B-GC-2 Decision: CLOSED at planning level

Verification requirements are mandatory and recorded. The implementation slice may not skip or defer the spot checks. If any check fails, the implementation slice must halt and open a new planning fix before committing generated output.

---

## 6. Future Implementation Scope

The following is approved for the future Generated Types Implementation Slice only, after this planning document is accepted:

| Item | Allowed |
|---|---|
| Add `openapi-typescript` to `package.json` as `devDependency` | YES — if explicitly approved in implementation PR |
| Update `package-lock.json` | YES — as part of the same implementation PR |
| Generate types to `src/generated/creator-studio-openapi-types/index.d.ts` | YES |
| Add `generate:creator-studio-types` npm script | YES — optional; if added, must be reviewed in same PR |
| Commit generated output | YES — after mandatory spot checks pass |
| Import generated types into `src/pages/`, `src/components/`, or `src/utils/` | NO — not until backend + runtime integration gate |
| Add fetch/axios client code | NO |
| Add API calls | NO |
| Backend/runtime integration | NO |

---

## 7. Future Implementation Command Draft

The following command is proposed but must not be run in this slice. It is documented for review only.

**Candidate command:**

```sh
npx openapi-typescript docs/nashir_v1_openapi.yaml \
  --output src/generated/creator-studio-openapi-types/index.d.ts
```

**Important caveats:**

- `openapi-typescript` generates types for the entire YAML by default, not only Creator Studio schemas. The generated output will include types for Products, Assets, Campaign Content, and AI Readiness paths as well.
- This is acceptable — the generated artifact is an isolated `.d.ts` file. Only Creator Studio types need to be consumed, but generating the full contract is safer than attempting to filter, which could silently omit shared schemas.
- The implementation slice must not claim the generated output is Creator Studio-only if it contains all schemas. The output file must be reviewed as a full-contract type artifact.
- If a filtering strategy is needed in future, it must be separately planned.

**Version pinning:**

The implementation PR must use a pinned version, not `npx openapi-typescript@latest`:

```sh
npx openapi-typescript@7.13.0 docs/nashir_v1_openapi.yaml \
  --output src/generated/creator-studio-openapi-types/index.d.ts
```

---

## 8. Output Boundary

| Rule | Value |
|---|---|
| Output path | `src/generated/creator-studio-openapi-types/index.d.ts` |
| Hand-editing | Prohibited — changes must go through YAML → regenerate cycle |
| Reproducibility | Identical YAML + identical generator version → identical output |
| Review | Generated file reviewed as generated artifact in implementation PR |
| Isolation | No hand-written file may import from this path until runtime integration gate |
| `.gitignore` vs committed | Implementation slice must decide — recommended: commit the generated output for contract traceability |

---

## 9. Package Strategy

This planning slice makes no package changes.

For the implementation slice:

| Item | Plan |
|---|---|
| Package | `openapi-typescript@7.13.0` (or latest stable at implementation time) as `devDependency` |
| Runtime dep | None — `openapi-typescript` is types-only; no axios, no fetch, no node-fetch |
| Install timing | Implementation slice PR only |
| Lockfile | `package-lock.json` updated in same PR |
| Broad upgrades | None — only `openapi-typescript` added |
| Script | `"generate:creator-studio-types": "openapi-typescript docs/nashir_v1_openapi.yaml -o src/generated/creator-studio-openapi-types/index.d.ts"` — optional; reviewed in same PR |

---

## 10. Verification Plan for the Future Generated Types Slice

The following checks must pass before the implementation PR can be merged:

```sh
git diff --check
git diff --name-only
npm run build
npm run lint
```

Additional checks:

- Generator version used is recorded in the PR description.
- Generated file exists at the approved output path.
- No hand-written source files changed.
- No UI file (`src/pages/`, `src/components/`, `src/utils/`) imports from generated path.
- Spot-check grep for key generated types:

```sh
grep "CreatorStudioSession" src/generated/creator-studio-openapi-types/index.d.ts
grep "CreatorContextDraft" src/generated/creator-studio-openapi-types/index.d.ts
grep "CreatorTransferPayloadSummary" src/generated/creator-studio-openapi-types/index.d.ts
grep "CreatorManualContext" src/generated/creator-studio-openapi-types/index.d.ts
grep "CreatorContentStudioTransferDraftCreateRequest" src/generated/creator-studio-openapi-types/index.d.ts
grep "CreatorPublishingTransferDraftCreateRequest" src/generated/creator-studio-openapi-types/index.d.ts
```

- Null union spot check: `contentId` in `CreatorTransferPayloadSummary` must produce `string | null`, not `any`.
- `allOf` spot check: `CreatorContentStudioTransferDraftCreateRequest` must carry `draftId` and `promptVersionId`.
- No `fetch(`, `axios`, or HTTP import in the generated file.
- `npm run build` and `npm run lint` pass after package addition and generation.

---

## 11. Explicit Non-Goals

- No generated types in this slice.
- No generated runtime client.
- No package installation.
- No lockfile changes.
- No backend or runtime integration.
- No UI API calls.
- No fetch client or axios client.
- No auth implementation.
- No direct publishing, scraping, OAuth, or AI execution.
- No JSX to TSX migration.
- No app-wide TypeScript migration.
- No `jsconfig.json` or `tsconfig.json` changes in this planning slice.

---

## 12. Risks and Controls

| Risk | Description | Mitigation |
|---|---|---|
| Generator version drift | Future implementation may use a different version than `7.13.0`; output may differ | Pin exact version in implementation PR; record version in PR description |
| Full OpenAPI output vs Creator Studio-only expectation | `openapi-typescript` generates all schemas; generated file includes non-Creator Studio types | Accept full-contract output in isolated path; document explicitly in implementation PR |
| Accidental runtime client | Wrong generator config produces fetch methods | Spot-check generated output for `fetch`, `axios`, `XMLHttpRequest` before merging |
| JSX/JSDoc type-check uncertainty | JSDoc imports may not be type-checked without jsconfig | Keep type-check optional in generated types slice; do not block build on it |
| Generated file churn | Every YAML change triggers full regeneration | Keep YAML changes behind separate gates; use pinned generator version |
| `allOf` typing mismatch | Generator may produce `{ draftId: string } & { promptVersionId: string }` vs other shapes | Manually review the intersection output for transfer create request schemas |
| Null union mismatch | Generator may produce `string \| null` or `string | undefined` or `any` | Spot-check `contentId` in `CreatorTransferPayloadSummary` before accepting generated output |
| Overclaiming backend readiness | Merged generated types may be interpreted as proof that API is ready | Add clear header comment in generated file: "GENERATED — no backend exists in this repository" |
| Package-lock churn | Package addition changes lockfile; affects all contributors | Add only `openapi-typescript` as devDep; review lockfile diff in implementation PR |

---

## 13. Findings

### Blocking before generated types implementation

None. B-GC-1 and B-GC-2 are closed at planning level.

### Non-blocking before generated types implementation

**NB-IMP-1 — Actual generator version must be verified at implementation time**

| Field | Value |
|---|---|
| Severity | Non-blocking for planning; required in implementation |
| Evidence | Package metadata verified: `openapi-typescript@7.13.0` available with OpenAPI 3.1 description. Full output not generated in this slice. |
| Requirement | Implementation slice must run spot checks and record verified output before merging. |

**NB-IMP-2 — Generated output covers full contract, not Creator Studio only**

| Field | Value |
|---|---|
| Severity | Non-blocking |
| Evidence | `openapi-typescript` generates all schemas from the YAML by default. |
| Assessment | Acceptable — generated file is an isolated `.d.ts` artifact. Only Creator Studio types are consumed. |
| Requirement | Implementation PR must document that the generated file covers the full contract. |

### Watch items

**W-1** — `payloadSummary` is optional in `CreatorTransferDraft`. Generated client must not treat it as required.

**W-2** — `CreatorManualContext` closed shape. Future extension requires a YAML slice before regenerating.

**W-3** — Campaign and Prompt Governance transfer create requests have no additional required fields beyond `draftId`. Generated intersection types must not add spurious required fields.

**W-4** — Generated output must carry a comment stating no backend exists. Prevents accidental interpretation as a live API client.

---

## 14. Decision

B-GC-1 CLOSED at planning level. B-GC-2 CLOSED at planning level. No blocking findings before implementation.

**GO to Creator Studio Generated Types Implementation Slice.**

**NO-GO to generated runtime fetch client.**

**NO-GO to UI API integration.**

**NO-GO to backend / runtime implementation.**

### Conditions for the implementation slice

- Use `openapi-typescript@7.13.0` (or document deviation with rationale).
- Run mandatory spot checks (null union, allOf, closed object, enum, coverage, no-fetch).
- Output path: `src/generated/creator-studio-openapi-types/index.d.ts`.
- Generated output committed and reviewed as a generated artifact.
- No hand-written file imports from generated path.
- `npm run build` and `npm run lint` pass after package addition and generation.

### Reference documents

- `docs/creator_studio_generated_client_tooling_decision.md` — tooling decision; GO gate for this slice
- `docs/creator_studio_generated_client_planning_gate.md` — scope and risk register
- `docs/nashir_v1_openapi.yaml` — contract to generate from
