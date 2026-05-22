# Nashir UI Prototype — Screen Map

**Document Type:** UI Prototype Screen Map  
**Status:** Current Prototype Reference  
**Scope:** React/Vite UI only  
**Backend/API/Database/Auth:** Not implemented  

## 1. Purpose

This document defines the current approved screen map for the Nashir UI prototype.

It is a UI stabilization reference only. It does not create API contracts, database schema, authorization rules, or production behavior.

## 2. Global Constraints

- All screens are local React prototype screens.
- All data is mock/seed data inside the frontend.
- No screen performs real publishing, real AI generation, real integration, authentication, or persistence.
- Any action named scan, generate, approve, publish, sync, route, or run is a local simulation unless explicitly implemented in a later backend phase.
- Screen IDs are currently controlled by local state in `src/App.jsx`, not by React Router.

## 3. Current Navigation Groups

The sidebar currently groups screens as follows:

1. **الرئيسية**
   - Dashboard
   - Store Setup
   - Product Catalog
   - Data Sources Hub
   - Asset Library

2. **الحملات والمحتوى**
   - Campaign Wizard
   - Campaigns Unified
   - Content Studio
   - Publishing Queue

3. **التحليلات والقنوات**
   - Analytics Unified
   - Template Engine
   - Multi-Platform
   - Team Collaboration

4. **الإدارة والحوكمة**
   - Workflow Runs
   - System Admin
   - Secrets and Keys
   - Model Routing
   - Prompt Governance
   - Cost Monitor
   - Settings

## 4. Approved Screens

| Screen ID | Label | File | Primary Role | User Type | Current Status | Notes |
|---|---|---|---|---|---|---|
| `dashboard` | لوحة التحكم | `src/pages/DashboardPage.jsx` | Entry point and operational overview | Business user | Active Mock | Should direct the core journey, not overload admin controls. |
| `storeSetup` | إعداد المتجر | `src/pages/StoreSetupPage.jsx` | Capture store identity, business profile, products/services context | Business user | Active Mock | Must remain the main workspace setup source before campaign creation. |
| `productCatalog` | كتالوج المنتجات | `src/pages/ProductCatalogPage.jsx` | Manage mock product/service records used by campaigns | Business user | Active Mock | Later should align with actual product database or commerce integration. |
| `dataSourcesHub` | مركز المصادر البياناتية | `src/pages/DataSourcesHubPage.jsx` | Display and simulate source/integration readiness | Business/Admin | Active Mock | No real scraping, OAuth, or API connection. |
| `assetLibrary` | مكتبة الأصول | `src/pages/AssetLibraryPage.jsx` | Manage creative assets and media references | Business user | Active Mock | Must later distinguish uploaded assets, generated assets, and licensed assets. |
| `campaigns` | معالج الحملات | `src/pages/CampaignWizardPage.jsx` | Main campaign creation flow | Business user | Active Mock | This is the current official campaign creation screen. |
| `campaignsList` | الحملات | `src/pages/CampaignsUnifiedPage.jsx` | Unified campaign list and campaign-detail surface | Business user | Active Mock | Replaces standalone list/detail separation for now. |
| `content` | المحتوى والمراجعة | `src/pages/ContentStudioPage.jsx` | Content generation, editing, review, and approval surface | Business/Reviewer | Active Mock | Temporarily absorbs standalone review/preview responsibilities. |
| `publishingQueue` | جدولة النشر | `src/pages/PublishingQueuePage.jsx` | Simulated scheduling and publishing queue | Business/Reviewer | Active Mock | Must not imply real publishing. |
| `analytics` | التحليلات | `src/pages/AnalyticsUnifiedPage.jsx` | Unified analytics and smart analytics surface | Business/Admin | Active Mock | Replaces standalone smart analytics. |
| `templateEngine` | محرك القوالب | `src/pages/TemplateEnginePage.jsx` | Manage reusable content/template concepts | Admin/Power user | Active Mock | Needs later governance around prompt/template versioning. |
| `multiPlatform` | متعدد القنوات | `src/pages/MultiPlatformPage.jsx` | Simulate multi-channel readiness and publishing governance | Business/Reviewer | Active Mock | No real social, WhatsApp, or email publishing. |
| `teamCollaboration` | تعاون الفريق | `src/pages/TeamCollaborationPage.jsx` | Roles, comments, review collaboration, and local audit-like activity | Team/Reviewer | Active Mock | Real implementation needs RBAC and immutable audit logs. |
| `workflowRuns` | تشغيلات النظام | `src/pages/WorkflowRunsPage.jsx` | Show simulated workflow runs and statuses | Admin | Active Mock | Later depends on actual orchestration/workflow backend. |
| `systemAdmin` | إدارة النظام | `src/pages/SystemAdminPage.jsx` | Administrative configuration mock | Admin | Active Mock | Must remain clearly non-production. |
| `secrets` | الأسرار والمفاتيح | `src/pages/SecretsAndKeysPage.jsx` | Mock surface for secrets/key governance | Admin | Active Mock | Must never store real secrets in frontend state. |
| `modelRouting` | توجيه النماذج | `src/pages/ModelRoutingPage.jsx` | Simulate model-provider routing and policy | Admin/Governance | Active Mock | Later requires policy engine, cost constraints, and fallback rules. |
| `promptGovernance` | حوكمة المطالبات | `src/pages/PromptGovernancePage.jsx` | Simulate prompt lifecycle, risk, review, and versioning | Admin/Governance | Active Mock | Later requires prompt registry, approvals, version locks, and audit events. |
| `costMonitor` | مراقبة التكلفة | `src/pages/CostMonitorPage.jsx` | Simulate AI cost tracking and budget guardrails | Admin/Finance | Active Mock | Later needs provider usage metering and hard spend controls. |
| `settings` | الإعدادات | `src/pages/SettingsPage.jsx` | General local prototype settings | Business/Admin | Active Mock | Must later split user, workspace, billing, and governance settings. |

## 5. Removed Standalone Screens

The following standalone pages are intentionally removed from the current screen map:

| Removed Screen | Previous Purpose | Current Decision |
|---|---|---|
| `OnboardingFlowPage` | First-time onboarding | Removed from current navigation to reduce entry-flow complexity. |
| `CampaignIntakePage` | Separate campaign intake | Replaced by `CampaignWizardPage` as the official campaign creation surface. |
| `DualGuidedIntakePage` | Separate guided/agent intake | Removed as standalone; concept may return later only after journey approval. |
| `ReviewPage` | Standalone review | Absorbed temporarily into `ContentStudioPage`. |
| `LivePreviewPage` | Standalone live preview | Absorbed temporarily into content/channel preview surfaces. |
| `SmartAnalyticsPage` | Separate smart analytics | Merged into `AnalyticsUnifiedPage`. |
| `CampaignDetailPage` | Standalone campaign detail | Merged into `CampaignsUnifiedPage`. |

## 6. Core Journey

The current core journey should be stabilized in this order:

```text
Dashboard
→ StoreSetup
→ ProductCatalog / DataSourcesHub
→ CampaignWizard
→ CampaignsUnified
→ ContentStudio
→ PublishingQueue / MultiPlatform
→ Analytics
```

Administration and governance screens support the above journey but should not dominate the first-time business user experience.

## 7. Governance Notes

### 7.1 What is documented

- Screen IDs currently used by `App.jsx`.
- Sidebar grouping currently used by `Sidebar.jsx`.
- Intended responsibility of each page.
- Mock-only constraints and deferred production dependencies.

### 7.2 What is not implemented

- React Router route URLs.
- API contracts.
- Backend workflows.
- Database persistence.
- Authentication and RBAC.
- Real integrations.
- Real AI model execution.
- Immutable audit logs.
- Real cost metering.

## 8. Single Source of Truth Rule

Any field, state, or entity that appears in more than one screen must have exactly one source of truth.

Repeated display across screens is allowed only for shortcut, summary, contextual action, or read-only convenience. It must not create a second entity, duplicate state, separate save path, or independent meaning.

### 8.1 Required Definition

If a field or entity appears in more than one screen, the project must define:

| Required Definition | Meaning |
|---|---|
| Source Entity | The single data/entity that owns the value. |
| Owner Surface | The primary screen responsible for full management. |
| Shortcut Surfaces | Screens allowed to display or trigger limited actions for convenience. |
| Editable Surfaces | Screens allowed to write back to the same source entity. |
| Read-only Mirrors | Screens allowed only to display the value. |
| Forbidden Duplicate State | Any local copy or separate interpretation that is not allowed. |

### 8.2 Allowed Repetition

A repeated field, state, or entity is allowed only when it is one of the following:

- Shortcut action.
- Summary display.
- Contextual edit of the same source entity.
- Read-only mirror.
- Operational status indicator.
- Action trigger that writes back to the same source entity.

### 8.3 Forbidden Repetition

A repeated field, state, or entity is not allowed when it creates:

- A duplicate entity.
- A second local state.
- A separate save path.
- A different meaning for the same concept.
- A conflicting status between screens.
- Hidden ownership ambiguity.
- Manual synchronization between two independent copies.

### 8.4 Current Source-of-Truth Mapping

| Concept | Source of Truth | Owner Surface | Shortcut / Mirror Surfaces |
|---|---|---|---|
| Store profile | StoreProfile | StoreSetupPage | DashboardPage, CampaignWizardPage |
| Products / services | ProductCatalog / StoreProducts | ProductCatalogPage | StoreSetupPage, CampaignWizardPage, CampaignsUnifiedPage |
| Default audience | AudienceProfile | StoreSetupPage | CampaignWizardPage, CampaignsUnifiedPage |
| Channel connections | IntegrationConnections | SettingsPage | StoreSetupPage, MultiPlatformPage, PublishingQueuePage |
| Channel readiness | IntegrationConnections + MultiPlatformReadiness | MultiPlatformPage | DashboardPage, PublishingQueuePage |
| Data sources and store scans | DataSource + StoreScanSnapshot | DataSourcesHubPage | StoreSetupPage, DashboardPage, WorkflowRunsPage |
| Governance policies | GovernancePolicy | SettingsPage / PromptGovernancePage | StoreSetupPage, ContentStudioPage, PublishingQueuePage |
| Prompt templates | PromptTemplate | PromptGovernancePage | TemplateEnginePage, ContentStudioPage |
| Content templates | ContentTemplate | TemplateEnginePage | ContentStudioPage, CampaignWizardPage |
| AI model routing | ModelRoutingPolicy | ModelRoutingPage | SettingsPage, CostMonitorPage, WorkflowRunsPage |
| Cost controls | CostPolicy / UsageBudget | CostMonitorPage | DashboardPage, SettingsPage, ModelRoutingPage |
| Workflow runs | WorkflowRun | WorkflowRunsPage | DashboardPage, StoreSetupPage, CampaignWizardPage, ContentStudioPage, PublishingQueuePage |
| Campaign brief | CampaignBrief | CampaignWizardPage | CampaignsUnifiedPage, ContentStudioPage, DashboardPage |
| Campaign content | CampaignContent | ContentStudioPage | CampaignsUnifiedPage, PublishingQueuePage, MultiPlatformPage |
| Publishing schedule | PublishingQueue | PublishingQueuePage | DashboardPage, MultiPlatformPage, CampaignsUnifiedPage |
| Analytics metrics | AnalyticsSnapshot / CampaignMetricSnapshot | AnalyticsUnifiedPage | DashboardPage, CampaignsUnifiedPage |
| Assets | Asset | AssetLibraryPage | StoreSetupPage, ContentStudioPage, MultiPlatformPage, PublishingQueuePage |
| Members and roles | WorkspaceMember / Role | SystemAdminPage | TeamCollaborationPage, SettingsPage |
| Comments and reviews | Comment / ReviewDecision | TeamCollaborationPage / ContentStudioPage | CampaignsUnifiedPage, PublishingQueuePage |
| Secrets and keys | SecretReference | SecretsAndKeysPage | SettingsPage, DataSourcesHubPage, ModelRoutingPage |

### 8.5 Channel Connection Rule

Channel connections must be represented as one shared IntegrationConnections source.

StoreSetupPage may show a shortcut to start OAuth because it helps the merchant complete setup quickly.

SettingsPage is the management surface for viewing connection status, reconnecting, disconnecting, and later managing permissions.

Both surfaces must read and write the same IntegrationConnections entity.

They must not create separate channel records, separate connection states, duplicated connection fields, or manual synchronization flows.

In the current prototype, the shared mock source is:

```text
nashir_mock_integration_connections
```

In the real implementation, this should become a backend-backed table/entity such as:

```text
integration_connections
```

or:

```text
workspace_channel_connections
```

### 8.6 Product Rule

Products and services must be represented as one ProductCatalog / StoreProducts source.

StoreSetupPage may provide a shortcut to add or review products during setup.

ProductCatalogPage remains the owner surface for full product management.

CampaignWizardPage and CampaignsUnifiedPage may select or display products, but they must not create independent product entities unless that action writes back to the same ProductCatalog source.

### 8.7 Content and Publishing Rule

PublishingQueuePage owns scheduling state, not content ownership.

CampaignContent must be owned by ContentStudioPage.

PublishingQueuePage may reference approved content and attach schedule metadata, but it must not create a separate content entity that diverges from CampaignContent.

MultiPlatformPage may display channel readiness and format readiness, but it must not create separate channel connection or publishing records.

### 8.8 Data Source and Store Scan Rule

DataSourcesHubPage owns DataSource and StoreScanSnapshot state.

StoreSetupPage may trigger or summarize a store scan as a setup shortcut, but the scan source, confidence, collected outputs, and latest scan state must resolve back to DataSourcesHubPage ownership.

### 8.9 OAuth Prototype Rule

In the prototype, OAuth buttons may simulate the connection flow and open the provider consent page for UX demonstration.

This must remain clearly marked as OAuth Mock.

The frontend must not store access tokens, refresh tokens, client secrets, or real credentials.

Real implementation must use a backend-owned OAuth flow:

```text
Frontend connect button
→ Backend starts OAuth
→ Provider consent screen
→ Backend callback
→ Backend stores encrypted token
→ Frontend displays connection status only
```

### 8.10 Review Checklist

Before approving any new screen or field, answer:

1. Does this field/entity already appear in another screen?
2. What is the source entity?
3. Which screen owns full management?
4. Is the current screen a shortcut, mirror, or owner?
5. Does this action write back to the same entity?
6. Could this create a conflicting status or duplicate state?
7. Should the field be read-only here instead?

If these questions cannot be answered, the field is not approved for implementation.

## 9. Transition Rule

Before moving to backend, API, database, or production implementation, the project should pass a UI Stabilization Gate covering:

1. Final approved screen list.
2. Final user journey.
3. Component consistency review.
4. Mock-vs-real behavior marking.
5. Removal or archival of unused files.
6. Documentation alignment between README, screen map, and source code.
7. Source-of-truth ownership review for every repeated field, state, and entity.

## 10. Immediate Risks

| Risk | Impact | Required Control |
|---|---|---|
| UI scope expansion without journey lock | Confusing product experience | Freeze new pages until journey is approved. |
| Mock actions look like real actions | User misunderstanding and governance risk | Keep warnings visible in sensitive screens. |
| Admin/governance surfaces dominate | Business user friction | Keep admin screens secondary. |
| Inline CSS and repeated card patterns | Maintenance friction | Introduce shared UI components later. |
| No real routing | Weak implementation readiness | Add React Router only after screen map stabilizes. |
| Repeated fields without source ownership | Duplicate entities and conflicting state | Apply Single Source of Truth Rule before approving fields. |
