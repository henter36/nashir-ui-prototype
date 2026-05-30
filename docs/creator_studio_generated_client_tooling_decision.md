# Creator Studio Generated Client Tooling Decision

## 1. Status and Scope

| Field | Value |
|---|---|
| Gate type | Tooling decision document |
| Generated client | NO — not created in this slice |
| Package changes | NO — not made in this slice |
| Runtime / backend integration | NO-GO in this slice |
| UI API calls | NO-GO in this slice |
| OpenAPI YAML changes | NO-GO in this slice |
| Code generation | NO-GO in this slice |

This document decides the tooling direction for a future Creator Studio generated-client implementation. No code is generated, no packages are installed, and no runtime integration is approved.

---

## 2. Source Documents Reviewed

| Document | Role |
|---|---|
| `docs/nashir_v1_openapi.yaml` | Contract to generate from; `openapi: 3.1.0` |
| `docs/creator_studio_generated_client_planning_gate.md` | Scope, risks, pre-generation checklist, GO gate for this slice |
| `docs/creator_studio_openapi_fix_review_gate.md` | B-1–B-4 closed; B-5 withdrawn; GO issued |
| `package.json` | Repo toolchain: React 19 / Vite 8 / ESM / JSX — no TypeScript source files |

---

## 3. Contract Constraints

The following constraints are verified from the YAML and planning gate, and must be respected by any generator selection:

| Constraint | Source | Rule |
|---|---|---|
| OpenAPI version | `openapi: 3.1.0` at YAML line 1 | Generator must parse 3.1 natively |
| Nullable type arrays | `type: ["string", "null"]` in `CreatorTransferPayloadSummary` | Generator must produce correct null union types; must not convert to `nullable: true` |
| `allOf` composition | All 4 specialized transfer create request schemas | Generator must flatten or extend correctly — must not silently drop constraints |
| Closed objects | `additionalProperties: false` on `CreatorManualContext` and `CreatorTransferPayloadSummary` | Generator must not produce open object types |
| Generated scope | Creator Studio paths only for first slice | Generator config must not generate non-Creator Studio paths |
| No backend | No live API exists | Generated output must not assume a runtime API endpoint is reachable |
| No runtime UI usage | Prototype UI must not import generated output | Hard rule enforced until a separate backend + runtime integration gate is approved |

---

## 4. Tooling Options Compared

### A — `openapi-typescript`

A types-only generator that produces TypeScript interface definitions from an OpenAPI spec.

| Dimension | Assessment |
|---|---|
| OpenAPI 3.1 support | YES — v6+ and v7 have explicit 3.1 support including type arrays |
| `type: [...]` null union | YES — generates `string \| null` correctly |
| `allOf` composition | YES — produces TypeScript intersections (`A & B`) which correctly model the base + extension pattern |
| `additionalProperties: false` | YES — closed objects generate typed interfaces without index signatures |
| Enum handling | Generates string literal union types; stable naming if schema names are stable |
| Generated output | Types only — `.d.ts`-style or inline TypeScript; no runtime client code |
| Package impact | One lightweight devDependency; no runtime dependency added |
| JSX repo fit | Types can be consumed via JSDoc `@type` annotations in JSX files without converting to TSX |
| Reproducibility | Deterministic from same YAML input |
| Runtime coupling | None — types only; no fetch client, no axios, no generated HTTP calls |
| Risk of premature backend assumptions | LOW — types-only output cannot make HTTP calls |
| Suitability for first slice | **HIGH** — lowest risk, fits the prototype-only constraint, validates contract without runtime exposure |

### B — `openapi-generator-cli` (typescript-fetch or typescript-axios)

A full-client generator that produces TypeScript classes with fetch or axios transport.

| Dimension | Assessment |
|---|---|
| OpenAPI 3.1 support | UNCERTAIN — generator support varies by version and template; 3.1 type array support is not guaranteed without explicit validation |
| `type: [...]` null union | UNCERTAIN — may substitute `nullable: true` internally; must be tested before use |
| `allOf` composition | UNCERTAIN — some templates flatten allOf to merged interfaces; may drop per-extension required fields |
| `additionalProperties: false` | Variable — depends on template version |
| Generated output | Full runtime client: models, APIs, configuration, fetch/axios imports |
| Package impact | Heavier — Java runtime required for CLI; runtime dep (node-fetch or axios) added; significant lockfile change |
| JSX repo fit | Requires TypeScript project config (tsconfig.json) and `.ts`/`.tsx` conversion or separate compilation step |
| Reproducibility | Depends on generator version and config; large generated surface increases diff noise |
| Runtime coupling | HIGH — generates HTTP call infrastructure; risk of UI importing runtime client before backend exists |
| Risk of premature backend assumptions | HIGH — generated fetch/axios methods imply a live endpoint |
| Suitability for first slice | **LOW** — higher setup cost, uncertain 3.1 compatibility, premature runtime surface |

### C — Manual hand-written types

Manually written TypeScript interfaces that mirror the OpenAPI schemas.

| Dimension | Assessment |
|---|---|
| OpenAPI 3.1 support | N/A — manual; no parsing |
| Accuracy | Drifts from YAML on every schema change unless manually updated |
| Package impact | None |
| Maintenance burden | HIGH — every YAML change requires manual type update; no automated verification |
| Suitability | NOT PREFERRED — OpenAPI is the source of truth; manual types undermine contract integrity |

---

## 5. Decision Criteria Summary

| Criterion | openapi-typescript | openapi-generator-cli | Manual types |
|---|---|---|---|
| OpenAPI 3.1 support | ✓ verified | ✗ unverified | N/A |
| Null union `type: [...]` | ✓ correct | ✗ uncertain | N/A |
| `allOf` handling | ✓ intersections | ✗ uncertain | N/A |
| Closed object support | ✓ | ✗ uncertain | N/A |
| Generated output size | Small | Large | None |
| Package impact | Minimal (1 devDep) | Heavy (Java + runtime) | None |
| Runtime coupling | None | High | None |
| JSX compatibility | ✓ via JSDoc | ✗ requires TSX/tsconfig | ✓ |
| Reviewability | Clean, readable | Large diff surface | Manual |
| Reproducibility | ✓ | ✓ (with pinned version) | ✗ |
| Backend assumption risk | None | High | None |
| Verdict for first slice | **Recommended** | Deferred | Not preferred |

---

## 6. Recommended Decision

**Recommended: GO to Creator Studio Generated Types Slice using `openapi-typescript`.**

**Rationale:**

1. `openapi-typescript` is the only option with confirmed OpenAPI 3.1 support, correct null union handling, and correct `allOf` output — all required by the Creator Studio contract.
2. Types-only output eliminates the risk of importing a runtime HTTP client into the prototype UI before a backend exists.
3. No TypeScript project conversion is required — types can be consumed via JSDoc annotations in JSX files.
4. Minimal package footprint — one devDependency, no runtime dependency, no Java runtime.
5. Validated contract: B-1–B-4 closed, B-5 withdrawn, OpenAPI 3.1 confirmed.

**Deferred: Runtime fetch client generation.** `openapi-generator-cli typescript-fetch` must not be used as the first generated-client slice. It may be reconsidered in a later Runtime Client Planning slice after a backend exists and OpenAPI 3.1 template compatibility is validated.

**Deferred: Manual hand-written types.** Not preferred. OpenAPI YAML is the source of truth; manual types drift.

---

## 7. Proposed Future Output Boundary

The following path is recommended for generated types output. The final path must be approved before any generation.

**Recommended path:** `src/generated/creator-studio-openapi-types/index.d.ts`

**Reasoning:** `generated/` signals automated output; `creator-studio-openapi-types/` is explicit about content and source.

**Rules (to be enforced in implementation slice):**

- Generated files must not be hand-edited. All changes go through YAML → regenerate cycle.
- No hand-written file in `src/pages/`, `src/components/`, `src/utils/`, or `src/data/` may import from the generated path until a backend and runtime integration gate are separately approved.
- Generated output must be committed to the repository and reviewed in a PR as a generated artifact.
- Generated output must be reproducible: same YAML input → identical output.
- A generation script or Makefile target must be defined in the implementation slice so any contributor can regenerate deterministically.

---

## 8. Package Strategy

This slice makes no package changes.

For the implementation slice, the following strategy is proposed:

| Decision | Recommendation |
|---|---|
| Generator package | `openapi-typescript` added as a `devDependency` in `package.json` |
| Version pinning | Pin to a specific minor version; do not use `latest` |
| Runtime dep | None — `openapi-typescript` produces types only; no axios, no node-fetch |
| Installation timing | Package added in the Generated Types Implementation Slice PR, not before |
| Lockfile | `package-lock.json` updated in that same PR; not before |
| Script | A `generate:creator-studio-types` npm script added in that PR |

The package addition must be reviewed alongside the first generated output to verify:
- Generated types are correct for Creator Studio schemas.
- No unintended packages are pulled in transitively.
- `npm run build` and `npm run lint` still pass after package addition and generation.

---

## 9. JSX / Type Consumption Strategy

The current repo uses React/Vite JSX. There are no `.ts` or `.tsx` source files in `src/`.

`openapi-typescript` produces TypeScript type definitions. These can be consumed in a JSX project without a full TypeScript migration using one of two strategies:

**Strategy A — JSDoc imports (no TSX conversion)**

Generated types live in the output path. JSX files reference them via JSDoc annotations:

```js
/** @type {import('../generated/creator-studio-openapi-types').CreatorStudioSession} */
const session = ...;
```

Requires: `checkJs: true` in a minimal `jsconfig.json`, or both `allowJs: true` and `checkJs: true` in `tsconfig.json` for type-check only usage.

**Strategy B — Separate type-check step**

Run `tsc --noEmit` over the generated types path only to verify generated types are internally consistent. JSX app code does not import them until runtime integration is approved.

**Constraints:**

- Do not convert JSX pages or components to TSX in the generated-client slice.
- Do not force an app-wide TypeScript migration.
- The consumption strategy (A or B above) must be decided in the implementation slice, not before.
- Any `tsconfig.json` or `jsconfig.json` additions must be reviewed in the same PR as the generated output.

---

## 10. Pre-Implementation Checklist

Before the Generated Types Implementation Slice begins:

- [ ] `openapi-typescript` version confirmed to support OpenAPI 3.1.0
- [ ] `openapi-typescript` confirmed to produce `string | null` from `type: ["string", "null"]`
- [ ] `openapi-typescript` confirmed to produce correct intersection types from `allOf` schemas
- [ ] No unresolved Gemini / CodeRabbit / Sonar comments on Creator Studio YAML
- [ ] Final output path approved (`src/generated/creator-studio-openapi-types/index.d.ts` or alternative)
- [ ] Package strategy approved (`devDependency`, pinned version)
- [ ] Type consumption strategy approved (JSDoc vs separate type-check step)
- [ ] Generation script name approved (`generate:creator-studio-types` or equivalent)
- [ ] Generated artifact review process confirmed (PR-required, no manual edits)
- [ ] Hard rule confirmed: no import of generated types into prototype UI until backend + runtime integration gate
- [ ] `npm run build` and `npm run lint` confirmed to pass after package add and generation

---

## 11. Explicit Non-Goals

- No generated types in this slice.
- No generated client in this slice.
- No package installation.
- No lockfile changes.
- No backend or runtime integration.
- No UI API calls.
- No fetch client or axios client.
- No auth implementation.
- No direct publishing, scraping, OAuth, or AI execution.
- No TypeScript migration of existing JSX source files.

---

## 12. Findings

### Blocking before generated types implementation

**B-GC-1 — Type consumption strategy must be decided before implementation**

| Field | Value |
|---|---|
| Severity | Blocking before implementation |
| Evidence | The repo uses JSX with no tsconfig or jsconfig. `openapi-typescript` produces TypeScript output. The implementation slice cannot proceed without deciding whether to use JSDoc imports, a separate type-check step, or another pattern. |
| Required resolution | Implementation slice must include the type consumption decision and any tsconfig/jsconfig additions. |
| Owner | Generated Types Implementation Planning Slice |

**B-GC-2 — `openapi-typescript` version and 3.1 output must be validated before package approval**

| Field | Value |
|---|---|
| Severity | Blocking before implementation |
| Evidence | Tool compatibility is assessed from documentation only in this slice. Actual generation must be validated against a Creator Studio schema subset (at minimum `CreatorTransferPayloadSummary` for null union and one allOf schema) before the implementation slice is approved. |
| Required resolution | Implementation slice must include a validation step as part of the PR before generated output is committed. |
| Owner | Generated Types Implementation Planning Slice |

### Non-blocking before generated types implementation

**NB-GC-1 — Runtime client generation deferred, not blocked**

| Field | Value |
|---|---|
| Severity | Non-blocking |
| Evidence | `openapi-generator-cli typescript-fetch` is explicitly deferred, not permanently excluded. It may be reconsidered in a Runtime Client Planning Slice after a backend exists and OpenAPI 3.1 template compatibility is separately validated. |

### Watch items

**W-1** — `payloadSummary` is optional in `CreatorTransferDraft`. Generated types must not treat it as required. Any consuming code must null-guard access.

**W-2** — `CreatorManualContext` closed shape (`additionalProperties: false`). Future extension requires a YAML slice before generated types are re-frozen.

**W-3** — Campaign and Prompt Governance transfer create requests have no additional required fields beyond `draftId`. Generated client overrides must remain optional.

**W-4** — All generator config changes must be reviewed alongside generated output diffs. Generator version bumps require regeneration and re-review.

---

## 13. Decision

Two blocking gaps (B-GC-1 and B-GC-2) remain — both are pre-implementation conditions, not blockers on the planning decision itself. The tooling direction is clear.

**GO to Creator Studio Generated Types Implementation Planning Slice.**

**NO-GO to generated runtime fetch client** (deferred until a backend exists and toolchain compatibility is validated).

**NO-GO to generated types implementation** until B-GC-1 (type consumption strategy) and B-GC-2 (generator 3.1 validation) are resolved within the implementation slice.

**NO-GO to UI API integration.**

**NO-GO to backend / runtime implementation.**

### Next slice: Creator Studio Generated Types Implementation Planning Slice

Must resolve:

- B-GC-1: decide type consumption strategy (JSDoc vs separate type-check step) and add any required config.
- B-GC-2: validate `openapi-typescript` against Creator Studio YAML subset before committing generated output.
- Approve output path, package strategy, generation script, and review process.

### Reference documents

- `docs/creator_studio_generated_client_planning_gate.md` — GO gate for this slice
- `docs/creator_studio_openapi_fix_review_gate.md` — B-1–B-4 closed; B-5 withdrawn
- `docs/nashir_v1_openapi.yaml` — contract to generate from
