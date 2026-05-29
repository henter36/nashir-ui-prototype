// Prototype-only static fixture. No side effects. No imports from pages.
// These objects describe what context would hypothetically be passed to each
// destination if the flow were real — for UI display only.

export const creatorStudioDestinationMapping = [
  {
    id: "dm1",
    destination: "استوديو المحتوى",
    screen: "content",
    fields: [
      { id: "dm1f1", label: "الفكرة المختارة", value: "5 أدوات AI تستخدمها كل يوم — وكيف وفّرت 3 ساعات" },
      { id: "dm1f2", label: "النوع والمنصة", value: "Reel تعليمي — Instagram" },
      { id: "dm1f3", label: "النبرة المقترحة", value: "عملي ومباشر — محتوى قابل للتطبيق الفوري" },
    ],
  },
  {
    id: "dm2",
    destination: "معالج الحملات",
    screen: "campaigns",
    fields: [
      { id: "dm2f1", label: "زاوية الحملة", value: "أدوات الذكاء الاصطناعي للمرأة العاملة" },
      { id: "dm2f2", label: "الجمهور المقترح", value: "نساء 25–34 — موظفات وصاحبات مشاريع" },
      { id: "dm2f3", label: "القناة والتوقيت", value: "Instagram — ذروة الأحد 20:00–22:00" },
    ],
  },
  {
    id: "dm3",
    destination: "جدولة النشر",
    screen: "publishingQueue",
    fields: [
      { id: "dm3f1", label: "نافذة النشر", value: "الأحد 20:00–22:00 — ذروة الأسبوع" },
      { id: "dm3f2", label: "التكرار المقترح", value: "Reel يوم الأحد + Story يوم الاثنين" },
      { id: "dm3f3", label: "المنصة", value: "Instagram" },
    ],
  },
  {
    id: "dm4",
    destination: "حوكمة المطالبات",
    screen: "promptGovernance",
    fields: [
      { id: "dm4f1", label: "القالب المقترح", value: "محتوى تعليمي عربي — نبرة عملية مباشرة" },
      { id: "dm4f2", label: "الحالة", value: "استشاري — يتطلب مراجعة بشرية" },
      { id: "dm4f3", label: "ملاحظات الحوكمة", value: "راجع سياسات المنصة وامتثال المحتوى قبل الاعتماد" },
    ],
  },
];
