import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  ImageIcon,
  Megaphone,
  Plus,
  RefreshCw,
  Sparkles,
  UploadCloud,
  Video,
  Wand2,
  X,
} from "lucide-react";

import {
  readProductCatalog,
  upsertProduct,
} from "../utils/productCatalogStore.js";

import {
  deriveMetricsFromCampaigns,
  refreshDashboardSummary,
  upsertCampaign,
  writeCampaignMetrics,
} from "../utils/campaignAnalyticsStore.js";

import {
  readAssetLibrary,
  upsertAsset,
} from "../utils/assetLibraryStore.js";

import {
  upsertCampaignContentItem,
} from "../utils/campaignContentStore.js";

import {
  readLatestStoreStrategicPlan,
} from "../utils/storeStrategicPlanStore.js";

const goals = [
  "زيادة المبيعات",
  "إطلاق منتج جديد",
  "تصريف مخزون",
  "رفع الوعي",
  "زيادة المتابعين",
  "جمع عملاء محتملين",
  "زيارات للمتجر الإلكتروني",
  "زيارات للفرع",
  "إعادة استهداف",
  "حملة موسمية",
  "حملة عروض",
];

const occasions = [
  "رمضان",
  "العيد",
  "اليوم الوطني",
  "الجمعة البيضاء",
  "العودة للمدارس",
  "موسم الشتاء",
  "تصفية",
  "إطلاق منتج",
  "أخرى",
];

const languageOptions = ["العربية", "الإنجليزية", "العربية والإنجليزية"];

const ageGroupOptions = ["18–24", "25–34", "35–44", "45–54", "55+"];
const genderOptions = ["الكل", "رجال", "نساء"];

const ctaOptions = [
  "اطلب الآن",
  "تسوق الآن",
  "احجز الآن",
  "تواصل معنا",
  "اكتشف المزيد",
  "احصل على العرض",
  "جرّب المنتج",
  "أرسل رسالة واتساب",
];

const channelOptions = [
  "Instagram",
  "TikTok",
  "Snapchat",
  "X",
  "Facebook",
  "LinkedIn",
  "YouTube",
  "WhatsApp Business",
  "Email",
  "Google Ads",
  "Meta Ads",
];

const outputOptions = [
  "Caption",
  "Story",
  "Carousel",
  "Reel قصير",
  "صورة إعلانية",
  "فيديو قصير",
  "Email",
  "WhatsApp",
];

const initialProducts = [
  {
    id: "p-1",
    name: "عطر X",
    url: "https://store.example/products/perfume-x",
    price: "299 ريال",
    description: "عطر فاخر مناسب للهدايا والمناسبات.",
  },
  {
    id: "p-2",
    name: "باقة العطور الموسمية",
    url: "https://store.example/products/bundle",
    price: "599 ريال",
    description: "باقة عطور موسمية بتغليف مناسب للهدايا.",
  },
  {
    id: "p-3",
    name: "منتج العناية اليومي",
    url: "https://store.example/products/care",
    price: "149 ريال",
    description: "منتج عناية يومي بتجربة بسيطة وموثوقة.",
  },
];

const assetFallbackSeed = [
  {
    id: "wiz-asset-1",
    name: "صورة عطر X الرئيسية",
    type: "image",
    linkedType: "product",
    linkedName: "عطر X",
    quality: "high",
    rightsStatus: "allowed",
    tags: ["منتج", "صورة"],
  },
  {
    id: "wiz-asset-2",
    name: "فيديو قصير للعرض",
    type: "video",
    linkedType: "product",
    linkedName: "عطر X",
    quality: "medium",
    rightsStatus: "needs_check",
    tags: ["فيديو", "إعلان"],
  },
  {
    id: "wiz-asset-3",
    name: "شعار المتجر",
    type: "logo",
    linkedType: "general",
    linkedName: "عام",
    quality: "high",
    rightsStatus: "allowed",
    tags: ["هوية"],
  },
];

const steps = [
  [1, "أساسيات الحملة", "الهدف، المنتج، التاريخ، الميزانية، المناسبة."],
  [2, "الأصول المتاحة", "الأصول المحفوظة والجديدة وفحص الجودة."],
  [3, "العرض والجمهور والقنوات", "العرض، الجمهور، اللغة، والقنوات."],
  [4, "المخرجات المطلوبة", "النصوص، الصور، الفيديو، المقاسات، النسخ."],
  [5, "Brief + الجاهزية", "ملخص كامل ومخرجات عميل/نموذج قبل التوليد."],
];

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function makeCustomerText({
  output,
  productName,
  goal,
  offer,
  cta,
  ageGroup,
  gender,
  style,
  videoDuration,
}) {
  const audienceContext = `${ageGroup || "الفئة غير محددة"} · ${gender || "الكل"}`;

  if (output.includes("فيديو") || output.includes("Reel")) {
    return `سيناريو فيديو ${videoDuration} يعرّف بالمنتج "${productName}" ويربطه بهدف "${goal}" لفئة ${audienceContext} بأسلوب ${style}. سيظهر المنتج بوضوح، ثم يشرح الفائدة الرئيسية، ثم ينتهي بدعوة "${cta}".`;
  }

  if (output.includes("صورة") || output.includes("Story") || output.includes("Carousel")) {
    return `اتجاه بصري عام لمخرج ${output}: إبراز المنتج "${productName}" مع عرض واضح "${offer}" ودعوة "${cta}" وخلفية نظيفة تناسب الهوية. الفئة: ${audienceContext}.`;
  }

  if (output.includes("Email")) {
    return `هيكل بريد تسويقي يفتتح بمناسبة أو فائدة، ثم يعرض المنتج "${productName}" وفوائده، ثم يوضح العرض "${offer}" وينتهي بدعوة "${cta}". الفئة: ${audienceContext}.`;
  }

  if (output.includes("WhatsApp")) {
    return `صياغة قصيرة ومباشرة تناسب WhatsApp، تركز على المنتج "${productName}" والعرض "${offer}" مع دعوة "${cta}" دون إطالة.`;
  }

  return `نص تسويقي عام لمخرج ${output} يركز على المنتج "${productName}" والهدف "${goal}" والعرض "${offer}" ودعوة "${cta}" بنبرة واضحة وقابلة للمراجعة.`;
}

function makeInternalPrompt({ output, productName, goal, offer, cta, ageGroup, gender, style }) {
  return `INTERNAL_PROMPT:: generate_${output} | product=${productName} | goal=${goal} | offer=${offer} | cta=${cta} | age=${ageGroup} | gender=${gender} | style=${style} | include_brand_rules=true | include_platform_constraints=true | hidden_from_customer=true`;
}

export default function CampaignWizardPage({
  onOpenCampaign = () => {},
  onOpenContentStudio = () => {},
  onOpenReviewPreview = () => {},
} = {}) {
  const [step, setStep] = useState(1);

  const [campaignName, setCampaignName] = useState("حملة عطر X - مارس");
  const [goal, setGoal] = useState("زيادة المبيعات");
  const [occasion, setOccasion] = useState("إطلاق منتج");
  const [startDate, setStartDate] = useState("2025-03-10");
  const [endDate, setEndDate] = useState("2025-03-15");
  const [budget, setBudget] = useState("5,000 ريال");

  const [products, setProducts] = useState(() => readProductCatalog(initialProducts));
  const [selectedProductKey, setSelectedProductKey] = useState("p-1");
  const [showQuickProduct, setShowQuickProduct] = useState(false);
  const [quickProduct, setQuickProduct] = useState({
    name: "",
    url: "",
    price: "",
    description: "",
  });

  const [availableAssets, setAvailableAssets] = useState(() => {
    const sharedAssets = readAssetLibrary([]);
    return sharedAssets.length ? sharedAssets : assetFallbackSeed;
  });
  const [selectedAssetKeys, setSelectedAssetKeys] = useState([]);
  const [assetDraft, setAssetDraft] = useState({
    name: "",
    type: "image",
    url: "",
  });
  const [assetNotice, setAssetNotice] = useState("");

  const [offer, setOffer] = useState("خصم");
  const [cta, setCta] = useState("اطلب الآن");

  const [ageGroup, setAgeGroup] = useState("25–34");
  const [gender, setGender] = useState("الكل");
  const [language, setLanguage] = useState("العربية");
  const [channels, setChannels] = useState(["Instagram", "TikTok", "Email"]);

  const [outputs, setOutputs] = useState(["Caption", "Story", "Carousel", "Reel قصير"]);
  const [copies, setCopies] = useState("3 نسخ");
  const [videoDuration, setVideoDuration] = useState("15 ثانية");
  const [style, setStyle] = useState("مباشر");

  const [generatedTexts, setGeneratedTexts] = useState({});
  const [saveNotice, setSaveNotice] = useState("");
  const [latestStrategicPlan, setLatestStrategicPlan] = useState(() =>
    readLatestStoreStrategicPlan(null)
  );

  useEffect(() => {
    const refreshProducts = () => {
      setProducts(readProductCatalog(initialProducts));
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
    const refreshAssets = () => {
      const sharedAssets = readAssetLibrary([]);
      setAvailableAssets(sharedAssets.length ? sharedAssets : assetFallbackSeed);
    };

    window.addEventListener("focus", refreshAssets);
    window.addEventListener("storage", refreshAssets);
    window.addEventListener("nashir-asset-library-updated", refreshAssets);

    return () => {
      window.removeEventListener("focus", refreshAssets);
      window.removeEventListener("storage", refreshAssets);
      window.removeEventListener("nashir-asset-library-updated", refreshAssets);
    };
  }, []);

  useEffect(() => {
    const refreshStrategicPlan = () => {
      setLatestStrategicPlan(readLatestStoreStrategicPlan(null));
    };

    window.addEventListener("focus", refreshStrategicPlan);
    window.addEventListener("storage", refreshStrategicPlan);
    window.addEventListener("nashir-store-strategic-plan-updated", refreshStrategicPlan);

    return () => {
      window.removeEventListener("focus", refreshStrategicPlan);
      window.removeEventListener("storage", refreshStrategicPlan);
      window.removeEventListener("nashir-store-strategic-plan-updated", refreshStrategicPlan);
    };
  }, []);

  const selectedProduct = products.find((product) => product.id === selectedProductKey) || products[0];

  const sortedAssets = useMemo(() => {
    const productName = selectedProduct?.name || "";

    return [...availableAssets].sort((a, b) => {
      const aLinked = a.linkedType === "product" && a.linkedName === productName;
      const bLinked = b.linkedType === "product" && b.linkedName === productName;
      if (aLinked === bLinked) return String(a.name).localeCompare(String(b.name), "ar");
      return aLinked ? -1 : 1;
    });
  }, [availableAssets, selectedProduct?.name]);

  const selectedAssets = useMemo(
    () => availableAssets.filter((asset) => selectedAssetKeys.includes(asset.id)),
    [availableAssets, selectedAssetKeys]
  );

  const productLinkedAssets = useMemo(
    () => availableAssets.filter((asset) => asset.linkedType === "product" && asset.linkedName === selectedProduct?.name),
    [availableAssets, selectedProduct?.name]
  );

  const generalAssets = useMemo(
    () => availableAssets.filter((asset) => !(asset.linkedType === "product" && asset.linkedName === selectedProduct?.name)),
    [availableAssets, selectedProduct?.name]
  );

  const selectedHasImage = selectedAssets.some((asset) => asset.type === "image");
  const selectedHasVideo = selectedAssets.some((asset) => asset.type === "video");
  const storePlanSuggestions = useMemo(() => {
    const planJson = latestStrategicPlan?.planJson || {};
    const planPriorityProducts = Array.isArray(planJson.priorityProducts) ? planJson.priorityProducts : [];
    const planMessaging = Array.isArray(planJson.messaging) ? planJson.messaging : [];
    const planChannels = planJson.channels || {};
    const planTopProduct = planPriorityProducts[0];
    const planProductMatch = planPriorityProducts.find((product) => product.name === selectedProduct?.name) || planTopProduct;
    const planCta = planMessaging.find((row) => Array.isArray(row) && row[0] === "CTA مقترح")?.[1];
    const flags = selectedProduct?.flags || [];
    const productAssets = availableAssets.filter(
      (asset) => asset.linkedType === "product" && asset.linkedName === selectedProduct?.name
    );
    const hasImageAsset = productAssets.some((asset) => asset.type === "image");
    const hasVideoAsset = productAssets.some((asset) => asset.type === "video");
    const videoReady = flags.includes("يصلح للفيديو") || Boolean(selectedProduct?.videoUrl) || hasVideoAsset;
    const giftReady = flags.includes("مناسب للهدايا") || flags.includes("موسمي");
    const suggestedChannel = videoReady
      ? "Instagram / TikTok"
      : giftReady
        ? "WhatsApp Business / Email"
        : channels[0] || "Instagram";
    const suggestedContentType = videoReady
      ? "فيديو قصير / Reel"
      : giftReady
        ? "منشور عرض أو رسالة مباشرة"
        : "منشور تعريفي";
    const suggestedCta = channels.includes("WhatsApp Business") ? "تواصل معنا" : cta || "تسوق الآن";
    const assetGap = !selectedProduct
      ? "اختر المنتج أولًا لرؤية تنبيه الأصول."
      : !hasImageAsset
        ? "يحتاج صورة منتج واضحة قبل الحملة."
        : !hasVideoAsset && videoReady
          ? "يفضل إضافة أصل فيديو لهذا المنتج."
          : "لا يوجد نقص أصول واضح كبداية.";

    return {
      product: planProductMatch?.name || selectedProduct?.name || "غير محدد",
      channel: planProductMatch?.bestChannel || planChannels.primary?.[0] || suggestedChannel,
      contentType: planProductMatch?.contentType || suggestedContentType,
      cta: planCta || suggestedCta,
      assetGap: planProductMatch?.gap && planProductMatch.gap !== "لا يوجد نقص واضح" ? planProductMatch.gap : assetGap,
      hasSavedPlan: Boolean(latestStrategicPlan),
    };
  }, [availableAssets, channels, cta, latestStrategicPlan, selectedProduct]);

  const readiness = useMemo(() => {
    const checks = [
      campaignName,
      goal,
      selectedProductKey,
      startDate,
      endDate,
      budget,
      offer,
      cta,
      ageGroup,
      gender,
      language,
      channels.length,
      outputs.length,
      copies,
      style,
    ];

    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  }, [
    ageGroup,
    budget,
    campaignName,
    channels.length,
    copies,
    cta,
    endDate,
    gender,
    goal,
    language,
    offer,
    outputs.length,
    selectedProductKey,
    startDate,
    style,
  ]);

  const briefRows = [
    ["اسم الحملة", campaignName],
    ["الهدف", goal],
    ["المنتج", selectedProduct?.name || "غير محدد"],
    ["الفئة العمرية", ageGroup],
    ["الجنس", gender],
    ["القنوات", channels.join("، ")],
    ["العرض", offer],
    ["دعوة الإجراء", cta],
    ["الميزانية", budget],
    ["التواريخ", `${startDate} → ${endDate}`],
    ["المخرجات", outputs.join("، ")],
    ["الأصول المتاحة", selectedAssets.length ? selectedAssets.map((asset) => asset.name).join("، ") : "لم يتم اختيار أصول"],
  ];

  const canGenerate = readiness >= 60;

  const addQuickProduct = () => {
    if (!quickProduct.name.trim()) return;

    const product = {
      id: `p-${Date.now()}`,
      name: quickProduct.name,
      url: quickProduct.url,
      price: quickProduct.price,
      description: quickProduct.description,
    };

    const nextProducts = upsertProduct(product, initialProducts);
    setProducts(nextProducts);
    setSelectedProductKey(product.id);
    setQuickProduct({ name: "", url: "", price: "", description: "" });
    setShowQuickProduct(false);
  };

  const toggleAssetSelection = (asset) => {
    setSelectedAssetKeys((prev) => toggleValue(prev, asset.id));
  };

  const addWizardAsset = () => {
    if (!selectedProduct) {
      setAssetNotice("اختر المنتج أولًا حتى يتم ربط الأصل بالحملة بشكل صحيح.");
      return;
    }

    if (!assetDraft.name.trim()) return;

    const asset = {
      id: `wiz-asset-${Date.now()}`,
      name: assetDraft.name.trim(),
      type: assetDraft.type,
      url: assetDraft.url,
      thumbnailUrl: "",
      linkedType: "product",
      linkedName: selectedProduct.name,
      channel: channels[0] || "",
      status: "review",
      rightsStatus: "needs_check",
      quality: "medium",
      tags: ["حملة", selectedProduct.name],
      notes: "أصل أضيف من معالج الحملة ويحتاج مراجعة قبل الاستخدام.",
    };

    const nextAssets = upsertAsset(asset, []);
    setAvailableAssets(nextAssets);
    setSelectedAssetKeys((prev) => Array.from(new Set([...prev, asset.id])));
    setAssetDraft({ name: "", type: "image", url: "" });
    setAssetNotice("تمت إضافة الأصل وربطه بالمنتج الحالي.");
  };

  const regenerateOutputText = (output) => {
    const customerText = makeCustomerText({
      output,
      productName: selectedProduct?.name || "المنتج",
      goal,
      offer,
      cta,
      ageGroup,
      gender,
      style,
      videoDuration,
    });

    const internalPrompt = makeInternalPrompt({
      output,
      productName: selectedProduct?.name || "المنتج",
      goal,
      offer,
      cta,
      ageGroup,
      gender,
      style,
    });

    setGeneratedTexts((prev) => ({
      ...prev,
      [output]: {
        customerText,
        internalPrompt,
        regeneratedAt: new Date().toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    }));
  };

  const regenerateAllOutputs = () => {
    outputs.forEach((output) => regenerateOutputText(output));
  };

  const next = () => {
    if (step < 5) setStep((current) => current + 1);
  };

  const back = () => {
    if (step > 1) setStep((current) => current - 1);
  };

  const saveCampaignDraft = () => {
    if (!canGenerate) return;

    const campaignId = `campaign_${Date.now()}`;
    const campaignOutputs = outputs.map((output) => {
      const generated = generatedTexts[output];

      return [
        output,
        "مسودة",
        channels[0] || "عام",
        generated?.customerText || makeCustomerText({
          output,
          productName: selectedProduct?.name || "المنتج",
          goal,
          offer,
          cta,
          ageGroup,
          gender,
          style,
          videoDuration,
        }),
      ];
    });

    const numericBudget = Number(String(budget).replace(/[^0-9.]/g, "")) || 0;

    const campaign = {
      id: campaignId,
      campaignId,
      name: campaignName,
      product: selectedProduct?.name || "غير محدد",
      goal,
      status: "draft",
      stage: "مخرجات أولية قابلة للمراجعة",
      owner: "أنت",
      budget,
      budgetValue: numericBudget,
      readiness,
      offer,
      cta,
      ageGroup,
      gender,
      selectedAssetCount: selectedAssets.length,
      selectedAssets: selectedAssets.map((asset) => ({
        name: asset.name,
        type: asset.type,
        linkedName: asset.linkedName,
      })),
      strategicPlanSnapshot: latestStrategicPlan
        ? {
            version: latestStrategicPlan.version,
            recommendations: {
              channel: storePlanSuggestions.channel,
              contentType: storePlanSuggestions.contentType,
              cta: storePlanSuggestions.cta,
              assetGap: storePlanSuggestions.assetGap,
            },
          }
        : null,
      channels,
      channel: channels[0] || "عام",
      outputs: campaignOutputs,
      edits: [["تم إنشاء الحملة من معالج إنشاء الحملة", "أنت", "الآن"]],
      updatedAt: "الآن",
    };

    const nextCampaigns = upsertCampaign(campaign);
    campaignOutputs.forEach(([output, , channel, content], index) => {
      upsertCampaignContentItem(
        {
          id: `${campaignId}_content_${index}`,
          contentId: `${campaignId}_content_${index}`,
          title: `${output} - ${campaignName}`,
          type: output,
          channel: channel || channels[0] || "عام",
          status: "needs_review",
          content,
          campaign: campaignName,
          approval: "needs_review",
          risk: "medium",
          metadata: {
            campaignId,
            product: selectedProduct?.name || "غير محدد",
          },
        },
        []
      );
    });
    const nextMetrics = deriveMetricsFromCampaigns(nextCampaigns);
    writeCampaignMetrics(nextMetrics);
    refreshDashboardSummary(nextCampaigns, nextMetrics);

    setSaveNotice("تم حفظ الحملة كحالة واجهية تجريبية، وتم تجهيز مخرجات أولية قابلة للمراجعة.");
  };

  return (
    <main className="campaign-wizard-page" dir="rtl">
      <style>{styles}</style>

      <PageTitle
        title="معالج إنشاء الحملة"
        description="معالج محكوم لإنشاء الحملة وتجهيز مخرجاتها قبل المراجعة والنشر."
        status="معتمد"
      />

      <section className="screen-guidance-card">
        <div><span>هدف الشاشة</span><strong>تحويل خطة المتجر والمنتج المختار إلى حملة قابلة للمراجعة.</strong></div>
        <div><span>المدخلات</span><strong>المنتج، الهدف، القناة، الأصول، العرض، الاقتراحات الاستراتيجية والاجتماعية.</strong></div>
        <div><span>المخرجات</span><strong>CampaignBrief ومخرجات أولية قابلة للمراجعة.</strong></div>
        <div><span>الإجراء التالي</span><strong>فتح الحملة أو استوديو المحتوى أو المراجعة والمعاينة.</strong></div>
        <div><span>ما لا يحدث هنا</span><strong>لا يتم نشر الحملة أو توليد AI حقيقي.</strong></div>
      </section>

      <StepTabs steps={steps} step={step} setStep={setStep} />

      <div className="wizard-layout">
        <section className="wizard-main">
          {step === 1 && (
            <Card>
              <SectionHeader
                icon={Megaphone}
                title="الخطوة 1: أساسيات الحملة"
                description="تم حذف نوع الحملة وأولوية الحملة لتخفيف الإدخال، مع إضافة اختصار لإضافة منتج من اختيار المنتجات."
              />

              <div className="form-grid">
                <Field label="اسم الحملة" value={campaignName} onChange={setCampaignName} />

                <ChoiceGroup title="هدف الحملة" options={goals} selected={goal} setSelected={setGoal} />

                <div className="field product-picker-field">
                  <span>المنتج / المنتجات المستهدفة</span>
                  <div className="product-picker-row">
                    <select
                      value={selectedProductKey}
                      onChange={(event) => setSelectedProductKey(event.target.value)}
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} — {product.price || "السعر غير محدد"}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="button secondary compact"
                      onClick={() => setShowQuickProduct((value) => !value)}
                    >
                      <Plus size={16} />
                      إضافة منتج سريع
                    </button>
                  </div>

                  <small>
                    Picker من قائمة المتجر — ويمكن إضافة منتج سريعًا دون مغادرة المعالج.
                  </small>
                </div>

                {showQuickProduct && (
                  <div className="quick-product-box">
                    <div className="quick-product-header">
                      <strong>إضافة بيانات منتج سريعًا</strong>
                      <button type="button" onClick={() => setShowQuickProduct(false)}>
                        <X size={16} />
                      </button>
                    </div>

                    <div className="form-grid compact-grid">
                      <Field
                        label="اسم المنتج"
                        value={quickProduct.name}
                        onChange={(value) => setQuickProduct((prev) => ({ ...prev, name: value }))}
                      />
                      <Field
                        label="رابط المنتج"
                        value={quickProduct.url}
                        onChange={(value) => setQuickProduct((prev) => ({ ...prev, url: value }))}
                      />
                      <Field
                        label="السعر"
                        value={quickProduct.price}
                        onChange={(value) => setQuickProduct((prev) => ({ ...prev, price: value }))}
                      />
                      <TextArea
                        label="وصف مختصر"
                        value={quickProduct.description}
                        onChange={(value) => setQuickProduct((prev) => ({ ...prev, description: value }))}
                      />
                    </div>

                    <button type="button" className="button primary" onClick={addQuickProduct}>
                      حفظ المنتج واختياره
                    </button>
                  </div>
                )}

                <div className="store-plan-suggestions">
                  <div className="suggestion-head">
                    <div>
                      <h3>اقتراحات مبنية على خطة المتجر</h3>
                      <p>{storePlanSuggestions.hasSavedPlan ? "هذه اقتراحات من آخر خطة استراتيجية محفوظة. يمكن تعديلها داخل الحملة، ولا يتم تعديل الخطة تلقائيًا." : "لا توجد خطة استراتيجية محفوظة؛ يمكن إنشاء الحملة يدويًا."}</p>
                    </div>
                    <Badge tone="blue">{storePlanSuggestions.hasSavedPlan ? "آخر خطة استراتيجية محفوظة" : "اقتراحات فقط"}</Badge>
                  </div>
                  <div className="asset-readiness-summary compact">
                    <Info label="المنتج المقترح" value={storePlanSuggestions.product} />
                    <Info label="القناة المقترحة" value={storePlanSuggestions.channel} />
                    <Info label="نوع المحتوى المقترح" value={storePlanSuggestions.contentType} />
                    <Info label="CTA مقترح" value={storePlanSuggestions.cta} />
                    <Info label="تنبيه نقص الأصول إن وجد" value={storePlanSuggestions.assetGap} />
                  </div>
                  <small>لا تعدل الحملات الخطة تلقائيًا. عند إنشاء الحملة لاحقًا، يجب حفظ نسخة من توصيات الخطة وقت الإنشاء.</small>
                </div>

                <div className="store-plan-suggestions social-campaign-suggestions">
                  <div className="suggestion-head">
                    <div>
                      <h3>اقتراحات اجتماعية للحملة</h3>
                      <p>هذه اقتراحات قابلة للتعديل ولا تعني سحب بيانات أو نشرًا تلقائيًا.</p>
                    </div>
                    <Badge tone="blue">UI فقط</Badge>
                  </div>
                  <div className="asset-readiness-summary compact">
                    <Info label="القناة الاجتماعية المقترحة" value={storePlanSuggestions.channel} />
                    <Info label="صيغة المحتوى المقترحة" value={storePlanSuggestions.contentType} />
                    <Info label="Hook مقترح" value={`ابدأ بسؤال قصير عن ${selectedProduct?.name || "المنتج"}.`} />
                    <Info label="CTA اجتماعي مقترح" value={storePlanSuggestions.cta} />
                    <Info label="تنبيه نقص الأصول الاجتماعية" value={storePlanSuggestions.assetGap} />
                  </div>
                </div>

                <Field label="تاريخ البداية" value={startDate} onChange={setStartDate} />
                <Field label="تاريخ النهاية" value={endDate} onChange={setEndDate} />
                <Field label="الميزانية" value={budget} onChange={setBudget} />

                <ChoiceGroup
                  title="هل توجد مناسبة مرتبطة؟"
                  options={occasions}
                  selected={occasion}
                  setSelected={setOccasion}
                />
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <SectionHeader
                icon={UploadCloud}
                title="الخطوة 2: الأصول المتاحة"
                description="المخرجات يجب أن تُبنى على ما هو متاح فعليًا من صور وفيديو وهوية."
              />

              <Notice tone="neutral">
                اختر الأصول التي ستُستخدم في هذه الحملة. الأصول المرتبطة بالمنتج تظهر أولًا.
                معالج الحملة يختار من الأصول المتاحة ولا يصبح مالكًا للكتالوج.
              </Notice>

              <div className="asset-step-header">
                <Badge tone="blue">{selectedAssets.length} أصل مختار</Badge>
                <span>المنتج المحدد: {selectedProduct?.name || "غير محدد"}</span>
              </div>

              <div className="asset-readiness-summary">
                <Info label="المنتج المحدد" value={selectedProduct?.name || "غير محدد"} />
                <Info label="عدد الأصول المرتبطة بالمنتج" value={String(productLinkedAssets.length)} />
                <Info label="عدد الأصول المختارة" value={String(selectedAssets.length)} />
                <Info label="هل يوجد أصل صورة؟" value={selectedHasImage ? "نعم" : "لا"} />
                <Info label="هل يوجد أصل فيديو؟" value={selectedHasVideo ? "نعم" : "لا"} />
              </div>

              {!productLinkedAssets.length ? (
                <Notice tone="amber">لا توجد أصول مرتبطة بهذا المنتج. يمكنك رفع أصل جديد وسيتم ربطه بالمنتج الحالي.</Notice>
              ) : null}

              <AssetSelectionGroup
                title="أصول مرتبطة بالمنتج الحالي"
                assets={productLinkedAssets}
                selectedAssetKeys={selectedAssetKeys}
                selectedProduct={selectedProduct}
                onToggle={toggleAssetSelection}
              />

              <AssetSelectionGroup
                title="أصول عامة أو غير مرتبطة"
                assets={generalAssets}
                selectedAssetKeys={selectedAssetKeys}
                selectedProduct={selectedProduct}
                onToggle={toggleAssetSelection}
              />

              <div className="form-grid">
                <Field
                  label="اسم الأصل"
                  value={assetDraft.name}
                  onChange={(value) => setAssetDraft((prev) => ({ ...prev, name: value }))}
                  placeholder="مثال: صورة المنتج الرئيسية"
                />
                <label className="field">
                  <span>نوع الأصل</span>
                  <select
                    value={assetDraft.type}
                    onChange={(event) => setAssetDraft((prev) => ({ ...prev, type: event.target.value }))}
                  >
                    <option value="image">صورة</option>
                    <option value="video">فيديو</option>
                    <option value="logo">شعار</option>
                    <option value="document">مستند</option>
                    <option value="design">تصميم</option>
                  </select>
                </label>
                <Field
                  label="رابط الأصل"
                  value={assetDraft.url}
                  onChange={(value) => setAssetDraft((prev) => ({ ...prev, url: value }))}
                  placeholder="https://example.com/asset"
                />
                <div className="field">
                  <span>إضافة أصل</span>
                  <button type="button" className="button primary" onClick={addWizardAsset}>
                    <Plus size={16} />
                    إضافة وربط بالمنتج
                  </button>
                </div>
              </div>

              {assetNotice ? <Notice tone="amber">{assetNotice}</Notice> : null}
            </Card>
          )}

          {step === 3 && (
            <Card>
              <SectionHeader
                icon={Sparkles}
                title="الخطوة 3: العرض والجمهور والقنوات"
                description="العرض ودعوة الإجراء والفئة والعمر والقنوات."
              />

              <div className="form-grid">
                <ChoiceGroup
                  title="العرض"
                  options={["خصم", "شحن مجاني", "باقة", "هدية", "بدون عرض", "عرض مخصص"]}
                  selected={offer}
                  setSelected={setOffer}
                />

                <ChoiceGroup
                  title="دعوة الإجراء"
                  options={ctaOptions}
                  selected={cta}
                  setSelected={setCta}
                />

                <ChoiceGroup
                  title="الفئة العمرية"
                  options={ageGroupOptions}
                  selected={ageGroup}
                  setSelected={setAgeGroup}
                />

                <ChoiceGroup
                  title="الجنس"
                  options={genderOptions}
                  selected={gender}
                  setSelected={setGender}
                />

                <ChoiceGroup
                  title="لغة الحملة"
                  options={languageOptions}
                  selected={language}
                  setSelected={setLanguage}
                />

                <MultiChoice
                  title="القنوات"
                  options={channelOptions}
                  selected={channels}
                  setSelected={setChannels}
                />
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <SectionHeader
                icon={FileText}
                title="الخطوة 4: المخرجات المطلوبة"
                description="حدد أنواع المخرجات المطلوبة. سيتم توليد شرح عام للعميل ومطالبة داخلية للنموذج."
              />

              <MultiChoice
                title="المخرجات المطلوبة"
                options={outputOptions}
                selected={outputs}
                setSelected={setOutputs}
              />

              <div className="form-grid">
                <ChoiceGroup
                  title="عدد النسخ"
                  options={["نسخة واحدة", "3 نسخ", "5 نسخ"]}
                  selected={copies}
                  setSelected={setCopies}
                />
                <ChoiceGroup
                  title="مدة الفيديو"
                  options={["10 ثواني", "15 ثانية", "30 ثانية", "45 ثانية"]}
                  selected={videoDuration}
                  setSelected={setVideoDuration}
                />
                <ChoiceGroup
                  title="أسلوب المخرج"
                  options={["مباشر", "قصصي", "فاخر", "تعليمي", "ترندي", "هادئ"]}
                  selected={style}
                  setSelected={setStyle}
                />
              </div>
            </Card>
          )}

          {step === 5 && (
            <div className="readiness-layout">
              <Card>
                <SectionHeader
                  icon={CheckCircle2}
                  title="الخطوة 5: Brief + الجاهزية"
                  description="ملخص الحملة مع مخرجات للعميل ومخرجات داخلية للنموذج."
                />

                <div className="metrics-grid">
                  <Metric title="جاهزية الحملة" value={`${readiness}%`} tone={readiness >= 60 ? "green" : "amber"} />
                  <Metric title="المخرجات المطلوبة" value={String(outputs.length)} />
                  <Metric title="القنوات" value={String(channels.length)} />
                  <Metric title="المنتجات" value={String(products.length)} />
                </div>

                <div className="brief-grid">
                  {briefRows.map(([label, value]) => (
                    <BriefRow key={label} label={label} value={value} />
                  ))}
                </div>

                <Notice tone="amber">
                  هذه مخرجات واجهية تجريبية. النص الظاهر للعميل هو مخرجات أولية قابلة للمراجعة، وليس توليدًا أو تنفيذًا حقيقيًا. التوليد والتنفيذ الحقيقي يحتاج Backend وAI orchestration لاحقًا.
                </Notice>

                <div className="button-row">
                  <button type="button" className="button primary" onClick={regenerateAllOutputs}>
                    <RefreshCw size={16} />
                    توليد/إعادة توليد كل النصوص
                  </button>
                  <button type="button" className="button secondary" disabled={!canGenerate} onClick={saveCampaignDraft}>
                    توليد الحملة
                  </button>
                </div>

                {saveNotice && (
                  <div className="saved-flow-card">
                    <Notice tone="amber">
                      {saveNotice}
                    </Notice>
                    <div className="saved-flow-actions">
                      <button type="button" className="button secondary" onClick={onOpenCampaign}>
                        فتح الحملة
                      </button>
                      <button type="button" className="button secondary" onClick={onOpenContentStudio}>
                        فتح استوديو المحتوى
                      </button>
                      <button type="button" className="button secondary" onClick={onOpenReviewPreview}>
                        فتح المراجعة والمعاينة
                      </button>
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="section-mini-title">مخرجات العميل والنموذج</h3>

                <div className="output-explanation-list">
                  {outputs.map((output) => {
                    const item = generatedTexts[output] || {
                      customerText: makeCustomerText({
                        output,
                        productName: selectedProduct?.name || "المنتج",
                        goal,
                        offer,
                        cta,
                        ageGroup,
                        gender,
                        style,
                        videoDuration,
                      }),
                      internalPrompt: makeInternalPrompt({
                        output,
                        productName: selectedProduct?.name || "المنتج",
                        goal,
                        offer,
                        cta,
                        ageGroup,
                        gender,
                        style,
                      }),
                      regeneratedAt: "مبدئي",
                    };

                    const isVisual =
                      output.includes("صورة") ||
                      output.includes("Story") ||
                      output.includes("Carousel") ||
                      output.includes("Reel") ||
                      output.includes("فيديو");

                    return (
                      <div key={output} className="output-card">
                        <div className="output-card-header">
                          <div>
                            <strong>{output}</strong>
                            <span>{isVisual ? "مخرج بصري / فيديو" : "مخرج نصي"}</span>
                          </div>

                          <button
                            type="button"
                            className="button secondary compact"
                            onClick={() => regenerateOutputText(output)}
                          >
                            <RefreshCw size={14} />
                            إعادة توليد النص
                          </button>
                        </div>

                        <div className="customer-output">
                          <h4>المخرج الظاهر للعميل</h4>
                          <p>{item.customerText}</p>
                        </div>

                        <div className="internal-output">
                          <h4>المخرج الداخلي للنموذج</h4>
                          <p>{item.internalPrompt.replace(/./g, "•").slice(0, 140)}</p>
                          <small>
                            محفوظ كنص داخلي للنظام — لا يظهر للعميل ولا يُنسخ في التقارير.
                          </small>
                        </div>

                        <div className="output-footer">
                          آخر توليد: {item.regeneratedAt}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          <Footer
            step={step}
            total={5}
            back={back}
            next={next}
            nextLabel={step < 5 ? "التالي" : "إنهاء"}
          />
        </section>

        <aside className="smart-panel">
          <SmartBox step={step} readiness={readiness} productName={selectedProduct?.name} />
        </aside>
      </div>
    </main>
  );
}

function PageTitle({ title, description, status }) {
  return (
    <section className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {status ? <Badge tone="blue">{status}</Badge> : null}
    </section>
  );
}

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Info({ label, value }) {
  return (
    <div className="asset-info-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AssetSelectionGroup({ title, assets, selectedAssetKeys, selectedProduct, onToggle }) {
  return (
    <section className="asset-selection-section">
      <div className="asset-section-title">
        <h3>{title}</h3>
        <Badge tone="neutral">{assets.length} أصل</Badge>
      </div>

      {assets.length ? (
        <div className="asset-select-grid">
          {assets.map((asset) => {
            const isSelected = selectedAssetKeys.includes(asset.id);
            const isCurrentProduct = asset.linkedType === "product" && asset.linkedName === selectedProduct?.name;
            const linkLabel = isCurrentProduct
              ? "مرتبط بالمنتج الحالي"
              : asset.linkedType === "product"
                ? "مرتبط بمنتج آخر"
                : "أصل عام";

            return (
              <button
                key={asset.id}
                type="button"
                className={`asset-select-card ${isSelected ? "selected" : ""}`}
                onClick={() => onToggle(asset)}
              >
                <div className="asset-select-icon">
                  {asset.type === "video" ? <Video size={22} /> : <ImageIcon size={22} />}
                </div>
                <strong>{asset.name}</strong>
                <span>{asset.linkedName || "أصل عام"}</span>
                <div className="asset-select-actions">
                  <Badge tone={isCurrentProduct ? "green" : "neutral"}>{linkLabel}</Badge>
                  <Badge tone={isSelected ? "green" : "neutral"}>
                    {isSelected ? "مختار" : "غير مختار"}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <Notice tone="neutral">لا توجد أصول في هذه المجموعة.</Notice>
      )}
    </section>
  );
}

function Button({ children, onClick, variant = "primary", disabled = false }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`button ${variant}`}>
      {children}
    </button>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="section-header">
      <div className="section-icon">
        <Icon size={22} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function StepTabs({ steps, step, setStep }) {
  return (
    <div className="step-tabs">
      {steps.map(([id, title, desc]) => {
        const state = id < step ? "done" : id === step ? "current" : "future";

        return (
          <button
            key={id}
            type="button"
            onClick={() => setStep(id)}
            className={`step-tab ${state}`}
          >
            <div className="step-number">{state === "done" ? "✓" : id}</div>
            <div>
              <strong>{title}</strong>
              <span>{desc}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="field wide">
      <span>{label}</span>
      <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ChoiceGroup({ title, options, selected, setSelected }) {
  return (
    <div className="choice-section">
      <div className="choice-title">{title}</div>
      <div className="choice-row">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSelected(item)}
            className={selected === item ? "selected" : ""}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiChoice({ title, options, selected, setSelected }) {
  return (
    <div className="choice-section wide">
      <div className="choice-title">{title}</div>
      <div className="choice-row">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSelected(toggleValue(selected, item))}
            className={selected.includes(item) ? "selected" : ""}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function UploadBox({ title }) {
  return (
    <div className="upload-box">
      <UploadCloud size={24} />
      <strong>{title}</strong>
      <span>إرفاق ملف أو رابط مرجعي — واجهة فقط</span>
    </div>
  );
}

function Metric({ title, value, tone = "green" }) {
  return (
    <div className={`metric ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BriefRow({ label, value }) {
  return (
    <div className="brief-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Notice({ children, tone = "neutral" }) {
  return <div className={`notice ${tone}`}>{children}</div>;
}

function SmartBox({ step, readiness, productName }) {
  const tips = {
    1: [
      "تم حذف نوع الحملة وأولوية الحملة لتقليل الاحتكاك.",
      "إذا لم يكن المنتج موجودًا، أضفه سريعًا من نفس خطوة المنتج.",
    ],
    2: [
      "المخرجات يجب أن تبنى على أصول متاحة فعليًا، لا على افتراضات.",
      "ضعف الأصول يرفع تكلفة التوليد والمراجعة.",
    ],
    3: [
      "وضوح العرض ودعوة الإجراء يقلل الحاجة لإعادة التوليد.",
      "حدد الجمهور والقنوات هنا قبل اختيار المخرجات.",
    ],
    4: [
      "اختيار صورة أو فيديو سيُنشئ شرحًا عامًا للعميل ومطالبة داخلية للنموذج.",
      "المطالبة الفعلية لا تظهر للعميل لأنها من أسرار المنصة.",
    ],
    5: [
      "راجع المخرج الظاهر للعميل وليس المطالبة الداخلية.",
      "أعد توليد السيناريو إذا لم يكن مناسبًا قبل توليد الحملة.",
    ],
  };

  return (
    <Card className="smart-box">
      <div className="smart-title">
        <Wand2 size={20} />
        <h3>توصيات ذكية</h3>
      </div>

      <div className="tips-list">
        {(tips[step] || []).map((tip, index) => (
          <div key={tip} className="tip">
            <span>{index + 1}</span>
            <p>{tip}</p>
          </div>
        ))}
      </div>

      <div className="smart-summary">
        <div>
          <span>المنتج الحالي</span>
          <strong>{productName || "غير محدد"}</strong>
        </div>
        <div>
          <span>جاهزية الحملة</span>
          <strong>{readiness}%</strong>
        </div>
      </div>
    </Card>
  );
}

function Footer({ step, total, back, next, nextLabel }) {
  return (
    <footer className="footer-bar">
      <Button variant="secondary" onClick={back} disabled={step === 1}>
        <ArrowRight size={16} />
        رجوع
      </Button>

      <div className="footer-progress">
        <strong>
          الخطوة {step} من {total}
        </strong>
        <span>
          <i style={{ width: `${(step / total) * 100}%` }} />
        </span>
      </div>

      <div className="footer-actions">
        <Button variant="secondary">حفظ كمسودة</Button>
        <Button onClick={next}>
          {nextLabel}
          {step < total ? <ArrowLeft size={16} /> : <CheckCircle2 size={16} />}
        </Button>
      </div>
    </footer>
  );
}

const styles = `
.campaign-wizard-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.06), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.page-title,
.card,
.footer-bar {
  background: #ffffff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
}

.page-title {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.page-title h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.page-title p {
  margin: 7px 0 0;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.badge {
  min-height: 30px;
  border-radius: 999px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 900;
}

.badge.blue {
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.badge.green {
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.badge.neutral {
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.step-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.step-tab {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 20px;
  padding: 12px;
  text-align: right;
  display: flex;
  gap: 10px;
  min-height: 82px;
  font-family: inherit;
  cursor: pointer;
}

.step-tab.current {
  border-color: #176b2c;
  background: #eef7e9;
  box-shadow: 0 0 0 4px #eef7e9;
}

.step-tab.done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  background: #f7f8f4;
  font-size: 12px;
  font-weight: 900;
}

.step-tab.current .step-number {
  background: #176b2c;
  color: #fff;
}

.step-tab.done .step-number {
  background: #16a34a;
  color: #fff;
}

.step-tab strong {
  display: block;
  font-size: 13px;
}

.step-tab span {
  display: block;
  color: #6f746b;
  font-size: 11px;
  line-height: 1.5;
  margin-top: 3px;
}

.wizard-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  align-items: start;
}

.wizard-main {
  display: grid;
  gap: 16px;
}

.card {
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7df;
}

.section-icon {
  width: 50px;
  height: 50px;
  border-radius: 18px;
  background: #176b2c;
  color: #fff;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.section-header h2 {
  margin: 0;
  font-size: 22px;
}

.section-header p {
  margin: 5px 0 0;
  color: #6f746b;
  line-height: 1.7;
  font-size: 13px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-grid.compact-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field,
.choice-section {
  display: grid;
  gap: 8px;
}

.field.wide,
.choice-section.wide {
  grid-column: 1 / -1;
}

.field span,
.choice-title {
  font-size: 13px;
  font-weight: 900;
}

.field input,
.field textarea,
.field select,
.product-picker-row select {
  width: 100%;
  border: 1px solid #e4e7df;
  border-radius: 16px;
  background: #fff;
  color: #1f241d;
  outline: none;
  font-family: inherit;
}

.field input,
.field select,
.product-picker-row select {
  min-height: 46px;
  padding: 0 13px;
}

.field textarea {
  min-height: 120px;
  resize: vertical;
  padding: 13px;
  line-height: 1.8;
}

.field small {
  color: #6f746b;
  font-size: 11px;
}

.product-picker-field {
  grid-column: 1 / -1;
}

.product-picker-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.quick-product-box {
  grid-column: 1 / -1;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 20px;
  padding: 14px;
}

.quick-product-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.quick-product-header strong {
  font-size: 15px;
}

.quick-product-header button {
  width: 34px;
  height: 34px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.choice-row button {
  min-height: 38px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 16px;
  padding: 0 13px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.choice-row button.selected {
  border-color: #176b2c;
  background: #eef7e9;
  color: #176b2c;
}

.store-plan-suggestions {
  grid-column: 1 / -1;
  border: 1px solid #d9ead7;
  background: #eef7e9;
  border-radius: 20px;
  padding: 14px;
}

.suggestion-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.suggestion-head h3 {
  margin: 0;
  font-size: 16px;
}

.suggestion-head p,
.store-plan-suggestions small {
  display: block;
  margin-top: 5px;
  color: #52604c;
  line-height: 1.7;
  font-size: 12px;
  font-weight: 800;
}

.saved-flow-card {
  border: 1px solid #d9ead7;
  background: #eef7e9;
  border-radius: 18px;
  padding: 12px;
  margin-top: 12px;
}

.saved-flow-card .notice {
  margin: 0 0 10px;
}

.saved-flow-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.asset-step-header {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 14px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.asset-step-header span {
  color: #6f746b;
  font-size: 13px;
  font-weight: 900;
}

.asset-readiness-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.asset-readiness-summary.compact {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-bottom: 8px;
}

.asset-info-cell {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 14px;
  padding: 10px;
}

.asset-info-cell span,
.asset-info-cell strong {
  display: block;
}

.asset-info-cell span {
  color: #6f746b;
  font-size: 11px;
  font-weight: 900;
}

.asset-info-cell strong {
  margin-top: 5px;
  color: #25301f;
  font-size: 12px;
  line-height: 1.6;
}

.asset-selection-section {
  margin-bottom: 16px;
}

.asset-section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.asset-section-title h3 {
  margin: 0;
  font-size: 15px;
}

.asset-select-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.asset-select-card {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 18px;
  padding: 13px;
  text-align: right;
  display: grid;
  gap: 8px;
  font-family: inherit;
  cursor: pointer;
}

.asset-select-card.selected {
  border-color: #176b2c;
  background: #fbfdf9;
  box-shadow: 0 0 0 4px #eef7e9;
}

.asset-select-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #176b2c;
  background: #eef7e9;
}

.asset-select-card strong {
  font-size: 13px;
  line-height: 1.5;
}

.asset-select-card > span {
  color: #6f746b;
  font-size: 12px;
}

.asset-select-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.upload-box {
  min-height: 140px;
  border: 1px dashed #9fd0a6;
  background: #eef7e9;
  color: #176b2c;
  border-radius: 20px;
  padding: 16px;
  display: grid;
  place-items: center;
  text-align: center;
  align-content: center;
  gap: 8px;
}

.upload-box strong,
.upload-box span {
  display: block;
}

.upload-box span {
  color: #4b6b52;
  font-size: 12px;
}

.notice {
  grid-column: 1 / -1;
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 16px;
  line-height: 1.8;
  font-size: 13px;
  font-weight: 800;
}

.notice.neutral {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  color: #1f241d;
}

.notice.amber {
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #92400e;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.metric {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #166534;
  border-radius: 18px;
  padding: 14px;
}

.metric.amber {
  border-color: #fde68a;
  background: #fff7e6;
  color: #92400e;
}

.metric span,
.metric strong {
  display: block;
}

.metric span {
  font-size: 12px;
  font-weight: 900;
}

.metric strong {
  margin-top: 6px;
  font-size: 22px;
}

.brief-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.brief-row {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  padding: 12px;
}

.brief-row span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.brief-row strong {
  display: block;
  margin-top: 6px;
  line-height: 1.6;
}

.readiness-layout {
  display: grid;
  gap: 16px;
}

.output-explanation-list {
  display: grid;
  gap: 14px;
}

.output-card {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 20px;
  padding: 14px;
}

.output-card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.output-card-header strong {
  display: block;
}

.output-card-header span {
  color: #6f746b;
  font-size: 12px;
}

.customer-output,
.internal-output {
  border-radius: 16px;
  padding: 12px;
  margin-top: 10px;
}

.customer-output {
  background: #eef7e9;
  border: 1px solid #d9ead7;
}

.internal-output {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.customer-output h4,
.internal-output h4 {
  margin: 0 0 8px;
  font-size: 13px;
}

.customer-output p,
.internal-output p {
  margin: 0;
  line-height: 1.8;
  font-size: 13px;
}

.internal-output p {
  font-family: monospace;
  color: #475569;
  letter-spacing: 1px;
}

.internal-output small {
  display: block;
  margin-top: 8px;
  color: #92400e;
  font-size: 11px;
  font-weight: 800;
}

.output-footer {
  margin-top: 10px;
  color: #6f746b;
  font-size: 11px;
}

.smart-panel {
  position: sticky;
  top: 96px;
}

.smart-box {
  background: #eef7e9;
}

.smart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #176b2c;
  margin-bottom: 14px;
}

.smart-title h3 {
  margin: 0;
}

.tips-list {
  display: grid;
  gap: 10px;
}

.tip {
  display: flex;
  gap: 10px;
  background: white;
  border-radius: 16px;
  padding: 12px;
}

.tip span {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #eef7e9;
  color: #176b2c;
  font-size: 12px;
  font-weight: 900;
  flex: 0 0 auto;
}

.tip p {
  margin: 0;
  color: #1f241d;
  line-height: 1.7;
  font-size: 13px;
}

.smart-summary {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.smart-summary div {
  background: white;
  border-radius: 16px;
  padding: 12px;
}

.smart-summary span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.smart-summary strong {
  display: block;
  margin-top: 5px;
}

.footer-bar {
  position: sticky;
  bottom: 16px;
  z-index: 10;
  margin-top: 18px;
  padding: 14px;
  display: grid;
  grid-template-columns: auto minmax(220px, 1fr) auto;
  gap: 12px;
  align-items: center;
  backdrop-filter: blur(16px);
}

.footer-progress {
  display: grid;
  gap: 7px;
  text-align: center;
  color: #176b2c;
  font-size: 13px;
}

.footer-progress span {
  height: 7px;
  background: #eef7e9;
  border-radius: 999px;
  overflow: hidden;
}

.footer-progress i {
  display: block;
  height: 100%;
  background: #176b2c;
  border-radius: inherit;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.button {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 16px;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.button.primary {
  background: #176b2c;
  color: white;
}

.button.secondary {
  background: white;
  color: #1f241d;
  border: 1px solid #e4e7df;
}

.button.compact {
  min-height: 38px;
  padding: 0 12px;
  font-size: 12px;
}

.button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 1180px) {
  .step-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .wizard-layout {
    grid-template-columns: 1fr;
  }

  .smart-panel {
    position: static;
  }

  .upload-grid,
  .asset-readiness-summary,
  .asset-select-grid,
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .campaign-wizard-page {
    padding: 16px;
  }

  .page-title,
  .footer-bar {
    grid-template-columns: 1fr;
  }

  .page-title {
    flex-direction: column;
  }

  .page-title h1 {
    font-size: 27px;
  }

  .step-tabs,
  .form-grid,
  .form-grid.compact-grid,
  .upload-grid,
  .asset-readiness-summary,
  .asset-select-grid,
  .metrics-grid,
  .brief-grid {
    grid-template-columns: 1fr;
  }

  .product-picker-row {
    grid-template-columns: 1fr;
  }

  .footer-actions,
  .button-row {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }
}

.screen-guidance-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.screen-guidance-card div {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  padding: 10px;
}

.screen-guidance-card span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.screen-guidance-card strong {
  display: block;
  margin-top: 5px;
  color: #1f241d;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 1280px) {
  .screen-guidance-card { grid-template-columns: 1fr; }
}
`;
