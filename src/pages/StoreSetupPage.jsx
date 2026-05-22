import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  Globe2,
  Link2,
  Package,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Upload,
  Users,
  Wand2,
} from "lucide-react";

import {
  readProductCatalog,
  upsertProduct,
  deleteProduct as deleteCatalogProduct,
} from "../utils/productCatalogStore.js";

import {
  readStoreScanSnapshot,
  markStoreScanPending,
  runMockStoreScan,
  writeStoreScanSnapshot,
} from "../utils/dataSourcesStore.js";

const steps = [
  [1, "بيانات المتجر", "البيانات الأساسية والهوية التشغيلية."],
  [2, "المنتجات", "جدول المنتجات والخدمات المستخدمة في الحملات."],
  [3, "الجمهور", "الجمهور الافتراضي الذي ترثه الحملات."],
  [4, "القنوات", "ربط OAuth مختصر يقرأ من نفس مصدر الإعدادات."],
  [5, "السياسات", "القيود والموافقات قبل التوليد."],
  [6, "الجاهزية", "ملخص النواقص وقرار الانتقال للحملة."],
];

const channelOptions = [
  "Instagram",
  "TikTok",
  "Snapchat",
  "WhatsApp Business",
  "Email",
  "YouTube",
  "Google Ads",
  "Meta Ads",
  "Salla",
];

const productFlagOptions = [
  "موسمي",
  "مخزون كبير",
  "جديد",
  "الأكثر مبيعًا",
  "مناسب للهدايا",
  "يحتاج شرحًا",
  "يصلح للفيديو",
];

const policyItems = [
  "هل توجد عبارات ممنوعة؟",
  "هل توجد ادعاءات لا يجوز استخدامها؟",
  "هل توجد منتجات مقيدة؟",
  "سياسة الخصومات",
  "سياسة استخدام صور العملاء",
  "سياسة الرد على التعليقات",
  "من يعتمد الحملات قبل النشر؟",
  "هل يسمح باستخدام وجوه أشخاص؟",
  "هل توجد حساسية ثقافية أو تنظيمية؟",
];

const defaultForm = {
  storeName: "متجر النخبة",
  storeUrl: "https://store.example",
  activity: "متجر إلكتروني",
  category: "عناية وجمال",
  marketLocation: "الرياض، السعودية",
  tone: ["ودية", "موثوقة", "هادئة"],
  useWords: "طبيعي، موثوق، تجربة، جودة",
  avoidWords: "علاج، مضمون، الأفضل مطلقًا",
  age: "25–34",
  gender: "نساء",
  audienceLocation: "الرياض، السعودية",
  motives: ["جودة", "تجربة", "هدية"],
  preferredChannels: ["Instagram", "WhatsApp Business", "Email"],
  policyAnswers: {},
};

const defaultProducts = [
  {
    id: 1,
    name: "سيروم عناية طبيعي",
    url: "https://store.example/products/serum",
    price: "149 ر.س",
    margin: "",
    description: "منتج عناية يومي مناسب لجمهور يبحث عن بساطة وثقة وتجربة طبيعية.",
    flags: ["جديد", "مناسب للهدايا", "يصلح للفيديو"],
    source: "manual",
  },
];

const statusLabels = {
  manual: ["إدخال يدوي", "slate"],
  pending_scan: ["قيد الفحص", "amber"],
  scan_completed: ["تم التحليل", "green"],
  approved: ["معتمد", "green"],
};

const channelConnectionLabels = {
  disconnected: ["غير مرتبط", "slate"],
  pending_oauth: ["بانتظار موافقة OAuth", "amber"],
  connected: ["مرتبط", "green"],
  failed: ["فشل الربط", "red"],
};

const integrationConnectionsKey = "nashir_mock_integration_connections";

const oauthProviderMeta = {
  Instagram: {
    id: "instagram",
    authUrl: "https://www.instagram.com/accounts/login/",
    scopes: ["profile", "content_read", "insights_later"],
  },
  TikTok: {
    id: "tiktok",
    authUrl: "https://www.tiktok.com/login",
    scopes: ["profile", "video_read", "content_planning"],
  },
  Snapchat: {
    id: "snapchat",
    authUrl: "https://accounts.snapchat.com/",
    scopes: ["profile", "ads_later"],
  },
  "WhatsApp Business": {
    id: "whatsapp",
    authUrl: "https://business.facebook.com/",
    scopes: ["business_profile", "message_templates_later"],
  },
  Email: {
    id: "email",
    authUrl: "https://accounts.google.com/",
    scopes: ["drafts_later", "sender_profile"],
  },
  YouTube: {
    id: "youtube",
    authUrl: "https://accounts.google.com/",
    scopes: ["channel_profile", "video_planning"],
  },
  "Google Ads": {
    id: "google_ads",
    authUrl: "https://accounts.google.com/",
    scopes: ["ads_profile_later", "reporting_later"],
  },
  "Meta Ads": {
    id: "meta_ads",
    authUrl: "https://business.facebook.com/",
    scopes: ["ads_profile_later", "reporting_later"],
  },
  Salla: {
    id: "salla",
    authUrl: "https://s.salla.sa/",
    scopes: ["store_profile", "products_read_later"],
  },
};

function normalizeProviderKey(channel) {
  return (oauthProviderMeta[channel]?.id || String(channel))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");
}

function readSharedIntegrationConnections() {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(integrationConnectionsKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed?.connections && typeof parsed.connections === "object"
      ? parsed.connections
      : {};
  } catch {
    return {};
  }
}

function writeSharedIntegrationConnections(nextConnections, preferredChannels = []) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      integrationConnectionsKey,
      JSON.stringify({
        version: 1,
        source: "nashir_ui_prototype_shared_oauth_mock",
        updatedAt: new Date().toISOString(),
        preferredChannels,
        connections: nextConnections,
      })
    );

    window.dispatchEvent(new Event("nashir-integration-connections-updated"));
  } catch {
    // Prototype-only: ignore storage errors.
  }
}

function snapshotToStoreSource(snapshot) {
  if (!snapshot) {
    return {
      status: "manual",
      confidence: 35,
      message: "رابط المتجر مُدخل يدويًا ولم يتم فحصه بعد.",
    };
  }

  return {
    status: snapshot.status || "manual",
    confidence: snapshot.confidence || 35,
    message: snapshot.message || "رابط المتجر مُدخل يدويًا ولم يتم فحصه بعد.",
  };
}

function snapshotToCollectedData(snapshot) {
  if (!snapshot) {
    return {
      detectedPlatform: "",
      detectedCategories: [],
      detectedProducts: [],
      brandKeywords: [],
      detectedTone: [],
      suggestedChannels: [],
      assetsNeedingReview: [],
    };
  }

  return {
    detectedPlatform: snapshot.detectedPlatform || "",
    detectedCategories: snapshot.detectedCategories || [],
    detectedProducts: snapshot.detectedProducts || [],
    brandKeywords: snapshot.brandKeywords || [],
    detectedTone: snapshot.detectedTone || [],
    suggestedChannels: snapshot.suggestedChannels || [],
    assetsNeedingReview: snapshot.assetsNeedingReview || [],
  };
}

export default function StoreSetupPage({ onCreateCampaign = () => {} }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [products, setProducts] = useState(() => readProductCatalog(defaultProducts));
  const [saved, setSaved] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productDraft, setProductDraft] = useState({
    name: "",
    url: "",
    price: "",
    margin: "",
    description: "",
    flags: [],
    source: "manual",
  });
  const [storeSource, setStoreSource] = useState(() =>
    snapshotToStoreSource(readStoreScanSnapshot())
  );
  const [channelConnections, setChannelConnections] = useState(() => readSharedIntegrationConnections());
  const [collectedData, setCollectedData] = useState(() =>
    snapshotToCollectedData(readStoreScanSnapshot())
  );
  const [recommendations, setRecommendations] = useState([
    "ابدأ بفحص المتجر لتحويل الرابط إلى منتجات وتصنيف ونبرة مبدئية.",
    "راجع المنتجات المسحوبة قبل استخدامها في أي حملة.",
    "أي أصل مكتشف من المتجر يحتاج تأكيد حقوق قبل النشر.",
  ]);

  useEffect(() => {
    const refreshProducts = () => {
      setProducts(readProductCatalog(defaultProducts));
    };

    window.addEventListener("focus", refreshProducts);
    window.addEventListener("storage", refreshProducts);
    window.addEventListener("nashir-product-catalog-updated", refreshProducts);

    return () => {
      window.removeEventListener("focus", refreshProducts);
      window.removeEventListener("storage", refreshProducts);
      window.removeEventListener("nashir-product-catalog-updated", refreshProducts);
    };
  }, []);

  useEffect(() => {
    const refreshStoreScan = () => {
      const snapshot = readStoreScanSnapshot();
      setStoreSource(snapshotToStoreSource(snapshot));
      setCollectedData(snapshotToCollectedData(snapshot));
    };

    window.addEventListener("focus", refreshStoreScan);
    window.addEventListener("storage", refreshStoreScan);
    window.addEventListener("nashir-store-scan-updated", refreshStoreScan);
    window.addEventListener("nashir-data-sources-updated", refreshStoreScan);

    return () => {
      window.removeEventListener("focus", refreshStoreScan);
      window.removeEventListener("storage", refreshStoreScan);
      window.removeEventListener("nashir-store-scan-updated", refreshStoreScan);
      window.removeEventListener("nashir-data-sources-updated", refreshStoreScan);
    };
  }, []);

  const completion = useMemo(() => {
    const checks = [
      form.storeName,
      form.storeUrl,
      form.activity,
      form.category,
      form.marketLocation,
      form.tone.length,
      form.useWords,
      form.avoidWords,
      products.some((product) => product.name.trim()),
      products.some((product) => product.flags.length),
      form.age,
      form.gender,
      form.audienceLocation,
      form.motives.length,
      form.preferredChannels.length,
      Object.keys(form.policyAnswers).length >= 4,
      storeSource.status === "scan_completed" || storeSource.status === "approved",
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, products, storeSource.status]);

  const readinessIssues = useMemo(() => {
    const issues = [];
    if (!form.storeName.trim()) issues.push("اسم المتجر غير مكتمل.");
    if (!form.storeUrl.trim()) issues.push("رابط المتجر غير مدخل.");
    if (storeSource.status !== "scan_completed" && storeSource.status !== "approved") {
      issues.push("رابط المتجر لم يتم فحصه أو اعتماد نتائجه بعد.");
    }
    if (!products.some((product) => product.name.trim())) issues.push("لا يوجد منتج صالح للاستخدام.");
    if (!form.tone.length) issues.push("نبرة العلامة غير محددة.");
    if (!form.preferredChannels.length) issues.push("لم يتم تحديد قنوات مفضلة.");
    if (Object.keys(form.policyAnswers).length < 4) issues.push("السياسات والقيود غير مكتملة.");
    return issues;
  }, [form, products, storeSource.status]);

  const connectedChannelsCount = form.preferredChannels.filter((channel) => {
    const key = normalizeProviderKey(channel);
    const status = channelConnections[key]?.status || "disconnected";
    return status === "connected" || status === "pending_oauth";
  }).length;

  const setChannelOAuthState = (channel, status, extra = {}) => {
    const key = normalizeProviderKey(channel);
    const provider = oauthProviderMeta[channel] || {
      id: key,
      authUrl: "about:blank",
      scopes: ["profile_later"],
    };

    setChannelConnections((prev) => {
      const next = {
        ...prev,
        [key]: {
          providerId: provider.id,
          providerName: channel,
          status,
          authorizationUrl: provider.authUrl,
          requestedScopes: provider.scopes,
          accountName: extra.accountName || prev[key]?.accountName || "",
          updatedAt: new Date().toISOString(),
          sourceSurface: "StoreSetupPage",
          ...extra,
        },
      };

      writeSharedIntegrationConnections(next, form.preferredChannels);
      return next;
    });

    setSaved(false);
  };

  const startOAuthConnection = (channel) => {
    const provider = oauthProviderMeta[channel];
    setChannelOAuthState(channel, "pending_oauth", {
      lastAction: "oauth_started",
    });

    if (provider?.authUrl && provider.authUrl !== "about:blank") {
      window.open(provider.authUrl, "_blank", "noopener,noreferrer");
    }
  };

  const mockOAuthSuccess = (channel) => {
    const key = normalizeProviderKey(channel);
    const safeName = String(channel).replace(/\s+Business/i, "");
    setChannelOAuthState(channel, "connected", {
      lastAction: "oauth_callback_mocked",
      accountName: channelConnections[key]?.accountName || `@${safeName.toLowerCase().replace(/\s+/g, "_")}_account`,
    });
  };

  const disconnectOAuth = (channel) => {
    setChannelOAuthState(channel, "disconnected", {
      lastAction: "oauth_disconnected",
      accountName: "",
    });
  };

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updatePolicy = (title, value) => {
    setForm((prev) => ({
      ...prev,
      policyAnswers: {
        ...prev.policyAnswers,
        [title]: value,
      },
    }));
    setSaved(false);
  };

  const updateProductDraft = (key, value) => {
    setProductDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const resetProductDraft = () => {
    setEditingProductId(null);
    setProductDraft({
      name: "",
      url: "",
      price: "",
      margin: "",
      description: "",
      flags: [],
      source: "manual",
    });
  };

  const toggleDraftFlag = (flag) => {
    setProductDraft((prev) => {
      const exists = prev.flags.includes(flag);
      return {
        ...prev,
        flags: exists ? prev.flags.filter((item) => item !== flag) : [...prev.flags, flag],
      };
    });
    setSaved(false);
  };

  const saveProductDraft = () => {
    const cleanName = productDraft.name.trim();
    if (!cleanName) {
      setRecommendations((prev) => [
        "أدخل اسم المنتج قبل إضافته إلى جدول المنتجات.",
        ...prev.filter((item) => item !== "أدخل اسم المنتج قبل إضافته إلى جدول المنتجات."),
      ]);
      return;
    }

    const next = upsertProduct(
      {
        ...productDraft,
        id: editingProductId || productDraft.id || Date.now(),
        source: productDraft.source || "store_setup",
        sourceSurface: "StoreSetupPage",
      },
      defaultProducts
    );

    setProducts(next);
    resetProductDraft();
    setSaved(false);
  };

  const startEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductDraft({
      name: product.name || "",
      url: product.url || "",
      price: product.price || "",
      margin: product.margin || "",
      description: product.description || "",
      flags: product.flags || [],
      source: product.source || "manual",
    });
  };

  const removeProduct = (id) => {
    const next = deleteCatalogProduct(id, defaultProducts);
    setProducts(next);
    if (editingProductId === id) resetProductDraft();
    setSaved(false);
  };

  const addDetectedProduct = (name, index = 0) => {
    const current = readProductCatalog(defaultProducts);
    const exists = current.some((product) => product.name === name);
    if (exists) return;

    const next = upsertProduct(
      {
        id: Date.now() + index,
        name,
        url: `${form.storeUrl.replace(/\/$/, "")}/products/${encodeURIComponent(name)}`,
        price: "",
        margin: "",
        description: "منتج مسحوب من رابط المتجر ويحتاج مراجعة التفاصيل قبل استخدامه في الحملات.",
        flags: ["مناسب للهدايا", "يصلح للفيديو"],
        source: "store_scan",
        sourceSurface: "StoreSetupPage",
      },
      defaultProducts
    );

    setProducts(next);
  };

  const scanStore = () => {
    if (!form.storeUrl.trim()) {
      setRecommendations((prev) => [
        "أدخل رابط المتجر أولًا حتى يمكن فحصه.",
        ...prev.filter((item) => item !== "أدخل رابط المتجر أولًا حتى يمكن فحصه."),
      ]);
      return;
    }

    const pending = markStoreScanPending({ storeUrl: form.storeUrl });
    setStoreSource(snapshotToStoreSource(pending.snapshot));
    setCollectedData(snapshotToCollectedData(pending.snapshot));

    window.setTimeout(() => {
      const { snapshot } = runMockStoreScan({ storeUrl: form.storeUrl });
      const result = snapshotToCollectedData(snapshot);

      setCollectedData(result);
      setStoreSource(snapshotToStoreSource(snapshot));

      setForm((prev) => ({
        ...prev,
        category: prev.category || result.detectedCategories[0],
        tone: prev.tone.length ? prev.tone : result.detectedTone,
        useWords: prev.useWords || result.brandKeywords.join("، "),
        preferredChannels: Array.from(new Set([...prev.preferredChannels, ...result.suggestedChannels])),
      }));

      const currentProducts = readProductCatalog(defaultProducts);
      const existingNames = new Set(currentProducts.map((product) => product.name).filter(Boolean));
      let nextProducts = currentProducts;

      result.detectedProducts
        .filter((name) => !existingNames.has(name))
        .forEach((name, index) => {
          nextProducts = upsertProduct(
            {
              id: Date.now() + index,
              name,
              url: `${form.storeUrl.replace(/\/$/, "")}/products/${encodeURIComponent(name)}`,
              price: "",
              margin: "",
              description: "منتج مكتشف من رابط المتجر ويحتاج مراجعة التفاصيل قبل استخدامه في حملة.",
              flags: ["مناسب للهدايا", "يصلح للفيديو"],
              source: "store_scan",
              sourceSurface: "StoreSetupPage",
            },
            defaultProducts
          );
        });

      setProducts(nextProducts);

      setRecommendations([
        "تم عكس نتائج فحص المتجر على نفس مصدر بيانات DataSourcesHub.",
        "تمت إضافة المنتجات المكتشفة إلى كتالوج المنتجات المشترك.",
        "أصول المتجر المكتشفة يجب مراجعة حقوقها في مكتبة الأصول.",
        "ابدأ بقناتين فقط في أول حملة قبل التوسع.",
      ]);
    }, 700);
  };

  const approveStoreScan = () => {
    const currentSnapshot = readStoreScanSnapshot();
    if (currentSnapshot?.status === "scan_completed") {
      const approvedSnapshot = writeStoreScanSnapshot({
        ...currentSnapshot,
        status: "approved",
        message: "تم اعتماد بيانات فحص المتجر كمصدر مساعد للحملات.",
      });
      setStoreSource(snapshotToStoreSource(approvedSnapshot));
      setCollectedData(snapshotToCollectedData(approvedSnapshot));
    }

    setRecommendations((prev) => [
      "تم اعتماد بيانات فحص المتجر كمصدر مساعد للحملات القادمة.",
      ...prev,
    ]);
  };

  const saveDraft = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const next = () => {
    if (step < steps.length) setStep((current) => current + 1);
  };

  const back = () => {
    if (step > 1) setStep((current) => current - 1);
  };

  return (
    <main className="store-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow">
            <Store size={15} />
            Store Setup
          </div>
          <h1>إعداد المتجر</h1>
          <p>
            إعداد مختصر ومباشر لبيانات المتجر والمنتجات والجمهور والقنوات
            والسياسات قبل إنشاء الحملات. كل البيانات هنا Mock داخل الواجهة.
          </p>
        </div>
        <Badge tone="blue">Prototype</Badge>
      </section>

      <section className="guardrail">
        <ShieldCheck size={19} />
        <div>
          <strong>Scope Guardrail</strong>
          <span>
            لا يوجد Backend أو API حقيقي. زر فحص المتجر هنا اختصار فقط؛ نتيجة الفحص
            تُحفظ في نفس مصدر بيانات DataSourcesHub، وليست حالة مستقلة داخل إعداد المتجر.
          </span>
        </div>
      </section>

      <section className="overview-grid">
        <Card className="score-card">
          <div className="score-ring">{completion}%</div>
          <div>
            <h3>اكتمال إعداد المتجر</h3>
            <p>كل عنصر مكتمل يقلل التخمين داخل معالج الحملة.</p>
          </div>
        </Card>

        <Card className="source-card">
          <div>
            <h3>مصدر المتجر</h3>
            <p>{storeSource.message}</p>
          </div>
          <SourceStatus status={storeSource.status} confidence={storeSource.confidence} />
        </Card>

        <Card className="quick-card">
          <Package size={22} />
          <div>
            <strong>{products.length}</strong>
            <span>منتجات/خدمات في الجدول</span>
          </div>
        </Card>
      </section>

      <section className="steps-panel">
        <StepTabs steps={steps} step={step} setStep={setStep} />
      </section>

      <section className="layout">
        <div className="main-panel">
          {step === 1 && (
            <Card>
              <SectionHeader
                icon={Store}
                title="الخطوة 1: بيانات المتجر والهوية التشغيلية"
                description="تم دمج ما يلزم من هوية العلامة داخل بيانات المتجر بدل إبقاء خطوة مستقلة."
              />

              <div className="form-grid">
                <Field label="اسم المتجر" value={form.storeName} onChange={(value) => update("storeName", value)} />
                <Field label="رابط المتجر" value={form.storeUrl} onChange={(value) => update("storeUrl", value)} />
                <ChoiceGroup
                  title="نوع النشاط"
                  options={["متجر إلكتروني", "خدمة", "مطعم/كافيه", "تعليم", "أزياء", "تجميل", "عطور", "هدايا"]}
                  selected={form.activity}
                  setSelected={(value) => update("activity", value)}
                />
                <ChoiceGroup
                  title="تصنيف النشاط الرئيسي"
                  options={["عناية وجمال", "أزياء", "عطور", "أغذية", "إلكترونيات", "خدمات", "تعليم", "هدايا"]}
                  selected={form.category}
                  setSelected={(value) => update("category", value)}
                />
                <Field label="السوق / الموقع الجغرافي" value={form.marketLocation} onChange={(value) => update("marketLocation", value)} />
              </div>

              <MultiChoice
                title="نبرة العلامة"
                options={["رسمية", "ودية", "فاخرة", "شبابية", "جريئة", "هادئة", "تعليمية", "محلية", "عالمية", "موثوقة"]}
                selected={form.tone}
                setSelected={(value) => update("tone", value)}
              />

              <div className="form-grid">
                <TextArea label="كلمات يجب استخدامها" value={form.useWords} onChange={(value) => update("useWords", value)} />
                <TextArea label="كلمات يجب تجنبها" value={form.avoidWords} onChange={(value) => update("avoidWords", value)} />
              </div>

              <div className="scan-card">
                <div className="scan-head">
                  <div>
                    <h3>فحص المتجر</h3>
                    <p>محاكاة فحص الرابط لاستخراج منتجات وتصنيف ونبرة وقنوات مقترحة.</p>
                  </div>
                  <SourceStatus status={storeSource.status} confidence={storeSource.confidence} />
                </div>
                <div className="scan-actions">
                  <Button onClick={scanStore}><RefreshCw size={16} /> فحص المتجر</Button>
                  <Button variant="secondary" onClick={approveStoreScan}><CheckCircle2 size={16} /> اعتماد نتيجة الفحص</Button>
                </div>
                {collectedData.detectedProducts.length ? (
                  <div className="scan-summary">
                    <Info label="المنصة المكتشفة" value={collectedData.detectedPlatform} />
                    <Info label="تصنيف مكتشف" value={collectedData.detectedCategories.join("، ")} />
                    <Info label="منتجات مقترحة" value={collectedData.detectedProducts.join("، ")} />
                    <Info label="قنوات مقترحة" value={collectedData.suggestedChannels.join("، ")} />
                  </div>
                ) : null}
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <div className="products-head">
                <SectionHeader icon={Package} title="الخطوة 2: المنتجات والخدمات" description="كل منتج يدخل هنا يصبح مرجعًا لمعالج الحملات." />
                <Button onClick={() => {
                  const fallback = collectedData.detectedProducts.length ? collectedData.detectedProducts : ["باقة هدايا طبيعية", "كريم مرطب نيفيا", "عطر مناسبات"];
                  fallback.forEach((name, index) => addDetectedProduct(name, index));
                }}><Plus size={16} /> سحب منتجات مقترحة</Button>
              </div>
              <Notice>هامش الربح اختياري وحساس ولا يجب جعله إلزاميًا في V1. المنتجات المسحوبة من المتجر تحتاج مراجعة قبل استخدامها في الحملات.</Notice>
              <div className="product-manager-grid">
                <div className="product-form-card">
                  <div className="product-form-head">
                    <div><h3>{editingProductId ? "تعديل منتج" : "إضافة منتج جديد"}</h3><p>أدخل بيانات المنتج ثم احفظه ليظهر في جدول المنتجات.</p></div>
                    <Badge tone={editingProductId ? "blue" : "green"}>{editingProductId ? "تعديل" : "جديد"}</Badge>
                  </div>
                  <div className="form-grid">
                    <Field label="اسم المنتج" value={productDraft.name} placeholder="مثال: سيروم عناية طبيعي" onChange={(value) => updateProductDraft("name", value)} />
                    <Field label="رابط المنتج" value={productDraft.url} placeholder="https://store.example/products/..." onChange={(value) => updateProductDraft("url", value)} />
                    <Field label="السعر" value={productDraft.price} placeholder="149 ر.س" onChange={(value) => updateProductDraft("price", value)} />
                    <Field label="هامش الربح التقريبي - اختياري" value={productDraft.margin} placeholder="اختياري" onChange={(value) => updateProductDraft("margin", value)} />
                    <TextArea label="وصف المنتج ومميزاته" value={productDraft.description} placeholder="اكتب وصف المنتج، فوائده، ولماذا يشتريه العميل..." onChange={(value) => updateProductDraft("description", value)} />
                    <UploadBox title="صور المنتج" />
                  </div>
                  <div className="product-flags-section"><h4>خصائص المنتج</h4><div className="choice-list">{productFlagOptions.map((flag) => (<button key={flag} type="button" onClick={() => toggleDraftFlag(flag)} className={`choice ${productDraft.flags.includes(flag) ? "selected" : ""}`}>{flag}</button>))}</div></div>
                  <div className="product-form-actions"><Button onClick={saveProductDraft}>{editingProductId ? "حفظ التعديل" : "إضافة إلى الجدول"}</Button><Button variant="secondary" onClick={resetProductDraft}>تفريغ النموذج</Button></div>
                </div>
                <div className="product-table-card">
                  <div className="product-table-headline"><div><h3>جدول المنتجات</h3><p>كل المنتجات اليدوية أو المقترحة تظهر هنا وفي كتالوج المنتجات من نفس المصدر.</p></div><Badge tone="neutral">{products.length} منتج</Badge></div>
                  <div className="product-table">
                    <div className="product-table-header"><span>المنتج</span><span>السعر</span><span>المصدر</span><span>الخصائص</span><span>إجراء</span></div>
                    {products.map((product, index) => (
                      <div key={product.id} className="product-table-row">
                        <div><strong>{product.name || `منتج بدون اسم ${index + 1}`}</strong><small>{product.url || "لا يوجد رابط"}</small></div>
                        <span>{product.price || "—"}</span>
                        <Badge tone={product.source === "store_scan" ? "blue" : "neutral"}>{product.source === "store_scan" ? "فحص المتجر" : "يدوي"}</Badge>
                        <div className="product-flags-preview">{(product.flags || []).slice(0, 2).map((flag) => (<span key={flag}>{flag}</span>))}{product.flags?.length > 2 ? <span>+{product.flags.length - 2}</span> : null}</div>
                        <div className="product-row-actions"><button type="button" onClick={() => startEditProduct(product)}>تعديل</button><button type="button" className="danger" onClick={() => removeProduct(product.id)} disabled={products.length === 1}><Trash2 size={14} /> حذف</button></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {collectedData.detectedProducts.length ? (
                <div className="scan-card">
                  <div className="scan-head"><div><h3>اقتراحات من فحص المتجر</h3><p>اضغط على أي منتج لإضافته إلى الجدول إن لم يكن موجودًا.</p></div><Badge tone="blue">store_scan</Badge></div>
                  <div className="suggestion-list">{collectedData.detectedProducts.map((product, index) => (<button key={product} type="button" onClick={() => addDetectedProduct(product, index)}>+ {product}</button>))}</div>
                  {collectedData.assetsNeedingReview.length ? (<Notice>أصول تحتاج مراجعة حقوق: {collectedData.assetsNeedingReview.join("، ")}</Notice>) : null}
                </div>
              ) : null}
            </Card>
          )}

          {step === 3 && (
            <Card>
              <SectionHeader
                icon={Users}
                title="الخطوة 3: الجمهور المستهدف الافتراضي"
                description="بيانات خفيفة فقط لاستخدامها كافتراض في معالج الحملات، دون حقول تفسيرية زائدة."
              />
              <div className="form-grid three">
                <ChoiceGroup title="الفئة العمرية" options={["13–17", "18–24", "25–34", "35–44", "45–54", "55+"]} selected={form.age} setSelected={(value) => update("age", value)} />
                <ChoiceGroup title="الجنس" options={["رجال", "نساء", "الجميع"]} selected={form.gender} setSelected={(value) => update("gender", value)} />
                <Field label="موقع الجمهور" value={form.audienceLocation} onChange={(value) => update("audienceLocation", value)} />
              </div>
              <MultiChoice
                title="دوافع الشراء"
                options={["سعر", "جودة", "سرعة", "هدية", "مناسبة", "رفاهية", "ضرورة", "تجربة"]}
                selected={form.motives}
                setSelected={(value) => update("motives", value)}
              />
            </Card>
          )}

          {step === 4 && (
            <Card>
              <SectionHeader
                icon={Globe2}
                title="الخطوة 4: القنوات والربط OAuth"
                description="اختصار لبدء ربط القنوات. نفس حالة الربط تظهر في الإعدادات لأنها تقرأ من نفس مصدر الاتصالات."
              />
              <Notice>
                هذا OAuth Mock داخل البروتوتايب: زر الربط يفتح صفحة حساب/موافقة المنصة كتصور للتجربة، لكن التنفيذ الحقيقي لاحقًا يجب أن يبدأ من Backend آمن يحفظ Tokens مشفرة. لا يوجد client_secret أو access_token داخل React.
              </Notice>
              <MultiChoice title="القنوات المفضلة للحملات" options={channelOptions} selected={form.preferredChannels} setSelected={(value) => update("preferredChannels", value)} />

              <div className="settings-sync-card">
                <Link2 size={18} />
                <div>
                  <strong>مصدر ربط واحد</strong>
                  <span>إعداد المتجر والإعدادات يقرآن نفس مصدر الربط المؤقت <code>{integrationConnectionsKey}</code>. لا توجد مزامنة يدوية ولا نسختان للحالة.</span>
                </div>
                <Badge tone={connectedChannelsCount ? "green" : "neutral"}>{connectedChannelsCount} قناة مرتبطة/بانتظار</Badge>
              </div>

              <div className="channel-grid">
                {form.preferredChannels.map((channel) => {
                  const key = normalizeProviderKey(channel);
                  const connection = channelConnections[key] || {};
                  const connectionStatus = connection.status || "disconnected";
                  return (
                    <div key={channel} className="channel-card">
                      <Globe2 size={20} />
                      <div>
                        <strong>{channel}</strong>
                        <span>زر الربط يبدأ مسار OAuth Mock ويظهر نفس السجل في الإعدادات.</span>
                        <ChannelConnectionStatus status={connectionStatus} />
                        {connection.accountName ? <small className="channel-account">{connection.accountName}</small> : null}
                        <div className="channel-actions">
                          <button type="button" onClick={() => startOAuthConnection(channel)}>ربط OAuth</button>
                          <button type="button" onClick={() => mockOAuthSuccess(channel)}>محاكاة إتمام الموافقة</button>
                          <button type="button" onClick={() => disconnectOAuth(channel)}>قطع الربط</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <SectionHeader icon={ShieldCheck} title="الخطوة 5: السياسات والقيود" description="تثبيت قيود الادعاءات والموافقات وحدود النشر قبل التوليد." />
              <div className="policy-grid">{policyItems.map((item) => (<PolicyRow key={item} title={item} value={form.policyAnswers[item] || "بحاجة مراجعة"} onChange={(value) => updatePolicy(item, value)} />))}</div>
            </Card>
          )}

          {step === 6 && (
            <div className="readiness-grid">
              <Card>
                <SectionHeader icon={FileCheck2} title="الخطوة 6: ملخص جاهزية المتجر" description="قرار واضح قبل الانتقال إلى معالج الحملات." />
                <div className="metrics-grid">
                  <Metric title="اكتمال الملف" value={`${completion}%`} />
                  <Metric title="المنتجات" value={String(products.length)} />
                  <Metric title="القنوات" value={`${connectedChannelsCount}/${form.preferredChannels.length}`} />
                  <Metric title="السياسات" value={`${Object.keys(form.policyAnswers).length}/${policyItems.length}`} />
                  <Metric title="فحص المتجر" value={storeSource.status === "approved" ? "معتمد" : storeSource.status === "scan_completed" ? "تم التحليل" : "ناقص"} tone={storeSource.status === "approved" || storeSource.status === "scan_completed" ? "green" : "amber"} />
                  <Metric title="جاهزية الحملات" value={readinessIssues.length ? "تحتاج استكمال" : "جاهزة"} tone={readinessIssues.length ? "amber" : "green"} />
                </div>
                <div className="issues-card"><h3>النواقص</h3>{readinessIssues.length ? readinessIssues.map((issue) => (<div key={issue} className="issue-row"><AlertTriangle size={16} /><span>{issue}</span></div>)) : (<div className="issue-row ok"><CheckCircle2 size={16} /><span>لا توجد نواقص حرجة قبل إنشاء الحملة.</span></div>)}</div>
              </Card>
              <Card className="recommendation-card"><h3>توصيات قبل البدء</h3><div className="recommendation-list">{recommendations.map((item) => (<div key={item}>{item}</div>))}</div><Button onClick={onCreateCampaign}><Sparkles size={16} /> إنشاء أول حملة</Button></Card>
            </div>
          )}
        </div>

        <aside className="smart-panel"><SmartBox step={step} /></aside>
      </section>

      <Footer step={step} total={steps.length} back={back} next={next} nextLabel={step < steps.length ? "التالي" : "إنهاء الإعداد"} saveDraft={saveDraft} />

      {saved && (<div className="saved-toast"><CheckCircle2 size={18} /> تم حفظ المسودة محليًا داخل الواجهة فقط.</div>)}
    </main>
  );
}

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Button({ children, onClick, variant = "primary" }) {
  return <button type="button" onClick={onClick} className={`button ${variant}`}>{children}</button>;
}

function SectionHeader({ icon: Icon, title, description }) {
  return <div className="section-header"><div className="section-icon"><Icon size={22} /></div><div><h2>{title}</h2><p>{description}</p></div></div>;
}

function StepTabs({ steps, step, setStep }) {
  return <div className="step-tabs">{steps.map(([id, title, desc]) => { const state = id < step ? "done" : id === step ? "current" : "future"; return <button key={id} type="button" onClick={() => setStep(id)} className={`step-tab ${state}`}><div className="step-number">{state === "done" ? "✓" : id}</div><div><strong>{title}</strong><span>{desc}</span></div></button>; })}</div>;
}

function Field({ label, value, placeholder = "", onChange }) {
  return <label className="field"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, placeholder = "", onChange }) {
  return <label className="field"><span>{label}</span><textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} rows={5} /></label>;
}

function ChoiceGroup({ title, options, selected, setSelected }) {
  return <div className="choice-block"><h4>{title}</h4><div className="choice-list">{options.map((item) => <button key={item} type="button" onClick={() => setSelected(item)} className={`choice ${selected === item ? "selected" : ""}`}>{item}</button>)}</div></div>;
}

function MultiChoice({ title, options, selected, setSelected }) {
  const toggle = (item) => setSelected(selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item]);
  return <div className="choice-block wide"><h4>{title}</h4><div className="choice-list">{options.map((item) => <button key={item} type="button" onClick={() => toggle(item)} className={`choice ${selected.includes(item) ? "selected" : ""}`}>{item}</button>)}</div></div>;
}

function UploadBox({ title }) {
  return <div className="upload-box"><Upload size={22} /><strong>{title}</strong><span>إرفاق صور / روابط / ملاحظات</span><p>المرفقات هنا شكلية داخل البروتوتايب ولا يتم رفعها فعليًا.</p></div>;
}

function Notice({ children }) {
  return <div className="notice amber">{children}</div>;
}

function SourceStatus({ status, confidence = 0 }) {
  const [label, tone] = statusLabels[status] || statusLabels.manual;
  return <div className={`source-status ${tone}`}><strong>{label}</strong><span>{confidence}% ثقة</span></div>;
}

function Info({ label, value }) {
  return <div className="info-row"><span>{label}</span><strong>{value || "غير متاح"}</strong></div>;
}

function ChannelConnectionStatus({ status }) {
  const [label, tone] = channelConnectionLabels[status] || channelConnectionLabels.disconnected;
  return <span className={`channel-status ${tone}`}>{label}</span>;
}

function PolicyRow({ title, value, onChange }) {
  return <div className="policy-row"><strong>{title}</strong><div>{["نعم", "لا", "بحاجة مراجعة"].map((item) => <button key={item} type="button" onClick={() => onChange(item)} className={value === item ? "active" : ""}>{item}</button>)}</div></div>;
}

function Metric({ title, value, tone = "green" }) {
  return <div className={`metric ${tone}`}><span>{title}</span><strong>{value}</strong></div>;
}

function SmartBox({ step }) {
  const tips = {
    1: ["أبقِ بيانات المتجر مختصرة؛ لا تحولها إلى صفحة Branding كاملة.", "فحص المتجر يولّد اقتراحات فقط، ولا يعتمدها دون مراجعة."],
    2: ["المنتجات هنا هي مصدر الحقيقة للحملات القادمة.", "لا تجعل هامش الربح إلزاميًا في V1."],
    3: ["الجمهور الافتراضي يجب أن يكون خفيفًا وقابلًا لإعادة الاستخدام.", "تجنب الحقول التخمينية مثل الدخل والاهتمامات العامة."],
    4: ["القنوات هنا تختصر بدء OAuth، وليست مكان إدارة الأسرار.", "الإعدادات وإعداد المتجر يقرآن نفس مصدر الربط؛ لا مزامنة يدوية."],
    5: ["السياسات تحمي النظام من ادعاءات أو نشر غير آمن.", "أي عنصر بحاجة مراجعة يجب أن يمنع النشر التلقائي لاحقًا."],
    6: ["لا تنتقل إلى الحملة إذا كانت المنتجات أو السياسات ناقصة.", "ابدأ بحملة منتج واحد قبل التوسع."],
  };
  return <Card className="smart-box"><div className="smart-title"><Wand2 size={20} /><h3>توصيات ذكية</h3></div><div className="tips-list">{(tips[step] || []).map((tip, index) => <div key={tip} className="tip"><span>{index + 1}</span><p>{tip}</p></div>)}</div></Card>;
}

function Footer({ step, total, back, next, nextLabel, saveDraft }) {
  return <footer className="footer-bar"><Button variant="secondary" onClick={back}><ArrowRight size={16} /> رجوع</Button><div className="footer-progress"><strong>الخطوة {step} من {total}</strong><span><i style={{ width: `${(step / total) * 100}%` }} /></span></div><div className="footer-actions"><Button variant="secondary" onClick={saveDraft}><Save size={16} /> حفظ كمسودة</Button><Button onClick={next}>{nextLabel}{step < total ? <ArrowLeft size={16} /> : <CheckCircle2 size={16} />}</Button></div></footer>;
}

const styles = `
.store-page{min-height:calc(100vh - 80px);padding:24px;background:radial-gradient(circle at top right,rgba(23,107,44,.05),transparent 30%),#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}.page-title,.guardrail,.card{background:#fff;border:1px solid #e4e7df;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}.page-title{padding:20px;display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.page-title h1{margin:0;font-size:34px;line-height:1.2;letter-spacing:-.04em}.page-title p{margin:8px 0 0;color:#6f746b;line-height:1.8;max-width:860px}.guardrail{padding:14px 16px;margin-bottom:16px;display:flex;gap:12px;color:#176b2c}.guardrail strong{display:block;margin-bottom:4px}.guardrail span{display:block;color:#52604c;line-height:1.8;font-size:13px}.badge{min-height:28px;border-radius:999px;padding:0 10px;display:inline-flex;align-items:center;font-size:12px;font-weight:900;border:1px solid;white-space:nowrap}.badge.green{color:#166534;background:#f0fdf4;border-color:#bbf7d0}.badge.amber{color:#92400e;background:#fffbeb;border-color:#fde68a}.badge.blue{color:#1d4ed8;background:#eff6ff;border-color:#bfdbfe}.badge.neutral{color:#475569;background:#f8fafc;border-color:#e2e8f0}.button{min-height:42px;border-radius:16px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:inherit;font-size:14px;font-weight:900;cursor:pointer}.button.primary{border:0;color:#fff;background:#176b2c;box-shadow:0 12px 24px rgba(23,107,44,.16)}.button.secondary{color:#1f241d;background:#fff;border:1px solid #e4e7df}.overview-grid{display:grid;grid-template-columns:300px minmax(0,1fr)260px;gap:14px;margin-bottom:16px}.card{padding:20px}.score-card,.source-card,.quick-card{display:flex;align-items:center;gap:14px}.score-ring{width:82px;height:82px;border-radius:50%;border:8px solid #176b2c;box-shadow:inset 0 0 0 6px #eef7e9;display:grid;place-items:center;font-size:20px;font-weight:950;background:#fff;flex:0 0 auto}.score-card h3,.source-card h3,.quick-card strong{margin:0;font-size:18px;font-weight:950}.score-card p,.source-card p,.quick-card span{margin:6px 0 0;color:#6f746b;font-size:13px;line-height:1.7}.source-card{justify-content:space-between}.source-status{min-width:104px;border-radius:16px;padding:8px 10px;display:grid;gap:4px;text-align:center;border:1px solid;flex:0 0 auto}.source-status strong{font-size:12px}.source-status span{color:inherit;opacity:.78;font-size:11px;font-weight:900}.source-status.green{color:#166534;background:#f0fdf4;border-color:#bbf7d0}.source-status.amber{color:#92400e;background:#fffbeb;border-color:#fde68a}.source-status.slate{color:#475569;background:#f8fafc;border-color:#e2e8f0}.steps-panel{margin-bottom:16px}.step-tabs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.step-tab{width:100%;min-height:86px;border-radius:18px;border:1px solid #e4e7df;background:#fff;display:flex;align-items:flex-start;gap:12px;padding:12px;text-align:right;font-family:inherit;cursor:pointer}.step-tab.current{border-color:#176b2c;background:#eef7e9;box-shadow:0 0 0 4px #eef7e9}.step-tab.done{background:#f0fdf4;border-color:#bbf7d0}.step-number{width:36px;height:36px;display:grid;place-items:center;border-radius:999px;color:#fff;background:#176b2c;font-size:13px;font-weight:950;flex:0 0 auto}.step-tab.future .step-number{color:#64748b;background:#f1f5f9}.step-tab strong{display:block;font-size:14px}.step-tab span{display:block;margin-top:3px;color:#6f746b;line-height:1.5;font-size:11px}.layout{display:grid;grid-template-columns:minmax(0,1fr)320px;gap:16px;align-items:start}.smart-panel{position:sticky;top:96px}.section-header{display:flex;align-items:flex-start;gap:12px;padding-bottom:16px;margin-bottom:18px;border-bottom:1px solid #e4e7df}.section-icon{width:48px;height:48px;display:grid;place-items:center;border-radius:18px;color:#fff;background:#176b2c;flex:0 0 auto}.section-header h2{margin:0;font-size:22px;letter-spacing:-.03em}.section-header p{margin:5px 0 0;color:#6f746b;line-height:1.7;font-size:13px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}.form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.field{display:grid;gap:8px}.field span,.choice-block h4{margin:0;color:#1f241d;font-size:13px;font-weight:950}.field input,.field textarea{width:100%;border:1px solid #e4e7df;border-radius:18px;background:#fff;outline:none;padding:13px 14px;color:#1f241d;font-family:inherit;font-size:14px}.field textarea{min-height:128px;resize:vertical;line-height:1.8}.choice-block{display:grid;gap:10px}.choice-block.wide{grid-column:1/-1;margin-top:16px}.choice-list{display:flex;flex-wrap:wrap;gap:8px}.choice{min-height:38px;border-radius:16px;border:1px solid #e4e7df;background:#fff;color:#1f241d;padding:0 13px;font-family:inherit;font-size:12px;font-weight:950;cursor:pointer}.choice.selected{border-color:#176b2c;color:#176b2c;background:#eef7e9}.scan-card{margin-top:18px;border:1px solid #e4e7df;background:#f7f8f4;border-radius:22px;padding:16px}.scan-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.scan-head h3{margin:0;font-size:16px}.scan-head p{margin:6px 0 0;color:#6f746b;line-height:1.7;font-size:12px}.scan-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.scan-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.info-row{border:1px solid #e4e7df;background:#fff;border-radius:16px;padding:12px}.info-row span{display:block;color:#6f746b;font-size:12px;font-weight:900}.info-row strong{display:block;margin-top:5px;color:#1f241d;font-size:13px;line-height:1.6}.notice{border-radius:18px;padding:14px;margin:14px 0;line-height:1.8;font-size:13px;font-weight:800}.notice.amber{color:#92400e;background:#fff7e6;border:1px solid #fde68a}.products-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.product-manager-grid{display:grid;grid-template-columns:minmax(320px,.82fr) minmax(0,1.18fr);gap:16px;margin-top:16px}.product-form-card,.product-table-card{border:1px solid #e4e7df;background:#f7f8f4;border-radius:24px;padding:16px}.product-form-head,.product-table-headline{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}.product-form-head h3,.product-table-headline h3{margin:0;font-size:17px;font-weight:950}.product-form-head p,.product-table-headline p{margin:5px 0 0;color:#6f746b;font-size:12px;line-height:1.7}.upload-box{min-height:150px;border:1px dashed #cbd5e1;background:#fff;border-radius:22px;padding:16px;display:grid;place-items:center;text-align:center;color:#6f746b}.upload-box strong{color:#1f241d}.upload-box p{margin:0;font-size:12px;line-height:1.7}.product-flags-section{margin-top:14px}.product-flags-section h4{margin:0 0 10px;font-size:14px;font-weight:950}.product-form-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.product-table{border:1px solid #e4e7df;background:#fff;border-radius:20px;overflow:hidden}.product-table-header,.product-table-row{display:grid;grid-template-columns:minmax(180px,1.25fr) 90px 120px minmax(120px,.8fr) 170px;gap:10px;align-items:center;padding:12px 14px}.product-table-header{background:#f7f8f4;color:#6f746b;font-size:12px;font-weight:950}.product-table-row{border-top:1px solid #e4e7df;font-size:13px}.product-table-row strong{display:block}.product-table-row small{display:block;color:#6f746b;margin-top:3px;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.product-flags-preview{display:flex;flex-wrap:wrap;gap:5px}.product-flags-preview span{border:1px solid #d9ead7;background:#eef7e9;color:#176b2c;border-radius:999px;padding:4px 7px;font-size:10px;font-weight:900}.product-row-actions{display:flex;gap:8px}.product-row-actions button{min-width:70px;min-height:34px;border-radius:12px;border:1px solid #e4e7df;background:#fff;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;gap:5px;font-family:inherit;font-size:12px;font-weight:950;cursor:pointer}.product-row-actions button.danger{color:#991b1b;background:#fef2f2;border-color:#fecaca}.product-row-actions button:disabled{opacity:.45;cursor:not-allowed}.suggestion-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.suggestion-list button{min-height:36px;border:1px solid #d9ead7;background:#eef7e9;color:#176b2c;border-radius:999px;padding:0 12px;font-family:inherit;font-size:12px;font-weight:900;cursor:pointer}.channel-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.channel-card{border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:14px;display:flex;gap:10px;align-items:flex-start}.channel-card strong{display:block}.channel-card span{display:block;color:#6f746b;margin-top:4px;line-height:1.6;font-size:12px}.settings-sync-card{margin-top:16px;border:1px solid #d9ead7;background:#eef7e9;color:#176b2c;border-radius:18px;padding:14px;display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:10px;align-items:start}.settings-sync-card strong{display:block}.settings-sync-card span{display:block;color:#52604c;margin-top:4px;line-height:1.7;font-size:12px;font-weight:800}.settings-sync-card code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#fff;border:1px solid #d9ead7;border-radius:8px;padding:1px 5px}.channel-status{width:fit-content;min-height:28px;border-radius:999px;padding:0 10px;display:inline-flex;align-items:center;font-size:11px;font-weight:900;border:1px solid;margin-top:8px}.channel-status.green{color:#166534;background:#f0fdf4;border-color:#bbf7d0}.channel-status.amber{color:#92400e;background:#fffbeb;border-color:#fde68a}.channel-status.slate{color:#475569;background:#f8fafc;border-color:#e2e8f0}.channel-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.channel-actions button{min-height:32px;border-radius:999px;border:1px solid #e4e7df;background:#fff;padding:0 10px;font-family:inherit;font-size:11px;font-weight:900;cursor:pointer}.policy-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.policy-row{border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:14px}.policy-row strong{display:block;margin-bottom:10px;font-size:13px}.policy-row div{display:flex;flex-wrap:wrap;gap:7px}.policy-row button{min-height:32px;border-radius:999px;border:1px solid #e4e7df;background:#fff;padding:0 10px;font-family:inherit;font-size:12px;font-weight:900;cursor:pointer}.policy-row button.active{border-color:#176b2c;color:#176b2c;background:#eef7e9}.readiness-grid{display:grid;grid-template-columns:minmax(0,1fr)360px;gap:16px}.metrics-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.metric{border-radius:22px;border:1px solid;padding:16px}.metric.green{color:#166534;background:#f0fdf4;border-color:#bbf7d0}.metric.amber{color:#92400e;background:#fffbeb;border-color:#fde68a}.metric span{display:block;font-size:12px;font-weight:900}.metric strong{display:block;margin-top:9px;font-size:24px;color:#1f241d}.issues-card{margin-top:16px;border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:14px}.issues-card h3{margin:0 0 10px}.issue-row{border:1px solid #fde68a;background:#fff7e6;color:#92400e;border-radius:16px;padding:10px;display:flex;gap:8px;align-items:flex-start;line-height:1.7;font-size:12px;font-weight:800;margin-top:8px}.issue-row.ok{border-color:#bbf7d0;background:#f0fdf4;color:#166534}.recommendation-card{background:#eef7e9}.recommendation-card h3{margin:0;color:#176b2c}.recommendation-list{display:grid;gap:10px;margin:16px 0}.recommendation-list div{border-radius:16px;background:#fff;padding:12px;line-height:1.7;font-size:13px;font-weight:800}.smart-title{display:flex;align-items:center;gap:8px;color:#176b2c}.smart-title h3{margin:0}.tips-list{display:grid;gap:10px;margin-top:14px}.tip{display:flex;gap:10px;border-radius:16px;background:#f7f8f4;padding:12px}.tip span{width:26px;height:26px;border-radius:999px;display:grid;place-items:center;color:#fff;background:#176b2c;font-size:12px;font-weight:950;flex:0 0 auto}.tip p{margin:0;color:#1f241d;line-height:1.7;font-size:13px;font-weight:800}.footer-bar{position:sticky;bottom:16px;z-index:10;margin-top:18px;border:1px solid #e4e7df;background:rgba(255,255,255,.95);backdrop-filter:blur(16px);box-shadow:0 18px 40px rgba(15,23,42,.10);border-radius:24px;padding:14px;display:grid;grid-template-columns:auto minmax(240px,1fr) auto;align-items:center;gap:14px}.footer-progress{min-height:44px;border-radius:16px;background:#eef7e9;color:#176b2c;padding:8px 14px;display:grid;gap:7px;text-align:center;font-size:13px}.footer-progress span{height:6px;border-radius:999px;overflow:hidden;background:#d8ead3}.footer-progress i{display:block;height:100%;border-radius:inherit;background:#176b2c}.footer-actions{display:flex;align-items:center;gap:10px}.saved-toast{position:fixed;left:22px;bottom:98px;min-height:44px;border-radius:16px;padding:0 14px;display:flex;align-items:center;gap:8px;color:#166534;background:#f0fdf4;border:1px solid #bbf7d0;box-shadow:0 16px 34px rgba(15,23,42,.12);font-size:13px;font-weight:900}@media(max-width:1280px){.overview-grid,.layout,.readiness-grid{grid-template-columns:1fr}.smart-panel{position:static}.step-tabs{grid-template-columns:repeat(3,minmax(0,1fr))}.product-manager-grid{grid-template-columns:1fr}.product-table{overflow-x:auto}.product-table-header,.product-table-row{min-width:820px}}@media(max-width:860px){.store-page{padding:16px}.page-title,.footer-bar,.footer-actions,.products-head{align-items:stretch;grid-template-columns:1fr;flex-direction:column}.form-grid,.form-grid.three,.policy-grid,.metrics-grid,.step-tabs,.channel-grid,.scan-summary{grid-template-columns:1fr}.button{width:100%}.settings-sync-card{grid-template-columns:1fr}.settings-sync-card .badge{width:fit-content}}
`;
