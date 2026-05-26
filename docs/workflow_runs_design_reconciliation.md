# Workflow Runs Design Reconciliation Gate

## 1. Executive Decision

WorkflowRunsPage design = Accepted as UI prototype.

Runtime/backend execution = NO-GO.

Further feature expansion inside WorkflowRunsPage = NO-GO until component split or backend readiness planning.

Current gate = documentation-only.

## 2. Accepted Capabilities

The accepted WorkflowRunsPage UI prototype now covers:

| Capability | Accepted state |
| --- | --- |
| Workflow Builder | Defines route shape, steps, trigger, inputs, outputs, and review rules as UI configuration. |
| Data Flow Map | Shows trigger, input flow, step processing, outputs, review, next route, and destination. |
| Output Contracts | Summarizes output visibility, review needs, destinations, retention, and risk flags. |
| Runs Monitor | Displays prototype run state, warnings, review actions, retry/cancel actions, and safe summaries. |
| Test Run / Dry Run | Simulates readiness checks only; it does not execute routes or models. |
| Structured step input designer | Replaces free-text input setup with page/domain and field selection. |
| Multi-source selected inputs | A step can select fields from multiple pages/domains at the same time. |
| Workflow trigger model | Shows when a workflow route is expected to start. |
| Structured output fields | Captures output name, type, format, destination, visibility, review, and reuse. |
| Next-route chaining | Describes whether an output can open another route and what gets passed forward. |
| Prompt sent with output to next route | Selects a prompt association for a future route handoff without executing it. |
| Readiness reflection | Reflects trigger, selected inputs, outputs, prompt, routing, cost, and review readiness. |
| Prototype-only disclaimers | States that no real trigger, workflow, prompt, model, or backend execution happens. |

## 3. Multi-Source Input Model

A workflow step can select inputs from multiple pages/domains. Selected inputs must be represented as a page/domain label plus field label.

Changing the current selector page/domain must not remove previously selected inputs from another page/domain. The current selector only controls which field can be added next.

The UI supports removing each selected input independently. Empty selected inputs should produce a warning, not a real execution block unless later backend rules require it.

Conceptual selected input examples:

- إعداد المتجر · السوق الافتراضي
- كتالوج المنتجات · اسم المنتج
- مكتبة الأصول · الأصول المختارة
- معالج الحملة · القنوات
- مصادر البيانات · مؤشرات الأداء

## 4. Workflow Trigger Model

Accepted trigger fields:

- نوع المشغل
- متى يبدأ المسار؟
- شرط البدء
- مصدر الحدث

Accepted trigger examples:

- تشغيل يدوي
- عند إنشاء حملة
- عند اعتماد محتوى
- عند وصول بيانات جديدة
- عند اكتمال مسار سابق
- عند جدولة نشر
- عند تجاوز مؤشر أداء
- عند طلب مراجعة

Triggers are UI contracts only. No real trigger execution is implemented or approved.

## 5. Structured Output Model

Accepted output fields:

- اسم المخرج
- نوع المخرج
- صيغة المخرج
- وجهة المخرج
- مستوى الظهور
- يحتاج مراجعة؟
- يصلح كمدخل لخطوة لاحقة؟

Accepted output types:

- نص حملة
- أصل بصري
- سيناريو فيديو
- ملخص تحليلي
- توصية
- بيانات منظمة
- قائمة مهام
- قرار مراجعة

## 6. Next-Route Chaining

Accepted chaining fields:

- يفتح مسارًا تاليًا
- المسار التالي
- الخطوة التالية
- شرط الانتقال
- المدخلات المرسلة للمسار التالي

This is a UI contract only. It must later be translated into backend workflow orchestration rules before real execution.

## 7. Prompt Sent With Output

A step output may select a prompt to send with the output to the next route.

This does not execute the prompt. Prompt execution remains out of scope until backend readiness planning.

## 8. Data Flow Map Acceptance

Accepted map lanes:

- ما الذي يبدأ المسار؟
- من أين تأتي البيانات؟
- ماذا تعالج الخطوة؟
- ماذا تنتج؟
- هل يحتاج المخرج مراجعة؟
- هل يفتح مسارًا تاليًا؟
- أين يذهب المخرج؟

The map is accepted as a visual explanation of orchestration intent, not runtime behavior.

## 9. Ownership Boundaries

WorkflowRunsPage consumes readiness from provider, routing, prompt, cost, review, and destination surfaces.

WorkflowRunsPage does not own providers.

WorkflowRunsPage does not own model routing.

WorkflowRunsPage does not own prompt governance.

WorkflowRunsPage does not own cost policy.

WorkflowRunsPage does not own system-wide policy.

WorkflowRunsPage is the visual orchestration/readiness surface only.

## 10. Explicitly Out of Scope

- real workflow execution
- real trigger execution
- real AI model calls
- real prompt execution
- real publishing
- real connector calls
- backend workflow engine
- API routes
- database persistence
- generated clients
- runtime scheduler
- queue system
- billing

## 11. Risks

| Risk | Classification | Notes |
| --- | --- | --- |
| Single-page-only input selection problem | Resolved | Steps now support multi-source selected inputs. |
| Missing workflow trigger explanation | Resolved | Workflow trigger model is visible in builder, map, readiness, and dry run. |
| Dense Data Flow Map presentation | Resolved | Map now separates trigger, inputs, processing, outputs, review, next route, and destination. |
| Workflow engine planning | Backend blocker | Real execution requires a backend workflow engine contract. |
| Shared readiness model | Backend blocker | Provider, route, prompt, cost, review, and destination readiness need a shared backend model. |
| Immutable audit for run actions | Backend blocker | Run actions and decisions must be auditable later. |
| Trigger execution policy | Backend blocker | Trigger rules need scheduling/event semantics and authorization. |
| Output contract validation | Backend blocker | Runtime outputs must be validated against schemas before reuse. |
| Component split / page decomposition | Should fix before backend | WorkflowRunsPage has grown too large for continued feature additions as one file. |
| Explicit run artifact model | Should fix before backend | Runs need durable input/output artifacts before implementation. |
| Structured input/output schema model | Should fix before backend | UI labels must map to formal contracts before execution. |
| Prompt/version snapshot at run time | Should fix before backend | Real runs must snapshot prompt/version and execution context. |
| Advanced drag-and-drop workflow builder | Can defer | Useful later, not required for V1 planning. |
| Visual node graph editor | Can defer | Not required for the current requirements prototype. |
| Real-time run streaming | Can defer | Requires backend events or streaming transport. |
| Advanced scheduler UI | Can defer | Depends on runtime scheduler design. |

## 12. Performance and Maintainability Warning

WorkflowRunsPage has grown significantly.

Further UI growth should require either:

- component split gate
- backend readiness planning gate

Do not add more major features to WorkflowRunsPage as a single monolithic file.

## 13. Recommended Next Gate

Recommended next gate:

Backend Readiness Planning Gate — AI Operations Shared Readiness + Ownership Model

Do NOT recommend:

- new WorkflowRunsPage features
- real backend implementation
- Slice 3
- AI Gateway Overview
- billing

## 14. Final Decision

WorkflowRunsPage UI design = GO / Accepted.

Runtime execution = NO-GO.

Documentation gate = GO.
