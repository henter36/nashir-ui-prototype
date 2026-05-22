const MODEL_REGISTRY_KEY = "nashir_mock_model_registry";
const MODEL_ROUTING_KEY = "nashir_mock_model_routing";
const COST_MONITOR_KEY = "nashir_mock_cost_monitor";

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
    // Replace invalid local payloads with the normalized payload below.
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
    key === MODEL_REGISTRY_KEY
      ? "nashir-model-registry-updated"
      : key === MODEL_ROUTING_KEY
        ? "nashir-model-routing-updated"
        : "nashir-cost-monitor-updated";

  window.dispatchEvent(new Event(eventName));
}

function normalizeModel(item = {}) {
  const modelId = String(item.modelId || item.id || makeId("model"));

  return {
    id: modelId,
    modelId,
    displayName: item.displayName || "نموذج غير محدد",
    provider: item.provider || "غير محدد",
    modelIdentifier: item.modelIdentifier || "",
    status: item.status || "testing",
    qualityTier: item.qualityTier || "balanced",
    speedTier: item.speedTier || "balanced",
    costTier: item.costTier || "medium",
    capabilities: Array.isArray(item.capabilities) ? item.capabilities : [],
    governance: {
      humanReviewRequired: item.governance?.humanReviewRequired ?? true,
      allowCustomerData: item.governance?.allowCustomerData ?? false,
      allowAssets: item.governance?.allowAssets ?? false,
      allowExternalTools: item.governance?.allowExternalTools ?? false,
      logRequests: item.governance?.logRequests ?? true,
    },
    createdAt: item.createdAt || nowIso(),
    updatedAt: item.updatedAt || nowIso(),
  };
}

function normalizeRoute(item = {}) {
  const routeId = String(item.routeId || item.id || makeId("route"));

  return {
    id: routeId,
    routeId,
    taskType: item.taskType || "general_task",
    primaryModelId: item.primaryModelId || "",
    fallbackModelIds: Array.isArray(item.fallbackModelIds) ? item.fallbackModelIds : [],
    policy: {
      useCheapestFirst: item.policy?.useCheapestFirst ?? false,
      useBestQuality: item.policy?.useBestQuality ?? true,
      retryOnFailure: item.policy?.retryOnFailure ?? true,
      maxRetries: Number(item.policy?.maxRetries ?? 1),
      timeoutSeconds: Number(item.policy?.timeoutSeconds ?? 60),
    },
    cost: {
      maxCostPerRun: String(item.cost?.maxCostPerRun ?? "0.25"),
      monthlyBudgetLimit: String(item.cost?.monthlyBudgetLimit ?? "100"),
      requireApprovalAboveCost: String(item.cost?.requireApprovalAboveCost ?? "1.00"),
    },
    governance: {
      humanReviewRequired: item.governance?.humanReviewRequired ?? true,
      blockAutoPublish: item.governance?.blockAutoPublish ?? true,
      redactSensitiveData: item.governance?.redactSensitiveData ?? true,
      includeSourceCitations: item.governance?.includeSourceCitations ?? false,
    },
    createdAt: item.createdAt || nowIso(),
    updatedAt: item.updatedAt || nowIso(),
  };
}

function normalizeCostRow(item = {}) {
  const costRowId = String(item.costRowId || item.id || item.task || makeId("cost"));
  const row = {
    id: costRowId,
    costRowId,
    task: item.task || item.taskType || "general_task",
    label: item.label || item.task || item.taskType || "مهمة تشغيلية",
    provider: item.provider || "غير محدد",
    route: item.route || item.workflowId || item.task || item.taskType || "general_task",
    runs: Number(item.runs ?? 0),
    cost: Number(item.cost ?? 0),
    cap: Number(item.cap ?? item.monthlyBudgetLimit ?? 0),
    avgRunCost: Number(item.avgRunCost ?? item.maxCostPerRun ?? 0),
    approvalAbove: Number(item.approvalAbove ?? item.requireApprovalAboveCost ?? 1),
    status: item.status || "ok",
    owner: item.owner || "تشغيلي",
    policy: item.policy || "review_required",
    autoThrottle: Boolean(item.autoThrottle),
    last: item.last || "لا يوجد",
    forecast: Number(item.forecast ?? item.cost ?? 0),
    createdAt: item.createdAt || nowIso(),
    updatedAt: item.updatedAt || nowIso(),
  };

  return {
    ...row,
    status: item.status || deriveCostStatus(row),
  };
}

export function readModelRegistry(seed = []) {
  return readJsonStore(MODEL_REGISTRY_KEY, seed, normalizeModel);
}

export function writeModelRegistry(items = []) {
  writeJsonStore(MODEL_REGISTRY_KEY, items.map(normalizeModel));
}

export function upsertModel(item, seed = []) {
  const current = readModelRegistry(seed);
  const normalized = normalizeModel({ ...item, updatedAt: nowIso() });
  const next = current.some((candidate) => candidate.modelId === normalized.modelId || candidate.id === normalized.id)
    ? current.map((candidate) =>
        candidate.modelId === normalized.modelId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writeModelRegistry(next);
  return readModelRegistry(seed);
}

export function deleteModel(modelId, seed = []) {
  const next = readModelRegistry(seed).filter(
    (item) => item.modelId !== modelId && item.id !== modelId
  );

  writeModelRegistry(next);
  return readModelRegistry(seed);
}

export function readModelRoutes(seed = []) {
  return readJsonStore(MODEL_ROUTING_KEY, seed, normalizeRoute);
}

export function writeModelRoutes(items = []) {
  writeJsonStore(MODEL_ROUTING_KEY, items.map(normalizeRoute));
}

export function upsertModelRoute(item, seed = []) {
  const current = readModelRoutes(seed);
  const normalized = normalizeRoute({ ...item, updatedAt: nowIso() });
  const next = current.some((candidate) => candidate.routeId === normalized.routeId || candidate.id === normalized.id)
    ? current.map((candidate) =>
        candidate.routeId === normalized.routeId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writeModelRoutes(next);
  return readModelRoutes(seed);
}

export function deleteModelRoute(routeId, seed = []) {
  const next = readModelRoutes(seed).filter(
    (item) => item.routeId !== routeId && item.id !== routeId
  );

  writeModelRoutes(next);
  return readModelRoutes(seed);
}

export function readCostRows(seed = []) {
  return readJsonStore(COST_MONITOR_KEY, seed, normalizeCostRow);
}

export function writeCostRows(items = []) {
  writeJsonStore(COST_MONITOR_KEY, items.map(normalizeCostRow));
}

export function upsertCostRow(item, seed = []) {
  const current = readCostRows(seed);
  const normalized = normalizeCostRow({ ...item, updatedAt: nowIso() });
  const next = current.some((candidate) => candidate.costRowId === normalized.costRowId || candidate.task === normalized.task)
    ? current.map((candidate) =>
        candidate.costRowId === normalized.costRowId || candidate.task === normalized.task
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writeCostRows(next);
  return readCostRows(seed);
}

export function deleteCostRow(costRowId, seed = []) {
  const next = readCostRows(seed).filter(
    (item) => item.costRowId !== costRowId && item.id !== costRowId && item.task !== costRowId
  );

  writeCostRows(next);
  return readCostRows(seed);
}

export function deriveCostRowsFromRoutes(routes = [], existingRows = [], models = []) {
  const existingByTask = new Map(existingRows.map((row) => [row.task, row]));
  const modelById = new Map(models.map((model) => [model.id, model]));

  return routes.map((route) => {
    const normalizedRoute = normalizeRoute(route);
    const existing = existingByTask.get(normalizedRoute.taskType);
    const model = modelById.get(normalizedRoute.primaryModelId);
    const cap = Number(normalizedRoute.cost.monthlyBudgetLimit || existing?.cap || 0);
    const avgRunCost = Number(normalizedRoute.cost.maxCostPerRun || existing?.avgRunCost || 0);
    const cost = Number(existing?.cost ?? 0);
    const forecast = Number(existing?.forecast ?? cost);
    const row = normalizeCostRow({
      ...(existing || {}),
      id: existing?.id || `cost_${normalizedRoute.taskType}`,
      task: normalizedRoute.taskType,
      label: existing?.label || normalizedRoute.taskType,
      provider: model?.provider || existing?.provider || "غير محدد",
      route: existing?.route || normalizedRoute.taskType,
      cap,
      avgRunCost,
      approvalAbove: Number(normalizedRoute.cost.requireApprovalAboveCost || existing?.approvalAbove || 1),
      cost,
      forecast,
      policy: normalizedRoute.governance.humanReviewRequired ? "review_required" : "low_risk",
    });

    return {
      ...row,
      status: deriveCostStatus(row),
    };
  });
}

export function getCostUsage(row = {}) {
  const cap = Number(row.cap || 0);
  return cap > 0 ? Math.round((Number(row.cost || 0) / cap) * 100) : 0;
}

export function getForecastUsage(row = {}) {
  const cap = Number(row.cap || 0);
  return cap > 0 ? Math.round((Number(row.forecast || 0) / cap) * 100) : 0;
}

export function deriveCostStatus(row = {}) {
  const usage = getCostUsage(row);
  const forecastUsage = getForecastUsage(row);

  if (row.status === "blocked") return "blocked";
  if (usage >= 80 || forecastUsage > 100 || Number(row.avgRunCost || 0) > Number(row.approvalAbove || 0)) {
    return "risk";
  }
  if (usage >= 55 || forecastUsage >= 80) return "watch";
  return "ok";
}

export function getModelRoutingSummary(modelSeed = [], routeSeed = [], costSeed = []) {
  const models = readModelRegistry(modelSeed);
  const routes = readModelRoutes(routeSeed);
  const rows = readCostRows(costSeed);
  const totalBudget = rows.reduce((sum, row) => sum + Number(row.cap || 0), 0);
  const totalCost = rows.reduce((sum, row) => sum + Number(row.cost || 0), 0);
  const totalForecast = rows.reduce((sum, row) => sum + Number(row.forecast || 0), 0);

  return {
    models: models.length,
    activeModels: models.filter((model) => model.status === "active").length,
    routes: routes.length,
    reviewRoutes: routes.filter((route) => route.governance.humanReviewRequired).length,
    highCostRoutes: routes.filter((route) => Number(route.cost.maxCostPerRun) >= 1).length,
    costRows: rows.length,
    totalBudget,
    totalCost,
    totalForecast,
    usage: totalBudget > 0 ? Math.round((totalCost / totalBudget) * 100) : 0,
    forecastUsage: totalBudget > 0 ? Math.round((totalForecast / totalBudget) * 100) : 0,
    blockedRows: rows.filter((row) => row.status === "blocked").length,
    riskRows: rows.filter((row) => row.status === "risk").length,
  };
}

export function getModelStatusLabel(status) {
  const map = {
    active: "نشط",
    testing: "تجريبي",
    disabled: "معطل",
    deprecated: "Deprecated",
  };

  return map[status] || "تجريبي";
}

export function getRouteStatusLabel(route = {}) {
  if (!route.primaryModelId) return "يحتاج إعداد";
  if (route.governance?.humanReviewRequired) return "يتطلب مراجعة";
  return "جاهز";
}

export function getCostStatusLabel(status) {
  const map = {
    ok: "طبيعي",
    watch: "مراقبة",
    risk: "مرتفع",
    blocked: "موقوف",
  };

  return map[status] || "طبيعي";
}

export { MODEL_REGISTRY_KEY, MODEL_ROUTING_KEY, COST_MONITOR_KEY };
