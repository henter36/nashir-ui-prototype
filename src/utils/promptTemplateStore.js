const PROMPT_GOVERNANCE_KEY = "nashir_mock_prompt_governance";
const TEMPLATE_ENGINE_KEY = "nashir_mock_template_engine";

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
    // Invalid local payloads are replaced with the normalized payload below.
  }

  window.localStorage.setItem(
    key,
    JSON.stringify({
      version: 1,
      updatedAt: nowIso(),
      items,
    })
  );

  window.dispatchEvent(
    new Event(
      key === PROMPT_GOVERNANCE_KEY
        ? "nashir-prompt-governance-updated"
        : "nashir-template-engine-updated"
    )
  );
}

function normalizePrompt(item = {}) {
  const promptId = String(item.promptId || item.id || makeId("prompt"));

  return {
    id: promptId,
    promptId,
    name: item.name || "مطالبة جديدة",
    task: item.task || "ad_copy_generation",
    version: item.version || "v0.1",
    status: item.status || "draft",
    owner: item.owner || "System Admin",
    visibleToCustomer: Boolean(item.visibleToCustomer),
    review: item.review || "required",
    sensitivity: item.sensitivity || item.risk || "medium",
    updatedAt: item.updatedAt || "الآن",
    channel: item.channel || "غير محدد",
    description: item.description || "",
    customerFacingSummary: item.customerFacingSummary || "",
    internalPromptPreview: item.internalPromptPreview || "",
    allowedOutputs: Array.isArray(item.allowedOutputs) ? item.allowedOutputs : [],
    blockedPatterns: Array.isArray(item.blockedPatterns) ? item.blockedPatterns : [],
    requiredChecks: Array.isArray(item.requiredChecks) ? item.requiredChecks : [],
    usage: Array.isArray(item.usage) ? item.usage : [],
    createdAt: item.createdAt || nowIso(),
    updatedAtIso: item.updatedAtIso || nowIso(),
    sourceSurface: item.sourceSurface || "PromptGovernancePage",
  };
}

function normalizeTemplate(item = {}) {
  const templateId = String(item.templateId || item.id || makeId("template"));

  return {
    id: templateId,
    templateId,
    title: item.title || "قالب جديد",
    occasion: item.occasion || "Custom",
    type: item.type || "مخصص",
    channel: item.channel || "Instagram",
    content: item.content || "",
    status: item.status || (item.type === "جاهز" ? "approved" : "draft"),
    approval: item.approval || (item.type === "جاهز" ? "approved" : "needs_review"),
    review: item.review || "required",
    risk: item.risk || "medium",
    createdAt: item.createdAt || nowIso(),
    updatedAt: item.updatedAt || nowIso(),
    sourceSurface: item.sourceSurface || "TemplateEnginePage",
  };
}

export function readPromptRegistry(seed = []) {
  return readJsonStore(PROMPT_GOVERNANCE_KEY, seed, normalizePrompt);
}

export function writePromptRegistry(items = []) {
  writeJsonStore(PROMPT_GOVERNANCE_KEY, items.map(normalizePrompt));
}

export function upsertPrompt(item, seed = []) {
  const current = readPromptRegistry(seed);
  const normalized = normalizePrompt({
    ...item,
    updatedAt: "الآن",
    updatedAtIso: nowIso(),
  });
  const next = current.some((candidate) => candidate.promptId === normalized.promptId || candidate.id === normalized.id)
    ? current.map((candidate) =>
        candidate.promptId === normalized.promptId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writePromptRegistry(next);
  return readPromptRegistry(seed);
}

export function deletePrompt(promptId, seed = []) {
  const next = readPromptRegistry(seed).filter(
    (item) => item.promptId !== promptId && item.id !== promptId
  );

  writePromptRegistry(next);
  return readPromptRegistry(seed);
}

export function duplicatePrompt(prompt, seed = []) {
  const source = normalizePrompt(prompt);
  const cloned = normalizePrompt({
    ...source,
    id: makeId("prompt"),
    promptId: undefined,
    name: `${source.name} - نسخة مراجعة`,
    version: `${source.version}-copy`,
    status: "draft",
    updatedAt: "الآن",
    updatedAtIso: nowIso(),
    usage: [],
  });

  const next = [cloned, ...readPromptRegistry(seed)];
  writePromptRegistry(next);
  return {
    item: cloned,
    items: readPromptRegistry(seed),
  };
}

export function readTemplateRegistry(seed = []) {
  return readJsonStore(TEMPLATE_ENGINE_KEY, seed, normalizeTemplate);
}

export function writeTemplateRegistry(items = []) {
  writeJsonStore(TEMPLATE_ENGINE_KEY, items.map(normalizeTemplate));
}

export function upsertTemplate(item, seed = []) {
  const current = readTemplateRegistry(seed);
  const normalized = normalizeTemplate({
    ...item,
    updatedAt: nowIso(),
  });
  const next = current.some((candidate) => candidate.templateId === normalized.templateId || candidate.id === normalized.id)
    ? current.map((candidate) =>
        candidate.templateId === normalized.templateId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writeTemplateRegistry(next);
  return readTemplateRegistry(seed);
}

export function deleteTemplate(templateId, seed = []) {
  const next = readTemplateRegistry(seed).filter(
    (item) => item.templateId !== templateId && item.id !== templateId
  );

  writeTemplateRegistry(next);
  return readTemplateRegistry(seed);
}

export function createTemplateFromText(text, overrides = {}, seed = []) {
  const template = normalizeTemplate({
    id: makeId("template"),
    title: overrides.title || "قالب مخصص جديد",
    occasion: overrides.occasion || "Custom",
    type: overrides.type || "مخصص",
    channel: overrides.channel || "Instagram",
    content: text || "",
    status: overrides.status || "draft",
    approval: overrides.approval || "needs_review",
    review: overrides.review || "required",
    risk: overrides.risk || "medium",
  });
  const next = [template, ...readTemplateRegistry(seed)];

  writeTemplateRegistry(next);
  return {
    item: template,
    items: readTemplateRegistry(seed),
  };
}

export function getPromptStatusLabel(status) {
  const map = {
    active: "نشط",
    testing: "تجريبي",
    draft: "مسودة",
    blocked: "محظور",
  };

  return map[status] || "مسودة";
}

export function getTemplateStatusLabel(status) {
  const map = {
    approved: "جاهز",
    active: "جاهز",
    draft: "مسودة",
    needs_review: "يحتاج مراجعة",
    blocked: "محظور",
  };

  return map[status] || "يحتاج مراجعة";
}

export function getApprovalLabel(approval) {
  const map = {
    approved: "معتمد",
    needs_review: "يحتاج مراجعة",
    rejected: "مرفوض",
  };

  return map[approval] || "يحتاج مراجعة";
}

export function getReviewLabel(review) {
  const map = {
    always: "دائمًا",
    required: "مطلوبة",
    optional: "اختيارية",
  };

  return map[review] || "مطلوبة";
}

export function getRiskLabel(risk) {
  const map = {
    low: "منخفض",
    medium: "متوسط",
    high: "مرتفع",
    critical: "حرج",
  };

  return map[risk] || "متوسط";
}

export function getActivePrompts(seed = []) {
  return readPromptRegistry(seed).filter((prompt) => prompt.status === "active");
}

export function getApprovedTemplates(seed = []) {
  return readTemplateRegistry(seed).filter(
    (template) => template.status === "approved" || template.approval === "approved"
  );
}

export { PROMPT_GOVERNANCE_KEY, TEMPLATE_ENGINE_KEY };
