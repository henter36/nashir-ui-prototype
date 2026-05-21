import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Database,
  Eye,
  FileSearch,
  Globe2,
  Link2,
  Lock,
  Plus,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Store,
  Trash2,
  Unlink,
  XCircle,
} from "lucide-react";

const initialSources = [
  {
    id: "website",
    name: "رابط المتجر",
    type: "Website",
    status: "scan_completed",
    confidence: 86,
    output: "3 منتجات، 3 تصنيفات، 2 أصول",
    last: "منذ 12 دقيقة",
    connectionMode: "public_url",
    sourceUrl: "https://store.example.com",
    owner: "Store Setup",
    visibility: "reviewer_only",
    reviewRequired: true,
    sensitive: false,
    destinations: ["storeSetup", "productCatalog", "assetLibrary"],
    fields: ["store_url", "product_candidates", "asset_candidates", "brand_insights"],
    warnings: ["تحتاج المنتجات المستخرجة إلى اعتماد قبل استخدامها في الحملات."],
    scanLog: [
      "تم فحص رابط المتجر.",
      "تم استخراج المنتجات والتصنيفات.",
      "تم إرسال الأصول المرشحة إلى مكتبة الأصول.",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    type: "Social",
    status: "scan_completed",
    confidence: 74,
    output: "نبرة ودية وثيمات هدايا",
    last: "منذ ساعة",
    connectionMode: "public_profile",
    sourceUrl: "https://instagram.com/example",
    owner: "Brand Signals",
    visibility: "internal_only",
    reviewRequired: true,
    sensitive: false,
    destinations: ["storeSetup", "content"],
    fields: ["tone_signals", "visual_themes", "audience_hints"],
    warnings: ["تحليل الحسابات العامة مؤشر مساعد وليس مصدر حقيقة نهائي."],
    scanLog: [
      "تمت قراءة بيانات عامة فقط.",
      "تم استنتاج نبرة محتوى مبدئية.",
      "تم وسم النتائج كمؤشرات تحتاج مراجعة.",
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    type: "Social",
    status: "manual",
    confidence: 30,
    output: "رابط مدخل يدويًا",
    last: "لم يحلل",
    connectionMode: "manual_url",
    sourceUrl: "https://tiktok.com/@example",
    owner: "Manual Intake",
    visibility: "reviewer_only",
    reviewRequired: true,
    sensitive: false,
    destinations: ["content"],
    fields: ["manual_social_url"],
    warnings: ["لم يتم تحليل المصدر بعد؛ لا تستخدمه كمدخل للحملة قبل الفحص."],
    scanLog: ["تم إدخال الرابط يدويًا فقط."],
  },
  {
    id: "commerce",
    name: "Salla / Commerce",
    type: "Commerce",
    status: "empty",
    confidence: 0,
    output: "غير متصل",
    last: "لم يبدأ",
    connectionMode: "official_integration",
    sourceUrl: "",
    owner: "Commerce Integration",
    visibility: "admin_only",
    reviewRequired: true,
    sensitive: true,
    destinations: ["productCatalog", "storeSetup"],
    fields: ["catalog_sync", "orders_scope_disabled", "inventory_scope_disabled"],
    warnings: ["الربط الرسمي مؤجل في البروتوتايب ولا توجد صلاحيات API حقيقية."],
    scanLog: [],
  },
];

const STATUS_META = {
  empty: { label: "لم يبدأ", tone: "slate", icon: CircleAlert },
  manual: { label: "يدوي", tone: "slate", icon: FileSearch },
  pending_scan: { label: "قيد الفحص", tone: "amber", icon: RefreshCw },
  scan_completed: { label: "تم التحليل", tone: "green", icon: CheckCircle2 },
  failed: { label: "فشل", tone: "red", icon: XCircle },
  connected: { label: "مرتبط", tone: "green", icon: Link2 },
  disabled: { label: "معطل", tone: "red", icon: Lock },
};

const SOURCE_TYPES = ["Website", "Social", "Commerce", "Files", "Manual"];
const CONNECTION_MODES = [
  ["public_url", "رابط عام"],
  ["public_profile", "حساب عام"],
  ["manual_url", "إدخال يدوي"],
  ["official_integration", "تكامل رسمي"],
  ["file_upload", "ملف مرفوع"],
];

const VISIBILITY = [
  ["customer_visible", "ظاهر للعميل"],
  ["reviewer_only", "للمراجع فقط"],
  ["internal_only", "داخلي فقط"],
  ["admin_only", "للمدير فقط"],
];

const DESTINATION_OPTIONS = [
  ["storeSetup", "إعداد المتجر"],
  ["productCatalog", "كتالوج المنتجات"],
  ["assetLibrary", "مكتبة الأصول"],
  ["campaigns", "معالج الحملات"],
  ["content", "المحتوى والمراجعة"],
  ["analytics", "التحليلات"],
  ["workflowRuns", "تشغيلات النظام"],
];

const FILTERS = [
  ["all", "الكل"],
  ["scan_completed", "تم التحليل"],
  ["manual", "يدوي"],
  ["empty", "لم يبدأ"],
  ["connected", "مرتبط"],
  ["failed", "فشل"],
  ["disabled", "معطل"],
];

function buildGovernanceWarnings(source) {
  const warnings = [...(source.warnings || [])];

  if (source.status === "empty") {
    warnings.push("المصدر غير مفعّل ولا يمد أي شاشة ببيانات موثوقة.");
  }

  if (source.status === "manual") {
    warnings.push("الإدخال اليدوي يحتاج تحقق قبل استخدامه في توصيات الحملة.");
  }

  if (source.confidence < 50 && source.status !== "empty") {
    warnings.push("مستوى الثقة منخفض؛ يجب عدم استخدامه كمصدر قرار منفرد.");
  }

  if (source.visibility === "customer_visible" && source.sensitive) {
    warnings.push("تعارض: مصدر حساس لا يجب أن يكون ظاهرًا للعميل.");
  }

  if (source.connectionMode === "official_integration" && source.status !== "connected") {
    warnings.push("التكامل الرسمي غير مفعل في البروتوتايب؛ لا توجد صلاحيات API حقيقية.");
  }

  if (!source.reviewRequired && source.confidence < 80) {
    warnings.push("تعطيل المراجعة غير آمن لمصدر ثقة أقل من 80%.");
  }

  if (!source.destinations.length) {
    warnings.push("المصدر غير مربوط بأي شاشة؛ فائدته التشغيلية غير واضحة.");
  }

  return Array.from(new Set(warnings));
}

function getSourceHealth(source) {
  if (source.status === "disabled") return 0;
  let score = 40;

  if (source.status === "scan_completed" || source.status === "connected") score += 25;
  if (source.status === "manual") score += 5;
  if (source.sourceUrl || source.connectionMode === "official_integration") score += 10;
  if (source.destinations.length) score += 10;
  if (source.reviewRequired) score += 5;
  if (source.confidence >= 75) score += 10;
  if (source.sensitive && source.visibility === "customer_visible") score -= 25;
  if (source.status === "empty") score -= 20;

  return Math.max(0, Math.min(100, score));
}

function createNewSource() {
  return {
    id: `source_${Date.now()}`,
    name: "مصدر جديد",
    type: "Manual",
    status: "manual",
    confidence: 20,
    output: "مصدر محلي مضاف يدويًا",
    last: "الآن",
    connectionMode: "manual_url",
    sourceUrl: "",
    owner: "Manual Intake",
    visibility: "reviewer_only",
    reviewRequired: true,
    sensitive: false,
    destinations: [],
    fields: ["manual_input"],
    warnings: ["مصدر جديد يحتاج مراجعة وربط قبل استخدامه."],
    scanLog: ["تم إنشاء مصدر محلي جديد داخل البروتوتايب."],
  };
}

export default function DataSourcesHubPage() {
  const [sources, setSources] = useState(initialSources);
  const [selectedId, setSelectedId] = useState(initialSources[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const selected = sources.find((source) => source.id === selectedId) || sources[0];

  const visibleSources = useMemo(() => {
    return sources.filter((source) => {
      const matchesFilter = filter === "all" || source.status === filter;
      const text = `${source.name} ${source.type} ${source.output} ${source.owner}`.toLowerCase();
      const matchesQuery = !query.trim() || text.includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [sources, filter, query]);

  const stats = useMemo(() => {
    const activeSources = sources.filter((source) => source.status !== "disabled");
    const analyzed = sources.filter((source) => source.status === "scan_completed").length;
    const connected = sources.filter((source) => source.status === "connected").length;
    const manual = sources.filter((source) => source.status === "manual").length;
    const warnings = sources.reduce((total, source) => total + buildGovernanceWarnings(source).length, 0);
    const avg = activeSources.length
      ? Math.round(activeSources.reduce((sum, source) => sum + source.confidence, 0) / activeSources.length)
      : 0;

    return { total: sources.length, analyzed, connected, manual, avg, warnings };
  }, [sources]);

  const updateSelected = (key, value) => {
    setSources((prev) =>
      prev.map((source) =>
        source.id === selected.id
          ? {
              ...source,
              [key]: value,
              last: key === "status" ? "الآن" : source.last,
            }
          : source
      )
    );
  };

  const scan = (id) => {
    setSources((prev) =>
      prev.map((source) =>
        source.id === id
          ? {
              ...source,
              status: "pending_scan",
              output: "جاري التحليل...",
              last: "الآن",
              scanLog: [`بدأ فحص المصدر: ${source.name}`, ...(source.scanLog || [])],
            }
          : source
      )
    );

    window.setTimeout(() => {
      setSources((prev) =>
        prev.map((source) =>
          source.id === id
            ? {
                ...source,
                status: source.connectionMode === "official_integration" ? "connected" : "scan_completed",
                confidence: Math.max(source.confidence, source.connectionMode === "official_integration" ? 82 : 78),
                output:
                  source.connectionMode === "official_integration"
                    ? "تكامل تمثيلي متصل محليًا بدون API حقيقي"
                    : "تم جمع بيانات جديدة وتحديث التوصيات",
                last: "الآن",
                scanLog: [
                  "اكتمل الفحص المحلي.",
                  "تم تحديث الثقة والمخرجات.",
                  "تم وسم النتائج كمخرجات تحتاج مراجعة قبل الاستخدام.",
                  ...(source.scanLog || []),
                ],
              }
            : source
        )
      );
    }, 800);
  };

  const addSource = () => {
    const next = createNewSource();
    setSources((prev) => [next, ...prev]);
    setSelectedId(next.id);
  };

  const disableSource = () => {
    setSources((prev) =>
      prev.map((source) =>
        source.id === selected.id
          ? {
              ...source,
              status: "disabled",
              destinations: [],
              output: "تم تعطيل المصدر محليًا",
              last: "الآن",
              scanLog: ["تم تعطيل المصدر وفك جميع الروابط.", ...(source.scanLog || [])],
            }
          : source
      )
    );
  };

  const deleteSource = () => {
    const remaining = sources.filter((source) => source.id !== selected.id);
    setSources(remaining);
    setSelectedId(remaining[0]?.id || "");
  };

  const toggleDestination = (destinationId) => {
    setSources((prev) =>
      prev.map((source) => {
        if (source.id !== selected.id) return source;
        const exists = source.destinations.includes(destinationId);
        return {
          ...source,
          destinations: exists
            ? source.destinations.filter((id) => id !== destinationId)
            : [...source.destinations, destinationId],
          scanLog: [
            `${exists ? "تم فك الربط عن" : "تم ربط المصدر بـ"} ${
              DESTINATION_OPTIONS.find(([id]) => id === destinationId)?.[1] || destinationId
            }`,
            ...(source.scanLog || []),
          ],
        };
      })
    );
  };

  const warnings = selected ? buildGovernanceWarnings(selected) : [];
  const health = selected ? getSourceHealth(selected) : 0;

  return (
    <main className="data-sources-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-hero">
        <div>
          <div className="eyebrow">
            <Globe2 size={15} />
            Data Sources & Integrations
          </div>
          <h1>مصادر البيانات والتكاملات</h1>
          <p>
            مركز إدارة مصادر المتجر والحسابات والتكاملات. كل مصدر له حالة، ثقة،
            مخرجات، وجهات استخدام، وتحذيرات حوكمة قبل أن يؤثر على الحملات.
          </p>
        </div>

        <div className="hero-actions">
          <button type="button" className="secondary-button" onClick={addSource}>
            <Plus size={16} />
            إضافة مصدر
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => selected && scan(selected.id)}
            disabled={!selected || selected.status === "disabled"}
          >
            <SearchCheck size={16} />
            فحص المصدر المحدد
          </button>
        </div>
      </section>

      <section className="governance-strip">
        <ShieldCheck size={20} />
        <div>
          <strong>Prototype فقط — لا يوجد ربط API حقيقي</strong>
          <span>
            الفحص والربط هنا محليان لتثبيت تجربة المنتج. أي مصدر يحتاج مراجعة قبل
            استخدامه كمصدر نهائي للحملات.
          </span>
        </div>
      </section>

      <section className="stats-grid">
        <Stat title="المصادر" value={stats.total} />
        <Stat title="تم التحليل" value={stats.analyzed} />
        <Stat title="مرتبطة" value={stats.connected} />
        <Stat title="يدوي" value={stats.manual} />
        <Stat title="متوسط الثقة" value={`${stats.avg}%`} />
        <Stat title="تنبيهات الحوكمة" value={stats.warnings} tone={stats.warnings ? "warn" : "ok"} />
      </section>

      <section className="tools-row">
        <label className="search-box">
          <span>بحث</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث باسم المصدر أو نوعه أو مخرجاته..."
          />
        </label>

        <div className="filter-pills">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={filter === id ? "active" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="main-layout">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>المصادر</h2>
              <p>اختر مصدرًا لمراجعة مخرجاته وربطه بالشاشات.</p>
            </div>
            <span>{visibleSources.length} ظاهر</span>
          </div>

          <div className="source-list">
            {visibleSources.map((source) => (
              <button
                key={source.id}
                type="button"
                className={selectedId === source.id ? "selected" : ""}
                onClick={() => setSelectedId(source.id)}
              >
                <div className="source-main">
                  <strong>{source.name}</strong>
                  <span>{source.type} · {source.output}</span>
                  <small>
                    {source.destinations.length
                      ? `مرتبط بـ ${source.destinations.length} شاشة`
                      : "غير مربوط"}
                  </small>
                </div>

                <div className="source-meta">
                  <Status value={source.status} />
                  <b>{getSourceHealth(source)}%</b>
                </div>
              </button>
            ))}
          </div>
        </article>

        {selected ? (
          <aside className="panel detail-panel">
            <div className="source-icon">
              {selected.type === "Commerce" ? <Database size={24} /> : <Store size={24} />}
            </div>

            <div className="detail-title">
              <div>
                <h2>{selected.name}</h2>
                <p>{selected.type}</p>
              </div>
              <Status value={selected.status} />
            </div>

            <div className="health-card">
              <div>
                <span>Source Health</span>
                <strong>{health}%</strong>
              </div>
              <div className="meter">
                <i style={{ width: `${health}%` }} />
              </div>
            </div>

            <div className="editor-grid">
              <label className="field">
                <span>اسم المصدر</span>
                <input value={selected.name} onChange={(e) => updateSelected("name", e.target.value)} />
              </label>

              <label className="field">
                <span>النوع</span>
                <select value={selected.type} onChange={(e) => updateSelected("type", e.target.value)}>
                  {SOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>طريقة الربط</span>
                <select
                  value={selected.connectionMode}
                  onChange={(e) => updateSelected("connectionMode", e.target.value)}
                >
                  {CONNECTION_MODES.map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>الرابط / المرجع</span>
                <input
                  value={selected.sourceUrl}
                  onChange={(e) => updateSelected("sourceUrl", e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="field">
                <span>المالك</span>
                <input value={selected.owner} onChange={(e) => updateSelected("owner", e.target.value)} />
              </label>

              <label className="field">
                <span>الحالة</span>
                <select value={selected.status} onChange={(e) => updateSelected("status", e.target.value)}>
                  {Object.entries(STATUS_META).map(([id, meta]) => (
                    <option key={id} value={id}>{meta.label}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>الثقة</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selected.confidence}
                  onChange={(e) => updateSelected("confidence", Number(e.target.value))}
                />
              </label>

              <label className="field">
                <span>الرؤية</span>
                <select value={selected.visibility} onChange={(e) => updateSelected("visibility", e.target.value)}>
                  {VISIBILITY.map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field wide">
              <span>المخرجات</span>
              <textarea
                value={selected.output}
                onChange={(e) => updateSelected("output", e.target.value)}
                rows={3}
              />
            </label>

            <div className="toggle-row">
              <button
                type="button"
                className={selected.reviewRequired ? "toggle active" : "toggle"}
                onClick={() => updateSelected("reviewRequired", !selected.reviewRequired)}
              >
                <Eye size={15} />
                مراجعة قبل الاستخدام
              </button>

              <button
                type="button"
                className={selected.sensitive ? "toggle active danger" : "toggle"}
                onClick={() => updateSelected("sensitive", !selected.sensitive)}
              >
                <Lock size={15} />
                بيانات حساسة
              </button>
            </div>

            <Info label="آخر فحص" value={selected.last} />
            <Info label="حقول المخرجات" value={selected.fields.join("، ")} />

            <div className="destination-box">
              <h3>ربط المخرجات بالشاشات</h3>
              <p>اختيار الوجهات يوضح أين ستظهر مخرجات المصدر داخل البروتوتايب.</p>

              <div className="destination-grid">
                {DESTINATION_OPTIONS.map(([id, label]) => {
                  const linked = selected.destinations.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      className={linked ? "linked" : ""}
                      onClick={() => toggleDestination(id)}
                    >
                      {linked ? <Link2 size={15} /> : <Unlink size={15} />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="warnings-box">
              <h3>
                <AlertTriangle size={17} />
                تحذيرات الحوكمة
              </h3>
              {warnings.length ? (
                warnings.map((warning) => <p key={warning}>{warning}</p>)
              ) : (
                <p className="safe">لا توجد تحذيرات جوهرية لهذا المصدر.</p>
              )}
            </div>

            <div className="scan-log">
              <h3>سجل الفحص</h3>
              {selected.scanLog.length ? (
                selected.scanLog.map((item, index) => (
                  <div key={`${item}-${index}`} className="log-row">
                    <span>{index + 1}</span>
                    <p>{item}</p>
                  </div>
                ))
              ) : (
                <p className="empty">لا يوجد سجل فحص بعد.</p>
              )}
            </div>

            <div className="action-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => scan(selected.id)}
                disabled={selected.status === "disabled"}
              >
                <RefreshCw size={16} />
                إعادة الفحص
              </button>
              <button type="button" className="danger-soft" onClick={disableSource}>
                <Lock size={16} />
                تعطيل
              </button>
              <button type="button" className="danger-button" onClick={deleteSource}>
                <Trash2 size={16} />
                حذف محلي
              </button>
            </div>
          </aside>
        ) : (
          <aside className="panel detail-panel">
            <p className="empty">لا يوجد مصدر محدد.</p>
          </aside>
        )}
      </section>
    </main>
  );
}

function Status({ value }) {
  const meta = STATUS_META[value] || STATUS_META.empty;
  const Icon = meta.icon;

  return (
    <span className={`status ${meta.tone}`}>
      <Icon size={13} />
      {meta.label}
    </span>
  );
}

function Stat({ title, value, tone = "" }) {
  return (
    <article className={`stat-card ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.data-sources-page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}
.page-hero,.governance-strip,.stat-card,.panel,.tools-row{background:#fff;border:1px solid #e4e7df;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}
.page-hero{padding:22px;display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:14px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.page-hero h1{margin:0;font-size:34px;letter-spacing:-.04em}.page-hero p{color:#6f746b;line-height:1.8;max-width:760px;margin:10px 0 0}.hero-actions,.action-row,.toggle-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.primary-button,.secondary-button,.danger-button,.danger-soft{min-height:42px;border-radius:16px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:900;font-family:inherit;cursor:pointer}.primary-button{border:0;background:#176b2c;color:#fff}.primary-button:disabled,.secondary-button:disabled{opacity:.55;cursor:not-allowed}.secondary-button{border:1px solid #e4e7df;background:#fff;color:#1f241d}.danger-button{border:0;background:#991b1b;color:#fff}.danger-soft{border:1px solid #fecaca;background:#fff5f5;color:#991b1b}.governance-strip{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;color:#176b2c;margin-bottom:14px}.governance-strip strong{display:block;font-size:14px}.governance-strip span{display:block;margin-top:4px;color:#6f746b;line-height:1.7;font-size:13px}.stats-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin-bottom:14px}.stat-card{padding:16px}.stat-card span{color:#6f746b;font-size:12px;font-weight:900}.stat-card strong{display:block;margin-top:8px;font-size:28px}.stat-card.warn strong{color:#92400e}.stat-card.ok strong{color:#176b2c}.tools-row{padding:14px;display:flex;gap:14px;align-items:center;justify-content:space-between;margin-bottom:14px}.search-box{display:grid;gap:6px;min-width:320px}.search-box span,.field span{color:#6f746b;font-size:12px;font-weight:900}.search-box input,.field input,.field select,.field textarea{border:1px solid #e4e7df;border-radius:14px;padding:11px 12px;font-family:inherit;background:#fff;color:#1f241d;outline:none}.field textarea{resize:vertical}.filter-pills{display:flex;gap:8px;flex-wrap:wrap}.filter-pills button{border:1px solid #e4e7df;background:#fff;border-radius:999px;padding:8px 12px;font-weight:900;font-family:inherit;color:#6f746b}.filter-pills button.active{background:#176b2c;border-color:#176b2c;color:#fff}.main-layout{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:16px;align-items:start}.panel{padding:18px}.panel-header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.panel h2,.panel h3{margin:0}.panel-header p,.destination-box p{margin:6px 0 0;color:#6f746b;line-height:1.7;font-size:13px}.panel-header span{background:#eef7e9;color:#176b2c;border-radius:999px;padding:7px 10px;font-weight:900;font-size:12px}.source-list{display:grid;gap:10px}.source-list button{border:1px solid #e4e7df;background:#fff;border-radius:18px;padding:14px;text-align:right;display:flex;justify-content:space-between;gap:12px;font-family:inherit;cursor:pointer}.source-list button.selected{border-color:#176b2c;background:#eef7e9}.source-main strong{display:block}.source-main span{display:block;color:#6f746b;margin-top:4px;font-size:12px}.source-main small{display:block;color:#176b2c;margin-top:6px;font-weight:900}.source-meta{display:grid;justify-items:end;gap:8px}.source-meta b{font-size:13px;color:#176b2c}.status{border-radius:999px;padding:6px 10px;font-size:11px;font-weight:900;height:fit-content;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.green{background:#f0fdf4;color:#166534}.amber{background:#fffbeb;color:#92400e}.slate{background:#f8fafc;color:#475569}.red{background:#fef2f2;color:#991b1b}.detail-panel{position:sticky;top:18px}.source-icon{width:54px;height:54px;background:#176b2c;color:#fff;display:grid;place-items:center;border-radius:18px;margin-bottom:12px}.detail-title{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.detail-title p{color:#6f746b;margin:5px 0 0}.health-card{border:1px solid #e4e7df;border-radius:18px;padding:12px;margin-bottom:14px}.health-card div:first-child{display:flex;justify-content:space-between;color:#6f746b;font-weight:900;font-size:12px}.health-card strong{color:#176b2c;font-size:20px}.meter{height:8px;background:#eef0ea;border-radius:999px;overflow:hidden;margin-top:10px}.meter i{display:block;height:100%;background:#176b2c;border-radius:999px}.editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{display:grid;gap:6px;margin-bottom:10px}.field.wide{margin-top:4px}.toggle{min-height:38px;border:1px solid #e4e7df;border-radius:14px;background:#fff;padding:0 12px;display:inline-flex;align-items:center;gap:7px;font-family:inherit;font-weight:900;color:#6f746b}.toggle.active{background:#eef7e9;border-color:#176b2c;color:#176b2c}.toggle.active.danger{background:#fef2f2;border-color:#fecaca;color:#991b1b}.info-row{min-height:44px;border-bottom:1px solid #e4e7df;display:flex;justify-content:space-between;gap:12px;align-items:center}.info-row span{color:#6f746b;font-size:12px;font-weight:900}.info-row strong{text-align:left;font-size:13px;line-height:1.7}.destination-box,.warnings-box,.scan-log{border:1px solid #e4e7df;border-radius:18px;padding:13px;margin-top:14px}.destination-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.destination-grid button{border:1px solid #e4e7df;background:#fff;border-radius:14px;padding:10px;display:flex;align-items:center;gap:7px;font-weight:900;font-family:inherit;color:#6f746b}.destination-grid button.linked{border-color:#176b2c;background:#eef7e9;color:#176b2c}.warnings-box{background:#fffaf0;border-color:#fde68a}.warnings-box h3{display:flex;align-items:center;gap:7px;color:#92400e;margin-bottom:8px}.warnings-box p{margin:7px 0;color:#92400e;font-size:12px;line-height:1.8;font-weight:800}.warnings-box .safe{color:#166534}.log-row{display:flex;gap:10px;border-bottom:1px solid #eef0ea;padding:8px 0}.log-row:last-child{border-bottom:0}.log-row span{width:24px;height:24px;background:#eef7e9;color:#176b2c;border-radius:999px;display:grid;place-items:center;font-size:11px;font-weight:900;flex:0 0 auto}.log-row p{margin:0;color:#4d5549;line-height:1.7;font-size:12px;font-weight:700}.empty{color:#6f746b;line-height:1.8;font-weight:800}.action-row{margin-top:14px}@media(max-width:1180px){.stats-grid{grid-template-columns:repeat(3,1fr)}.main-layout{grid-template-columns:1fr}.detail-panel{position:static}}@media(max-width:760px){.page-hero,.tools-row{flex-direction:column;align-items:stretch}.stats-grid,.editor-grid,.destination-grid{grid-template-columns:1fr}.search-box{min-width:0}}
`;
