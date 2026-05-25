export const STORE_STRATEGIC_PLANS_KEY = "nashir_mock_store_strategic_plans";

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `store_plan_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeStatus(status) {
  return ["draft", "ready_for_review", "approved"].includes(status) ? status : "draft";
}

export function normalizeStoreStrategicPlan(plan = {}) {
  const id = String(plan.id || makeId());
  const createdAt = plan.createdAt || plan.updatedAt || nowIso();

  return {
    ...plan,
    id,
    storeProfileId: plan.storeProfileId || "",
    storeRef: plan.storeRef || plan.storeProfileId || "prototype_store_profile",
    workspaceRef: plan.workspaceRef || "prototype_workspace",
    version: Number.isFinite(Number(plan.version)) ? Number(plan.version) : 1,
    status: normalizeStatus(plan.status),
    planJson: plan.planJson && typeof plan.planJson === "object" ? plan.planJson : {},
    sourceInputs: Array.isArray(plan.sourceInputs) ? plan.sourceInputs : [],
    confidence: Number.isFinite(Number(plan.confidence)) ? Number(plan.confidence) : 0,
    limitations: Array.isArray(plan.limitations) ? plan.limitations : [],
    createdAt,
    updatedAt: plan.updatedAt || nowIso(),
  };
}

export function readStoreStrategicPlans(fallback = []) {
  const fallbackPlans = Array.isArray(fallback) ? fallback : [];
  if (typeof window === "undefined") return fallbackPlans.map(normalizeStoreStrategicPlan);

  try {
    const raw = window.localStorage.getItem(STORE_STRATEGIC_PLANS_KEY);

    if (!raw) {
      const normalizedFallback = fallbackPlans.map(normalizeStoreStrategicPlan);
      if (normalizedFallback.length) writeStoreStrategicPlans(normalizedFallback);
      return normalizedFallback;
    }

    const parsed = JSON.parse(raw);
    const plans = Array.isArray(parsed) ? parsed : parsed?.plans;

    if (!Array.isArray(plans)) return fallbackPlans.map(normalizeStoreStrategicPlan);

    return plans.map(normalizeStoreStrategicPlan);
  } catch {
    return fallbackPlans.map(normalizeStoreStrategicPlan);
  }
}

export function readLatestStoreStrategicPlan(fallback = null) {
  const fallbackPlans = fallback ? [fallback] : [];
  const plans = readStoreStrategicPlans(fallbackPlans);

  return plans
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] || fallback;
}

export function writeStoreStrategicPlans(plans = []) {
  const normalized = plans.map(normalizeStoreStrategicPlan);
  if (typeof window === "undefined") return normalized;

  window.localStorage.setItem(
    STORE_STRATEGIC_PLANS_KEY,
    JSON.stringify({
      version: 1,
      source: "nashir_ui_prototype_store_strategic_plans",
      updatedAt: nowIso(),
      plans: normalized,
    })
  );

  window.dispatchEvent(new Event("nashir-store-strategic-plan-updated"));

  return normalized;
}

export function upsertStoreStrategicPlan(plan, fallback = []) {
  const current = readStoreStrategicPlans(fallback);
  const normalized = normalizeStoreStrategicPlan({
    ...plan,
    updatedAt: nowIso(),
  });
  const exists = current.some((item) => item.id === normalized.id);
  const next = exists
    ? current.map((item) => (item.id === normalized.id ? normalized : item))
    : [normalized, ...current];

  return writeStoreStrategicPlans(next);
}
