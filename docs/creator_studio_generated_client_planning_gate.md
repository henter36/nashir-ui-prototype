# Creator Studio Generated Client Planning Gate

## 1. Status and Scope

| Field | Value |
|---|---|
| Gate type | Generated client planning gate |
| Generated client | NO — not created in this slice |
| Runtime / backend integration | NO-GO in this slice |
| UI API calls | NO-GO in this slice |
| OpenAPI YAML changes | NO-GO in this slice |
| Package installation | NO-GO in this slice |
| Code generation | NO-GO in this slice |

This document plans the future Creator Studio generated client. No code is generated here. No packages are installed. No runtime integration is approved.

---

## 2. Source Documents Reviewed

| Document | Role |
|---|---|
| `docs/nashir_v1_openapi.yaml` | Contract to generate from |
| `docs/creator_studio_openapi_planning.md` | Schema, naming, and payload decisions |
| `docs/creator_studio_openapi_review_gate.md` | B-1 through B-4 findings (all closed) |
| `docs/creator_studio_openapi_fix_review_gate.md` | B-5 withdrawn; B-1–B-4 confirmed closed; GO to this gate |

---

## 3. OpenAPI Version Decision

`docs/nashir_v1_openapi.yaml` declares `openapi: 3.1.0`. This is confirmed.

| Rule | Value |
|---|---|
| Generator must support | OpenAPI 3.1 |
| `type: ["string", "null"]` | Valid in this contract — must not be converted |
| `nullable: true` | 3.0.x syntax — must not be introduced without a separate repo-wide OpenAPI 3.0 migration gate |
| Version migration | Only via a separately approved, repo-wide gate — not in a feature slice |

Any generator that does not natively support OpenAPI 3.1 multi-type arrays must not be used for this contract.

---

## 4. Generated Client Purpose

The future generated client serves the following purposes only:

- Type-safe access to the Creator Studio OpenAPI surface for future UI integration.
- Contract verification aid — generated types confirm the YAML schema is coherent.

The generated client is NOT:

- A runtime integration approval.
- Evidence that a backend exists.
- Permission to connect the prototype UI to a live API.
- An authorization to ship Creator Studio features to users.

---

## 5. Candidate Generated Client Scope

Only Creator Studio paths are in scope for the first generated-client slice:

```
/workspaces/{workspaceId}/creator-studio/sessions
/workspaces/{workspaceId}/creator-studio/sessions/{sessionId}
/workspaces/{workspaceId}/creator-studio/context-drafts
/workspaces/{workspaceId}/creator-studio/context-drafts/{draftId}
/workspaces/{workspaceId}/creator-studio/readiness-assessments
/workspaces/{workspaceId}/creator-studio/transfer-drafts/content-studio
/workspaces/{workspaceId}/creator-studio/transfer-drafts/campaign
/workspaces/{workspaceId}/creator-studio/transfer-drafts/publishing
/workspaces/{workspaceId}/creator-studio/transfer-drafts/prompt-governance
/workspaces/{workspaceId}/creator-studio/transfer-drafts/{transferId}
```

Shared parameter and schema components (`WorkspaceIdPath`, `ErrorModel`, etc.) are included where required by the Creator Studio schemas.

**Explicitly excluded from scope:**

- Non-Creator Studio paths (Products, Assets, Campaign Content, AI Readiness) — not in first slice unless a shared schema dependency requires it.
- Any publishing, scraping, OAuth ingestion, or AI execution endpoint — none exist in V1.

---

## 6. Generator Requirements

Any future generator must satisfy all of the following:

| Requirement | Rationale |
|---|---|
| OpenAPI 3.1 support | Contract declares 3.1.0; type arrays must parse correctly |
| `type: [...]` null union handling | `CreatorTransferPayloadSummary` uses `type: ["string", "null"]` |
| `allOf` composition support | All four specialized transfer create request schemas use allOf |
| `additionalProperties: false` enforcement | `CreatorManualContext` and `CreatorTransferPayloadSummary` are closed objects |
| Enum stability | 3 Creator Studio status enums must map to stable generated type names |
| ESM output compatibility | `package.json` declares `"type": "module"` — generated output must be ESM-compatible or explicitly isolated |
| No auto-modification of `package.json` | Planning only; lockfile must not change until an approved implementation slice |
| Output path isolation | Generated code must not be placed inside `src/pages/`, `src/components/`, or `src/utils/` |
| Reproducible output | Generation must produce deterministic output from the same YAML input |

**Additional repo-specific constraint:** The current project uses JavaScript (JSX), not TypeScript (no `.ts`/`.tsx` files exist in `src/`). Generator output format — TypeScript types only, full TypeScript client, or JavaScript client — must be decided in the tooling decision slice before implementation.

---

## 7. Proposed Output Boundary

The generated client output path must be approved before any code generation. Proposed candidates:

| Candidate path | Notes |
|---|---|
| `src/generated/creator-studio-api/` | Conventional; clearly separated from hand-written code |
| `src/api/generated/creator-studio/` | Signals API layer intent; slightly deeper nesting |

**Rules for the approved path:**

- Generated files must not be edited by hand after generation. Changes must go through the YAML → regenerate cycle.
- Generated output must be fully isolated from hand-written UI code; no hand-written file should import from generated output until a backend exists and a runtime integration slice is approved.
- The path must be added to `.gitignore` or committed with a clear notice — this decision belongs to the tooling decision slice.
- Generated output must be reviewed in a PR before being merged.

---

## 8. Risks and Required Controls

| Risk | Description | Mitigation |
|---|---|---|
| OpenAPI 3.1 generator compatibility | Many generators still parse 3.1 as 3.0 and mishandle `type: [...]` arrays | Verify generator against a small Creator Studio schema subset before committing to a toolchain |
| `allOf` type flattening | Some generators flatten `allOf` into a single merged type; others produce interface extensions — behavior varies | Validate flattened vs extended output for `CreatorContentStudioTransferDraftCreateRequest` specifically before adopting a generator |
| Nullable handling drift | If `nullable: true` is accidentally introduced during generation config, it conflicts with the 3.1 contract | Lock generator config; review diff for any `nullable` keyword not present in the source YAML |
| Enum drift | Generator enum names may not match YAML enum schema names — causes import mismatch after contract updates | Pin enum naming config; verify `CreatorStudioSessionStatus`, `CreatorContextDraftStatus`, `CreatorTransferDraftStatus` names |
| Accidental runtime API usage | Generated client imported into prototype UI before backend exists | Hard rule: no import of generated client into any `src/pages/`, `src/components/`, `src/utils/` file until a backend and runtime integration slice are separately approved |
| Generated code churn | Each YAML change triggers full regeneration; large diffs are hard to review | Use a focused Creator Studio-only generation scope; generate in a dedicated CI step that fails if YAML has changed but output has not been regenerated |
| Package / lockfile churn | Generator packages added to `package.json` affect all contributors | Add generator as a dev dependency in the tooling decision slice, not before; evaluate `devDependencies` vs standalone script |
| JavaScript vs TypeScript mismatch | Current repo is JSX; a TypeScript generator produces `.ts` output that needs a TS config | Resolve in the tooling decision slice: either add TS support, use a types-only approach, or use a JS client generator |

---

## 9. Pre-Generation Checklist

Before any generated-client implementation slice is started, all of the following must be confirmed:

- [ ] `docs/nashir_v1_openapi.yaml` `openapi:` value is `3.1.0`
- [ ] No unresolved Gemini / CodeRabbit / Sonar review comments on Creator Studio YAML
- [ ] B-1 through B-4 confirmed closed; B-5 confirmed withdrawn
- [ ] Generator confirmed to support OpenAPI 3.1 `type: [...]` arrays
- [ ] Generator confirmed to handle `allOf` composition correctly
- [ ] Output path approved and documented
- [ ] Package strategy approved (devDependency vs external script vs CI tool)
- [ ] Generated code review strategy approved (PR-required, no manual edits)
- [ ] JavaScript vs TypeScript output decision approved
- [ ] Explicit rule confirmed: no import of generated client into prototype UI without a separate runtime integration gate
- [ ] No backend assumptions embedded in generated client config
- [ ] No credentials, tokens, or secrets in generator config or generated output

---

## 10. Evaluation of Candidate Generators

No generator is installed or run in this slice. The following is a conceptual comparison only.

### Option A — `openapi-typescript`

| Dimension | Assessment |
|---|---|
| OpenAPI 3.1 support | YES — v6+ has native 3.1 support including `type: [...]` unions |
| Output | TypeScript types only (`.d.ts`-style interfaces) — no runtime client code |
| `allOf` handling | Produces intersection types (`A & B`) — accurate for the specialized transfer create schemas |
| Null union handling | Generates `string \| null` correctly from `type: ["string", "null"]` |
| Package impact | Lightweight devDependency; no runtime dependency added |
| JSX repo fit | Types-only output can coexist with JSX; no `.tsx` conversion required |
| Suitability | Strong fit for contract verification and future typed access; does not generate a fetch client |

### Option B — `openapi-generator-cli` (typescript-fetch or typescript-axios)

| Dimension | Assessment |
|---|---|
| OpenAPI 3.1 support | Partial — generator versions vary; 3.1 support is generator-specific and not guaranteed |
| Output | Full TypeScript client with fetch/axios transport |
| `allOf` handling | Varies by generator version; may flatten to a merged interface |
| Null union handling | May substitute `nullable: true` patterns; requires verification |
| Package impact | Heavier; Java runtime dependency for CLI; adds axios or node-fetch as runtime dep |
| JSX repo fit | Requires TypeScript project config; significant setup before first generation |
| Suitability | More capable for runtime use; higher setup cost and 3.1 compatibility risk |

### Recommendation

No final tool selection in this gate — the tooling decision belongs to the Generated Client Tooling Decision Slice. However, `openapi-typescript` is the lower-risk starting point given:
- Native OpenAPI 3.1 support
- Types-only output (no premature runtime client)
- No TypeScript project conversion required
- Lightweight package footprint

A tooling decision slice should evaluate `openapi-typescript` against one full-client alternative and produce a committed configuration before any code generation proceeds.

---

## 11. Explicit Non-Goals

- No generated client created in this slice.
- No API runtime integration.
- No backend implementation.
- No UI API calls added.
- No auth implementation.
- No publishing integration.
- No scraping, OAuth, or AI execution endpoints exist or are approved.
- No package installation or lockfile changes.
- No TypeScript project conversion.

---

## 12. Findings

### Blocking before generated-client implementation

None. All prior blocking findings (B-1 through B-4) are closed. B-5 is withdrawn.

### Non-blocking before generated-client implementation

**NB-1 — JavaScript vs TypeScript output decision pending**

| Field | Value |
|---|---|
| Severity | Non-blocking for planning; blocking before implementation |
| Evidence | The repo uses JSX (no `.ts`/`.tsx` files). A TypeScript generator requires adding TS support. A types-only generator (`openapi-typescript`) works without it. |
| Recommendation | Resolve in the tooling decision slice before implementation. |

### Watch items

**W-1 — `payloadSummary` is optional in `CreatorTransferDraft`**

Generated client code that unconditionally reads `payloadSummary` fields will need null guards. Callers must check for presence before accessing fields.

**W-2 — `CreatorManualContext` closed shape may need extension**

`additionalProperties: false` correctly closes this schema. Any V2 extension requires a YAML slice before generated code is re-frozen.

**W-3 — Campaign and Prompt Governance transfer requests require `draftId` only**

`CreatorCampaignTransferDraftCreateRequest` and `CreatorPromptGovernanceTransferDraftCreateRequest` require only `draftId` (inherited from base); `overrides` is optional. Generated client must not treat `overrides` as required.

**W-4 — Generator toolchain must be confirmed as 3.1-capable**

Before running code generation, validate the chosen generator against a small Creator Studio schema subset containing `type: ["string", "null"]` and `allOf`. Do not assume 3.1 support without verified test output.

---

## 13. Decision

No blocking planning findings.

**GO to Creator Studio Generated Client Tooling Decision Slice.**

**NO-GO to generated-client implementation** until tooling decision is reviewed and accepted.

**NO-GO to runtime / backend / UI API integration.**

### Next slice: Creator Studio Generated Client Tooling Decision Slice

Must produce:

- Final generator selection with evidence of OpenAPI 3.1 support
- JavaScript vs TypeScript output decision
- Approved output path
- Package strategy (devDependency vs CI tool)
- Generated code review process
- Explicit no-import rule for prototype UI until a backend exists

### Reference documents

- `docs/creator_studio_openapi_fix_review_gate.md` — GO gate for this slice
- `docs/creator_studio_openapi_planning.md`
- `docs/nashir_v1_openapi.yaml` — contract to generate from
