import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  Filter,
  HelpCircle,
  History,
  MessageSquare,
  MessageSquarePlus,
  Plus,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

const ROLE_OPTIONS = [
  {
    id: "Owner",
    label: "Owner",
    description: "إدارة الفريق والصلاحيات والاعتماد النهائي.",
    tone: "green",
    permissions: ["إدارة الأعضاء", "تغيير الصلاحيات", "اعتماد نهائي", "عرض السجل"],
    risk: "مرتفع إذا استخدم بلا ضوابط؛ يجب أن يبقى محدودًا.",
  },
  {
    id: "Reviewer",
    label: "Reviewer",
    description: "مراجعة واعتماد أو رفض المحتوى قبل النشر.",
    tone: "blue",
    permissions: ["مراجعة المحتوى", "طلب تعديل", "اعتماد محتوى", "عرض التعليقات"],
    risk: "مقبول بشرط وجود سجل قرارات واضح.",
  },
  {
    id: "Editor",
    label: "Editor",
    description: "تحرير المحتوى وإضافة تعليقات دون اعتماد نهائي.",
    tone: "amber",
    permissions: ["تحرير المحتوى", "إضافة تعليق", "رفع نسخة", "طلب مراجعة"],
    risk: "لا يجب منحه صلاحية نشر أو اعتماد نهائي.",
  },
  {
    id: "Viewer",
    label: "Viewer",
    description: "عرض فقط دون تعديل أو اعتماد.",
    tone: "slate",
    permissions: ["عرض المحتوى", "عرض التعليقات"],
    risk: "منخفض، لكنه يحتاج ضبط وصول للبيانات الحساسة.",
  },
];

const INITIAL_MEMBERS = [
  {
    id: "m-1",
    name: "أحمد السعيد",
    email: "ahmad@example.com",
    role: "Owner",
    scope: "كل الصلاحيات",
    status: "active",
    lastActive: "منذ 8 دقائق",
  },
  {
    id: "m-2",
    name: "سارة محمد",
    email: "sarah@example.com",
    role: "Reviewer",
    scope: "مراجعة واعتماد",
    status: "active",
    lastActive: "منذ 16 دقيقة",
  },
  {
    id: "m-3",
    name: "محمد خالد",
    email: "mohammed@example.com",
    role: "Editor",
    scope: "تحرير المحتوى",
    status: "active",
    lastActive: "منذ ساعة",
  },
];

const INITIAL_COMMENTS = [
  {
    id: "c-1",
    author: "سارة",
    text: "يحتاج CTA أوضح في Reel.",
    time: "قبل 10 دقائق",
    target: "Reel حملة عطر X",
    priority: "high",
    decision: "needs_changes",
    status: "open",
  },
  {
    id: "c-2",
    author: "أحمد",
    text: "اعتمد نسخة WhatsApp بعد تعديل الرابط.",
    time: "قبل 25 دقيقة",
    target: "رسالة WhatsApp",
    priority: "medium",
    decision: "approved_with_note",
    status: "resolved",
  },
];

const INITIAL_CHANGES = [
  { id: "a-1", action: "تم تغيير دور سارة إلى Reviewer", actor: "System Admin", time: "قبل ساعة", severity: "medium" },
  { id: "a-2", action: "تمت إضافة تعليق على Caption", actor: "سارة", time: "قبل ساعتين", severity: "low" },
  { id: "a-3", action: "تم تحديث حالة المحتوى إلى مراجعة", actor: "محمد", time: "قبل 3 ساعات", severity: "low" },
];

const REVIEW_ITEMS = [
  {
    id: "r-1",
    title: "Reel حملة عطر X",
    owner: "محمد خالد",
    status: "needs_review",
    due: "اليوم",
    risk: "ادعاء تسويقي يحتاج تدقيق",
  },
  {
    id: "r-2",
    title: "Caption Instagram",
    owner: "سارة محمد",
    status: "approved",
    due: "غدًا",
    risk: "منخفض",
  },
  {
    id: "r-3",
    title: "رسالة WhatsApp",
    owner: "أحمد السعيد",
    status: "changes_requested",
    due: "اليوم",
    risk: "رابط غير موثق",
  },
];

const statusMeta = {
  active: ["نشط", "green"],
  invited: ["دعوة معلقة", "amber"],
  suspended: ["موقوف", "red"],
};

const commentDecisionMeta = {
  note: ["ملاحظة", "slate"],
  needs_changes: ["يحتاج تعديل", "amber"],
  approved_with_note: ["اعتماد مع ملاحظة", "green"],
  blocked: ["محظور", "red"],
};

const reviewStatusMeta = {
  needs_review: ["بانتظار مراجعة", "amber"],
  approved: ["معتمد", "green"],
  changes_requested: ["مطلوب تعديل", "red"],
};

function nowLabel() {
  return "الآن";
}

function createAudit(action, actor = "Prototype Admin", severity = "low") {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    action,
    actor,
    time: nowLabel(),
    severity,
  };
}

function getRole(roleId) {
  return ROLE_OPTIONS.find((role) => role.id === roleId) || ROLE_OPTIONS[ROLE_OPTIONS.length - 1];
}

function scoreTeamGovernance(members, comments) {
  let score = 100;
  const owners = members.filter((member) => member.role === "Owner" && member.status === "active");
  const reviewers = members.filter((member) => member.role === "Reviewer" && member.status === "active");
  const openHighComments = comments.filter((item) => item.status === "open" && item.priority === "high");

  if (owners.length === 0) score -= 35;
  if (owners.length > 1) score -= 15;
  if (reviewers.length === 0) score -= 25;
  if (openHighComments.length > 0) score -= 10;
  if (members.some((member) => member.status === "invited")) score -= 5;

  return Math.max(0, Math.min(100, score));
}

function governanceWarnings(members, comments) {
  const warnings = [];
  const owners = members.filter((member) => member.role === "Owner" && member.status === "active");
  const reviewers = members.filter((member) => member.role === "Reviewer" && member.status === "active");
  const activeEditors = members.filter((member) => member.role === "Editor" && member.status === "active");
  const openHighComments = comments.filter((item) => item.status === "open" && item.priority === "high");

  if (owners.length === 0) warnings.push("لا يوجد Owner نشط؛ قرارات الاعتماد النهائي غير محكومة.");
  if (owners.length > 1) warnings.push("يوجد أكثر من Owner نشط؛ راجع فصل الصلاحيات وتقليل الصلاحيات العليا.");
  if (reviewers.length === 0) warnings.push("لا يوجد Reviewer نشط؛ مسار المراجعة قد يصبح شكليًا.");
  if (activeEditors.length > reviewers.length + owners.length) warnings.push("عدد المحررين أكبر من المراجعين؛ خطر تراكم محتوى غير مراجع.");
  if (openHighComments.length > 0) warnings.push("يوجد تعليقات عالية الأولوية مفتوحة؛ لا تعتمد المحتوى قبل إغلاقها.");

  return warnings;
}

export default function TeamCollaborationPage() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [changes, setChanges] = useState(INITIAL_CHANGES);
  const [comment, setComment] = useState("");
  const [commentTarget, setCommentTarget] = useState(REVIEW_ITEMS[0].title);
  const [commentDecision, setCommentDecision] = useState("note");
  const [commentPriority, setCommentPriority] = useState("medium");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Viewer");
  const [selectedRole, setSelectedRole] = useState("all");
  const [commentFilter, setCommentFilter] = useState("all");
  const [search, setSearch] = useState("");

  const score = useMemo(() => scoreTeamGovernance(members, comments), [members, comments]);
  const warnings = useMemo(() => governanceWarnings(members, comments), [members, comments]);

  const filteredMembers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return members.filter((member) => {
      const roleOk = selectedRole === "all" || member.role === selectedRole;
      const searchOk =
        !normalized ||
        member.name.toLowerCase().includes(normalized) ||
        member.email.toLowerCase().includes(normalized) ||
        member.role.toLowerCase().includes(normalized);
      return roleOk && searchOk;
    });
  }, [members, selectedRole, search]);

  const filteredComments = useMemo(() => {
    return comments.filter((item) => {
      if (commentFilter === "all") return true;
      if (commentFilter === "open") return item.status === "open";
      if (commentFilter === "resolved") return item.status === "resolved";
      if (commentFilter === "high") return item.priority === "high";
      return true;
    });
  }, [comments, commentFilter]);

  const addAudit = (entry) => setChanges((prev) => [entry, ...prev]);

  const addComment = () => {
    if (!comment.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: "أنت",
      text: comment.trim(),
      time: nowLabel(),
      target: commentTarget,
      priority: commentPriority,
      decision: commentDecision,
      status: commentDecision === "approved_with_note" ? "resolved" : "open",
    };

    setComments((prev) => [newComment, ...prev]);
    addAudit(createAudit(`إضافة تعليق على ${commentTarget}`, "أنت", commentPriority === "high" ? "medium" : "low"));
    setComment("");
  };

  const resolveComment = (id) => {
    const target = comments.find((item) => item.id === id);
    setComments((prev) => prev.map((item) => (item.id === id ? { ...item, status: "resolved" } : item)));
    addAudit(createAudit(`إغلاق تعليق: ${target?.target || id}`, "أنت", "low"));
  };

  const reopenComment = (id) => {
    const target = comments.find((item) => item.id === id);
    setComments((prev) => prev.map((item) => (item.id === id ? { ...item, status: "open" } : item)));
    addAudit(createAudit(`إعادة فتح تعليق: ${target?.target || id}`, "أنت", "medium"));
  };

  const inviteMember = () => {
    if (!newMemberName.trim()) return;

    const role = getRole(newMemberRole);
    const member = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || "pending@example.com",
      role: newMemberRole,
      scope: role.description,
      status: "invited",
      lastActive: "لم يقبل الدعوة",
    };

    setMembers((prev) => [member, ...prev]);
    addAudit(createAudit(`إرسال دعوة إلى ${member.name} بدور ${member.role}`, "أنت", "medium"));
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberRole("Viewer");
  };

  const updateRole = (memberId, roleId) => {
    const member = members.find((item) => item.id === memberId);
    const role = getRole(roleId);

    setMembers((prev) =>
      prev.map((item) =>
        item.id === memberId
          ? {
              ...item,
              role: roleId,
              scope: role.description,
            }
          : item
      )
    );

    addAudit(createAudit(`تغيير دور ${member?.name || memberId} إلى ${roleId}`, "أنت", roleId === "Owner" ? "high" : "medium"));
  };

  const toggleMemberStatus = (memberId) => {
    const member = members.find((item) => item.id === memberId);
    const nextStatus = member?.status === "suspended" ? "active" : "suspended";

    setMembers((prev) => prev.map((item) => (item.id === memberId ? { ...item, status: nextStatus } : item)));
    addAudit(createAudit(`${nextStatus === "suspended" ? "تعطيل" : "إعادة تفعيل"} عضو: ${member?.name || memberId}`, "أنت", "high"));
  };

  return (
    <main className="team-page" dir="rtl">
      <style>{styles}</style>

      <section className="hero">
        <div>
          <div className="eyebrow"><Users size={15} /> Team Collaboration</div>
          <h1>تعاون الفريق</h1>
          <p>
            إدارة أعضاء الفريق، الأدوار، تعليقات المراجعة، وقرارات الاعتماد داخل البروتوتايب. لا توجد دعوات أو صلاحيات حقيقية في هذه المرحلة.
          </p>
        </div>
        <div className="hero-actions">
          <div className={`score-card ${score >= 80 ? "good" : score >= 60 ? "warn" : "bad"}`}>
            <span>Governance Score</span>
            <strong>{score}%</strong>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <Stat title="الأعضاء" value={members.length} hint="محلي / Prototype" />
        <Stat title="المراجعين" value={members.filter((m) => m.role === "Reviewer" && m.status === "active").length} hint="نشطون" />
        <Stat title="تعليقات مفتوحة" value={comments.filter((c) => c.status === "open").length} hint="تحتاج إغلاق" />
        <Stat title="تنبيهات الحوكمة" value={warnings.length} hint="قبل الاعتماد" />
      </section>

      {warnings.length ? (
        <section className="governance-panel">
          <ShieldAlert size={20} />
          <div>
            <strong>تنبيهات يجب عدم تجاهلها</strong>
            <ul>
              {warnings.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          </div>
        </section>
      ) : (
        <section className="governance-panel safe">
          <ShieldCheck size={20} />
          <div>
            <strong>حالة الحوكمة مقبولة للبروتوتايب</strong>
            <p>لا توجد تنبيهات حرجة في الأدوار أو التعليقات المفتوحة.</p>
          </div>
        </section>
      )}

      <section className="layout">
        <article className="card members-card">
          <div className="card-header">
            <div>
              <h2>الأدوار والصلاحيات</h2>
              <p>إدارة شكلية داخل البروتوتايب لتثبيت تجربة الصلاحيات قبل بناء Auth/RBAC لاحقًا.</p>
            </div>
            <UserCog size={22} />
          </div>

          <div className="toolbar">
            <label className="search-box">
              <Search size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن عضو أو دور..." />
            </label>
            <label className="select-box">
              <Filter size={16} />
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="all">كل الأدوار</option>
                {ROLE_OPTIONS.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
              </select>
            </label>
          </div>

          <div className="invite-box">
            <div className="invite-title"><UserPlus size={17} /> دعوة عضو محليًا</div>
            <input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="اسم العضو" />
            <input value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="البريد — تمثيلي فقط" />
            <select value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)}>
              {ROLE_OPTIONS.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
            </select>
            <button type="button" onClick={inviteMember}><Plus size={16} /> إضافة دعوة</button>
          </div>

          <div className="members">
            {filteredMembers.map((member) => {
              const role = getRole(member.role);
              return (
                <div key={member.id} className={`member-row ${member.status === "suspended" ? "muted" : ""}`}>
                  <div className="member-main">
                    <div className="avatar">{member.name.slice(0, 1)}</div>
                    <div>
                      <strong>{member.name}</strong>
                      <span>{member.email}</span>
                      <small>{member.scope}</small>
                    </div>
                  </div>
                  <div className="member-controls">
                    <Badge tone={role.tone}>{role.label}</Badge>
                    <StatusBadge value={member.status} map={statusMeta} />
                    <select value={member.role} onChange={(e) => updateRole(member.id, e.target.value)}>
                      {ROLE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                    <button type="button" className="ghost danger" onClick={() => toggleMemberStatus(member.id)}>
                      {member.status === "suspended" ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                      {member.status === "suspended" ? "تفعيل" : "تعطيل"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="card comments-card">
          <div className="card-header">
            <div>
              <h2>تعليقات وقرارات المحتوى</h2>
              <p>تعليقات مرتبطة بعناصر مراجعة، مع قرار واضح حتى لا تتحول المراجعة إلى محادثة عامة بلا أثر.</p>
            </div>
            <MessageSquarePlus size={22} />
          </div>

          <div className="comment-box">
            <div className="comment-options">
              <select value={commentTarget} onChange={(e) => setCommentTarget(e.target.value)}>
                {REVIEW_ITEMS.map((item) => <option key={item.id} value={item.title}>{item.title}</option>)}
              </select>
              <select value={commentDecision} onChange={(e) => setCommentDecision(e.target.value)}>
                {Object.entries(commentDecisionMeta).map(([id, [label]]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <select value={commentPriority} onChange={(e) => setCommentPriority(e.target.value)}>
                <option value="low">أولوية منخفضة</option>
                <option value="medium">أولوية متوسطة</option>
                <option value="high">أولوية عالية</option>
              </select>
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="أضف تعليقًا قابلًا للتنفيذ على المحتوى..." />
            <button type="button" onClick={addComment}><Send size={16} /> إضافة تعليق</button>
          </div>

          <div className="comment-filter">
            {[
              ["all", "الكل"],
              ["open", "مفتوحة"],
              ["resolved", "مغلقة"],
              ["high", "عالية الأولوية"],
            ].map(([id, label]) => (
              <button key={id} type="button" className={commentFilter === id ? "active" : ""} onClick={() => setCommentFilter(id)}>{label}</button>
            ))}
          </div>

          <div className="comments">
            {filteredComments.map((item) => (
              <div key={item.id} className={`comment-row ${item.status === "resolved" ? "resolved" : ""}`}>
                <MessageSquare size={18} />
                <div>
                  <div className="comment-meta">
                    <strong>{item.author}</strong>
                    <StatusBadge value={item.decision} map={commentDecisionMeta} />
                    {item.priority === "high" && <Badge tone="red">عالي</Badge>}
                  </div>
                  <p>{item.text}</p>
                  <span>{item.target} · {item.time}</span>
                </div>
                <div className="comment-actions">
                  {item.status === "open" ? (
                    <button type="button" onClick={() => resolveComment(item.id)}><CheckCircle2 size={15} /> إغلاق</button>
                  ) : (
                    <button type="button" onClick={() => reopenComment(item.id)}><XCircle size={15} /> إعادة فتح</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="right-column">
          <article className="card review-card">
            <div className="card-header compact">
              <h2>قائمة المراجعة</h2>
              <FileCheck2 size={20} />
            </div>
            <div className="review-list">
              {REVIEW_ITEMS.map((item) => (
                <div key={item.id} className="review-item">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.owner} · {item.due}</span>
                  </div>
                  <StatusBadge value={item.status} map={reviewStatusMeta} />
                  <small>{item.risk}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="card role-card">
            <div className="card-header compact">
              <h2>مصفوفة الصلاحيات</h2>
              <Eye size={20} />
            </div>
            <div className="role-list">
              {ROLE_OPTIONS.map((role) => (
                <details key={role.id}>
                  <summary>
                    <Badge tone={role.tone}>{role.label}</Badge>
                    <span>{role.description}</span>
                  </summary>
                  <ul>
                    {role.permissions.map((permission) => <li key={permission}>{permission}</li>)}
                  </ul>
                  <p><AlertTriangle size={14} /> {role.risk}</p>
                </details>
              ))}
            </div>
          </article>

          <article className="card audit-card">
            <div className="card-header compact">
              <h2>سجل التغييرات</h2>
              <History size={20} />
            </div>
            <div className="changes">
              {changes.map((change) => (
                <div key={change.id}>
                  <Clock3 size={17} />
                  <p>
                    <strong>{change.action}</strong>
                    <span>{change.actor} · {change.time}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="warning">
              <ShieldCheck size={18} />
              لاحقًا يجب أن يكون السجل غير قابل للتلاعب ومربوطًا بالصلاحيات وعمليات الاعتماد. في هذه النسخة هو سجل محلي تمثيلي فقط.
            </div>
          </article>

          <article className="card help-card">
            <HelpCircle size={18} />
            <p>
              الهدف من هذه الشاشة ليس بناء نظام صلاحيات حقيقي الآن، بل تثبيت تجربة القرار: من يحرر، من يراجع، من يعتمد، وما الذي يُسجل.
            </p>
          </article>
        </aside>
      </section>
    </main>
  );
}

function StatusBadge({ value, map }) {
  const [label, tone] = map[value] || [value, "slate"];
  return <span className={`badge ${tone}`}>{label}</span>;
}

function Badge({ tone = "slate", children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Stat({ title, value, hint }) {
  return (
    <article className="stat">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

const styles = `
.team-page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}
.hero,.card,.stat,.governance-panel{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}
.hero{padding:22px;margin-bottom:16px;display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}
.hero h1{margin:0;font-size:34px;letter-spacing:-.04em}.hero p{color:#6f746b;line-height:1.8;max-width:820px}.hero-actions{display:flex;gap:10px}.score-card{min-width:138px;border-radius:20px;padding:14px;background:#f7f8f4;border:1px solid #e4e7df}.score-card span,.stat span{display:block;color:#6f746b;font-size:12px;font-weight:900}.score-card strong{display:block;font-size:30px;margin-top:4px}.score-card.good strong{color:#176b2c}.score-card.warn strong{color:#92400e}.score-card.bad strong{color:#991b1b}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}.stat{padding:16px}.stat strong{display:block;font-size:30px;margin-top:6px}.stat small{display:block;color:#6f746b;margin-top:4px}
.governance-panel{margin-bottom:16px;padding:15px;display:flex;gap:12px;align-items:flex-start;border-color:#fde68a;background:#fff7e6;color:#92400e}.governance-panel.safe{border-color:#bbf7d0;background:#f0fdf4;color:#166534}.governance-panel strong{display:block}.governance-panel ul{margin:8px 18px 0 0;padding:0;line-height:1.8}.governance-panel p{margin:6px 0 0;line-height:1.8}
.layout{display:grid;grid-template-columns:minmax(360px,.9fr) minmax(0,1.35fr) 360px;gap:16px;align-items:start}.card{padding:18px}.card-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.card-header.compact{align-items:center}.card h2{margin:0;font-size:20px}.card p{margin:5px 0 0;color:#6f746b;line-height:1.7}
.toolbar,.comment-filter,.comment-options{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.search-box,.select-box{border:1px solid #e4e7df;background:#f7f8f4;border-radius:16px;min-height:42px;padding:0 12px;display:flex;align-items:center;gap:8px;flex:1}.search-box input,.select-box select,.invite-box input,.invite-box select,.member-controls select,.comment-options select{border:0;background:transparent;outline:0;font-family:inherit;width:100%;color:#1f241d;font-weight:800}.invite-box{border:1px dashed #cbd5c0;border-radius:18px;padding:12px;background:#fbfcf8;display:grid;gap:9px;margin-bottom:14px}.invite-title{display:flex;align-items:center;gap:7px;font-weight:900;color:#176b2c}.invite-box input,.invite-box select,.comment-options select{min-height:40px;border:1px solid #e4e7df;background:#fff;border-radius:14px;padding:0 12px}.invite-box button,.comment-box button,.comment-actions button,.ghost{min-height:38px;border-radius:14px;border:1px solid #e4e7df;background:#fff;padding:0 12px;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-family:inherit;font-weight:900;cursor:pointer}.invite-box button,.comment-box button{background:#176b2c;color:#fff;border-color:#176b2c}.ghost.danger{color:#991b1b;background:#fff5f5;border-color:#fecaca}
.members,.comments,.review-list,.role-list,.changes{display:grid;gap:10px}.member-row,.comment-row,.review-item{border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:13px}.member-row{display:grid;gap:12px}.member-row.muted{opacity:.68}.member-main{display:flex;gap:10px;align-items:center}.avatar{width:42px;height:42px;border-radius:14px;background:#176b2c;color:#fff;display:grid;place-items:center;font-weight:900}.member-main strong{display:block}.member-main span,.member-main small,.review-item span,.comment-row span,.changes span{display:block;color:#6f746b;font-size:12px;margin-top:3px}.member-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.member-controls select{min-height:36px;border:1px solid #e4e7df;background:#fff;border-radius:12px;padding:0 8px;width:auto}
.badge{border-radius:999px;padding:6px 10px;font-size:11px;font-weight:900;height:fit-content;display:inline-flex;align-items:center;white-space:nowrap}.green{background:#f0fdf4;color:#166534}.amber{background:#fffbeb;color:#92400e}.slate{background:#f8fafc;color:#475569}.red{background:#fef2f2;color:#991b1b}.blue{background:#eff6ff;color:#1d4ed8}
.comment-box{display:grid;gap:10px;margin-bottom:14px}.comment-box textarea{min-height:128px;border:1px solid #e4e7df;border-radius:16px;padding:14px;font-family:inherit;line-height:1.8;resize:vertical}.comment-filter button{min-height:34px;border:1px solid #e4e7df;background:#fff;border-radius:999px;padding:0 12px;font-family:inherit;font-weight:900;color:#6f746b}.comment-filter button.active{background:#176b2c;color:#fff;border-color:#176b2c}.comment-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:flex-start}.comment-row.resolved{opacity:.78}.comment-row p{margin:6px 0;color:#1f241d}.comment-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.comment-actions button{font-size:12px}
.right-column{display:grid;gap:16px}.review-item{display:grid;gap:8px}.review-item strong{display:block}.review-item small{color:#92400e;font-weight:800}.role-list details{border:1px solid #e4e7df;background:#f7f8f4;border-radius:16px;padding:11px}.role-list summary{cursor:pointer;display:flex;align-items:center;gap:8px;font-weight:900}.role-list summary span:last-child{color:#6f746b;font-size:12px;font-weight:800}.role-list ul{margin:10px 20px 0 0;padding:0;line-height:1.8;color:#1f241d}.role-list p{font-size:12px;color:#92400e;display:flex;gap:6px;align-items:flex-start;margin-top:8px}.changes>div{border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:12px;display:flex;gap:9px}.changes p{margin:0;line-height:1.7}.warning{margin-top:14px;border:1px solid #fde68a;background:#fff7e6;color:#92400e;border-radius:18px;padding:13px;display:flex;gap:8px;line-height:1.8;font-size:12px;font-weight:800}.help-card{display:flex;gap:10px;align-items:flex-start;background:#eef7e9;border-color:#cfe8c5}.help-card p{margin:0;color:#176b2c;font-size:13px;font-weight:800}
@media(max-width:1240px){.layout{grid-template-columns:1fr}.stats-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:760px){.team-page{padding:14px}.hero{display:grid}.stats-grid{grid-template-columns:1fr}.comment-row{grid-template-columns:1fr}.comment-actions{display:flex}.toolbar,.comment-options{display:grid}.member-controls{display:grid;grid-template-columns:1fr 1fr}.member-controls select,.member-controls button{width:100%}}
`;
