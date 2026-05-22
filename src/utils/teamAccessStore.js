const WORKSPACE_MEMBERS_KEY = "nashir_mock_workspace_members";
const WORKSPACE_ROLES_KEY = "nashir_mock_workspace_roles";
const ACTIVITY_LOG_KEY = "nashir_mock_activity_log";
const COLLABORATION_COMMENTS_KEY = "nashir_mock_collaboration_comments";

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readJsonStore(key, seed, normalizer) {
  if (typeof window === "undefined") return seed.map(normalizer);

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      const seeded = seed.map(normalizer);
      writeJsonStore(key, seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : parsed?.items;

    if (!Array.isArray(items)) return seed.map(normalizer);

    return items.map(normalizer);
  } catch {
    return seed.map(normalizer);
  }
}

function writeJsonStore(key, items) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    const currentItems = Array.isArray(parsed) ? parsed : parsed?.items;

    if (Array.isArray(currentItems) && JSON.stringify(currentItems) === JSON.stringify(items)) {
      return;
    }
  } catch {
    // Invalid local payloads are replaced by the normalized payload below.
  }

  window.localStorage.setItem(
    key,
    JSON.stringify({
      version: 1,
      updatedAt: nowIso(),
      items,
    })
  );

  const eventName =
    key === WORKSPACE_MEMBERS_KEY
      ? "nashir-workspace-members-updated"
      : key === WORKSPACE_ROLES_KEY
        ? "nashir-workspace-roles-updated"
        : key === ACTIVITY_LOG_KEY
          ? "nashir-activity-log-updated"
          : "nashir-collaboration-comments-updated";

  window.dispatchEvent(new Event(eventName));
}

function normalizeMember(item = {}) {
  const memberId = String(item.memberId || item.id || item.email || makeId("member"));
  const role = item.role || item.roleId || "Viewer";

  return {
    id: memberId,
    memberId,
    name: item.name || "عضو غير محدد",
    email: item.email || "pending@example.com",
    role,
    roleId: role,
    scope: item.scope || item.workspace || "صلاحيات محددة",
    workspace: item.workspace || "",
    status: normalizeMemberStatus(item.status),
    lastActive: item.lastActive || item.updatedAtLabel || "لا يوجد",
    createdAt: item.createdAt || nowIso(),
    updatedAt: item.updatedAt || nowIso(),
  };
}

function normalizeRole(item = {}) {
  const roleId = String(item.roleId || item.id || item.label || makeId("role"));

  return {
    id: roleId,
    roleId,
    label: item.label || roleId,
    description: item.description || "",
    tone: item.tone || "slate",
    permissions: Array.isArray(item.permissions) ? item.permissions : [],
    risk: item.risk || "",
    createdAt: item.createdAt || nowIso(),
    updatedAt: item.updatedAt || nowIso(),
  };
}

function normalizeActivity(item = {}) {
  const activityId = String(item.activityId || item.id || makeId("activity"));
  const severity = item.severity || item.level || "info";

  return {
    id: activityId,
    activityId,
    action: item.action || item.event || "تحديث محلي",
    actor: item.actor || "System",
    target: item.target || "",
    severity,
    level: severity,
    time: item.time || "الآن",
    createdAt: item.createdAt || nowIso(),
  };
}

function normalizeComment(item = {}) {
  const commentId = String(item.commentId || item.id || makeId("comment"));

  return {
    id: commentId,
    commentId,
    author: item.author || "غير محدد",
    text: item.text || "",
    time: item.time || "الآن",
    target: item.target || "مراجعة عامة",
    priority: item.priority || "medium",
    decision: item.decision || "note",
    status: item.status || "open",
    createdAt: item.createdAt || nowIso(),
    updatedAt: item.updatedAt || nowIso(),
  };
}

function normalizeMemberStatus(status) {
  if (status === "نشط") return "active";
  if (status === "بانتظار مراجعة") return "invited";
  if (status === "محدود") return "suspended";
  return status || "active";
}

export function readWorkspaceMembers(seed = []) {
  return readJsonStore(WORKSPACE_MEMBERS_KEY, seed, normalizeMember);
}

export function writeWorkspaceMembers(items = []) {
  writeJsonStore(WORKSPACE_MEMBERS_KEY, items.map(normalizeMember));
}

export function upsertWorkspaceMember(item, seed = []) {
  const current = readWorkspaceMembers(seed);
  const normalized = normalizeMember({ ...item, updatedAt: nowIso() });
  const next = current.some((candidate) => candidate.memberId === normalized.memberId || candidate.id === normalized.id)
    ? current.map((candidate) =>
        candidate.memberId === normalized.memberId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writeWorkspaceMembers(next);
  return readWorkspaceMembers(seed);
}

export function deleteWorkspaceMember(memberId, seed = []) {
  const next = readWorkspaceMembers(seed).filter(
    (item) => item.memberId !== memberId && item.id !== memberId
  );

  writeWorkspaceMembers(next);
  return readWorkspaceMembers(seed);
}

export function readWorkspaceRoles(seed = []) {
  return readJsonStore(WORKSPACE_ROLES_KEY, seed, normalizeRole);
}

export function writeWorkspaceRoles(items = []) {
  writeJsonStore(WORKSPACE_ROLES_KEY, items.map(normalizeRole));
}

export function upsertWorkspaceRole(item, seed = []) {
  const current = readWorkspaceRoles(seed);
  const normalized = normalizeRole({ ...item, updatedAt: nowIso() });
  const next = current.some((candidate) => candidate.roleId === normalized.roleId || candidate.id === normalized.id)
    ? current.map((candidate) =>
        candidate.roleId === normalized.roleId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writeWorkspaceRoles(next);
  return readWorkspaceRoles(seed);
}

export function deleteWorkspaceRole(roleId, seed = []) {
  const next = readWorkspaceRoles(seed).filter(
    (item) => item.roleId !== roleId && item.id !== roleId
  );

  writeWorkspaceRoles(next);
  return readWorkspaceRoles(seed);
}

export function readActivityLog(seed = []) {
  return readJsonStore(ACTIVITY_LOG_KEY, seed, normalizeActivity);
}

export function writeActivityLog(items = []) {
  writeJsonStore(ACTIVITY_LOG_KEY, items.map(normalizeActivity));
}

export function addActivity(activity, seed = []) {
  const normalized = normalizeActivity({
    ...activity,
    id: activity?.id || makeId("activity"),
    time: activity?.time || "الآن",
    createdAt: nowIso(),
  });
  const next = [normalized, ...readActivityLog(seed)];

  writeActivityLog(next);
  return readActivityLog(seed);
}

export function readCollaborationComments(seed = []) {
  return readJsonStore(COLLABORATION_COMMENTS_KEY, seed, normalizeComment);
}

export function writeCollaborationComments(items = []) {
  writeJsonStore(COLLABORATION_COMMENTS_KEY, items.map(normalizeComment));
}

export function upsertCollaborationComment(item, seed = []) {
  const current = readCollaborationComments(seed);
  const normalized = normalizeComment({ ...item, updatedAt: nowIso() });
  const next = current.some((candidate) => candidate.commentId === normalized.commentId || candidate.id === normalized.id)
    ? current.map((candidate) =>
        candidate.commentId === normalized.commentId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writeCollaborationComments(next);
  return readCollaborationComments(seed);
}

export function deleteCollaborationComment(commentId, seed = []) {
  const next = readCollaborationComments(seed).filter(
    (item) => item.commentId !== commentId && item.id !== commentId
  );

  writeCollaborationComments(next);
  return readCollaborationComments(seed);
}

export function getWorkspaceTeamSummary(memberSeed = [], roleSeed = [], activitySeed = [], commentSeed = []) {
  const members = readWorkspaceMembers(memberSeed);
  const roles = readWorkspaceRoles(roleSeed);
  const activity = readActivityLog(activitySeed);
  const comments = readCollaborationComments(commentSeed);

  return {
    members: members.length,
    activeMembers: members.filter((member) => member.status === "active").length,
    invitedMembers: members.filter((member) => member.status === "invited").length,
    suspendedMembers: members.filter((member) => member.status === "suspended").length,
    roles: roles.length,
    openComments: comments.filter((comment) => comment.status === "open").length,
    resolvedComments: comments.filter((comment) => comment.status === "resolved").length,
    activityItems: activity.length,
    criticalActivity: activity.filter((item) => ["critical", "high"].includes(item.severity)).length,
  };
}

export function getMemberStatusLabel(status) {
  const map = {
    active: "نشط",
    invited: "دعوة معلقة",
    suspended: "موقوف",
  };

  return map[status] || status || "نشط";
}

export function getCommentStatusLabel(status) {
  const map = {
    open: "مفتوح",
    resolved: "مغلق",
  };

  return map[status] || status || "مفتوح";
}

export function getActivitySeverityLabel(severity) {
  const map = {
    low: "منخفض",
    medium: "متوسط",
    high: "مرتفع",
    warning: "تحذير",
    critical: "حرج",
    info: "معلومة",
    success: "ناجح",
  };

  return map[severity] || severity || "معلومة";
}

export function getRoleById(roleId, roleSeed = []) {
  return readWorkspaceRoles(roleSeed).find((role) => role.roleId === roleId || role.id === roleId) || null;
}

export function resolveMemberRole(member, roleSeed = []) {
  return getRoleById(member?.roleId || member?.role, roleSeed);
}

export {
  ACTIVITY_LOG_KEY,
  COLLABORATION_COMMENTS_KEY,
  WORKSPACE_MEMBERS_KEY,
  WORKSPACE_ROLES_KEY,
};
