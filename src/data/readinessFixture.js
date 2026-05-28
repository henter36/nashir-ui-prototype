export const workspaceReadinessFixture = {
  workspaceId: "ws-nashir-demo",
  overallStatus: "warning",
  totalActiveWorkflows: 3,
  blockedWorkflows: 0,
  warningWorkflows: 2,
  readyWorkflows: 1,
  unknownWorkflows: 0,
  updatedAt: "2026-05-28T12:00:00Z",
  workflows: [
    {
      workflowDefinitionId: "wf-001",
      workflowVersion: "1.0",
      name: "مسار توليد المحتوى",
      overallStatus: "ready",
      blockers: [],
      warnings: [],
    },
    {
      workflowDefinitionId: "wf-002",
      workflowVersion: "1.0",
      name: "مسار تحليل المنتج",
      overallStatus: "warning",
      blockers: [],
      warnings: [
        "مزود الذكاء الاصطناعي لم يُختبر مؤخرًا",
        "مسار النموذج يفتقر لنموذج احتياطي",
      ],
    },
    {
      workflowDefinitionId: "wf-003",
      workflowVersion: "1.0",
      name: "مسار الحملة الترويجية",
      overallStatus: "warning",
      blockers: [],
      warnings: ["قالب المطالبة بحاجة لمراجعة الاعتماد"],
    },
  ],
};
