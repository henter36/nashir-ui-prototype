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

## 8. Transition Rule

Before moving to backend, API, database, or production implementation, the project should pass a UI Stabilization Gate covering:

1. Final approved screen list.
2. Final user journey.
3. Component consistency review.
4. Mock-vs-real behavior marking.
5. Removal or archival of unused files.
6. Documentation alignment between README, screen map, and source code.

## 9. Immediate Risks

| Risk | Impact | Required Control |
|---|---|---|
| UI scope expansion without journey lock | Confusing product experience | Freeze new pages until journey is approved. |
| Mock actions look like real actions | User misunderstanding and governance risk | Keep warnings visible in sensitive screens. |
| Admin/governance surfaces dominate | Business user friction | Keep admin screens secondary. |
| Inline CSS and repeated card patterns | Maintenance friction | Introduce shared UI components later. |
| No real routing | Weak implementation readiness | Add React Router only after screen map stabilizes. |
