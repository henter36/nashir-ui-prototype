import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Ban,
  CheckCircle2,
  CircleAlert,
  Clock3,
  DollarSign,
  FileText,
  Lock,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  deriveCostRowsFromRoutes,
  deriveCostStatus,
  getCostUsage,
  getForecastUsage as getStoredForecastUsage,
  readCostRows,
  readModelRegistry,
  readModelRoutes,
  upsertCostRow,
  writeCostRows,
} from "../utils/modelCostStore.js";

const initialRows = [
  {
    task: "store_reading",
    label: "قراءة المتجر",
    provider: "Gemini",
    route: "store_intelligence",
    runs: 34,
    cost: 18.7,
    cap: 150,
    avgRunCost: 0.55,
    approvalAbove: 2,
    status: "ok",
    owner: "Store Setup",
    policy: "low_risk",
    autoThrottle: false,
    last: "منذ 12 دقيقة",
    forecast: 42,
  },
  {
    task: "ad_copy_generation",
    label: "توليد النصوص الإعلانية",
    provider: "OpenAI",
    route: "campaign_generation",
    runs: 148,
    cost: 92.4,
    cap: 300,
    avgRunCost: 0.62,
    approvalAbove: 3,
    status: "ok",
    owner: "Content Studio",
    policy: "review_required",
    autoThrottle: false,
    last: "منذ 8 دقائق",
    forecast: 178,
  },
  {
    task: "image_generation",
    label: "توليد الصور",
    provider: "Replicate",
    route: "content_generation",
    runs: 28,
    cost: 126,
    cap: 400,
    avgRunCost: 4.5,
    approvalAbove: 6,
    status: "watch",
    owner: "Asset Library",
    policy: "asset_rights_review",
    autoThrottle: true,
    last: "منذ 35 دقيقة",
    forecast: 278,
  },
  {
    task: "video_generation",
    label: "توليد الفيديو",
    provider: "Runway",
    route: "video_generation",
    runs: 7,
    cost: 196,
    cap: 300,
    avgRunCost: 28,
    approvalAbove: 3,
    status: "risk",
    owner: "Content Studio",
    policy: "strict_approval",
    autoThrottle: true,
    last: "منذ ساعة",
    forecast: 412,
  },
  {
    task: "risk_review",
    label: "مراجعة المخاطر",
    provider: "Anthropic",
    route: "risk_review",
    runs: 55,
    cost: 41.2,
    cap: 200,
    avgRunCost: 0.75,
    approvalAbove: 5,
    status: "ok",
    owner: "Governance",
    policy: "mandatory",
    autoThrottle: false,
    last: "منذ 20 دقيقة",
    forecast: 89,
  },
];

const statusMap = {
  ok: ["طبيعي", "green"],
  watch: ["مراقبة", "amber"],
  risk: ["مرتفع", "red"],
  blocked: ["موقوف", "slate"],
  ready: ["جاهز", "green"],
  warning: ["يحتاج متابعة", "amber"],
  approval: ["يحتاج اعتماد", "red"],
};

const policyMap = {
  low_risk: "استخدام منخفض المخاطر",
  review_required: "مراجعة عند المخرجات التسويقية",
  asset_rights_review: "فحص حقوق الأصول",
  strict_approval: "اعتماد صارم قبل التشغيل",
  mandatory: "إلزامي قبل الاعتماد",
};

const periods = ["هذا الشهر", "آخر 7 أيام", "اليوم", "تجريبي"];

function getUsage(row) {
  return getCostUsage(row);
}

function getForecastUsage(row) {
  return getStoredForecastUsage(row);
}

function getRowWarnings(row) {
  if (!row) {
    return ["لا يوجد مسار تكلفة محدد حاليًا."];
  }

  const safeRow = {
    status: "ok",
    avgRunCost: 0,
    approvalAbove: Number.POSITIVE_INFINITY,
    autoThrottle: true,
    task: "",
    ...row,
  };

  const warnings = [];
  const usage = getUsage(safeRow);
  const forecastUsage = getForecastUsage(safeRow);

  if (safeRow.status === "risk") warnings.push("المسار مصنف عالي التكلفة ويحتاج اعتمادًا قبل التوسع.");
  if (usage >= 80) warnings.push("الاستهلاك الحالي تجاوز 80% من الحد.");
  if (forecastUsage > 100) warnings.push("التوقع الشهري يتجاوز الحد المحدد.");
  if (safeRow.avgRunCost > safeRow.approvalAbove) warnings.push("متوسط تكلفة التشغيل أعلى من حد الموافقة.");
  if (!safeRow.autoThrottle && usage >= 70) warnings.push("يفضل تفعيل الخفض التلقائي قبل تجاوز الميزانية.");
  if (safeRow.task === "video_generation") warnings.push("توليد الفيديو لا يجب أن يعمل دون موافقة بشرية صريحة.");

  return warnings;
}

function getLinkedRoute(row, routes = []) {
  if (!row) return null;
  const rowKeys = [row.task, row.route].filter(Boolean);

  return (
    routes.find((route) => rowKeys.includes(route.taskType) || rowKeys.includes(route.id) || rowKeys.includes(route.routeId)) ||
    null
  );
}

function getLinkedModel(route, models = []) {
  if (!route?.primaryModelId) return null;
  return models.find((model) => model.id === route.primaryModelId || model.modelId === route.primaryModelId) || null;
}

function getCostHealthLabel(status) {
  const labels = {
    ready: "جاهز",
    warning: "يحتاج متابعة",
    approval: "يحتاج اعتماد",
    blocked: "محظور",
  };

  return labels[status] || "يحتاج متابعة";
}

function buildCostRouteHealth(row, routes = [], models = []) {
  const checks = [];
  const warnings = [];
  const blockedReasons = [];

  if (!row) {
    return {
      status: "blocked",
      score: 0,
      checks: [],
      warnings: [],
      blockedReasons: ["لا يوجد صف تكلفة محدد."],
      linkedRoute: null,
      linkedModel: null,
    };
  }

  const linkedRoute = getLinkedRoute(row, routes);
  const linkedModel = getLinkedModel(linkedRoute, models);
  const usage = getUsage(row);
  const forecastUsage = getForecastUsage(row);
  const avgRunCost = Number(row.avgRunCost ?? 0);
  const approvalAbove = Number(row.approvalAbove ?? Number.POSITIVE_INFINITY);
  const forecast = Number(row.forecast ?? 0);
  const cap = Number(row.cap ?? 0);
  const routeMaxCost = Number(linkedRoute?.cost?.maxCostPerRun ?? avgRunCost);
  const routeApproval = Number(linkedRoute?.cost?.requireApprovalAboveCost ?? approvalAbove);
  const highCost = Math.max(avgRunCost, routeMaxCost) >= 1;

  checks.push("صف التكلفة موجود.");

  if (linkedRoute) {
    checks.push("مرتبطة بتوجيه النماذج.");
    if (linkedRoute.primaryModelId) {
      checks.push("المسار يحتوي نموذجًا أساسيًا.");
    } else {
      blockedReasons.push("المسار المرتبط لا يحتوي نموذجًا أساسيًا.");
    }
  } else {
    blockedReasons.push("لا يوجد مسار تشغيل مرتبط بتوجيه النماذج.");
  }

  if (linkedModel) {
    checks.push("النموذج الأساسي موجود.");
    if (linkedModel.status === "active") {
      checks.push("النموذج الأساسي نشط.");
    } else {
      blockedReasons.push("النموذج الأساسي غير نشط.");
    }
  } else if (linkedRoute) {
    blockedReasons.push("النموذج الأساسي غير موجود في سجل النماذج.");
  }

  if (Number.isFinite(avgRunCost) && avgRunCost > 0) {
    checks.push("متوسط تكلفة التشغيل متوفر.");
  } else {
    warnings.push("متوسط تكلفة التشغيل غير مكتمل.");
  }

  if (Number.isFinite(approvalAbove) && approvalAbove > 0) {
    checks.push("حد الموافقة متوفر.");
  } else {
    warnings.push("حد الموافقة غير محدد.");
  }

  if (avgRunCost > approvalAbove * 2) {
    blockedReasons.push("متوسط تكلفة التشغيل يتجاوز حد الموافقة بشكل كبير.");
  } else if (avgRunCost > approvalAbove || routeMaxCost > routeApproval) {
    warnings.push("متوسط تكلفة التشغيل أعلى من حد الموافقة ويحتاج اعتمادًا قبل التشغيل.");
  }

  if (cap > 0 && forecast > cap * 1.25) {
    blockedReasons.push("التوقع الشهري يتجاوز الحد بشكل كبير.");
  } else if (forecastUsage > 100) {
    warnings.push("التوقع الشهري يتجاوز الحد المحدد.");
  }

  if (usage >= 80) warnings.push("الاستهلاك الحالي تجاوز 80% من الحد.");
  if (!row.autoThrottle && usage >= 70) warnings.push("الخفض التلقائي غير مفعل مع اقتراب الاستهلاك من الحد.");

  if (row.task === "video_generation") {
    if (linkedRoute?.governance?.humanReviewRequired || row.approvalAbove > 0) {
      checks.push("توليد الفيديو يحتاج اعتمادًا قبل التشغيل.");
    } else {
      blockedReasons.push("توليد الفيديو يجب أن يتطلب مراجعة أو اعتمادًا قبل التشغيل.");
    }
  }

  if (highCost) {
    if (approvalAbove > 0 || routeApproval > 0) {
      warnings.push("مسار عالي التكلفة يحتاج اعتمادًا قبل التشغيل.");
    } else {
      blockedReasons.push("مسار عالي التكلفة بدون حد موافقة.");
    }
  }

  const score = Math.max(0, 100 - blockedReasons.length * 35 - warnings.length * 8);
  const status = blockedReasons.length
    ? "blocked"
    : warnings.some((warning) => warning.includes("اعتماد"))
      ? "approval"
      : warnings.length
        ? "warning"
        : "ready";

  return {
    status,
    score,
    checks,
    warnings,
    blockedReasons,
    linkedRoute,
    linkedModel,
  };
}

export default function CostMonitorPage() {
  const [rows, setRows] = useState(() => readCostRows(initialRows));
  const [routes, setRoutes] = useState(() => readModelRoutes([]));
  const [models, setModels] = useState(() => readModelRegistry([]));
  const [period, setPeriod] = useState("هذا الشهر");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(initialRows[0].task);
  const [auditLog, setAuditLog] = useState([
    {
      id: 1,
      action: "تم تفعيل مراقبة تكلفة الفيديو",
      actor: "System Admin",
      time: "منذ ساعة",
    },
    {
      id: 2,
      action: "تمت مراجعة حد ad_copy_generation",
      actor: "Cost Monitor",
      time: "قبل ساعتين",
    },
  ]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesQuery =
        row.task.toLowerCase().includes(query.toLowerCase()) ||
        row.label.includes(query) ||
        row.provider.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === "all" || row.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  const selected =
    rows.find((row) => row.task === selectedTask) ||
    rows[0] ||
    initialRows[0] ||
    null;

  useEffect(() => {
    const reloadCosts = () => {
      setRows(readCostRows(initialRows));
      setRoutes(readModelRoutes([]));
      setModels(readModelRegistry([]));
    };
    const reloadFromRouting = () => {
      const routes = readModelRoutes([]);
      const models = readModelRegistry([]);
      const storedRows = readCostRows(initialRows);

      if (!routes.length) {
        setRows(storedRows);
        setRoutes(routes);
        setModels(models);
        return;
      }

      const next = deriveCostRowsFromRoutes(routes, storedRows, models);
      writeCostRows(next);
      setRoutes(routes);
      setModels(models);
      setRows(readCostRows(initialRows));
    };

    window.addEventListener("focus", reloadCosts);
    window.addEventListener("storage", reloadCosts);
    window.addEventListener("nashir-cost-monitor-updated", reloadCosts);
    window.addEventListener("nashir-model-routing-updated", reloadFromRouting);

    return () => {
      window.removeEventListener("focus", reloadCosts);
      window.removeEventListener("storage", reloadCosts);
      window.removeEventListener("nashir-cost-monitor-updated", reloadCosts);
      window.removeEventListener("nashir-model-routing-updated", reloadFromRouting);
    };
  }, []);

  const totals = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + row.cost, 0);
    const cap = rows.reduce((sum, row) => sum + row.cap, 0);
    const forecast = rows.reduce((sum, row) => sum + row.forecast, 0);
    const risk = rows.filter((row) => row.status === "risk").length;
    const watch = rows.filter((row) => row.status === "watch").length;
    const blocked = rows.filter((row) => row.status === "blocked").length;

    return {
      total,
      cap,
      forecast,
      usage: cap > 0 ? Math.round((total / cap) * 100) : 0,
      forecastUsage: cap > 0 ? Math.round((forecast / cap) * 100) : 0,
      risk,
      watch,
      blocked,
    };
  }, [rows]);

  const governanceWarnings = useMemo(() => {
    const warnings = [];

    if (totals.forecastUsage > 100) warnings.push("التوقع الشهري يتجاوز سقف الميزانية العام.");
    if (totals.risk > 0) warnings.push("يوجد مسار أو أكثر في حالة تكلفة مرتفعة.");
    if (rows.some((row) => row.avgRunCost > row.approvalAbove)) {
      warnings.push("بعض المسارات تتجاوز تكلفة التشغيل فيها حد الموافقة.");
    }
    if (rows.some((row) => getUsage(row) >= 70 && !row.autoThrottle)) {
      warnings.push("بعض المسارات تقترب من الحد دون خفض تلقائي.");
    }

    return warnings.length ? warnings : ["الوضع الحالي تحت السيطرة، مع بقاء المراقبة مطلوبة."];
  }, [rows, totals]);

  const updateSelected = (key, value) => {
    const updatedRow = {
      ...selected,
      [key]: value,
    };

    if (key === "cost" || key === "cap" || key === "forecast" || key === "avgRunCost" || key === "approvalAbove") {
      updatedRow.status = deriveCostStatus(updatedRow);
    }

    const next = upsertCostRow(updatedRow, initialRows);
    setRows(next);
  };

  const deriveStatus = (row) => {
    return deriveCostStatus(row);
  };

  const refreshCosts = () => {
    const nextRows = rows.map((row) => {
      const updatedRow = {
        ...row,
        cost: Number((row.cost + row.avgRunCost * 0.15).toFixed(2)),
        forecast: Number((row.forecast + row.avgRunCost * 0.4).toFixed(2)),
        last: "الآن",
      };

      return {
        ...updatedRow,
        status: deriveStatus({
          ...row,
          cost: Number((row.cost + row.avgRunCost * 0.15).toFixed(2)),
          forecast: Number((row.forecast + row.avgRunCost * 0.4).toFixed(2)),
        }),
      };
    });

    writeCostRows(nextRows);
    setRows(readCostRows(initialRows));

    addAudit("تم تحديث التكلفة محليًا كمحاكاة", "Cost Monitor");
  };

  const addAudit = (action, actor = "System Admin") => {
    setAuditLog((prev) => [
      {
        id: Date.now(),
        action,
        actor,
        time: "الآن",
      },
      ...prev,
    ]);
  };

  const blockSelected = () => {
    const next = upsertCostRow(
      {
        ...selected,
        status: "blocked",
        autoThrottle: true,
      },
      initialRows
    );
    setRows(next);
    addAudit(`تم إيقاف ${selected.task} محليًا`, "System Admin");
  };

  const approveSelected = () => {
    const next = upsertCostRow(
      {
        ...selected,
        status: "ok",
      },
      initialRows
    );
    setRows(next);
    addAudit(`تم اعتماد استمرار ${selected.task} ضمن الحد الحالي`, "Reviewer");
  };

  const selectedWarnings = getRowWarnings(selected);
  const selectedHealth = buildCostRouteHealth(selected, routes, models);

  return (
    <main className="cost-page" dir="rtl">
      <style>{styles}</style>

      <section className="cost-title">
        <div>
          <div className="eyebrow">
            <DollarSign size={15} />
            Cost Monitor
          </div>
          <h1>مراقبة تكلفة الذكاء الاصطناعي</h1>
          <p>
            مراقبة محلية لتكلفة المهام والمزوّدين، مع حدود إنفاق، توقعات شهرية،
            موافقات، وخفض تلقائي. هذه الشاشة Prototype فقط ولا تستدعي أي مزود.
          </p>
        </div>

        <div className="title-actions">
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            {periods.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <button className="secondary" type="button" onClick={() => addAudit("تم تصدير تقرير تكلفة محلي", "Cost Monitor")}>
            <FileText size={16} />
            تقرير محلي
          </button>

          <button className="primary" type="button" onClick={refreshCosts}>
            <RefreshCw size={16} />
            تحديث
          </button>
        </div>
      </section>

      <section className="governance-strip">
        <ShieldCheck size={19} />
        <div>
          <strong>حوكمة تكلفة التشغيل</strong>
          <span>
            صفوف التكلفة مرتبطة بتوجيه النماذج وتؤثر على جاهزية التشغيل. أي مسار
            يتجاوز حد الموافقة أو يتوقع تجاوز الميزانية يحتاج اعتمادًا قبل التشغيل.
          </span>
        </div>
      </section>

      <section className="stats">
        <Stat title="إجمالي الصرف" value={`$${totals.total.toFixed(1)}`} hint={period} />
        <Stat title="الحد العام" value={`$${totals.cap}`} hint="مجموع حدود المهام" />
        <Stat title="الاستهلاك الحالي" value={`${totals.usage}%`} hint="من الحد العام" />
        <Stat title="التوقع الشهري" value={`${totals.forecastUsage}%`} hint={`$${totals.forecast.toFixed(1)}`} />
        <Stat title="مسارات خطر" value={totals.risk} hint={`${totals.watch} مراقبة`} />
      </section>

      <section className="controls-card">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث بالمهمة أو المزود..."
          />
        </div>

        <div className="filter-group">
          {[
            ["all", "الكل"],
            ["ok", "طبيعي"],
            ["watch", "مراقبة"],
            ["risk", "مرتفع"],
            ["blocked", "موقوف"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={statusFilter === id ? "active" : ""}
              onClick={() => setStatusFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="layout">
        <article className="card">
          <div className="card-header">
            <div>
              <h2>التكلفة حسب المهمة</h2>
              <p>اضغط على أي مسار لعرض الحدود والسياسات والتوقعات.</p>
            </div>
            <BarChart3 size={20} />
          </div>

          <div className="table">
            <div className="head">
              <span>المهمة</span>
              <span>المزود</span>
              <span>التشغيلات</span>
              <span>التكلفة</span>
              <span>الحد</span>
              <span>التوقع</span>
              <span>الحالة</span>
              <span>جاهزية التكلفة</span>
            </div>

            {filteredRows.map((row) => {
              const health = buildCostRouteHealth(row, routes, models);
              return (
                <button
                  key={row.task}
                  type="button"
                  className={`row ${selected?.task === row.task ? "selected" : ""}`}
                  onClick={() => setSelectedTask(row.task)}
                >
                  <span>
                    <strong>{row.label}</strong>
                    <small>{policyMap[row.policy] || "تشغيلي"}</small>
                  </span>
                  <span>{row.provider}</span>
                  <span>{row.runs}</span>
                  <span>${row.cost}</span>
                  <span>${row.cap}</span>
                  <span>{getForecastUsage(row)}%</span>
                  <Status value={row.status} />
                  <CostHealthBadge status={health.status} />
                </button>
              );
            })}
          </div>
        </article>

        <aside className="card">
          <div className="card-header">
            <div>
              <h2>تنبيهات التكلفة</h2>
              <p>ملخص المخاطر الناتجة عن الحدود والتوقعات.</p>
            </div>
            <AlertTriangle size={20} />
          </div>

          <div className="alerts">
            {governanceWarnings.map((warning) => (
              <div key={warning} className={warning.includes("تحت السيطرة") ? "alert ok" : "alert"}>
                {warning.includes("تحت السيطرة") ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                <span>{warning}</span>
              </div>
            ))}
          </div>

          <div className="mini-chart">
            {rows.map((row) => (
              <span
                key={row.task}
                title={`${row.label}: ${getUsage(row)}%`}
                className={row.status}
                style={{ height: `${Math.max(12, Math.min(100, getUsage(row)))}%` }}
              />
            ))}
          </div>

          <div className="legend">
            <span><b className="dot green" /> طبيعي</span>
            <span><b className="dot amber" /> مراقبة</span>
            <span><b className="dot red" /> مرتفع</span>
          </div>
        </aside>
      </section>

      <section className="detail-layout">
        <article className="card">
          <div className="card-header">
            <div>
              <h2>ضبط المسار المحدد</h2>
              <p>{selected.label} · {selected.provider}</p>
            </div>
            <Status value={selected.status} />
          </div>

          <div className="detail-grid">
            <Info label="مفتاح المهمة" value={selected.task} />
            <Info label="مسار التشغيل" value={selected.route} />
            <Info label="المجال التشغيلي" value={selected.owner} />
            <Info label="السياسة" value={policyMap[selected.policy]} />
            <Info label="آخر تحديث" value={selected.last} />
            <Info label="متوسط تكلفة التشغيل" value={`$${selected.avgRunCost}`} />
          </div>

          <CostRouteHealthPanel row={selected} health={selectedHealth} />

          <div className="edit-grid">
            <label>
              <span>الحد الشهري</span>
              <input
                type="number"
                min="0"
                value={selected.cap}
                onChange={(event) => updateSelected("cap", Number(event.target.value))}
              />
            </label>

            <label>
              <span>حد الموافقة لكل تشغيل</span>
              <input
                type="number"
                min="0"
                value={selected.approvalAbove}
                onChange={(event) => updateSelected("approvalAbove", Number(event.target.value))}
              />
            </label>

            <label>
              <span>التوقع الشهري</span>
              <input
                type="number"
                min="0"
                value={selected.forecast}
                onChange={(event) => updateSelected("forecast", Number(event.target.value))}
              />
            </label>

            <label>
              <span>التكلفة الحالية</span>
              <input
                type="number"
                min="0"
                value={selected.cost}
                onChange={(event) => updateSelected("cost", Number(event.target.value))}
              />
            </label>
          </div>

          <div className="toggle-row">
            <button
              type="button"
              className={selected.autoThrottle ? "toggle active" : "toggle"}
              onClick={() => {
                updateSelected("autoThrottle", !selected.autoThrottle);
                addAudit(
                  `${selected.autoThrottle ? "تعطيل" : "تفعيل"} الخفض التلقائي لـ ${selected.task}`,
                  "System Admin"
                );
              }}
            >
              <SlidersHorizontal size={16} />
              الخفض التلقائي: {selected.autoThrottle ? "مفعل" : "غير مفعل"}
            </button>

            <button type="button" className="secondary" onClick={approveSelected}>
              <ShieldCheck size={16} />
              اعتماد الاستمرار
            </button>

            <button type="button" className="danger" onClick={blockSelected}>
              <Ban size={16} />
              إيقاف محلي
            </button>
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h2>تحليل المخاطر</h2>
              <p>تحذيرات مرتبطة بالمسار المحدد.</p>
            </div>
            <CircleAlert size={20} />
          </div>

          <div className="risk-meter">
            <div>
              <span>الاستهلاك الحالي</span>
              <strong>{getUsage(selected)}%</strong>
            </div>
            <div className="meter">
              <span style={{ width: `${Math.min(100, getUsage(selected))}%` }} />
            </div>
          </div>

          <div className="risk-meter">
            <div>
              <span>التوقع الشهري</span>
              <strong>{getForecastUsage(selected)}%</strong>
            </div>
            <div className="meter forecast">
              <span style={{ width: `${Math.min(100, getForecastUsage(selected))}%` }} />
            </div>
          </div>

          <div className="alerts">
            {selectedWarnings.length ? (
              selectedWarnings.map((warning) => (
                <div key={warning} className="alert">
                  <AlertTriangle size={17} />
                  <span>{warning}</span>
                </div>
              ))
            ) : (
              <div className="alert ok">
                <CheckCircle2 size={17} />
                <span>لا توجد مخاطر تكلفة حرجة لهذا المسار.</span>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="bottom-layout">
        <article className="card">
          <div className="card-header">
            <div>
              <h2>محاكاة قرار التشغيل</h2>
              <p>اختبار محلي يوضح هل يسمح النظام بالتشغيل أم يطلب اعتمادًا.</p>
            </div>
            <PlayCircle size={20} />
          </div>

          <SimulationBox selected={selected} routes={routes} models={models} />
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h2>سجل الحوكمة</h2>
              <p>سجل محلي للقرارات داخل البروتوتايب.</p>
            </div>
            <Clock3 size={20} />
          </div>

          <div className="audit-list">
            {auditLog.map((item) => (
              <div key={item.id} className="audit-row">
                <Lock size={16} />
                <p>
                  <strong>{item.action}</strong>
                  <span>{item.actor} · {item.time}</span>
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function CostHealthBadge({ status }) {
  return <span className={`cost-health-badge ${status}`}>{getCostHealthLabel(status)}</span>;
}

function CostRouteHealthPanel({ row, health }) {
  const routeLabel = health.linkedRoute
    ? row.route || row.label
    : "غير مرتبط";
  const modelLabel = health.linkedModel?.displayName || "غير محدد";
  const impact =
    health.status === "blocked"
      ? "محظور حتى معالجة أسباب الحظر."
      : health.status === "approval"
        ? "يحتاج اعتمادًا قبل التشغيل."
        : health.status === "warning"
          ? "يؤثر على جاهزية التشغيل ويحتاج متابعة."
          : "جاهز ضمن حدود التكلفة الحالية.";

  return (
    <section className={`cost-route-health-panel ${health.status}`}>
      <div className="cost-health-head">
        <div>
          <strong>جاهزية التكلفة للمسار</strong>
          <span>مرتبطة بتوجيه النماذج · تؤثر على جاهزية التشغيل</span>
        </div>
        <CostHealthBadge status={health.status} />
      </div>

      <div className="cost-health-grid">
        <Info label="حالة التكلفة" value={`${getCostHealthLabel(health.status)} · ${health.score}%`} />
        <Info label="المسار المرتبط" value={routeLabel} />
        <Info label="النموذج الأساسي" value={modelLabel} />
        <Info label="متوسط تكلفة التشغيل" value={`$${row.avgRunCost ?? 0}`} />
        <Info label="حد الموافقة" value={`$${row.approvalAbove ?? "غير محدد"}`} />
        <Info label="التوقع الشهري" value={`$${row.forecast ?? 0} · ${getForecastUsage(row)}%`} />
        <Info label="الخفض التلقائي" value={row.autoThrottle ? "مفعل" : "غير مفعل"} />
        <Info label="أثر التكلفة على التشغيل" value={impact} />
      </div>

      {health.blockedReasons.length ? (
        <div className="cost-health-notes blocked-notes">
          <strong>أسباب الحظر</strong>
          {health.blockedReasons.map((reason) => (
            <span key={reason}>{reason}</span>
          ))}
        </div>
      ) : null}

      {health.warnings.length ? (
        <div className="cost-health-notes warning-notes">
          <strong>تحذيرات</strong>
          {health.warnings.map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
        </div>
      ) : null}

      <div className="cost-health-notes check-notes">
        {health.checks.slice(0, 5).map((check) => (
          <span key={check}>{check}</span>
        ))}
      </div>
    </section>
  );
}

function SimulationBox({ selected, routes = [], models = [] }) {
  const health = buildCostRouteHealth(selected, routes, models);
  const warnings = getRowWarnings(selected);
  const blocked = selected.status === "blocked" || health.status === "blocked";
  const requiresApproval =
    health.status === "approval" ||
    selected.avgRunCost > selected.approvalAbove ||
    getUsage(selected) >= 80 ||
    getForecastUsage(selected) > 100 ||
    selected.task === "video_generation";
  const approvalReason =
    selected.avgRunCost > selected.approvalAbove
      ? "متوسط تكلفة التشغيل أعلى من حد الموافقة."
      : selected.task === "video_generation"
        ? "توليد الفيديو يحتاج اعتمادًا قبل التشغيل."
        : "توجد عتبة تكلفة أو توقع تحتاج اعتمادًا.";
  const forecastReason =
    getForecastUsage(selected) > 100
      ? "التوقع الشهري يتجاوز الحد المحدد."
      : "التوقع الشهري داخل الحد الحالي.";

  return (
    <div className="simulation">
      <div className={blocked ? "simulation-result blocked" : requiresApproval ? "simulation-result approval" : "simulation-result ok"}>
        {blocked ? <Ban size={20} /> : requiresApproval ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
        <div>
          <strong>
            {blocked
              ? "محظور"
              : requiresApproval
                ? "يحتاج اعتماد"
                : "allowed"}
          </strong>
          <span>
            {blocked
              ? health.blockedReasons[0] || "هذا المسار لن يظهر كمسموح في البروتوتايب."
              : requiresApproval
                ? approvalReason
                : "لا توجد عتبات حرجة حسب البيانات الحالية."}
          </span>
        </div>
      </div>

      <div className="simulation-grid">
        <Info label="المسار" value={selected.task} />
        <Info label="المزود" value={selected.provider} />
        <Info label="متوسط التشغيل" value={`$${selected.avgRunCost}`} />
        <Info label="حد الموافقة" value={`$${selected.approvalAbove}`} />
        <Info label="سبب التوقع" value={forecastReason} />
        <Info label="سبب الاعتماد" value={requiresApproval ? approvalReason : "لا يحتاج اعتمادًا حاليًا"} />
        <Info label="التحذيرات" value={warnings.length || "لا يوجد"} />
        <Info label="نوع القرار" value={blocked ? "blocked" : requiresApproval ? "needs approval" : "allowed"} />
      </div>
    </div>
  );
}

function Status({ value }) {
  const [label, tone] = statusMap[value] || statusMap.ok;
  return <span className={`status ${tone}`}>{label}</span>;
}

function Stat({ title, value, hint }) {
  return (
    <article className="stat">
      <span>{title}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.cost-page{
  min-height:calc(100vh - 80px);
  padding:24px;
  background:#f7f8f4;
  color:#1f241d;
  font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif;
}

.cost-title,
.stat,
.card,
.controls-card,
.governance-strip{
  background:#fff;
  border:1px solid #e4e7df;
  border-radius:24px;
  box-shadow:0 8px 26px rgba(24,38,18,.035);
}

.cost-title{
  padding:20px;
  display:flex;
  justify-content:space-between;
  gap:16px;
  margin-bottom:16px;
}

.eyebrow{
  width:fit-content;
  min-height:30px;
  padding:0 11px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:#176b2c;
  background:#eef7e9;
  font-size:12px;
  font-weight:900;
  margin-bottom:10px;
}

.cost-title h1{
  margin:0;
  font-size:34px;
  letter-spacing:-.04em;
}

.cost-title p{
  color:#6f746b;
  line-height:1.8;
  max-width:850px;
}

.title-actions{
  display:flex;
  gap:10px;
  align-items:flex-start;
  flex-wrap:wrap;
  justify-content:flex-end;
}

.title-actions select{
  min-height:42px;
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:16px;
  padding:0 12px;
  font-family:inherit;
  font-weight:900;
}

.primary,
.secondary,
.danger,
.toggle{
  min-height:42px;
  border-radius:16px;
  padding:0 16px;
  display:inline-flex;
  gap:8px;
  align-items:center;
  justify-content:center;
  font-weight:900;
  font-family:inherit;
  cursor:pointer;
}

.primary{
  border:0;
  background:#176b2c;
  color:#fff;
}

.secondary{
  border:1px solid #e4e7df;
  background:#fff;
  color:#1f241d;
}

.danger{
  border:1px solid #fecaca;
  background:#fef2f2;
  color:#991b1b;
}

.toggle{
  border:1px solid #e4e7df;
  background:#fff;
  color:#1f241d;
}

.toggle.active{
  border-color:#176b2c;
  background:#eef7e9;
  color:#176b2c;
}

.governance-strip{
  padding:14px 16px;
  margin-bottom:16px;
  display:flex;
  gap:12px;
  align-items:flex-start;
  color:#176b2c;
}

.governance-strip strong{
  display:block;
  margin-bottom:4px;
}

.governance-strip span{
  display:block;
  color:#52604c;
  line-height:1.8;
  font-size:13px;
}

.stats{
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:14px;
  margin-bottom:16px;
}

.stat{
  padding:16px;
}

.stat span{
  color:#6f746b;
  font-size:13px;
  font-weight:900;
}

.stat strong{
  display:block;
  margin-top:8px;
  font-size:30px;
}

.stat small{
  display:block;
  color:#8a9185;
  margin-top:5px;
  font-size:12px;
  font-weight:800;
}

.controls-card{
  padding:14px;
  margin-bottom:16px;
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:center;
  flex-wrap:wrap;
}

.search-box{
  flex:1;
  min-width:260px;
  min-height:42px;
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:16px;
  padding:0 12px;
  display:flex;
  align-items:center;
  gap:8px;
}

.search-box input{
  flex:1;
  border:0;
  outline:0;
  background:transparent;
  font-family:inherit;
  font-weight:800;
}

.filter-group{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.filter-group button{
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:999px;
  min-height:36px;
  padding:0 12px;
  font-family:inherit;
  font-weight:900;
  cursor:pointer;
}

.filter-group button.active{
  border-color:#176b2c;
  background:#eef7e9;
  color:#176b2c;
}

.layout,
.detail-layout,
.bottom-layout{
  display:grid;
  gap:16px;
  margin-bottom:16px;
}

.layout{
  grid-template-columns:minmax(0,1fr)340px;
}

.detail-layout{
  grid-template-columns:minmax(0,1.25fr)minmax(0,.75fr);
}

.bottom-layout{
  grid-template-columns:minmax(0,1fr)minmax(0,1fr);
}

.card{
  padding:18px;
}

.card-header{
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
  margin-bottom:14px;
}

.card h2{
  margin:0;
}

.card p{
  margin:6px 0 0;
  color:#6f746b;
  line-height:1.7;
  font-size:13px;
}

.table{
  border:1px solid #e4e7df;
  border-radius:18px;
  overflow:hidden;
}

.head,
.row{
  display:grid;
  grid-template-columns:1.25fr .7fr .55fr .6fr .6fr .6fr .6fr .75fr;
  gap:10px;
  padding:13px 14px;
  align-items:center;
}

.head{
  background:#f7f8f4;
  color:#6f746b;
  font-size:12px;
  font-weight:900;
}

.row{
  width:100%;
  border:0;
  border-top:1px solid #e4e7df;
  background:#fff;
  text-align:right;
  font-family:inherit;
  cursor:pointer;
}

.row.selected{
  background:#eef7e9;
}

.row strong{
  display:block;
}

.row small{
  display:block;
  color:#6f746b;
  margin-top:4px;
}

.status{
  width:fit-content;
  border-radius:999px;
  padding:6px 10px;
  font-size:11px;
  font-weight:900;
}

.green{
  background:#f0fdf4;
  color:#166534;
}

.amber{
  background:#fffbeb;
  color:#92400e;
}

.red{
  background:#fef2f2;
  color:#991b1b;
}

.slate{
  background:#f8fafc;
  color:#475569;
}

.cost-health-badge{
  width:fit-content;
  min-height:28px;
  border-radius:999px;
  padding:0 10px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  font-weight:1000;
  white-space:nowrap;
}

.cost-health-badge.ready{
  color:#166534;
  background:#dcfce7;
}

.cost-health-badge.warning{
  color:#92400e;
  background:#fef3c7;
}

.cost-health-badge.approval,
.cost-health-badge.blocked{
  color:#991b1b;
  background:#fee2e2;
}

.alerts{
  display:grid;
  gap:10px;
}

.alert{
  border:1px solid #fde68a;
  background:#fff7e6;
  color:#92400e;
  border-radius:18px;
  padding:13px;
  display:flex;
  gap:8px;
  line-height:1.8;
  font-size:12px;
  font-weight:800;
}

.alert.ok{
  background:#f0fdf4;
  border-color:#bbf7d0;
  color:#166534;
}

.mini-chart{
  height:210px;
  border:1px solid #e4e7df;
  border-radius:18px;
  padding:16px;
  display:flex;
  align-items:flex-end;
  gap:12px;
  margin-top:14px;
}

.mini-chart span{
  flex:1;
  border-radius:999px 999px 6px 6px;
  min-height:12px;
}

.mini-chart span.ok{
  background:#176b2c;
}

.mini-chart span.watch{
  background:#d97706;
}

.mini-chart span.risk{
  background:#dc2626;
}

.mini-chart span.blocked{
  background:#94a3b8;
}

.legend{
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  color:#6f746b;
  font-size:12px;
  font-weight:900;
  margin-top:12px;
}

.legend span{
  display:inline-flex;
  align-items:center;
  gap:6px;
}

.dot{
  width:9px;
  height:9px;
  border-radius:999px;
  display:inline-block;
}

.dot.green{background:#176b2c}
.dot.amber{background:#d97706}
.dot.red{background:#dc2626}

.detail-grid,
.simulation-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
  margin-bottom:14px;
}

.cost-route-health-panel{
  border:1px solid #d9ead7;
  background:#fbfdf9;
  border-radius:18px;
  padding:13px;
  margin-bottom:14px;
}

.cost-route-health-panel.warning{
  border-color:#fde68a;
  background:#fffaf0;
}

.cost-route-health-panel.approval,
.cost-route-health-panel.blocked{
  border-color:#fecaca;
  background:#fff5f5;
}

.cost-health-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px;
  margin-bottom:12px;
}

.cost-health-head strong{
  display:block;
  color:#1f241d;
  font-size:15px;
}

.cost-health-head span{
  display:block;
  margin-top:4px;
  color:#6f746b;
  font-size:12px;
  line-height:1.7;
}

.cost-health-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:10px;
}

.cost-health-notes{
  display:grid;
  gap:6px;
  margin-top:10px;
}

.cost-health-notes strong{
  display:block;
  color:#1f241d;
  font-size:12px;
}

.cost-health-notes span{
  border-radius:12px;
  padding:7px 9px;
  font-size:11px;
  font-weight:800;
  line-height:1.6;
}

.blocked-notes span{
  color:#991b1b;
  background:#fee2e2;
}

.warning-notes span{
  color:#92400e;
  background:#ffedd5;
}

.check-notes span{
  color:#166534;
  background:#ecfdf5;
}

.info{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:16px;
  padding:12px;
  min-height:64px;
}

.info span{
  display:block;
  color:#6f746b;
  font-size:12px;
  font-weight:900;
  margin-bottom:6px;
}

.info strong{
  display:block;
  line-height:1.6;
  overflow-wrap:anywhere;
}

.edit-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:10px;
}

.edit-grid label{
  display:grid;
  gap:7px;
}

.edit-grid label span{
  color:#6f746b;
  font-size:12px;
  font-weight:900;
}

.edit-grid input{
  min-height:42px;
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:14px;
  padding:0 12px;
  font-family:inherit;
  font-weight:900;
}

.toggle-row{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-top:14px;
}

.risk-meter{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:13px;
  margin-bottom:12px;
}

.risk-meter>div:first-child{
  display:flex;
  justify-content:space-between;
  gap:10px;
  font-weight:900;
}

.risk-meter span{
  color:#6f746b;
}

.meter{
  height:10px;
  background:#e8ecdf;
  border-radius:999px;
  overflow:hidden;
  margin-top:10px;
}

.meter span{
  display:block;
  height:100%;
  background:#176b2c;
  border-radius:999px;
}

.meter.forecast span{
  background:#d97706;
}

.simulation-result{
  border-radius:18px;
  padding:14px;
  display:flex;
  gap:10px;
  align-items:flex-start;
  margin-bottom:14px;
}

.simulation-result strong{
  display:block;
  margin-bottom:4px;
}

.simulation-result span{
  display:block;
  color:inherit;
  line-height:1.7;
  font-size:13px;
}

.simulation-result.ok{
  background:#f0fdf4;
  color:#166534;
  border:1px solid #bbf7d0;
}

.simulation-result.approval{
  background:#fff7e6;
  color:#92400e;
  border:1px solid #fde68a;
}

.simulation-result.blocked{
  background:#fef2f2;
  color:#991b1b;
  border:1px solid #fecaca;
}

.audit-list{
  display:grid;
  gap:10px;
}

.audit-row{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:12px;
  display:flex;
  gap:9px;
  align-items:flex-start;
}

.audit-row p{
  margin:0;
}

.audit-row strong{
  display:block;
  color:#1f241d;
}

.audit-row span{
  display:block;
  margin-top:4px;
  color:#6f746b;
  font-size:12px;
  font-weight:800;
}

@media(max-width:1180px){
  .stats,
  .layout,
  .detail-layout,
  .bottom-layout{
    grid-template-columns:1fr;
  }

  .cost-title{
    flex-direction:column;
  }

  .title-actions{
    justify-content:flex-start;
  }
}

@media(max-width:820px){
  .table{
    overflow:auto;
  }

  .head,
  .row{
    min-width:900px;
  }

  .detail-grid,
  .simulation-grid,
  .cost-health-grid,
  .edit-grid{
    grid-template-columns:1fr;
  }
}
`;
