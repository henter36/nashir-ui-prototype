# Workspace and Minimum Identity Decision

## 1. Executive Decision

GO for documenting the V1 workspace and minimum identity model.

V1 decision: one Workspace has one StoreProfile.

Post-V1 may support multiple stores per Workspace.

NO-GO for API Contract Gate until this decision is documented.

This is documentation-only and does not implement authentication, authorization, backend services, API routes, database schema, or migrations.

## 2. Why This Decision Is Required

API endpoints need a stable tenant boundary before contracts are written. Without a clear workspace boundary, products, campaigns, assets, strategic plans, content outputs, and audit events cannot be scoped safely.

ERD relationships also depend on whether products, campaigns, and assets belong directly to a workspace or to one of many stores inside a workspace. The current prototype journey treats the store as the commercial identity for the workspace, not as one store among many.

Campaign and strategic plan references require stable workspace/store ownership. A campaign needs to know which workspace owns it, which product it references, and which strategic plan recommendation it snapshotted.

Multi-store support too early increases complexity across routing, permissions, product catalogs, asset ownership, campaign selection, strategy refresh, and analytics. V1 should preserve future compatibility without implementing multi-store behavior.

## 3. V1 Workspace Boundary

Workspace is the top-level tenant boundary.

In V1, each Workspace has exactly one StoreProfile.

Products, Assets, StoreStrategicPlan, Campaigns, ContentOutputs, ReviewFindings, PublishingReadiness, ModelRoutes, PromptTemplates, CostPolicies, and AuditEvents belong to the Workspace.

StoreProfile acts as the commercial identity of the Workspace. It contains the store name, selling context, category, audience assumptions, policies, channel preferences, and setup state.

StoreProfile is not optional after setup. A Workspace may be created before setup is complete, but the commercial journey cannot be considered ready until the StoreProfile exists.

## 4. Why Single-Store in V1

Single-store V1 matches the current UI prototype: setup, product catalog, asset library, strategic plan, campaign creation, content review, and dashboard reflection all assume one commercial store context.

Single-store V1 reduces API and ERD complexity. Products, assets, campaigns, strategic plans, content outputs, and publishing readiness can all be workspace-scoped without store switching.

Single-store V1 avoids cross-store campaign ambiguity. A campaign references one product in the workspace, and that product implicitly belongs to the single StoreProfile.

Single-store V1 avoids duplicated product/asset ownership logic. Asset linking and campaign selection can remain focused on product and campaign identity rather than cross-store ownership.

Single-store V1 allows faster implementation of the commercial journey. Multi-store concerns can be designed into IDs and schema relationships without appearing in UI or API behavior yet.

Multi-store can be added later without blocking the current journey if IDs are designed carefully and `storeProfileId` remains available where future scoping needs it.

## 5. Post-V1 Multi-Store Expansion

A future Workspace may have many StoreProfiles.

Products, Assets, Campaigns, StoreStrategicPlans, and SocialStoreIntelligenceReports may then need explicit `storeProfileId` scoping.

The UI would need a store switcher or a persistent store context so users know which store they are editing, analyzing, or creating campaigns for.

API endpoints may need `storeProfileId` path or query scoping for product catalogs, assets, campaigns, strategic plans, analytics, and connector reports.

Post-V1 multi-store support is not part of V1. It should be treated as a deliberate expansion, not an accidental side effect of V1 endpoint design.

## 6. Minimum Identity Model

| Identifier | Purpose | Where It Appears Later | Required in V1 API Contracts | Implemented in Current Prototype |
|---|---|---|---|---|
| `workspaceId` | Top-level tenant boundary and data isolation scope. | All workspace-owned endpoints, tables, audit events, model operations, campaigns, products, assets. | Yes. | No; prototype uses local UI state and local stores. |
| `storeProfileId` | Commercial store identity inside a workspace. | Store profile, strategic plans, social intelligence, future multi-store products/assets/campaigns. | Yes for StoreProfile and StoreStrategicPlan. Optional/future-compatible elsewhere in V1. | Partially represented conceptually by store/profile references, not as production ID. |
| `userId` | Human user identity. | Authenticated requests, created/updated by fields, review decisions, audit events. | Yes once auth exists; can be represented in API planning before auth implementation. | No. |
| `roleId` | Authorization role reference. | RBAC, permission checks, approval gates, admin changes. | Yes for planning; enforcement later. | No. |
| `actorId` | Abstraction for user or service actor performing an action. | Audit events, connector runs, AI jobs, scheduled jobs. | Yes for audit/event contracts where actions may be automated. | No. |

## 7. V1 Identity Rules

Every entity belongs to `workspaceId`.

StoreProfile belongs to `workspaceId`.

Product belongs to `workspaceId` and implicitly the single StoreProfile in V1.

Asset belongs to `workspaceId` and may reference `productId`.

StoreStrategicPlan belongs to `workspaceId` and StoreProfile.

Campaign belongs to `workspaceId` and references `productId`.

CampaignContentOutput belongs to `campaignId` and `workspaceId`.

ReviewFinding references `contentOutputId`.

PublishingReadiness references `campaignId` and/or `contentOutputId`.

AuditEvent must include `workspaceId` and `actorId` or `userId` later.

ModelProvider, ModelRoute, PromptTemplate, WorkflowRun, and CostPolicy are scoped to `workspaceId`.

User-facing names are never canonical identity. Product names, campaign names, asset names, and store names are display labels only.

## 8. User / Role Model for V1

Minimum conceptual roles:

- `owner`: owns workspace-level administration and sensitive policy changes.
- `admin`: manages settings, integrations, team access, model/provider configuration, and operational controls.
- `marketer`: creates campaigns, drafts content, selects products/assets, and works with strategy recommendations.
- `reviewer`: reviews content, approves/rejects outputs, and participates in publishing readiness gates.
- `viewer`: reads reports, dashboards, campaigns, and content without changing operational state.

These roles are conceptual for API planning.

There is no authentication implementation in this prototype.

There is no real RBAC enforcement yet.

Future API implementation must include authorization checks on workspace, entity, and action boundaries.

## 9. Service Actor and Automation Identity

Some actions may be performed by system jobs later.

Use `actorType`: `user` / `service` / `system`.

Connector runs, AI tasks, scheduled jobs, workflow processing, strategy refreshes, and automated status updates should be attributable.

This is important for `audit_events`, troubleshooting, compliance, and review workflows.

`actorId` should identify the user or service actor. For system-generated actions, `actorType = system` may be paired with a stable system actor reference.

## 10. Audit Requirements

AuditEvent should later capture:

- `workspaceId`
- `actorId`
- `actorType`
- `roleId` if available
- `action`
- `entityType`
- `entityId`
- before/after summary if applicable
- timestamp
- decision/result

Events that must be auditable later:

- strategic plan save/approve
- campaign create/update
- content review decision
- publishing readiness change
- model route change
- provider/secret reference change
- connector run start/fail/complete
- cost policy threshold change

Audit events must not store secret values or raw sensitive payloads.

## 11. Impact on API Contract Gate

API Contract Gate should assume workspace-scoped endpoints.

V1 has one StoreProfile per Workspace.

V1 has no store switcher.

Future-compatible IDs should still allow adding `storeProfileId` later where multi-store support requires it.

API examples should include `workspaceId` in route paths or request context.

Example endpoint shapes:

- `/workspaces/{workspaceId}/store-profile`
- `/workspaces/{workspaceId}/products`
- `/workspaces/{workspaceId}/assets`
- `/workspaces/{workspaceId}/store-strategic-plans`
- `/workspaces/{workspaceId}/campaigns`
- `/workspaces/{workspaceId}/campaigns/{campaignId}/content`
- `/workspaces/{workspaceId}/review-findings`
- `/workspaces/{workspaceId}/publishing-readiness`

These examples are not OpenAPI definitions.

## 12. Impact on ERD / SQL Planning

The `workspaces` table is the parent table.

The `store_profiles` table has `workspace_id` with a unique constraint in V1.

Products, assets, campaigns, content outputs, review findings, publishing readiness, model providers, model routes, prompt templates, workflow runs, cost policies, and audit events include `workspace_id`.

`store_profile_id` may exist where helpful, especially on StoreStrategicPlan and future social intelligence reports, but V1 should not require multi-store routing behavior.

Multi-store support later may relax the unique workspace/store constraint and require explicit store scoping in more tables and API filters.

This section does not define SQL.

## 13. Risks If Not Decided

API endpoints will be unstable.

Campaign/product ownership becomes ambiguous.

Future multi-store support may force a rewrite if V1 identity rules are informal.

Audit logs may lack a tenant boundary.

Permissions cannot be scoped safely.

Data isolation risk increases if entities are not workspace-scoped from the beginning.

Strategic plan, campaign, content, and publishing readiness references may drift or rely on user-facing names.

## 14. NO-GO

Do not implement authentication now.

Do not implement RBAC now.

Do not add multi-store UI now.

Do not add a store switcher now.

Do not start API Contract Gate before this decision is merged.

Do not make user-facing names act as identity.

Do not write SQL, OpenAPI, migrations, backend services, auth providers, or permission enforcement in this gate.

## 15. Final Position

For V1, Nashir uses one Workspace with one StoreProfile.

All core entities are workspace-scoped.

Minimum identity for API planning is `workspaceId`, `storeProfileId`, `userId`, `roleId`, and `actorType`.

This document clears the final identity decision needed before API Contract Gate.
