import { useEffect, useMemo, useState } from "react";
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
  XCircle,
} from "lucide-react";

import {
  readDataSources,
  upsertDataSource,
  deleteDataSource,
  runMockStoreScan,
} from "../utils/dataSourcesStore.js";

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
    owner: "فريق المتجر",
    visibility: "reviewer_only",
    reviewRequired: true,
    sensitive: false,
    destinations: ["storeSetup", "productCatalog", "assetLibrary"], // internal-only metadata
    fields: ["store_url", "product_candidates", "asset_candidates", "brand_insights"],
    warnings: ["تحتاج المنتجات المستخرجة إلى اعتماد قبل استخدامها في الحملات."],
    scanLog: [
      "تم فحص رابط المتجر.",
      "تم استخراج المنتجات والتصنيفات.",
      "تم تجهيز الأصول المرشحة للمراجعة.",
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
    owner: "فريق العلامة",
    visibility: "internal_only",
    reviewRequired: true,
    sensitive: false,
    destinations: ["storeSetup", "content"], // internal-only metadata
    fields: ["tone_signals", "visual_themes", "audience_hints"],
    warnings: ["تحليل الحسابات العامة مؤشر مساعد وليس مصدر قرار نهائي."],
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
    owner: "فريق المحتوى",
    visibility: "reviewer_only",
    reviewRequired: true,
    sensitive: false,
    destinations: ["content"], // internal-only metadata
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
    owner: "فريق التجارة",
    visibility: "admin_only",
    reviewRequired: true,
    sensitive: true,
    destinations: ["productCatalog", "storeSetup"], // internal-only metadata
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

const FILTERS = [
  ["all", "الكل"],
  ["scan_completed", "تم التحليل"],
  ["manual", "يدوي"],
  ["empty", "لم يبدأ"],
  ["connected", "مرتبط"],
  ["failed", "فشل"],
  ["disabled", "معطل"],
];

const SOCIAL_CONNECTORS = [
  {
    platform: "Instagram",
    status: "غير متصل",
    provider: "Official API",
    lastSync: "لم تتم مزامنة بعد",
    confidence: "غير متاح",
    risk: "متوسط",
    nextAction: "تحديد صلاحيات Meta ومراجعة سياسة الامتثال.",
  },
  {
    platform: "TikTok",
    status: "مهيأ فقط",
    provider: "Apify",
    lastSync: "موعد تجريبي لاحق",
    confidence: "تقديري لاحقًا",
    risk: "مرتفع",
    nextAction: "تصميم تشغيل Actor مع موافقة واضحة وشروط المنصة.",
  },
  {
    platform: "TikTok Shop",
    status: "يحتاج Backend",
    provider: "Official API",
    lastSync: "غير مفعّل",
    confidence: "غير متاح",
    risk: "متوسط",
    nextAction: "تعريف نطاق التجارة والصلاحيات قبل أي مزامنة.",
  },
  {
    platform: "Instagram Shop / Meta",
    status: "جاهز للمزامنة لاحقًا",
    provider: "Custom Connector",
    lastSync: "Placeholder",
    confidence: "0%",
    risk: "متوسط",
    nextAction: "ربط كتالوج Meta لاحقًا عبر خدمة آمنة.",
  },
];

const SOCIAL_PROVIDERS = [
  {
    name: "Official API",
    bestFor: "الحسابات التي تملك صلاحيات رسمية.",
    requiredBackend: "نعم",
    secretReference: "مرجع سر فقط",
    risk: "منخفض",
    notes: "الخيار المفضل عندما تكون الأذونات متاحة.",
  },
  {
    name: "Apify",
    bestFor: "Actor / Run / Dataset style connector.",
    requiredBackend: "نعم",
    secretReference: "مرجع سر فقط",
    risk: "متوسط",
    notes: "يحتاج ضبط حدود التشغيل وسياسة استخدام واضحة.",
  },
  {
    name: "PhantomBuster",
    bestFor: "social automation connector.",
    requiredBackend: "نعم",
    secretReference: "مرجع سر فقط",
    risk: "مرتفع",
    notes: "يجب احترام شروط المنصات ونطاق الموافقة.",
  },
  {
    name: "Firecrawl",
    bestFor: "website / page crawl.",
    requiredBackend: "نعم",
    secretReference: "مرجع سر فقط",
    risk: "متوسط",
    notes: "ليس الخيار الأساسي لبيانات اجتماعية مغلقة.",
  },
  {
    name: "Browserless",
    bestFor: "browser rendering / screenshot / content extraction.",
    requiredBackend: "نعم",
    secretReference: "مرجع سر فقط",
    risk: "مرتفع",
    notes: "يستخدم فقط مع ضوابط امتثال صارمة.",
  },
  {
    name: "Bright Data / Enterprise",
    bestFor: "enterprise data collection.",
    requiredBackend: "نعم",
    secretReference: "مرجع سر فقط",
    risk: "مرتفع",
    notes: "يتطلب حوكمة وموافقات مؤسسية عالية.",
  },
  {
    name: "Custom Connector",
    bestFor: "تنفيذ لاحق مخصص داخل خدمات المنصة.",
    requiredBackend: "نعم",
    secretReference: "مرجع سر فقط",
    risk: "حسب التصميم",
    notes: "يستخدم عند تثبيت العقود وقواعد الامتثال.",
  },
];

const CONNECTOR_CONFIG_PREVIEW = [
  ["المنصة", "Instagram / TikTok"],
  ["مزود السحب", "Official API أو مزود خارجي محدد"],
  ["مرجع السر", "اسم مرجع السر فقط، وليس قيمة المفتاح."],
  ["نوع العملية", "تحليل حساب / منتجات / محتوى"],
  ["Actor / Agent / Endpoint", "اسم تكوين تشغيلي فقط"],
  ["طريقة التشغيل", "يدوي لاحقًا / مجدول لاحقًا"],
  ["جدول المزامنة", "يومي / أسبوعي / عند الطلب"],
  ["مخرجات البيانات", "حساب، منتجات، محتوى، أسئلة، فرص"],
  ["Webhook للحالة", "اختياري لتحديث حالة التشغيل لاحقًا"],
  ["مستوى الامتثال", "مراجعة مطلوبة قبل التفعيل"],
];

const SOCIAL_OUTPUTS = [
  "قوة الحساب",
  "وضوح البايو والرابط",
  "المنتجات الأكثر ظهورًا",
  "أفضل أنواع المحتوى",
  "الأسئلة المتكررة",
  "الاعتراضات المتكررة",
  "فجوات الأصول",
  "فرص الحملات",
  "توصية القناة",
  "خطة محتوى 30 يوم",
  "مستوى الثقة",
  "حدود البيانات",
];

const SOCIAL_GOVERNANCE_WARNINGS = [
  "لا يتم تنفيذ أي سحب بيانات من الواجهة الحالية.",
  "التنفيذ الحقيقي يحتاج Backend آمن وتخزين أسرار ومراعاة شروط المنصات.",
  "استخدام مزودات خارجية لا يلغي الحاجة إلى موافقة وصلاحيات واضحة.",
  "التحليل لا يعتمد على scraping غير مصرح.",
];

const ACQUISITION_ALIGNMENT = [
  ["متجر إلكتروني مستقل", "Firecrawl / Browserless", "Website crawl / rendered page extraction"],
  ["منصة تجارة إلكترونية", "Official API / Firecrawl fallback", "كتالوج المنتجات والصفحات العامة"],
  ["Instagram-first", "Official API / Apify / PhantomBuster governed connector", "حساب اجتماعي ومحتوى مصرح"],
  ["TikTok-first", "TikTok API / Apify / PhantomBuster governed connector", "فيديوهات وتعليقات ومؤشرات مصرح بها"],
  ["TikTok Shop", "TikTok Shop API / governed connector", "منتجات المتجر والمحتوى التجاري"],
  ["Marketplace", "Official marketplace API / governed connector", "بيانات المتجر والمنتجات والتقييمات"],
  ["متعدد القنوات", "Connector orchestration", "website + social + marketplace signals"],
  ["بدون موقع واضح", "Social connector / store profile", "ملف متجر يدوي وإشارات اجتماعية مصرح بها"],
];

const CONNECTOR_PIPELINE = [
  "إعداد الموصل",
  "تشغيل الموصل",
  "استلام الحالة أو Webhook",
  "حفظ البيانات الخام",
  "تطبيع البيانات",
  "بناء حزمة أدلة للتحليل",
  "إرسال مهمة الذكاء الاصطناعي",
  "حفظ تقرير التحليل",
  "إعادة استخدام النتائج في إعداد المتجر والحملة والمحتوى",
];

const AI_PAYLOAD_PREVIEW = [
  "ملخص المتجر",
  "المنتجات",
  "الأصول",
  "القنوات",
  "السياسات",
  "الإشارات الاجتماعية",
  "حدود البيانات",
  "مستوى الثقة",
  "نوع المهمة",
  "مخطط الإخراج",
];

function buildGovernanceWarnings(source) {
  const warnings = [...(source.warnings || [])];

  if (source.status === "empty") {
    warnings.push("المصدر غير مفعّل ولا يمد التجربة ببيانات موثوقة.");
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

  if (!source.destinations?.length) {
    warnings.push("المصدر يحتاج تحديد استخدام تشغيلي داخلي قبل الاعتماد.");
  }

  return Array.from(new Set(warnings));
}

function getSourceHealth(source) {
  if (source.status === "disabled") return 0;

  let score = 40;

  if (source.status === "scan_completed" || source.status === "connected") score += 25;
  if (source.status === "manual") score += 5;
  if (source.sourceUrl || source.connectionMode === "official_integration") score += 10;
  if (source.destinations?.length) score += 10;
  if (source.reviewRequired) score += 5;
  if (source.confidence >= 75) score += 10;
  if (source.sensitive && source.visibility === "customer_visible") score -= 25;
  if (source.status === "empty") score -= 20;

  return Math.max(0, Math.min(100, score));
}

function getUsageLabel(source) {
  if (source.status === "disabled") return "معطل";
  if (source.status === "empty") return "غير جاهز";
  if (source.status === "manual") return "يحتاج فحص";
  if (source.reviewRequired) return "جاهز بعد المراجعة";
  if (source.confidence >= 80) return "جاهز للاستخدام";
  return "يحتاج مراجعة";
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
    owner: "فريق المراجعة",
    visibility: "reviewer_only",
    reviewRequired: true,
    sensitive: false,
    destinations: [], // internal-only metadata
    fields: ["manual_input"],
    warnings: ["مصدر جديد يحتاج مراجعة قبل استخدامه."],
    scanLog: ["تم إنشاء مصدر محلي جديد داخل البروتوتايب."],
  };
}

export default function DataSourcesHubPage() {
  const [sources, setSources] = useState(() => readDataSources(initialSources));
  const [selectedId, setSelectedId] = useState(() => readDataSources(initialSources)[0]?.id || initialSources[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const refreshSources = () => {
      const latest = readDataSources(initialSources);
      setSources(latest);
      setSelectedId((prev) => prev || latest[0]?.id || "");
    };

    window.addEventListener("focus", refreshSources);
    window.addEventListener("storage", refreshSources);
    window.addEventListener("nashir-data-sources-updated", refreshSources);
    window.addEventListener("nashir-store-scan-updated", refreshSources);

    return () => {
      window.removeEventListener("focus", refreshSources);
      window.removeEventListener("storage", refreshSources);
      window.removeEventListener("nashir-data-sources-updated", refreshSources);
      window.removeEventListener("nashir-store-scan-updated", refreshSources);
    };
  }, []);

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
    const updated = {
      ...selected,
      [key]: value,
      last: key === "status" ? "الآن" : selected.last,
    };
    const next = upsertDataSource(updated, initialSources);
    setSources(next);
  };

  const scan = (id) => {
    const target = sources.find((source) => source.id === id);
    if (!target) return;

    const pending = {
      ...target,
      status: "pending_scan",
      output: "جاري التحليل...",
      last: "الآن",
      scanLog: [`بدأ فحص المصدر: ${target.name}`, ...(target.scanLog || [])],
    };
    setSources(upsertDataSource(pending, initialSources));

    window.setTimeout(() => {
      if (target.id === "website") {
        const { sources: nextSources } = runMockStoreScan({
          storeUrl: target.sourceUrl || "https://store.example.com",
          seedSources: initialSources,
        });
        setSources(nextSources);
        return;
      }

      const completed = {
        ...pending,
        status: target.connectionMode === "official_integration" ? "connected" : "scan_completed",
        confidence: Math.max(target.confidence, target.connectionMode === "official_integration" ? 82 : 78),
        output:
          target.connectionMode === "official_integration"
            ? "تكامل تمثيلي متصل محليًا بدون API حقيقي"
            : "تم جمع بيانات جديدة وتحديث التوصيات",
        last: "الآن",
        scanLog: [
          "اكتمل الفحص المحلي.",
          "تم تحديث الثقة والمخرجات.",
          "تم وسم النتائج كمخرجات تحتاج مراجعة قبل الاستخدام.",
          ...(target.scanLog || []),
        ],
      };
      setSources(upsertDataSource(completed, initialSources));
    }, 800);
  };

  const addSource = () => {
    const nextSource = createNewSource();
    const next = upsertDataSource(nextSource, initialSources);
    setSources(next);
    setSelectedId(nextSource.id);
  };

  const disableSource = () => {
    const disabled = {
      ...selected,
      status: "disabled",
      output: "تم تعطيل المصدر محليًا",
      last: "الآن",
      scanLog: ["تم تعطيل المصدر.", ...(selected.scanLog || [])],
    };
    setSources(upsertDataSource(disabled, initialSources));
  };

  const deleteSource = () => {
    const remaining = deleteDataSource(selected.id, initialSources);
    setSources(remaining);
    setSelectedId(remaining[0]?.id || "");
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
            مخرجات، وتحذيرات حوكمة قبل أن يؤثر على الحملات.
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

      <section className="screen-guidance-card">
        <div><span>هدف الشاشة</span><strong>تصميم مصادر البيانات والموصلات التي ستغذي التحليل لاحقًا.</strong></div>
        <div><span>المدخلات</span><strong>نوع المصدر، مزود السحب، مرجع السر، طريقة التشغيل، خريطة المخرجات.</strong></div>
        <div><span>المخرجات</span><strong>خطة موصلات، ترتيب تشغيل، حزمة تحليل مهيأة.</strong></div>
        <div><span>الإجراء التالي</span><strong>تجهيز Backend والموصلات أو مراجعة خطة الجمع.</strong></div>
        <div><span>ما لا يحدث هنا</span><strong>لا يتم تشغيل API أو سحب بيانات فعليًا من الواجهة.</strong></div>
      </section>

      <section className="governance-strip">
        <ShieldCheck size={20} />
        <div>
          <strong>Prototype فقط — لا يوجد ربط API حقيقي</strong>
          <span>
            الفحص والربط هنا محليان لتثبيت تجربة المنتج. المستخدم يتعامل مع حالة
            المصدر ومخرجاته فقط، أما توزيع البيانات على الشاشات فيدار داخليًا.
          </span>
        </div>
      </section>

      <section className="social-intelligence-section">
        <div className="social-section-head">
          <div>
            <h2>تحليل المتاجر الاجتماعية</h2>
            <p>
              مصادر آلية لتحليل حسابات Instagram وTikTok عبر مزودات تكامل.
              التنفيذ الحقيقي يحتاج Backend وواجهات API وصلاحيات امتثال.
            </p>
          </div>
          <span>تصميم جاهز / تنفيذ غير مفعّل</span>
        </div>

        <div className="social-source-grid">
          {SOCIAL_CONNECTORS.map((connector) => (
            <div key={connector.platform} className="social-source-card">
              <div className="social-card-top">
                <strong>{connector.platform}</strong>
                <span>{connector.status}</span>
              </div>
              <Info label="مزود السحب" value={connector.provider} />
              <Info label="آخر مزامنة" value={connector.lastSync} />
              <Info label="الثقة" value={connector.confidence} />
              <Info label="مستوى مخاطر الامتثال" value={connector.risk} />
              <Info label="الإجراء التالي" value={connector.nextAction} />
            </div>
          ))}
        </div>

        <div className="social-subsection">
          <h3>مزود السحب الآلي</h3>
          <div className="provider-matrix">
            {SOCIAL_PROVIDERS.map((provider) => (
              <div key={provider.name} className="provider-card">
                <strong>{provider.name}</strong>
                <Info label="Best for" value={provider.bestFor} />
                <Info label="Required backend" value={provider.requiredBackend} />
                <Info label="Secret reference only" value={provider.secretReference} />
                <Info label="Risk level" value={provider.risk} />
                <p>{provider.notes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="social-two-column">
          <div className="social-subsection">
            <h3>إعداد موصل البيانات</h3>
            <div className="connector-config-grid">
              {CONNECTOR_CONFIG_PREVIEW.map(([label, value]) => (
                <Info key={label} label={label} value={value} />
              ))}
            </div>
          </div>

          <div className="social-subsection">
            <h3>مخرجات التحليل الاجتماعي المتوقعة</h3>
            <div className="output-chip-grid">
              {SOCIAL_OUTPUTS.map((output) => (
                <span key={output}>{output}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="social-two-column">
          <div className="social-subsection warning-subsection">
            <h3>تحذيرات الحوكمة</h3>
            {SOCIAL_GOVERNANCE_WARNINGS.map((warning) => (
              <p key={warning}><AlertTriangle size={15} /> {warning}</p>
            ))}
          </div>

          <div className="social-subsection readiness-subsection">
            <h3>جاهزية تحليل المتجر الاجتماعي</h3>
            <Info label="موصل رسمي أو مزود خارجي محدد" value="محدد على مستوى التصميم" />
            <Info label="مرجع سر موجود" value="اسم مرجع فقط، دون قيمة" />
            <Info label="سياسة امتثال محددة" value="مطلوبة قبل التفعيل" />
            <Info label="خريطة مخرجات محددة" value="محددة في واجهة التصميم" />
            <Info label="Backend مطلوب" value="نعم" />
            <Info label="حالة الجاهزية" value="تصميم جاهز / تنفيذ غير مفعّل" />
          </div>
        </div>
      </section>

      <section className="social-intelligence-section acquisition-alignment-section">
        <div className="social-section-head">
          <div>
            <h2>مواءمة مصادر البيانات مع نوع المتجر</h2>
            <p>
              يوضح هذا التصميم كيف يحدد نوع المتجر وقناة البيع الأساسية اختيار الموصل،
              ترتيب التشغيل، وحزمة التحليل التي ستجهز لاحقًا لمهام الذكاء الاصطناعي.
            </p>
          </div>
          <span>تخطيط فقط</span>
        </div>

        <div className="alignment-grid">
          {ACQUISITION_ALIGNMENT.map(([storeType, tool, collectionScope]) => (
            <div key={storeType} className="alignment-card">
              <strong>{storeType}</strong>
              <Info label="الأداة المناسبة" value={tool} />
              <Info label="نطاق الجمع" value={collectionScope} />
              <Info label="حالة التنفيذ" value="يحتاج Backend وموصل مصرح" />
            </div>
          ))}
        </div>

        <div className="social-two-column">
          <div className="social-subsection">
            <h3>ترتيب تشغيل موصل البيانات</h3>
            <div className="connector-pipeline">
              {CONNECTOR_PIPELINE.map((step, index) => (
                <div key={step} className="connector-pipeline-step">
                  <span>{index + 1}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="social-subsection">
            <h3>حزمة التحليل المرسلة للنموذج</h3>
            <div className="output-chip-grid">
              {AI_PAYLOAD_PREVIEW.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p className="alignment-note">
              هذه الصفحة تصمم موصلات البيانات فقط. التنفيذ الحقيقي يحتاج Backend وموصلات مصرح بها وتخزين أسرار آمن.
            </p>
          </div>
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
              <p>اختر مصدرًا لمراجعة حالته ومخرجاته.</p>
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
                  <small>{getUsageLabel(source)}</small>
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
                <span>جاهزية المصدر</span>
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
                <span>مسؤول المراجعة</span>
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
            <Info label="حالة الاستخدام" value={getUsageLabel(selected)} />

            <div className="usage-box">
              <h3>استخدام البيانات</h3>
              <p>
                يستخدم النظام هذه المخرجات داخليًا في التجربة حسب جاهزية المصدر
                وحالة المراجعة. لا يحتاج المستخدم إلى اختيار شاشة أو وجهة ربط.
              </p>
              <div className="usage-summary">
                <span>{selected.reviewRequired ? "يتطلب مراجعة" : "لا يتطلب مراجعة"}</span>
                <span>{selected.sensitive ? "بيانات حساسة" : "بيانات عادية"}</span>
                <span>{selected.confidence >= 80 ? "ثقة عالية" : "تحتاج تحقق"}</span>
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
.page-hero,.governance-strip,.social-intelligence-section,.stat-card,.panel,.tools-row{background:#fff;border:1px solid #e4e7df;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}
.page-hero{padding:22px;display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:14px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.page-hero h1{margin:0;font-size:34px;letter-spacing:-.04em}.page-hero p{color:#6f746b;line-height:1.8;max-width:760px;margin:10px 0 0}.hero-actions,.action-row,.toggle-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.primary-button,.secondary-button,.danger-button,.danger-soft{min-height:42px;border-radius:16px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:900;font-family:inherit;cursor:pointer}.primary-button{border:0;background:#176b2c;color:#fff}.primary-button:disabled,.secondary-button:disabled{opacity:.55;cursor:not-allowed}.secondary-button{border:1px solid #e4e7df;background:#fff;color:#1f241d}.danger-button{border:0;background:#991b1b;color:#fff}.danger-soft{border:1px solid #fecaca;background:#fff5f5;color:#991b1b}.governance-strip{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;color:#176b2c;margin-bottom:14px}.governance-strip strong{display:block;font-size:14px}.governance-strip span{display:block;margin-top:4px;color:#6f746b;line-height:1.7;font-size:13px}.social-intelligence-section{padding:18px;margin-bottom:14px}.social-section-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:14px}.social-section-head h2,.social-subsection h3{margin:0}.social-section-head p{margin:7px 0 0;color:#6f746b;line-height:1.8;font-size:13px;max-width:880px}.social-section-head>span{background:#eef7e9;color:#176b2c;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}.social-source-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.social-source-card,.provider-card,.social-subsection{border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:13px}.social-card-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px}.social-card-top strong,.provider-card strong{font-size:14px}.social-card-top span{background:#fff;border:1px solid #e4e7df;border-radius:999px;padding:5px 8px;color:#475569;font-size:11px;font-weight:900}.social-subsection{margin-top:14px}.provider-matrix{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}.provider-card p{margin:9px 0 0;color:#52604c;line-height:1.7;font-size:12px;font-weight:800}.social-two-column{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.connector-config-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.output-chip-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.output-chip-grid span{border:1px solid #d9ead7;background:#fff;color:#176b2c;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:900}.warning-subsection{background:#fffaf0;border-color:#fde68a}.warning-subsection p{display:flex;gap:7px;align-items:flex-start;margin:10px 0 0;color:#92400e;line-height:1.7;font-size:12px;font-weight:900}.readiness-subsection{background:#eef7e9;border-color:#d9ead7}.screen-guidance-card{background:#fff;border:1px solid #e4e7df;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035);padding:14px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:14px}.screen-guidance-card div{border:1px solid #e4e7df;background:#f7f8f4;border-radius:16px;padding:10px}.screen-guidance-card span{display:block;color:#6f746b;font-size:12px;font-weight:900}.screen-guidance-card strong{display:block;margin-top:5px;color:#1f241d;font-size:12px;line-height:1.6}.acquisition-alignment-section{background:#fff}.alignment-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.alignment-card{border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:13px;display:grid;gap:8px}.alignment-card>strong{font-size:14px}.connector-pipeline{display:grid;gap:8px;margin-top:12px}.connector-pipeline-step{display:flex;gap:10px;align-items:flex-start;border:1px solid #e4e7df;background:#fff;border-radius:14px;padding:10px}.connector-pipeline-step span{width:24px;height:24px;border-radius:999px;background:#176b2c;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:950;flex:0 0 auto}.connector-pipeline-step strong{font-size:12px;line-height:1.7}.alignment-note{margin:14px 0 0;color:#92400e;background:#fff7e6;border:1px solid #fde68a;border-radius:14px;padding:12px;line-height:1.7;font-size:12px;font-weight:900}.stats-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin-bottom:14px}.stat-card{padding:16px}.stat-card span{color:#6f746b;font-size:12px;font-weight:900}.stat-card strong{display:block;margin-top:8px;font-size:28px}.stat-card.warn strong{color:#92400e}.stat-card.ok strong{color:#176b2c}.tools-row{padding:14px;display:flex;gap:14px;align-items:center;justify-content:space-between;margin-bottom:14px}.search-box{display:grid;gap:6px;min-width:320px}.search-box span,.field span{color:#6f746b;font-size:12px;font-weight:900}.search-box input,.field input,.field select,.field textarea{border:1px solid #e4e7df;border-radius:14px;padding:11px 12px;font-family:inherit;background:#fff;color:#1f241d;outline:none}.field textarea{resize:vertical}.filter-pills{display:flex;gap:8px;flex-wrap:wrap}.filter-pills button{border:1px solid #e4e7df;background:#fff;border-radius:999px;padding:8px 12px;font-weight:900;font-family:inherit;color:#6f746b}.filter-pills button.active{background:#176b2c;border-color:#176b2c;color:#fff}.main-layout{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:16px;align-items:start}.panel{padding:18px}.panel-header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.panel h2,.panel h3{margin:0}.panel-header p,.usage-box p{margin:6px 0 0;color:#6f746b;line-height:1.7;font-size:13px}.panel-header span{background:#eef7e9;color:#176b2c;border-radius:999px;padding:7px 10px;font-weight:900;font-size:12px}.source-list{display:grid;gap:10px}.source-list button{border:1px solid #e4e7df;background:#fff;border-radius:18px;padding:14px;text-align:right;display:flex;justify-content:space-between;gap:12px;font-family:inherit;cursor:pointer}.source-list button.selected{border-color:#176b2c;background:#eef7e9}.source-main strong{display:block}.source-main span{display:block;color:#6f746b;margin-top:4px;font-size:12px}.source-main small{display:block;color:#176b2c;margin-top:6px;font-weight:900}.source-meta{display:grid;justify-items:end;gap:8px}.source-meta b{font-size:13px;color:#176b2c}.status{border-radius:999px;padding:6px 10px;font-size:11px;font-weight:900;height:fit-content;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.green{background:#f0fdf4;color:#166534}.amber{background:#fffbeb;color:#92400e}.slate{background:#f8fafc;color:#475569}.red{background:#fef2f2;color:#991b1b}.detail-panel{position:sticky;top:18px}.source-icon{width:54px;height:54px;background:#176b2c;color:#fff;display:grid;place-items:center;border-radius:18px;margin-bottom:12px}.detail-title{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.detail-title p{color:#6f746b;margin:5px 0 0}.health-card{border:1px solid #e4e7df;border-radius:18px;padding:12px;margin-bottom:14px}.health-card div:first-child{display:flex;justify-content:space-between;color:#6f746b;font-weight:900;font-size:12px}.health-card strong{color:#176b2c;font-size:20px}.meter{height:8px;background:#eef0ea;border-radius:999px;overflow:hidden;margin-top:10px}.meter i{display:block;height:100%;background:#176b2c;border-radius:999px}.editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{display:grid;gap:6px;margin-bottom:10px}.field.wide{margin-top:4px}.toggle{min-height:38px;border:1px solid #e4e7df;border-radius:14px;background:#fff;padding:0 12px;display:inline-flex;align-items:center;gap:7px;font-family:inherit;font-weight:900;color:#6f746b}.toggle.active{background:#eef7e9;border-color:#176b2c;color:#176b2c}.toggle.active.danger{background:#fef2f2;border-color:#fecaca;color:#991b1b}.info-row{min-height:44px;border-bottom:1px solid #e4e7df;display:flex;justify-content:space-between;gap:12px;align-items:center}.info-row span{color:#6f746b;font-size:12px;font-weight:900}.info-row strong{text-align:left;font-size:13px;line-height:1.7}.usage-box,.warnings-box,.scan-log{border:1px solid #e4e7df;border-radius:18px;padding:13px;margin-top:14px}.usage-summary{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.usage-summary span{border:1px solid #d9ead7;background:#eef7e9;color:#176b2c;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900}.warnings-box{background:#fffaf0;border-color:#fde68a}.warnings-box h3{display:flex;align-items:center;gap:7px;color:#92400e;margin-bottom:8px}.warnings-box p{margin:7px 0;color:#92400e;font-size:12px;line-height:1.8;font-weight:800}.warnings-box .safe{color:#166534}.log-row{display:flex;gap:10px;border-bottom:1px solid #eef0ea;padding:8px 0}.log-row:last-child{border-bottom:0}.log-row span{width:24px;height:24px;background:#eef7e9;color:#176b2c;border-radius:999px;display:grid;place-items:center;font-size:11px;font-weight:900;flex:0 0 auto}.log-row p{margin:0;color:#4d5549;line-height:1.7;font-size:12px;font-weight:700}.empty{color:#6f746b;line-height:1.8;font-weight:800}.action-row{margin-top:14px}@media(max-width:1180px){.social-source-grid,.provider-matrix,.alignment-grid{grid-template-columns:repeat(2,1fr)}.screen-guidance-card{grid-template-columns:1fr}.social-two-column,.stats-grid{grid-template-columns:repeat(3,1fr)}.main-layout{grid-template-columns:1fr}.detail-panel{position:static}}@media(max-width:760px){.page-hero,.tools-row,.social-section-head{flex-direction:column;align-items:stretch}.social-source-grid,.provider-matrix,.social-two-column,.connector-config-grid,.stats-grid,.editor-grid,.alignment-grid{grid-template-columns:1fr}.search-box{min-width:0}}
`;
