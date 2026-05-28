import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  CircleAlert,
  Eye,
  Flag,
  HelpCircle,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import {
  addActivity,
  readActivityLog,
  readWorkspaceMembers,
  readWorkspaceRoles,
} from "../utils/teamAccessStore.js";
import ReadinessBadge from "../components/ui/ReadinessBadge.jsx";
import { workspaceReadinessFixture } from "../data/readinessFixture.js";

const workspaces = [
  {
    id: "ws-001",
    name: "متجر النمو",
    plan: "Growth",
    owner: "أحمد السعيد",
    status: "active",
    campaigns: 15,
    users: 4,
    risk: "low",
  },
  {
    id: "ws-002",
    name: "متجر العطور",
    plan: "Starter",
    owner: "سارة محمد",
    status: "review",
    campaigns: 6,
    users: 2,
    risk: "medium",
  },
  {
    id: "ws-003",
    name: "متجر الهدايا",
    plan: "Trial",
    owner: "محمد خالد",
    status: "limited",
    campaigns: 2,
    users: 1,
    risk: "high",
  },
];

const users = [
  {
    name: "أحمد السعيد",
    email: "ahmad@example.com",
    role: "Owner",
    workspace: "متجر النمو",
    status: "نشط",
  },
  {
    name: "سارة محمد",
    email: "sarah@example.com",
    role: "Reviewer",
    workspace: "متجر العطور",
    status: "بانتظار مراجعة",
  },
  {
    name: "محمد خالد",
    email: "mohammad@example.com",
    role: "Editor",
    workspace: "متجر الهدايا",
    status: "محدود",
  },
];

const roles = [
  {
    id: "Owner",
    label: "Owner",
    description: "إدارة الفريق والصلاحيات والاعتماد النهائي.",
    tone: "green",
    permissions: ["إدارة الأعضاء", "تغيير الصلاحيات", "اعتماد نهائي", "عرض السجل"],
    risk: "مرتفع",
  },
  {
    id: "Reviewer",
    label: "Reviewer",
    description: "مراجعة واعتماد أو رفض المحتوى قبل النشر.",
    tone: "blue",
    permissions: ["مراجعة المحتوى", "طلب تعديل", "اعتماد محتوى", "عرض التعليقات"],
    risk: "متوسط",
  },
  {
    id: "Editor",
    label: "Editor",
    description: "تحرير المحتوى وإضافة تعليقات دون اعتماد نهائي.",
    tone: "amber",
    permissions: ["تحرير المحتوى", "إضافة تعليق", "طلب مراجعة"],
    risk: "متوسط",
  },
];

const integrations = [
  {
    name: "Instagram",
    status: "healthy",
    connected: 18,
    pending: 3,
    risk: "منخفض",
  },
  {
    name: "TikTok",
    status: "warning",
    connected: 11,
    pending: 5,
    risk: "متوسط",
  },
  {
    name: "WhatsApp Business",
    status: "restricted",
    connected: 7,
    pending: 2,
    risk: "مرتفع",
  },
  {
    name: "Email",
    status: "healthy",
    connected: 21,
    pending: 1,
    risk: "منخفض",
  },
];

const aiProviders = [
  {
    name: "OpenAI",
    type: "نصوص",
    status: "active",
    monthlyCost: "$184",
    usage: 72,
  },
  {
    name: "Image Provider",
    type: "صور",
    status: "review",
    monthlyCost: "$96",
    usage: 45,
  },
  {
    name: "Video Provider",
    type: "فيديو",
    status: "limited",
    monthlyCost: "$312",
    usage: 83,
  },
];

const auditLogs = [
  {
    action: "تمت محاولة ربط WhatsApp Business",
    actor: "أحمد السعيد",
    target: "متجر النمو",
    level: "warning",
    time: "قبل 12 دقيقة",
  },
  {
    action: "تم تغيير سياسة المراجعة البشرية",
    actor: "System Admin",
    target: "Global Governance",
    level: "critical",
    time: "قبل 45 دقيقة",
  },
  {
    action: "تم إنشاء مساحة عمل جديدة",
    actor: "محمد خالد",
    target: "متجر الهدايا",
    level: "info",
    time: "قبل ساعتين",
  },
  {
    action: "تم اعتماد محتوى بعد مراجعة بشرية",
    actor: "سارة محمد",
    target: "حملة العودة للمدارس",
    level: "success",
    time: "قبل 3 ساعات",
  },
];

const featureFlags = [
  {
    key: "human_review_required",
    label: "اشتراط المراجعة البشرية",
    enabled: true,
    risk: "منخفض",
  },
  {
    key: "auto_publish",
    label: "النشر التلقائي",
    enabled: false,
    risk: "مرتفع",
  },
  {
    key: "ai_video_generation",
    label: "توليد الفيديو",
    enabled: false,
    risk: "مرتفع",
  },
  {
    key: "external_integrations",
    label: "التكاملات الخارجية",
    enabled: true,
    risk: "متوسط",
  },
];

function getFlag(flags, key) {
  return flags.find((flag) => flag.key === key) || {};
}

function getPolicyStatusLabel(status) {
  const labels = {
    ready: "جاهز",
    warning: "يحتاج ضبط",
    blocked: "محظور",
  };

  return labels[status] || "يحتاج ضبط";
}

function buildAiOpsPolicyHealth(flags = [], roles = [], integrations = [], auditLogs = []) {
  const checks = [];
  const warnings = [];
  const blockedReasons = [];
  const humanReview = getFlag(flags, "human_review_required");
  const autoPublish = getFlag(flags, "auto_publish");
  const videoGeneration = getFlag(flags, "ai_video_generation");
  const externalIntegrations = getFlag(flags, "external_integrations");
  const hasAdminRole = roles.some((role) => ["Owner", "Admin"].includes(role.id) || ["Owner", "Admin"].includes(role.label));
  const hasReviewerRole = roles.some((role) => role.id === "Reviewer" || role.label === "Reviewer");
  const warningAuditCount = auditLogs.filter((log) => ["warning", "critical"].includes(log.level || log.severity)).length;
  const criticalAudit = auditLogs.some((log) => (log.level || log.severity) === "critical");
  const riskyIntegrations = integrations.filter((item) => ["warning", "restricted", "limited"].includes(item.status));

  if (humanReview.enabled) checks.push("المراجعة البشرية مفعلة.");
  else blockedReasons.push("المراجعة البشرية معطلة.");

  if (autoPublish.enabled) blockedReasons.push("النشر التلقائي مفعل دون ضوابط كافية.");
  else checks.push("النشر التلقائي معطل أو مقيد.");

  if (videoGeneration.enabled) warnings.push("توليد الفيديو يحتاج مراجعة بشرية واعتماد تكلفة قبل التشغيل.");
  else checks.push("توليد الفيديو غير مفعل افتراضيًا.");

  if (externalIntegrations.enabled) warnings.push("التكاملات الخارجية تحتاج موافقة وصلاحيات واضحة قبل استخدامها في التشغيلات.");
  else checks.push("التكاملات الخارجية غير مفعلة افتراضيًا.");

  if (hasAdminRole) checks.push("صلاحيات الإدارة متوفرة.");
  else blockedReasons.push("لا يوجد دور Admin/Owner لتغيير السياسات الحساسة.");

  if (hasReviewerRole) checks.push("دور Reviewer متوفر للمراجعة.");
  else blockedReasons.push("لا يوجد دور Reviewer للمراجعة.");

  if (auditLogs.length) checks.push("سجل التدقيق متوفر.");
  else warnings.push("لا توجد أحداث تدقيق مسجلة.");

  if (riskyIntegrations.length) warnings.push("توجد تكاملات خارجية تحتاج متابعة قبل التشغيل.");
  if (warningAuditCount) warnings.push("توجد أحداث تدقيق تحذيرية تؤثر على جاهزية التشغيل.");
  if (criticalAudit) warnings.push("يوجد حدث حرج في سجل التدقيق يحتاج مراجعة.");

  const score = Math.max(0, 100 - blockedReasons.length * 35 - warnings.length * 8);
  const status = blockedReasons.length ? "blocked" : warnings.length ? "warning" : "ready";

  return { status, score, checks, warnings, blockedReasons };
}

export default function SystemAdminPage() {
  const [query, setQuery] = useState("");
  const [flags, setFlags] = useState(featureFlags);
  const [workspaceMembers, setWorkspaceMembers] = useState(() => readWorkspaceMembers(users));
  const [workspaceRoles, setWorkspaceRoles] = useState(() => readWorkspaceRoles(roles));
  const [adminAuditLogs, setAdminAuditLogs] = useState(() => readActivityLog(auditLogs));

  useEffect(() => {
    const reloadAccessState = () => {
      setWorkspaceMembers(readWorkspaceMembers(users));
      setWorkspaceRoles(readWorkspaceRoles(roles));
      setAdminAuditLogs(readActivityLog(auditLogs));
    };

    window.addEventListener("focus", reloadAccessState);
    window.addEventListener("storage", reloadAccessState);
    window.addEventListener("nashir-workspace-members-updated", reloadAccessState);
    window.addEventListener("nashir-workspace-roles-updated", reloadAccessState);
    window.addEventListener("nashir-activity-log-updated", reloadAccessState);

    return () => {
      window.removeEventListener("focus", reloadAccessState);
      window.removeEventListener("storage", reloadAccessState);
      window.removeEventListener("nashir-workspace-members-updated", reloadAccessState);
      window.removeEventListener("nashir-workspace-roles-updated", reloadAccessState);
      window.removeEventListener("nashir-activity-log-updated", reloadAccessState);
    };
  }, []);

  const stats = useMemo(() => {
    return {
      workspaces: workspaces.length,
      users: workspaceMembers.length,
      activeIntegrations: integrations.filter((item) => item.status === "healthy")
        .length,
      warnings: adminAuditLogs.filter(
        (item) =>
          item.level === "warning" ||
          item.level === "critical" ||
          item.severity === "warning" ||
          item.severity === "critical"
      ).length,
    };
  }, [adminAuditLogs, workspaceMembers]);

  const filteredWorkspaces = workspaces.filter((workspace) => {
    const text = `${workspace.name} ${workspace.owner} ${workspace.plan}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const aiOpsHealth = useMemo(
    () => buildAiOpsPolicyHealth(flags, workspaceRoles, integrations, adminAuditLogs),
    [adminAuditLogs, flags, workspaceRoles]
  );

  const toggleFlag = (key) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.key === key ? { ...flag, enabled: !flag.enabled } : flag
      )
    );
    setAdminAuditLogs(
      addActivity(
        {
          action: `تغيير حالة خاصية ${key}`,
          actor: "System Admin",
          target: "Feature Flags",
          severity: "warning",
        },
        auditLogs
      )
    );
  };

  return (
    <main className="sys-admin-page" dir="rtl">
      <style>{styles}</style>

      <section className="sys-hero">
        <div>
          <div className="sys-eyebrow">
            <Shield size={15} />
            إدارة النظام
          </div>

          <h1>لوحة مدير النظام</h1>
          <p>
            مراقبة صحة المنصة، مساحات العمل، الصلاحيات، التكاملات، أدوات الذكاء
            الاصطناعي، وسياسات الحوكمة.
          </p>
        </div>

        <div className="sys-hero-actions">
          <button type="button" className="sys-secondary">
            <RefreshCw size={16} />
            تحديث الحالة
          </button>

          <button type="button" className="sys-primary">
            <ShieldCheck size={16} />
            مراجعة المخاطر
          </button>
        </div>
      </section>

      <section className="sys-warning">
        <CircleAlert size={20} />
        <div>
          <strong>تنبيه حوكمي</strong>
          <p>
            هذه الصفحة Prototype فقط. لا تنفذ تعطيل حسابات، حذف مستخدمين، أو
            تغيير مفاتيح تكاملات فعليًا من الواجهة. أي إجراء حقيقي يحتاج
            صلاحيات وسجل تدقيق معتمد.
          </p>
        </div>
      </section>

      <section className={`sys-card ai-policy-card ${aiOpsHealth.status}`}>
        <div className="sys-card-header">
          <div>
            <h2>سياسات تشغيل الذكاء الاصطناعي</h2>
            <p>هذه السياسات تؤثر على جاهزية التشغيل.</p>
          </div>
          <PolicyBadge status={aiOpsHealth.status} />
        </div>

        <div className="policy-health-grid">
          <InfoBox label="حالة السياسات" value={`${getPolicyStatusLabel(aiOpsHealth.status)} · ${aiOpsHealth.score}%`} />
          <InfoBox label="المراجعة البشرية" value={getFlag(flags, "human_review_required").enabled ? "مفعلة" : "معطلة"} />
          <InfoBox label="النشر التلقائي" value={getFlag(flags, "auto_publish").enabled ? "مفعل" : "معطل"} />
          <InfoBox label="توليد الفيديو" value={getFlag(flags, "ai_video_generation").enabled ? "مفعل" : "معطل"} />
          <InfoBox label="التكاملات الخارجية" value={getFlag(flags, "external_integrations").enabled ? "مفعلة" : "معطلة"} />
          <InfoBox label="صلاحيات الإدارة" value={workspaceRoles.some((role) => ["Owner", "Admin"].includes(role.id) || ["Owner", "Admin"].includes(role.label)) ? "متوفرة" : "غير مكتملة"} />
          <InfoBox label="سجل التدقيق" value={`${adminAuditLogs.length} حدث`} />
          <InfoBox label="أثرها على تشغيلات النظام" value="تؤثر على جاهزية التشغيل" />
        </div>

        <div className="policy-impact-note">
          <ShieldCheck size={17} />
          <span>Reviewer مطلوب للمراجعة. Admin/Owner مطلوب لتغيير السياسات الحساسة. Editor لا يملك اعتمادًا نهائيًا.</span>
        </div>

        <div className="policy-impact-note">
          <Server size={17} />
          <span>التكاملات الخارجية تحتاج موافقة وصلاحيات واضحة قبل استخدامها في التشغيلات. القنوات الخارجية لا تعني نشرًا تلقائيًا.</span>
        </div>

        <div className="policy-audit-summary">
          <InfoBox label="آخر تغيير سياسة" value={adminAuditLogs.find((log) => String(log.action).includes("سياسة") || String(log.target).includes("Feature"))?.time || "لا يوجد"} />
          <InfoBox label="آخر تحذير" value={adminAuditLogs.find((log) => ["warning", "critical"].includes(log.level || log.severity))?.time || "لا يوجد"} />
          <InfoBox label="عدد أحداث التدقيق" value={adminAuditLogs.length} />
          <InfoBox label="هل يوجد حدث حرج؟" value={adminAuditLogs.some((log) => (log.level || log.severity) === "critical") ? "نعم" : "لا"} />
        </div>

        <div className="policy-notes blocked-notes">
          <strong>أسباب الحظر</strong>
          {aiOpsHealth.blockedReasons.length
            ? aiOpsHealth.blockedReasons.map((reason) => <span key={reason}>{reason}</span>)
            : <span>لا توجد أسباب حظر</span>}
        </div>

        <div className="policy-notes warning-notes">
          <strong>تحذيرات</strong>
          {aiOpsHealth.warnings.length
            ? aiOpsHealth.warnings.map((warning) => <span key={warning}>{warning}</span>)
            : <span>لا توجد تحذيرات</span>}
        </div>

        {aiOpsHealth.checks.length ? (
          <div className="policy-notes check-notes">
            <strong>الفحوصات الناجحة</strong>
            {aiOpsHealth.checks.slice(0, 5).map((check) => <span key={check}>{check}</span>)}
          </div>
        ) : null}
      </section>

      <section className="sys-stats-grid">
        <StatCard
          title="مساحات العمل"
          value={stats.workspaces}
          icon={Building2}
          tone="blue"
        />
        <StatCard title="المستخدمون" value={stats.users} icon={Users} tone="green" />
        <StatCard
          title="تكاملات سليمة"
          value={stats.activeIntegrations}
          icon={Server}
          tone="teal"
        />
        <StatCard
          title="تنبيهات حرجة"
          value={stats.warnings}
          icon={AlertTriangle}
          tone="red"
        />
      </section>

      <section className="sys-main-grid">
        <article className="sys-card workspaces-card">
          <div className="sys-card-header">
            <div>
              <h2>مساحات العمل</h2>
              <p>متابعة حالة الحسابات والخطط والمخاطر.</p>
            </div>

            <div className="sys-search">
              <Search size={17} />
              <input
                value={query}
                placeholder="بحث في المساحات..."
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="sys-table">
            <div className="sys-table-head">
              <span>المساحة</span>
              <span>الخطة</span>
              <span>الحالة</span>
              <span>المخاطر</span>
              <span>إجراء</span>
            </div>

            {filteredWorkspaces.map((workspace) => (
              <div key={workspace.id} className="sys-table-row">
                <div>
                  <strong>{workspace.name}</strong>
                  <small>{workspace.owner}</small>
                </div>

                <span>{workspace.plan}</span>

                <StatusBadge status={workspace.status} />

                <RiskBadge risk={workspace.risk} />

                <button type="button" className="sys-row-button">
                  عرض
                </button>
              </div>
            ))}
          </div>
        </article>

        <aside className="sys-side-stack">
          <article className="sys-card health-card">
            <div className="sys-card-header">
              <h2>صحة النظام</h2>
              <Activity size={20} />
            </div>

            <HealthRow label="API Gateway" value="99.9%" tone="green" />
            <HealthRow label="طابور تشغيل الذكاء الاصطناعي" value="مستقر" tone="green" />
            <HealthRow label="OAuth Callbacks" value="تحتاج مراقبة" tone="amber" />
            <HealthRow label="سجل التدقيق" value="نشط" tone="green" />
          </article>

          <article className="sys-card security-card">
            <div className="security-icon">
              <Lock size={24} />
            </div>

            <h2>الأسرار والمفاتيح</h2>
            <p>
              لا تعرض أو تحفظ قيم مفاتيح داخل الواجهة. يتم التعامل مع مراجع
              الأسرار فقط ضمن ضوابط الأمان.
            </p>

            <button type="button" className="sys-secondary full">
              <KeyRound size={16} />
              إدارة المفاتيح لاحقًا
            </button>
          </article>
        </aside>
      </section>

      <section className="sys-lower-grid">
        <article className="sys-card">
          <div className="sys-card-header">
            <div>
              <h2>التكاملات</h2>
              <p>حالة الربط مع المنصات الخارجية.</p>
            </div>
          </div>

          <div className="integration-list">
            {integrations.map((item) => (
              <div key={item.name} className="integration-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    مرتبط: {item.connected} · بانتظار الموافقة: {item.pending}
                  </span>
                </div>

                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </article>

        <article className="sys-card">
          <div className="sys-card-header">
            <div>
              <h2>مزودو الذكاء الاصطناعي</h2>
              <p>مراقبة التكلفة والاستخدام حسب نوع المخرج.</p>
            </div>
          </div>

          <div className="ai-list">
            {aiProviders.map((provider) => (
              <div key={provider.name} className="ai-row">
                <div className="ai-row-head">
                  <div>
                    <strong>{provider.name}</strong>
                    <span>{provider.type}</span>
                  </div>

                  <b>{provider.monthlyCost}</b>
                </div>

                <div className="usage-track">
                  <i style={{ width: `${provider.usage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="sys-card">
          <div className="sys-card-header">
            <div>
              <h2>سياسات الخصائص</h2>
              <p>تشغيل وتعطيل خصائص النظام بشكل محكوم.</p>
            </div>
            <Flag size={20} />
          </div>

          <div className="flag-list">
            {flags.map((flag) => (
              <div key={flag.key} className="flag-row">
                <div>
                  <strong>{flag.label}</strong>
                  <span>المخاطر: {flag.risk} · يؤثر على: تشغيلات النظام، توجيه النماذج، مراقبة التكلفة، حوكمة المطالبات، الأسرار والمفاتيح</span>
                </div>

                <button
                  type="button"
                  className={`switch ${flag.enabled ? "on" : ""}`}
                  onClick={() => toggleFlag(flag.key)}
                >
                  <span />
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="sys-readiness-section">
        <div className="sys-card-header">
          <div>
            <h2>جاهزية مسارات الذكاء الاصطناعي</h2>
            <p>ملخص حالة جاهزية مسارات العمل النشطة في المساحة. البيانات تجريبية.</p>
          </div>
          <ReadinessBadge status={workspaceReadinessFixture.overallStatus} />
        </div>

        <div className="readiness-stats-row">
          <div className="readiness-stat readiness-stat--ready">
            <strong>{workspaceReadinessFixture.readyWorkflows}</strong>
            <span>جاهز</span>
          </div>
          <div className="readiness-stat readiness-stat--warning">
            <strong>{workspaceReadinessFixture.warningWorkflows}</strong>
            <span>تحذير</span>
          </div>
          <div className="readiness-stat readiness-stat--blocked">
            <strong>{workspaceReadinessFixture.blockedWorkflows}</strong>
            <span>محجوب</span>
          </div>
          <div className="readiness-stat readiness-stat--unknown">
            <strong>{workspaceReadinessFixture.unknownWorkflows}</strong>
            <span>
              <HelpCircle size={12} />
              غير معروف
            </span>
          </div>
        </div>

        <div className="readiness-panel">
          <div className="readiness-workflow-list">
            {workspaceReadinessFixture.workflows.map((wf) => (
              <div key={wf.workflowDefinitionId} className="readiness-workflow-row">
                <div className="readiness-workflow-meta">
                  <span className="readiness-workflow-name">{wf.name}</span>
                  <span className="readiness-workflow-version">v{wf.workflowVersion}</span>
                </div>
                <ReadinessBadge status={wf.overallStatus} />
                {wf.blockers?.length > 0 && (
                  <div className="readiness-blockers">
                    <span className="readiness-blockers-heading">عوائق تمنع التشغيل</span>
                    <ul className="readiness-blocker-list">
                      {wf.blockers.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {wf.warnings?.length > 0 && (
                  <ul className="readiness-advisory-caption">
                    {wf.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <p className="readiness-unknown-hint">
            الحالة "غير معروف" لا تُعدّ جاهزة — يُمنع تشغيل المسار حتى تُحسم.
          </p>
        </div>
      </section>

      <section className="sys-audit-grid">
        <article className="sys-card audit-card">
          <div className="sys-card-header">
            <div>
              <h2>سجل التدقيق التجريبي</h2>
              <p>أحداث حساسة يجب أن تحفظ ضمن سجل تدقيق محكوم.</p>
            </div>

            <button type="button" className="sys-secondary">
              <Eye size={16} />
              عرض الكل
            </button>
          </div>

          <div className="audit-list">
            {adminAuditLogs.map((log) => (
              <div key={`${log.action}-${log.time}`} className="audit-row">
                <div className={`audit-dot ${log.level || log.severity}`} />

                <div>
                  <strong>{log.action}</strong>
                  <p>
                    {log.actor} · {log.target}
                  </p>
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="sys-card risk-card">
          <div className="risk-icon">
            <SlidersHorizontal size={24} />
          </div>

          <h2>قرارات مؤجلة قبل V1</h2>

          <ul>
            <li>نموذج صلاحيات مدير النظام ومدير المساحة.</li>
            <li>سياسة تعطيل الحسابات والتجميد المؤقت.</li>
            <li>تشفير وحفظ مراجع الأسرار للتكاملات.</li>
            <li>سجل تدقيق فعلي غير قابل للتلاعب.</li>
            <li>حدود التكلفة والاستخدام حسب مساحة العمل.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}

function StatCard({ title, value, icon: Icon, tone }) {
  return (
    <article className={`sys-stat-card ${tone}`}>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <div className="stat-icon">
        <Icon size={22} />
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: "نشط",
    healthy: "سليم",
    review: "مراجعة",
    warning: "تحذير",
    limited: "محدود",
    restricted: "مقيد",
  };

  return <span className={`status-badge ${status}`}>{map[status] || status}</span>;
}

function RiskBadge({ risk }) {
  return <span className={`risk-badge ${risk}`}>{risk}</span>;
}

function PolicyBadge({ status }) {
  return <span className={`policy-badge ${status}`}>{getPolicyStatusLabel(status)}</span>;
}

function InfoBox({ label, value }) {
  return (
    <div className="policy-info-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HealthRow({ label, value, tone }) {
  return (
    <div className="health-row">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

const styles = `
.sys-admin-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.06), transparent 30%),
    radial-gradient(circle at bottom left, rgba(20, 184, 166, 0.05), transparent 34%),
    #f6f8fb;
  color: #111827;
  font-family: "Inter", "Tajawal", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.sys-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.sys-eyebrow {
  width: fit-content;
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 10px;
}

.sys-hero h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.sys-hero p {
  margin: 7px 0 0;
  max-width: 760px;
  color: #667085;
  line-height: 1.8;
  font-size: 14px;
}

.sys-hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sys-primary,
.sys-secondary,
.sys-row-button {
  min-height: 40px;
  border-radius: 12px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.sys-primary {
  color: #fff;
  border: 0;
  background: linear-gradient(135deg, #1d4ed8, #0f766e);
  box-shadow: 0 14px 28px rgba(29, 78, 216, 0.16);
}

.sys-secondary,
.sys-row-button {
  color: #374151;
  background: #fff;
  border: 1px solid #e5e7eb;
}

.full {
  width: 100%;
}

.sys-warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid #fde68a;
  background: #fffbeb;
  color: #92400e;
  border-radius: 20px;
  padding: 14px;
  margin-bottom: 16px;
}

.sys-warning strong {
  display: block;
  margin-bottom: 4px;
}

.sys-warning p {
  margin: 0;
  line-height: 1.8;
  font-size: 13px;
}

.sys-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.ai-policy-card {
  margin-bottom: 16px;
}

.ai-policy-card.warning {
  border-color: #fde68a;
  background: #fffaf0;
}

.ai-policy-card.blocked {
  border-color: #fecaca;
  background: #fff5f5;
}

.policy-badge {
  width: fit-content;
  min-height: 30px;
  border-radius: 999px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 1000;
  white-space: nowrap;
}

.policy-badge.ready {
  color: #166534;
  background: #dcfce7;
}

.policy-badge.warning {
  color: #92400e;
  background: #fef3c7;
}

.policy-badge.blocked {
  color: #991b1b;
  background: #fee2e2;
}

.policy-health-grid,
.policy-audit-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.policy-info-box {
  border: 1px solid #e7edf3;
  background: #fff;
  border-radius: 16px;
  padding: 11px;
}

.policy-info-box span {
  display: block;
  color: #667085;
  font-size: 11px;
  font-weight: 900;
}

.policy-info-box strong {
  display: block;
  margin-top: 5px;
  color: #111827;
  font-size: 13px;
  line-height: 1.6;
}

.policy-impact-note {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 16px;
  padding: 11px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 850;
  line-height: 1.8;
}

.policy-notes {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.policy-notes strong {
  color: #111827;
  font-size: 12px;
}

.policy-notes span {
  border-radius: 12px;
  padding: 7px 9px;
  font-size: 11px;
  font-weight: 850;
  line-height: 1.6;
}

.blocked-notes span {
  color: #991b1b;
  background: #fee2e2;
}

.warning-notes span {
  color: #92400e;
  background: #ffedd5;
}

.sys-stat-card,
.sys-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e7edf3;
  border-radius: 22px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.04);
}

.sys-stat-card {
  min-height: 110px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}

.sys-stat-card span {
  color: #667085;
  font-size: 13px;
  font-weight: 900;
}

.sys-stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 34px;
  line-height: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 16px;
}

.sys-stat-card.blue .stat-icon {
  background: #eff6ff;
  color: #2563eb;
}

.sys-stat-card.green .stat-icon {
  background: #f0fdf4;
  color: #16a34a;
}

.sys-stat-card.teal .stat-icon {
  background: #ecfeff;
  color: #0f766e;
}

.sys-stat-card.red .stat-icon {
  background: #fef2f2;
  color: #ef4444;
}

.sys-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  align-items: start;
  margin-bottom: 16px;
}

.sys-side-stack {
  display: grid;
  gap: 16px;
}

.sys-card {
  padding: 18px;
}

.sys-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.sys-card-header h2,
.security-card h2,
.risk-card h2 {
  margin: 0;
  color: #111827;
  font-size: 18px;
  line-height: 1.35;
}

.sys-card-header p {
  margin: 5px 0 0;
  color: #667085;
  font-size: 12px;
}

.sys-search {
  height: 40px;
  min-width: 260px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
}

.sys-search input {
  border: 0;
  outline: 0;
  width: 100%;
  background: transparent;
  font-family: inherit;
}

.sys-table {
  border: 1px solid #edf2f7;
  border-radius: 16px;
  overflow: hidden;
}

.sys-table-head,
.sys-table-row {
  display: grid;
  grid-template-columns: 1.4fr 0.7fr 0.8fr 0.7fr 0.6fr;
  gap: 12px;
  align-items: center;
  padding: 13px 14px;
}

.sys-table-head {
  background: #fbfcfe;
  color: #667085;
  font-size: 12px;
  font-weight: 900;
  border-bottom: 1px solid #edf2f7;
}

.sys-table-row {
  background: #fff;
  border-bottom: 1px solid #edf2f7;
  font-size: 13px;
}

.sys-table-row:last-child {
  border-bottom: 0;
}

.sys-table-row strong {
  display: block;
  font-size: 13px;
}

.sys-table-row small {
  display: block;
  margin-top: 3px;
  color: #667085;
  font-size: 11px;
}

.status-badge,
.risk-badge {
  width: fit-content;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
}

.status-badge.active,
.status-badge.healthy {
  color: #166534;
  background: #f0fdf4;
}

.status-badge.review,
.status-badge.warning {
  color: #92400e;
  background: #fffbeb;
}

.status-badge.limited,
.status-badge.restricted {
  color: #991b1b;
  background: #fef2f2;
}

.risk-badge.low,
.risk-badge.منخفض {
  color: #166534;
  background: #f0fdf4;
}

.risk-badge.medium,
.risk-badge.متوسط {
  color: #92400e;
  background: #fffbeb;
}

.risk-badge.high,
.risk-badge.مرتفع {
  color: #991b1b;
  background: #fef2f2;
}

.health-row,
.integration-row,
.flag-row {
  min-height: 48px;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.health-row:last-child,
.integration-row:last-child,
.flag-row:last-child {
  border-bottom: 0;
}

.health-row span,
.integration-row span,
.flag-row span {
  color: #667085;
  font-size: 12px;
}

.health-row strong.green {
  color: #166534;
}

.health-row strong.amber {
  color: #92400e;
}

.security-card {
  background:
    radial-gradient(circle at top left, rgba(29, 78, 216, 0.10), transparent 36%),
    #fff;
}

.security-icon,
.risk-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #1d4ed8, #0f766e);
  margin-bottom: 14px;
}

.security-card p {
  color: #667085;
  line-height: 1.8;
  font-size: 13px;
}

.sys-lower-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.integration-list,
.ai-list,
.flag-list,
.audit-list {
  display: grid;
  gap: 10px;
}

.integration-row {
  border: 1px solid #edf2f7;
  border-radius: 16px;
  padding: 12px;
}

.integration-row strong,
.ai-row strong,
.flag-row strong,
.audit-row strong {
  display: block;
  color: #111827;
  font-size: 13px;
}

.ai-row {
  border: 1px solid #edf2f7;
  border-radius: 16px;
  padding: 12px;
}

.ai-row-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.ai-row span {
  display: block;
  margin-top: 3px;
  color: #667085;
  font-size: 12px;
}

.ai-row b {
  color: #0f766e;
}

.usage-track {
  height: 8px;
  margin-top: 12px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.usage-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0f766e, #2563eb);
}

.flag-row {
  border: 1px solid #edf2f7;
  border-radius: 16px;
  padding: 12px;
}

.switch {
  width: 50px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: #cbd5e1;
  padding: 3px;
  cursor: pointer;
}

.switch span {
  width: 22px;
  height: 22px;
  display: block;
  border-radius: 50%;
  background: #fff;
  transform: translateX(0);
  transition: 0.18s ease;
}

.switch.on {
  background: linear-gradient(135deg, #0f766e, #2563eb);
}

.switch.on span {
  transform: translateX(-22px);
}

.sys-audit-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
}

.audit-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  padding: 12px;
}

.audit-dot {
  width: 10px;
  height: 10px;
  margin-top: 7px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.audit-dot.warning {
  background: #f59e0b;
}

.audit-dot.critical {
  background: #ef4444;
}

.audit-dot.info {
  background: #2563eb;
}

.audit-dot.success {
  background: #16a34a;
}

.audit-row p {
  margin: 5px 0;
  color: #374151;
  font-size: 12px;
}

.audit-row span {
  color: #667085;
  font-size: 11px;
}

.risk-card {
  background: #fffbeb;
  border-color: #fde68a;
}

.risk-card ul {
  margin: 14px 0 0;
  padding-inline-start: 18px;
  color: #92400e;
  line-height: 1.9;
  font-size: 13px;
}

@media (max-width: 1280px) {
  .sys-stats-grid,
  .sys-lower-grid,
  .policy-health-grid,
  .policy-audit-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sys-main-grid,
  .sys-audit-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .sys-admin-page {
    padding: 16px;
  }

  .sys-hero,
  .sys-hero-actions,
  .sys-card-header {
    align-items: stretch;
    flex-direction: column;
  }

  .sys-hero h1 {
    font-size: 27px;
  }

  .sys-stats-grid,
  .sys-lower-grid,
  .policy-health-grid,
  .policy-audit-summary {
    grid-template-columns: 1fr;
  }

  .sys-search {
    min-width: 0;
    width: 100%;
  }

  .sys-table {
    overflow-x: auto;
  }

  .sys-table-head,
  .sys-table-row {
    min-width: 760px;
  }
}

.sys-readiness-section {
  background: var(--card, rgba(255, 255, 255, 0.96));
  border: 1px solid var(--border, #e7edf3);
  border-radius: 26px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.readiness-stats-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.readiness-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 20px;
  border-radius: 14px;
  border: 1px solid var(--border, #e7edf3);
  min-width: 72px;
}

.readiness-stat strong {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.readiness-stat span {
  font-size: 0.75rem;
  color: var(--muted-foreground, #667085);
  display: flex;
  align-items: center;
  gap: 3px;
}

.readiness-stat--ready   { border-color: #bbf7d0; background: #f0fdf4; }
.readiness-stat--ready strong { color: #166534; }

.readiness-stat--warning { border-color: #fde68a; background: #fffbeb; }
.readiness-stat--warning strong { color: #92400e; }

.readiness-stat--blocked { border-color: #fecaca; background: #fef2f2; }
.readiness-stat--blocked strong { color: #991b1b; }

.readiness-stat--unknown { border-color: #e2e8f0; background: #f8fafc; }
.readiness-stat--unknown strong { color: #475569; }

.readiness-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.readiness-workflow-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.readiness-workflow-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border, #e7edf3);
  border-radius: 14px;
  flex-wrap: wrap;
}

.readiness-workflow-meta {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.readiness-workflow-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.readiness-workflow-version {
  font-size: 0.75rem;
  color: var(--muted-foreground, #667085);
  white-space: nowrap;
}

.readiness-advisory-caption {
  width: 100%;
  margin: 0;
  padding: 0;
  padding-inline-start: 16px;
  list-style: disc;
  font-size: 0.78rem;
  color: #92400e;
}

.readiness-unknown-hint {
  font-size: 0.78rem;
  color: var(--muted-foreground, #667085);
  margin: 0;
  padding: 8px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.readiness-blockers {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.readiness-blockers-heading {
  font-size: 0.75rem;
  font-weight: 600;
  color: #991b1b;
}

.readiness-blocker-list {
  margin: 0;
  padding: 0;
  padding-inline-start: 16px;
  list-style: disc;
  font-size: 0.78rem;
  color: #991b1b;
}
`;
