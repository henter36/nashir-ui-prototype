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
  "نص إعلان",
  "منشور اجتماعي",
  "Caption",
  "Story",
  "Carousel",
  "Reel قصير",
  "صورة إعلانية",
  "فيديو قصير",
  "صفحة هبوط",
  "Email",
  "WhatsApp",
  "بريد تسويقي",
  "رسالة واتساب",
  "ملخص حملة",
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

const productRefKey = ["product", "Id"].join("");
const assetRefKey = ["asset", "Id"].join("");

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function buildAssetSnapshot(asset = {}) {
  return {
    name: asset.name || "أصل غير محدد",
    type: asset.type || "image",
    linkedProductId: asset.linkedProductId || "",
    linkedName: asset.linkedName || "عام",
    rightsStatus: asset.rightsStatus || "needs_check",
    usage: Array.isArray(asset.usage) ? asset.usage : [],
    status: asset.status || "review",
  };
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

function buildSuggestedCampaignText({ productName, goal, offer, audience, cta, channels, assets }) {
  if (!productName || !offer || !audience) {
    return "أكمل بيانات المنتج والعرض والجمهور لظهور نص مقترح أوضح.";
  }

  const channelText = channels.length ? channels.join("، ") : "القنوات المختارة";
  const assetText = assets.length ? ` بالاعتماد على ${assets.slice(0, 2).map((asset) => asset.name).join("، ")}` : "";

  return `اكتشف ${productName} مع ${offer} يناسب ${audience}. حملة ${goal} على ${channelText}${assetText}. ${cta || "تسوق الآن"}.`;
}

function getApprovalLabel(status) {
  if (status === "approved") return "معتمد";
  if (status === "needs_edit") return "يحتاج تعديل";
  return "غير معتمد";
}

function getOutputTypeLabel(output) {
  const value = String(output || "");
  if (value.includes("صفحة هبوط")) return "صفحة هبوط";
  if (value.includes("فيديو") || value.includes("Reel")) return "سيناريو فيديو";
  if (value.includes("صورة") || value.includes("Story") || value.includes("Carousel")) return "وصف صورة / أصل بصري";
  if (value.includes("WhatsApp") || value.includes("واتساب")) return "رسالة واتساب";
  if (value.includes("Email") || value.includes("بريد")) return "بريد تسويقي";
  if (value.includes("منشور") || value.includes("Caption")) return "منشور اجتماعي";
  if (value.includes("ملخص")) return "ملخص حملة";
  if (value.includes("نص")) return "نص إعلان";
  return "مخرج آخر";
}

function buildMockOutputArtifact({ output, productName, goal, offer, cta, channels, selectedAssets, videoDuration, textApproved }) {
  const type = getOutputTypeLabel(output);
  const channelText = channels.length ? channels.join("، ") : "غير محدد";
  const assetText = selectedAssets.length ? selectedAssets.map((asset) => asset.name).join("، ") : "أصول مقترحة لاحقًا";
  const reviewRequired = type !== "ملخص حملة";
  const readiness = textApproved ? "جاهز كمخرج تجريبي للمراجعة" : "مسودة بانتظار اعتماد النص المقترح";
  const summary = `${type} لمنتج ${productName || "غير محدد"} يركز على ${goal || "هدف الحملة"} مع عرض ${offer || "غير محدد"} ودعوة ${cta || "غير محددة"}.`;

  if (type === "صفحة هبوط") {
    return {
      type,
      channelText,
      summary,
      readiness,
      reviewRequired,
      helper: "صفحة الهبوط هنا تصور واجهي فقط، وليست صفحة منشورة.",
      details: [
        ["عنوان الصفحة", `${productName || "المنتج"} لعرض ${offer || "الحملة"}`],
        ["الوعد الرئيسي", "حل واضح وسريع مع دعوة إجراء مباشرة."],
        ["أقسام الصفحة", "العرض، فوائد المنتج، الأصول، الأسئلة الشائعة، CTA"],
        ["CTA", cta || "تسوق الآن"],
        ["الأصول المقترحة", assetText],
        ["حالة المراجعة", reviewRequired ? "تحتاج مراجعة" : "لا تحتاج مراجعة"],
      ],
    };
  }

  if (type === "سيناريو فيديو") {
    return {
      type,
      channelText,
      summary,
      readiness,
      reviewRequired,
      helper: "الفيديو هنا سيناريو تجريبي فقط، ولا يتم توليد فيديو فعلي.",
      details: [
        ["الفكرة", `إظهار ${productName || "المنتج"} في موقف استخدام سريع.`],
        ["المشهد الأول", "لقطة المشكلة أو الحاجة خلال أول ثانيتين."],
        ["المشهد الثاني", "عرض المنتج والحل مع إبراز الأصل المختار."],
        ["النص الصوتي / التعليق", `منتج عملي لعرض ${offer || "واضح"} مع دعوة ${cta || "مباشرة"}.`],
        ["CTA", cta || "تسوق الآن"],
        ["مدة مقترحة", videoDuration || "15 ثانية"],
      ],
    };
  }

  return {
    type,
    channelText,
    summary,
    readiness,
    reviewRequired,
    helper: "",
    details: [
      ["ملخص المخرج", summary],
      ["الأصول المقترحة", assetText],
      ["القنوات المرتبطة", channelText],
      ["حالة المراجعة", reviewRequired ? "تحتاج مراجعة" : "لا تحتاج مراجعة"],
    ],
  };
}

export default function CampaignWizardPage({
  onOpenCampaign = () => {},
  onOpenContentStudio = () => {},
  onOpenReviewPreview = () => {},
  campaignOrigin = null,
  onNavigate = null,
} = {}) {
  const [step, setStep] = useState(1);
  const [starterNotice, setStarterNotice] = useState("");
  const [showStarterPanel, setShowStarterPanel] = useState(true);

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
    category: "",
    url: "",
    price: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
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
  const [textApprovalStatus, setTextApprovalStatus] = useState("unapproved");
  const [outputApprovalStatus, setOutputApprovalStatus] = useState({});
  const [campaignGenerated, setCampaignGenerated] = useState(false);
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
  const suggestedCampaignText = useMemo(
    () =>
      buildSuggestedCampaignText({
        productName: selectedProduct?.name,
        goal,
        offer,
        audience: `${ageGroup || "غير محدد"} · ${gender || "الكل"}`,
        cta,
        channels,
        assets: selectedAssets,
      }),
    [ageGroup, channels, cta, gender, goal, offer, selectedAssets, selectedProduct?.name]
  );
  const textApproved = textApprovalStatus === "approved";
  const approvedOutputCount = outputs.filter((output) => outputApprovalStatus[output] === "approved").length;
  const outputsNeedingEditCount = outputs.filter((output) => outputApprovalStatus[output] === "needs_edit").length;
  const campaignOutputReadiness = !textApproved
    ? "النص الأساسي لم يعتمد بعد."
    : outputs.length && approvedOutputCount === outputs.length
      ? "الحملة جاهزة للمراجعة النهائية."
      : "الحملة غير جاهزة — توجد مخرجات غير معتمدة.";

  const addQuickProduct = () => {
    if (!quickProduct.name.trim()) return;

    const product = {
      id: `p-${Date.now()}`,
      name: quickProduct.name,
      category: quickProduct.category,
      url: quickProduct.url,
      price: quickProduct.price,
      description: quickProduct.description,
      imageUrl: quickProduct.imageUrl,
      videoUrl: quickProduct.videoUrl,
    };

    const nextProducts = upsertProduct(product, initialProducts);
    setProducts(nextProducts);
    setSelectedProductKey(product.id);
    setQuickProduct({ name: "", category: "", url: "", price: "", description: "", imageUrl: "", videoUrl: "" });
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
      [assetRefKey]: `wiz-asset-${Date.now()}`,
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
    setCampaignGenerated(true);
  };

  const next = () => {
    if (step < 5) setStep((current) => current + 1);
  };

  const back = () => {
    if (step > 1) setStep((current) => current - 1);
  };

  const saveCampaignDraft = () => {
    if (!canGenerate) return;
    setCampaignGenerated(true);

    const campaignId = `campaign_${Date.now()}`;
    const productSnapshot = selectedProduct
      ? {
          name: selectedProduct.name || "غير محدد",
          price: selectedProduct.price || "",
          category: selectedProduct.category || "",
          imageUrl: selectedProduct.imageUrl || "",
          readiness: selectedProduct.readiness ?? "",
        }
      : null;
    const campaignSnapshot = {
      name: campaignName,
      goal,
      status: "draft",
      product: productSnapshot?.name || selectedProduct?.name || "غير محدد",
    };
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
      [productRefKey]: selectedProduct?.id || "",
      productSnapshot,
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
        [assetRefKey]: asset[assetRefKey] || asset.id || "",
        assetSnapshot: buildAssetSnapshot(asset),
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
          campaignId,
          campaignSnapshot,
          [productRefKey]: selectedProduct?.id || "",
          productSnapshot,
          approval: "needs_review",
          risk: "medium",
          metadata: {
            campaignId,
            [productRefKey]: selectedProduct?.id || "",
            campaignSnapshot,
            productSnapshot,
            selectedAssets: selectedAssets.map((asset) => ({
              [assetRefKey]: asset[assetRefKey] || asset.id || "",
              assetSnapshot: buildAssetSnapshot(asset),
            })),
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

      {campaignOrigin === "product-intelligence" && showStarterPanel ? (
        <section className="product-intelligence-context-panel">
          <div className="section-title-row">
            <div>
              <h2>بداية حملة من تحليل المنتج</h2>
              <p>
                هذه بطاقة تجريبية توضّح كيف يمكن لاحقًا تحويل تحليل المنتج إلى مدخلات حملة.
                لا يتم إنشاء حملة فعلية أو تمرير بيانات محفوظة في هذا النموذج.
              </p>
            </div>
            <div className="context-badges">
              <Badge tone="blue">Prototype</Badge>
              <Badge tone="neutral">لا يوجد إنشاء فعلي</Badge>
              <Badge tone="neutral">لا يوجد تمرير بيانات</Badge>
            </div>
          </div>

          <div className="starter-section">
            <h3>ملخص المنتج المصغر</h3>
            <div className="starter-summary-grid">
              <div><span>المنتج التجريبي</span><strong>هدية نباتية مكتبية</strong></div>
              <div><span>الفئة</span><strong>هدايا / ديكور مكتبي</strong></div>
              <div><span>نقطة البيع</span><strong>منتج جاهز للإهداء والاستخدام اليومي</strong></div>
              <div><span>حالة البيانات</span><strong>Demo فقط</strong></div>
            </div>
          </div>

          <div className="starter-section">
            <h3>اتجاه الحملة المقترح</h3>
            <div className="context-preview-grid">
              <div><span>هدف مقترح</span><strong>اختبار قابلية بيع المنتج</strong></div>
              <div><span>جمهور مقترح</span><strong>المهتمون بالهدايا والمنتجات العملية</strong></div>
              <div><span>زاوية رسالة</span><strong>هدية بسيطة تبقى على المكتب</strong></div>
              <div><span>مخاطرة يجب اختبارها</span><strong>وضوح الخامة والسعر قبل الإعلان</strong></div>
            </div>
          </div>

          <div className="starter-lists-grid">
            <div className="starter-list-card">
              <h3>ما الذي سيُستخدم لاحقًا؟</h3>
              <ul>
                <li>ملخص المنتج</li>
                <li>زوايا الإعلان</li>
                <li>توصيات التطوير</li>
                <li>تقويم 7 أيام</li>
                <li>مصفوفة المخاطر والفرص</li>
              </ul>
            </div>
            <div className="starter-list-card muted">
              <h3>ما الذي لا يحدث الآن؟</h3>
              <ul>
                <li>لا إنشاء حملة فعلية</li>
                <li>لا حفظ بيانات</li>
                <li>لا تمرير بيانات حقيقية</li>
                <li>لا اتصال API</li>
                <li>لا اعتماد توصيات الموردين</li>
              </ul>
            </div>
          </div>

          <div className="starter-actions">
            <button
              type="button"
              className="button primary"
              onClick={() => {
                setShowStarterPanel(false);
                setStarterNotice("يمكنك متابعة إعداد الحملة يدويًا في النموذج التجريبي.");
              }}
            >
              متابعة إعداد الحملة
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                if (typeof onNavigate === "function") {
                  onNavigate("productIntelligence");
                  return;
                }
                setStarterNotice("العودة لتحليل المنتج غير متاحة من هذه الصفحة حاليًا.");
              }}
            >
              العودة لتحليل المنتج
            </button>
          </div>
        </section>
      ) : null}

      {starterNotice ? <p className="context-demo-note starter-notice-outside">{starterNotice}</p> : null}

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
                        label="التصنيف"
                        value={quickProduct.category}
                        onChange={(value) => setQuickProduct((prev) => ({ ...prev, category: value }))}
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
                      <FileField
                        label="إرفاق صورة"
                        accept="image/*"
                        value={quickProduct.imageUrl}
                        onFile={(file) => setQuickProduct((prev) => ({ ...prev, imageUrl: file ? `إرفاق تجريبي: ${file.name}` : prev.imageUrl }))}
                      />
                      <FileField
                        label="إرفاق فيديو"
                        accept="video/*"
                        value={quickProduct.videoUrl}
                        onFile={(file) => setQuickProduct((prev) => ({ ...prev, videoUrl: file ? `إرفاق تجريبي: ${file.name}` : prev.videoUrl }))}
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
                  <small>تحفظ الحملة معرف المنتج ونسخة من بيانات المنتج وقت الإنشاء كمرجع واجهي. لا يتم تعديل المنتج أو الخطة تلقائيًا.</small>
                  <small>عند استخدام الأصل في حملة، تحفظ الحملة نسخة من بيانات الأصل وقت الاختيار.</small>
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
                <FileField
                  label={assetDraft.type === "video" ? "إرفاق فيديو" : "إرفاق صورة"}
                  accept={assetDraft.type === "video" ? "video/*" : "image/*"}
                  value={assetDraft.url}
                  onFile={(file) => setAssetDraft((prev) => ({ ...prev, url: file ? `إرفاق تجريبي: ${file.name}` : prev.url }))}
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
                title="الخطوة 3: العرض والجمهور"
                description="العرض ودعوة الإجراء والفئة والعمر. القنوات جزء من المخرجات المطلوبة وليست من تعريف الجمهور."
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
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <SectionHeader
                icon={FileText}
                title="الخطوة 4: المخرجات المطلوبة"
                description="القنوات جزء من المخرجات المطلوبة وليست من تعريف الجمهور."
              />

              <MultiChoice
                title="المخرجات المطلوبة"
                options={outputOptions}
                selected={outputs}
                setSelected={setOutputs}
              />
              <MultiChoice
                title="القنوات"
                options={channelOptions}
                selected={channels}
                setSelected={setChannels}
              />

              <div className="form-grid">
                <Info label="نوع المخرج" value={outputs.join("، ") || "غير محدد"} />
                <Info label="القنوات" value={channels.join("، ") || "غير محدد"} />
                <ChoiceGroup
                  title="الصيغة / التنسيق إن وجد"
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
                <Info label="CTA إن وجد" value={cta || "غير محدد"} />
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

                <div className="approval-sequence-strip">
                  <span>1. اعتماد النص الأساسي</span>
                  <span>2. توليد المخرجات المطلوبة</span>
                  <span>3. مراجعة المخرجات</span>
                </div>

                <div className="suggested-text-approval-card">
                  <div className="approval-card-head">
                    <div>
                      <h3>اعتماد النص الأساسي</h3>
                      <p>الاعتماد هنا واجهي فقط، ولا يرسل الحملة للنشر.</p>
                    </div>
                    <Badge tone={textApproved ? "green" : textApprovalStatus === "needs_edit" ? "amber" : "neutral"}>
                      {getApprovalLabel(textApprovalStatus)}
                    </Badge>
                  </div>
                  <div className="suggested-campaign-text">
                    <span>النص الأساسي للحملة</span>
                    <strong>{suggestedCampaignText}</strong>
                  </div>
                  <div className="asset-readiness-summary compact">
                    <Info label="حالة اعتماد النص الأساسي" value={getApprovalLabel(textApprovalStatus)} />
                    <Info label="تأثير الجاهزية" value={textApproved ? "النص الأساسي معتمد." : "النص الأساسي لم يعتمد بعد."} />
                  </div>
                  <div className="button-row compact">
                    <button type="button" className="button primary" onClick={() => setTextApprovalStatus("approved")}>
                      اعتماد النص الأساسي
                    </button>
                    <button type="button" className="button secondary" onClick={() => setTextApprovalStatus("needs_edit")}>
                      طلب تعديل النص
                    </button>
                  </div>
                  {!textApproved ? (
                    <Notice tone="amber">النص الأساسي لم يعتمد بعد. اعتماد النص الأساسي مطلوب قبل اعتبار المخرجات جاهزة.</Notice>
                  ) : (
                    <Notice tone="neutral">النص الأساسي معتمد.</Notice>
                  )}
                </div>

                <div className="output-approval-summary-card">
                  <h3>مراجعة مخرجات الحملة</h3>
                  <p>اعتماد النص الأساسي لا يعني اعتماد كل المخرجات. يجب مراجعة كل مخرج مطلوب قبل اعتبار الحملة جاهزة.</p>
                  <div className="asset-readiness-summary compact">
                    <Info label="عدد المخرجات المطلوبة" value={String(outputs.length)} />
                    <Info label="عدد المخرجات المعتمدة" value={String(approvedOutputCount)} />
                    <Info label="عدد المخرجات التي تحتاج تعديل" value={String(outputsNeedingEditCount)} />
                    <Info label="حالة جاهزية الحملة" value={campaignOutputReadiness} />
                  </div>
                  <Notice tone={textApproved && outputs.length && approvedOutputCount === outputs.length ? "neutral" : "amber"}>
                    {campaignOutputReadiness}
                  </Notice>
                </div>

                <div className="brief-grid">
                  {briefRows.map(([label, value]) => (
                    <BriefRow key={label} label={label} value={value} />
                  ))}
                </div>

                <Notice tone="amber">
                  مخرجات تجريبية — لا يوجد استدعاء نموذج ذكاء اصطناعي حقيقي. تظهر هنا نتيجة التوليد الواجهية حتى لا تبدو الحملة محفوظة بصمت.
                </Notice>

                <div className="asset-readiness-summary compact">
                  <Info label="المنتج" value={selectedProduct?.name || "غير محدد"} />
                  <Info label="القنوات" value={channels.join("، ") || "غير محدد"} />
                  <Info label="الأصول المختارة" value={selectedAssets.length ? selectedAssets.map((asset) => asset.name).join("، ") : "لم يتم اختيار أصول"} />
                  <Info label="المخرجات المطلوبة" value={outputs.join("، ") || "غير محدد"} />
                </div>

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
                <h3 className="section-mini-title">مراجعة مخرجات الحملة</h3>
                <Notice tone="amber">مخرجات تجريبية — لا يوجد استدعاء نموذج ذكاء اصطناعي حقيقي.</Notice>
                <Badge tone={campaignGenerated ? "green" : "neutral"}>
                  {campaignGenerated ? "تم عرض مخرجات تجريبية" : "مسودات قابلة للمراجعة"}
                </Badge>

                <div className="output-explanation-list">
                  {!outputs.length ? (
                    <Notice tone="amber">لم يتم اختيار مخرجات مطلوبة بعد. أضف مخرجًا واحدًا على الأقل لمراجعة الجاهزية.</Notice>
                  ) : null}

                  {outputs.map((output) => {
                    const outputStatus = outputApprovalStatus[output] || "unapproved";
                    const outputApproved = outputStatus === "approved";
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
                    const artifact = buildMockOutputArtifact({
                      output,
                      productName: selectedProduct?.name || "المنتج",
                      goal,
                      offer,
                      cta,
                      channels,
                      selectedAssets,
                      videoDuration,
                      textApproved: textApproved && outputApproved,
                    });
                    const outputReadiness = !textApproved
                      ? "مسودة بانتظار اعتماد النص الأساسي"
                      : outputApproved
                        ? "معتمد كمخرج تجريبي للمراجعة"
                        : outputStatus === "needs_edit"
                          ? "يحتاج تعديل"
                          : "غير معتمد";

                    return (
                      <div key={output} className="output-card">
                        <div className="output-card-header">
                          <div>
                            <strong>{artifact.type}</strong>
                            <span>{output}</span>
                          </div>
                          <Badge tone={outputApproved ? "green" : outputStatus === "needs_edit" ? "amber" : "neutral"}>
                            {getApprovalLabel(outputStatus)}
                          </Badge>

                          <button
                            type="button"
                            className="button secondary compact"
                            onClick={() => regenerateOutputText(output)}
                          >
                            <RefreshCw size={14} />
                            إعادة توليد النص
                          </button>
                        </div>

                        <div className="generated-artifact-grid">
                          <Info label="نوع المخرج" value={artifact.type} />
                          <Info label="القنوات المرتبطة" value={artifact.channelText} />
                          <Info label="ملخص المخرج" value={artifact.summary} />
                          <Info label="حالة الجاهزية" value={outputReadiness} />
                          <Info label="يحتاج مراجعة؟" value={artifact.reviewRequired ? "نعم" : "لا"} />
                        </div>

                        <div className="output-approval-actions">
                          <Info label="حالة اعتماد المخرج" value={getApprovalLabel(outputStatus)} />
                          <button
                            type="button"
                            className="button primary compact"
                            onClick={() => setOutputApprovalStatus((prev) => ({ ...prev, [output]: "approved" }))}
                          >
                            اعتماد هذا المخرج
                          </button>
                          <button
                            type="button"
                            className="button secondary compact"
                            onClick={() => setOutputApprovalStatus((prev) => ({ ...prev, [output]: "needs_edit" }))}
                          >
                            طلب تعديل هذا المخرج
                          </button>
                        </div>

                        {artifact.details.length ? (
                          <div className="generated-output-detail-grid">
                            {artifact.details.map(([label, value]) => (
                              <Info key={label} label={label} value={value} />
                            ))}
                          </div>
                        ) : null}

                        {artifact.helper ? <Notice tone="neutral">{artifact.helper}</Notice> : null}

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

function FileField({ label, accept, value, onFile }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="file" accept={accept} onChange={(event) => onFile(event.target.files?.[0] || null)} />
      <small>{value || "إرفاق تجريبي داخل النموذج الأولي — لا يوجد رفع فعلي للملفات."}</small>
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

.badge.amber {
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
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

.approval-sequence-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 16px 0;
}

.approval-sequence-strip span {
  border: 1px solid #d9ead7;
  background: #eef7e9;
  color: #176b2c;
  border-radius: 16px;
  padding: 10px;
  text-align: center;
  font-size: 12px;
  font-weight: 950;
}

.suggested-text-approval-card {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 20px;
  padding: 14px;
  margin-bottom: 16px;
}

.output-approval-summary-card {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 20px;
  padding: 14px;
  margin-bottom: 16px;
}

.output-approval-summary-card h3 {
  margin: 0;
  font-size: 17px;
}

.output-approval-summary-card p {
  margin: 6px 0 12px;
  color: #6f746b;
  line-height: 1.7;
  font-size: 12px;
  font-weight: 800;
}

.approval-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.approval-card-head h3 {
  margin: 0;
  font-size: 17px;
}

.approval-card-head p {
  margin: 5px 0 0;
  color: #6f746b;
  line-height: 1.7;
  font-size: 12px;
}

.suggested-campaign-text {
  border: 1px solid #d9ead7;
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 12px;
}

.suggested-campaign-text span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.suggested-campaign-text strong {
  display: block;
  margin-top: 6px;
  line-height: 1.8;
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

.generated-artifact-grid,
.generated-output-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.output-approval-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
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
  .metrics-grid,
  .approval-sequence-strip,
  .output-approval-actions,
  .generated-artifact-grid,
  .generated-output-detail-grid {
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
  .approval-sequence-strip,
  .output-approval-actions,
  .generated-artifact-grid,
  .generated-output-detail-grid,
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

.product-intelligence-context-panel {
  background: #fff;
  border: 1px solid #bfdbfe;
  border-radius: 24px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
  padding: 16px;
  margin-bottom: 16px;
}

.product-intelligence-context-panel .section-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.product-intelligence-context-panel h2 {
  margin: 0;
  font-size: 20px;
}

.product-intelligence-context-panel p {
  margin: 7px 0 0;
  color: #6f746b;
  line-height: 1.8;
  font-size: 13px;
}

.context-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.starter-section {
  margin-top: 14px;
}

.starter-section h3,
.starter-list-card h3 {
  margin: 0 0 10px;
  font-size: 15px;
}

.context-preview-grid,
.starter-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.starter-lists-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.context-preview-grid div,
.starter-summary-grid div,
.starter-list-card {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  border-radius: 16px;
  padding: 10px;
}

.starter-summary-grid div {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.starter-list-card.muted {
  background: #fff7ed;
  border-color: #fed7aa;
}

.context-preview-grid span,
.starter-summary-grid span {
  display: block;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 900;
}

.starter-summary-grid span {
  color: #475569;
}

.context-preview-grid strong,
.starter-summary-grid strong {
  display: block;
  margin-top: 5px;
  line-height: 1.6;
  font-size: 13px;
}

.starter-list-card ul {
  margin: 0;
  padding-right: 18px;
  color: #334155;
  line-height: 1.9;
  font-size: 13px;
}

.starter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.context-demo-note {
  font-weight: 900;
}

.starter-notice-outside {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 16px;
  color: #9a3412;
  line-height: 1.7;
  margin: 0 0 16px;
  padding: 10px 12px;
}

@media (max-width: 1280px) {
  .screen-guidance-card,
  .context-preview-grid,
  .starter-summary-grid,
  .starter-lists-grid { grid-template-columns: 1fr; }

  .product-intelligence-context-panel .section-title-row {
    display: grid;
  }

  .context-badges {
    justify-content: flex-start;
  }
}
`;
