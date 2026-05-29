// Prototype-only static fixture. No side effects. No imports from pages.
// Option arrays for interactive context selection in Creator Studio.

export const ctxContentIdeas = [
  { id: "ci1", label: "5 أدوات AI يومية وفّرت 3 ساعات", type: "Reel", platform: "Instagram" },
  { id: "ci2", label: "روتين صباح إنتاجي في 20 دقيقة", type: "Reel", platform: "TikTok" },
  { id: "ci3", label: "Notion vs Trello للمرأة العاملة", type: "Carousel", platform: "Instagram" },
  { id: "ci4", label: "خلف الكاميرا — يومي الحقيقي", type: "Reel BTS", platform: "TikTok" },
];

export const ctxCampaignAngles = [
  { id: "ca1", label: "أدوات AI للمرأة العاملة", audience: "نساء 25–34 — موظفات" },
  { id: "ca2", label: "التوازن بين العمل والحياة", audience: "نساء 18–34" },
  { id: "ca3", label: "التعليم التقني بالعربية", audience: "جمهور عربي واسع" },
];

export const ctxAudienceSegments = [
  { id: "as1", label: "نساء 25–34 — موظفات وصاحبات مشاريع" },
  { id: "as2", label: "نساء 18–24 — طالبات وخريجات" },
  { id: "as3", label: "مختلط 35+ — مهنيون متمرسون" },
];

export const ctxPublishWindows = [
  { id: "pw1", label: "الأحد 20:00–22:00", note: "ذروة الأسبوع" },
  { id: "pw2", label: "الثلاثاء 18:00–20:00", note: "وقت قوي" },
  { id: "pw3", label: "الجمعة 13:00–15:00", note: "متوسط — بعد صلاة الجمعة" },
];

export const ctxGovernanceTemplates = [
  { id: "gt1", label: "تعليمي عربي — نبرة عملية مباشرة" },
  { id: "gt2", label: "إلهامي — نبرة دافئة وشخصية" },
  { id: "gt3", label: "تحليلي — نبرة موضوعية مقارنة" },
];

export const productionReadinessChecklist = [
  { id: "pr1", label: "عقد API للمنصة",             note: "قابل للربط لاحقًا",          status: "pending" },
  { id: "pr2", label: "سياسة موافقة البيانات",      note: "مطلوب قبل الإنتاج",           status: "pending" },
  { id: "pr3", label: "مراجعة بشرية للمحتوى",      note: "مطلوب دائمًا قبل أي نشر",    status: "required" },
  { id: "pr4", label: "حوكمة المطالبات معتمدة",    note: "مطلوب قبل النشر التلقائي",    status: "pending" },
  { id: "pr5", label: "نموذج ثقة البيانات",         note: "مطلوب قبل الإنتاج",           status: "pending" },
  { id: "pr6", label: "امتثال سياسات المنصة",      note: "مطلوب في كل دورة نشر",        status: "required" },
];
