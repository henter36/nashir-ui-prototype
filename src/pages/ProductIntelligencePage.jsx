import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronDown,
  FileText,
  ImageUp,
  Link2,
  Lightbulb,
  Megaphone,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { readProductCatalog } from "../utils/productCatalogStore.js";
import { readAssetLibrary } from "../utils/assetLibraryStore.js";
import "./ProductIntelligencePage.css";

const demoProductUnderstanding = [
  ["نوع المنتج", "حقيبة تنظيم سفر صغيرة"],
  ["الفئة", "إكسسوارات السفر والتنظيم"],
  ["الاستخدام المتوقع", "ترتيب أدوات العناية والكابلات داخل الحقيبة"],
  ["الجمهور المحتمل", "مسافرون متكررون، طلاب، موظفون يتنقلون يوميًا"],
  ["نقطة البيع الأساسية", "تنظيم عملي بحجم صغير وشكل قابل للتصوير"],
  ["الأسئلة الناقصة", "الخامة الدقيقة، المقاسات، مقاومة الماء، خيارات الألوان"],
];

const radarScores = [
  ["وضوح المنتج", 86],
  ["قابلية التصوير", 78],
  ["قابلية الإعلان", 82],
  ["التميز عن المنافسين", 61],
  ["مخاطر الشحن/الإرجاع", 42],
  ["جاهزية الإطلاق", 74],
];

const summaryScore = Math.round(
  radarScores.reduce((sum, [, score]) => sum + score, 0) / radarScores.length
);

const decisionPaths = [
  {
    title: "استمر كما هو",
    when: "عندما تكون الصور واضحة والسعر مناسبًا والهامش مقبولًا.",
    gain: "إطلاق أسرع واختبار طلب السوق دون تأخير.",
    risk: "قد تظهر اعتراضات حول الخامة أو الحجم لاحقًا.",
    next: "ابدأ بمحتوى قصير يوضح الاستخدام اليومي.",
  },
  {
    title: "طوّر قبل الإعلان",
    when: "عند غموض الخامة أو ضعف التميّز أو الحاجة لتغليف أفضل.",
    gain: "تقليل المرتجعات ورفع الثقة قبل الدفع الإعلاني.",
    risk: "تأخير الإطلاق وزيادة تكلفة التجهيز.",
    next: "اطلب عينة محسنة وصوّر مقارنة قبل/بعد للتنظيم.",
  },
  {
    title: "اختبر قبل التوسع",
    when: "عند وجود زاوية قوية لكن لم تثبت قابلية الشراء بعد.",
    gain: "تعلم سريع من تفاعل الجمهور قبل شراء مخزون كبير.",
    risk: "نتائج الاختبار قد لا تعكس الطلب طويل المدى.",
    next: "اختبر إعلانين: زاوية السفر وزاوية تنظيم المكتب.",
  },
];

const recommendations = [
  ["أضف صورة توضح الحجم داخل حقيبة سفر", "تقليل الغموض ورفع الثقة", "قد تحتاج تصويرًا جديدًا", "متوسطة", "عالية"],
  ["اعرض الخامة ومقاومة الماء إن وجدت", "إزالة اعتراض الجودة", "لا يجب الجزم دون تأكيد المورد", "منخفضة", "عالية"],
  ["جهز باقة ألوان محايدة", "توسيع الجمهور المحتمل", "تعقيد المخزون", "متوسطة", "متوسطة"],
  ["أضف بطاقة قياسات واضحة", "خفض المرتجعات", "تحتاج قياس عينة دقيقة", "منخفضة", "عالية"],
  ["استخدم تغليف بسيط قابل للهدايا", "زيادة قيمة المنتج perceived value", "تكلفة تغليف إضافية", "متوسطة", "متوسطة"],
];

const adAngles = ["سافر بدون فوضى", "كل شيء في مكانه", "تنظيم يومي للحقيبة والمكتب"];

const calendar = [
  ["اليوم 1", "Reel", "قبل/بعد تنظيم حقيبة السفر", "إظهار المشكلة والحل", "Instagram"],
  ["اليوم 2", "Story", "تصويت: أكثر شيء يضيع في حقيبتك؟", "جمع اعتراضات", "Instagram"],
  ["اليوم 3", "صورة", "تفاصيل الجيوب والاستخدام", "شرح المزايا", "Instagram"],
  ["اليوم 4", "TikTok", "ترتيب سريع خلال 15 ثانية", "رفع التفاعل", "TikTok"],
  ["اليوم 5", "منشور", "مقاسات المنتج وما يدخل بداخله", "تقليل الغموض", "Instagram"],
  ["اليوم 6", "UGC", "سيناريو مسافر يستخدم المنتج", "بناء الثقة", "TikTok"],
  ["اليوم 7", "عرض", "باقة تنظيم السفر", "اختبار نية الشراء", "Instagram + TikTok"],
];

const matrix = [
  ["فرص عالية / مخاطر منخفضة", "محتوى تنظيم يومي مع عرض الاستخدام الحقيقي"],
  ["فرص عالية / مخاطر عالية", "ادعاء مقاومة الماء دون تأكيد عينة"],
  ["فرص محدودة / مخاطر منخفضة", "صورة منتج ثابتة دون سياق استخدام"],
  ["فرص محدودة / مخاطر عالية", "مقارنة مباشرة مع علامة منافسة أو نسخ تصميمها"],
];

const competitorAngles = [
  "زاوية منافسة محتملة: منتج تنظيم السفر كحل لفوضى الرحلات القصيرة.",
  "مثال Benchmark افتراضي: إبراز الجيوب الداخلية بدل التركيز على الشكل الخارجي فقط.",
  "زاوية منافسة محتملة: تحويل المنتج إلى هدية عملية للطلاب والموظفين.",
  "مثال Benchmark افتراضي: تصوير المنتج بجانب أدوات يومية لتوضيح الحجم.",
  "تحتاج تحققًا عند تفعيل البحث الخارجي قبل اعتبارها اتجاهًا سوقيًا.",
];

const materials = [
  ["قماش بوليستر أو نايلون", "متوسطة", "السطح يبدو كنسيج خفيف قابل للطي", "نوع الخيط، السماكة، مقاومة الماء"],
  ["سحاب معدني أو بلاستيكي", "منخفضة", "يظهر في الصورة كإغلاق جانبي", "نوع السحاب وتحمله للاستخدام المتكرر"],
  ["بطانة داخلية", "منخفضة", "محتملة لمنتجات التنظيم", "وجود البطانة وجودتها في العينة"],
  ["حزام أو مقبض جانبي", "متوسطة", "الشكل يوحي بسهولة الحمل", "قوة الخياطة ومكان التثبيت"],
];

const suppliers = [
  ["مورد المنتج النهائي", "حقيبة تنظيم جاهزة قابلة للتخصيص", "صور عينة، MOQ، جودة الخياطة، سياسة المرتجعات", "اختلاف الجودة بين العينة والدفعة"],
  ["مورد المواد الخام", "قماش وسحابات وبطانة", "مواصفات الخامة، شهادات إن وجدت، ثبات اللون", "خامة غير مطابقة أو تغير لون"],
  ["مورد التغليف", "علب أو أكياس تغليف بسيطة", "المقاسات، تحمل الشحن، تكلفة الوحدة", "تلف التغليف أثناء الشحن"],
  ["مورد الطباعة والملصقات", "ملصق شعار أو بطاقة تعليمات", "وضوح الطباعة وثباتها", "اختلاف اللون أو تقشر الملصق"],
  ["مورد الشحن/التجهيز", "تجهيز طلبات صغيرة ومتوسطة", "زمن التجهيز والتتبع والتكلفة", "تأخير أو سوء تغليف"],
];

function RadarChart({ scores }) {
  if (!scores || scores.length === 0) return null;

  const center = 120;
  const radius = 82;
  const points = scores.map(([, score], index) => {
    const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
    const valueRadius = radius * (score / 100);
    return [
      center + Math.cos(angle) * valueRadius,
      center + Math.sin(angle) * valueRadius,
    ];
  });
  const polygon = points.map(([x, y]) => `${x},${y}`).join(" ");
  const rings = [0.33, 0.66, 1].map((scale) =>
    scores
      .map((_, index) => {
        const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
        return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
      })
      .join(" ")
  );

  return (
    <svg className="radar-chart" viewBox="0 0 240 240" role="img" aria-label="Demo scoring radar">
      {rings.map((ring) => (
        <polygon key={ring} points={ring} fill="none" stroke="#dfe5dc" strokeWidth="1" />
      ))}
      {scores.map((_, index) => {
        const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
        return (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * radius}
            y2={center + Math.sin(angle) * radius}
            stroke="#dfe5dc"
          />
        );
      })}
      <polygon points={polygon} fill="rgba(23, 107, 44, 0.28)" stroke="#176b2c" strokeWidth="3" />
      {points.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="4" fill="#176b2c" />
      ))}
    </svg>
  );
}

function Badge({ children, tone = "green" }) {
  return <span className={`pi-badge ${tone}`}>{children}</span>;
}

function ScoreBar({ label, value }) {
  return (
    <div className="score-row">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="score-track"><i style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export default function ProductIntelligencePage({ onNavigate }) {
  const [products, setProducts] = useState(() => readProductCatalog([]));
  const [assets, setAssets] = useState(() => readAssetLibrary([]));
  const [selectedProductKey, setSelectedProductKey] = useState(() => readProductCatalog([])[0]?.id || "");
  const [inputMode, setInputMode] = useState("image");
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedProduct = products.find((product) => product.id === selectedProductKey) || products[0] || null;
  const linkedAssets = selectedProduct
    ? assets.filter((asset) => asset.linkedName === selectedProduct.name || asset["linkedProduct" + "Id"] === selectedProduct.id)
    : [];
  const selectedProductSummary = selectedProduct
    ? [
        ["اسم المنتج", selectedProduct.name || "غير محدد"],
        ["التصنيف", selectedProduct.category || "غير محدد"],
        ["السعر", selectedProduct.price || "غير محدد"],
        ["وصف مختصر", selectedProduct.description || "غير محدد"],
        ["حالة الصورة", selectedProduct.imageUrl ? "صورة متاحة" : "تحتاج صورة"],
        ["حالة الفيديو", selectedProduct.videoUrl ? "فيديو متاح" : "اختياري أو غير متاح"],
        ["الأصول المرتبطة", linkedAssets.length ? `${linkedAssets.length} أصل` : "لا توجد أصول مرتبطة"],
      ]
    : [];
  const productUnderstandingRows = selectedProduct
    ? [
        ["نوع المنتج", selectedProduct.name || "منتج من الكتالوج"],
        ["الفئة", selectedProduct.category || "غير مصنف"],
        ["الاستخدام المتوقع", selectedProduct.description || "غير محدد بعد"],
        ["الجمهور المحتمل", "جمهور الحملة يحدد لاحقًا في معالج الحملة."],
        ["نقطة البيع الأساسية", (selectedProduct.flags || [])[0] || "تحتاج تحديدًا من بيانات المنتج."],
        ["الأسئلة الناقصة", selectedProduct.videoUrl ? "الخامة، المقاسات، وسعر العرض." : "الخامة، المقاسات، الفيديو، وسعر العرض."],
      ]
    : demoProductUnderstanding;
  const analysisReadiness = selectedProduct
    ? [
        ["المنتج محدد", true, "تم اختيار منتج من الكتالوج."],
        ["بيانات المنتج كافية", Boolean(selectedProduct.name && selectedProduct.category && selectedProduct.description), "الاسم والتصنيف والوصف تساعد التحليل."],
        ["الصورة متاحة", Boolean(selectedProduct.imageUrl), "الصورة تحسن فهم المنتج بصريًا."],
        ["الفيديو متاح", Boolean(selectedProduct.videoUrl), "الفيديو اختياري في هذا النموذج."],
        ["الأصول المرتبطة موجودة", linkedAssets.length > 0, "يمكن إضافة الأصول من مكتبة الأصول."],
        ["مسار تحليل المنتج موجود", true, "مسار واجهي فقط داخل تشغيلات النظام."],
        ["مطالبة تحليل المنتج معتمدة", false, "تحتاج مراجعة حوكمة قبل التنفيذ الحقيقي."],
        ["حد التكلفة مضبوط", true, "مؤشر واجهي فقط ضمن مراقبة التكلفة."],
        ["مصادر البيانات متصلة / اختيارية", true, "مصادر البيانات اختيارية لهذا التحليل التجريبي."],
      ]
    : [];

  useEffect(() => {
    const refresh = () => {
      const nextProducts = readProductCatalog([]);
      setProducts(nextProducts);
      setAssets(readAssetLibrary([]));
      setSelectedProductKey((current) => current || nextProducts[0]?.id || "");
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("nashir-product-catalog-updated", refresh);
    window.addEventListener("nashir-asset-library-updated", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("nashir-product-catalog-updated", refresh);
      window.removeEventListener("nashir-asset-library-updated", refresh);
    };
  }, []);

  const handlePrototypeAction = (message) => {
    setNotice(message);
  };

  const handlePrototypeNavigate = (screenKey, context) => {
    if (typeof onNavigate === "function") {
      onNavigate(screenKey, context);
      return;
    }

    setNotice("التنقل التجريبي غير متاح من هذه الصفحة حاليًا.");
  };

  return (
    <main className="product-intelligence-page" dir="rtl">
      <section className="pi-hero">
        <div>
          <div className="pi-eyebrow"><PackageSearch size={16} /> Product Intelligence Studio</div>
          <h1>استوديو تحليل المنتج</h1>
          <p>
            حلّل منتجًا من صورة أو رابط، وافهم قابلية بيعه، خاماته المحتملة، فرص تطويره،
            والمحتوى الإعلاني المناسب له.
          </p>
        </div>
        <Badge tone="amber">Prototype / لا يوجد تحليل فعلي بعد</Badge>
      </section>

      <section className="progress-strip" aria-label="مسار تحليل المنتج">
        {["إدخال", "فهم", "قرار", "إنتاج", "ربط بالحملة"].map((stage, index) => (
          <div key={stage} className={index <= (hasAnalysis ? 4 : 0) ? "active" : ""}>
            <span>{index + 1}</span>
            <strong>{stage}</strong>
          </div>
        ))}
      </section>

      <section className="input-panel pi-card">
        <div className="section-head">
          <div>
            <h2>إدخال المنتج</h2>
            <p>هذه مدخلات واجهية فقط. لا يوجد رفع فعلي للملفات ولا جلب للرابط.</p>
          </div>
          <Badge>Demo</Badge>
        </div>

        <div className="catalog-selector-card">
          <div>
            <h3>اختيار منتج من كتالوج المنتجات</h3>
            <p>يستخدم الاستديو بيانات كتالوج المنتجات، ولا ينشئ نموذج منتج مستقل.</p>
          </div>
          {products.length ? (
            <select value={selectedProduct?.id || ""} onChange={(event) => setSelectedProductKey(event.target.value)}>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name || "منتج بدون اسم"} · {product.category || "غير مصنف"}
                </option>
              ))}
            </select>
          ) : (
            <div className="warning-panel">
              <AlertTriangle size={18} />
              لا توجد منتجات في الكتالوج. أضف منتجًا من إعداد المتجر أو كتالوج المنتجات.
            </div>
          )}
        </div>

        {selectedProduct ? (
          <div className="selected-product-summary">
            {selectedProductSummary.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        ) : null}

        <div className="input-modes">
          <button type="button" className={inputMode === "image" ? "selected" : ""} onClick={() => setInputMode("image")}>
            <ImageUp size={20} />
            <strong>رفع صورة منتج</strong>
            <span>اختر صورة شكلية لبدء عرض النتائج التجريبية.</span>
          </button>
          <button type="button" className={inputMode === "link" ? "selected" : ""} onClick={() => setInputMode("link")}>
            <Link2 size={20} />
            <strong>إدخال رابط منتج</strong>
            <span>اكتب رابطًا كمثال فقط دون أي جلب خارجي.</span>
          </button>
        </div>

        <div className="input-fields">
          {inputMode === "image" ? (
            <label className="file-placeholder">
              <ImageUp size={18} />
              <span>File upload placeholder only</span>
              <input type="file" accept="image/*" onChange={() => setNotice("تم اختيار ملف للواجهة فقط — لا يوجد رفع أو تحليل فعلي.")} />
            </label>
          ) : (
            <label className="url-placeholder">
              <span>رابط المنتج</span>
              <input placeholder="https://example.com/product-demo" />
            </label>
          )}
          <button type="button" className="primary-action" onClick={() => {
            setHasAnalysis(true);
            setNotice(selectedProduct ? "تحليل تجريبي داخل النموذج الأولي — لا يوجد استدعاء نموذج ذكاء اصطناعي حقيقي." : "اختر منتجًا من الكتالوج أولًا.");
          }}>
            <Sparkles size={16} />
            تحليل المنتج
          </button>
        </div>
      </section>

      {hasAnalysis ? (
        <>
          <section className="pi-card analysis-results-card">
            <div className="section-head">
              <div>
                <h2>ملخص التحليل</h2>
                <p>تحليل تجريبي داخل النموذج الأولي — لا يوجد استدعاء نموذج ذكاء اصطناعي حقيقي.</p>
              </div>
              <Badge tone="amber">تحليل تجريبي</Badge>
            </div>
            <div className="analysis-grid">
              <div><span>جاهزية المنتج للحملات</span><strong>{selectedProduct?.readiness || summaryScore}%</strong></div>
              <div><span>نقاط القوة</span><strong>وضوح الاستخدام، قابلية التصوير، قابلية تحويله إلى عرض قصير.</strong></div>
              <div><span>نقاط التحسين</span><strong>توضيح الخامة، المقاسات، وضمان عدم المبالغة في الادعاءات.</strong></div>
              <div><span>نقص البيانات</span><strong>{selectedProduct?.imageUrl ? "الفيديو والقياسات التفصيلية." : "الصورة، الفيديو، والقياسات التفصيلية."}</strong></div>
              <div><span>اقتراحات تحسين صفحة المنتج</span><strong>أضف صورة استخدام، جدول مقاسات، وسؤال/جواب عن الخامة.</strong></div>
              <div><span>اقتراحات للحملات</span><strong>اختبر زاوية الاستخدام اليومي وزاوية الهدية العملية.</strong></div>
              <div><span>الأصول المقترحة</span><strong>صورة استخدام، فيديو قصير، ولقطة مقارنة قبل/بعد.</strong></div>
              <div><span>القنوات المناسبة</span><strong>إنستغرام، تيك توك، واتساب حسب جاهزية الوسائط.</strong></div>
            </div>
          </section>

          <section className="pi-card readiness-card">
            <div className="section-head">
              <div>
                <h2>حالة أدوات التحليل</h2>
                <p>جاهزية الأدوات هنا مؤشرات واجهية فقط. لا يتم تشغيل أدوات تحليل فعلية.</p>
              </div>
              <Badge tone="slate">جاهزية الأدوات</Badge>
            </div>
            <div className="readiness-check-grid">
              {analysisReadiness.map(([label, ready, detail]) => (
                <div key={label} className={ready ? "ready" : "warning"}>
                  {ready ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <strong>{label}</strong>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="summary-grid">
            <article className="pi-card identity-card">
              <div className="section-head">
                <h2>فهم المنتج</h2>
                <Badge tone="slate">نتائج تجريبية</Badge>
              </div>
              <div className="info-grid">
                {productUnderstandingRows.map(([label, value]) => (
                  <div key={label} className="info-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="pi-card score-card">
              <div className="section-head">
                <h2>قابلية المنتج</h2>
                <Badge tone="amber">Demo scoring / نتائج تجريبية</Badge>
              </div>
              <div className="score-summary">
                <RadarChart scores={radarScores} />
                <div>
                  <strong>{summaryScore}%</strong>
                  <span>جاهزية تقديرية للعرض الأولي</span>
                </div>
              </div>
              <div className="score-list">
                {radarScores.map(([label, value]) => <ScoreBar key={label} label={label} value={value} />)}
              </div>
            </article>
          </section>

          <section className="pi-card signal-card">
            <div className="section-head">
              <div>
                <h2>إشارة للملف الاستراتيجي</h2>
                <p>اقتراح استرشادي يوضح كيف قد يؤثر المنتج على التوجه التجاري.</p>
              </div>
              <Badge tone="amber">مقترحة فقط</Badge>
            </div>
            <div className="signal-grid">
              <div><span>نوع الإشارة</span><strong>فرصة منتج عملي قابل للمحتوى القصير</strong></div>
              <div><span>لماذا ظهرت</span><strong>سهولة شرح الاستخدام بصريًا وتعدد سيناريوهات التصوير.</strong></div>
              <div><span>تأثيرها المحتمل</span><strong>رفع أولوية محتوى Reels/TikTok قبل حملات التحويل.</strong></div>
              <div><span>حالة الإشارة</span><strong>مقترحة فقط</strong></div>
            </div>
            <div className="warning-panel">
              <AlertTriangle size={18} />
              لا يتم تحديث الملف الاستراتيجي تلقائيًا. هذه إشارة تجريبية تحتاج اعتماد المستخدم لاحقًا.
            </div>
          </section>

          <section className="decision-grid">
            {decisionPaths.map((path) => (
              <article key={path.title} className="pi-card decision-card">
                <h3>{path.title}</h3>
                <div><span>متى يناسب؟</span><p>{path.when}</p></div>
                <div><span>المكسب</span><p>{path.gain}</p></div>
                <div><span>المخاطرة</span><p>{path.risk}</p></div>
                <div><span>الإجراء التالي</span><p>{path.next}</p></div>
                <Badge tone="slate">Prototype advisory</Badge>
              </article>
            ))}
          </section>

          <section className="pi-card recommendations-card">
            <div className="section-head">
              <h2>توصيات تطوير المنتج</h2>
              <Badge>يتطلب ربطًا لاحقًا</Badge>
            </div>
            <div className="recommendation-list">
              {recommendations.map(([rec, gain, risk, difficulty, priority], index) => (
                <div key={rec} className="recommendation-row">
                  <span>{index + 1}</span>
                  <strong>{rec}</strong>
                  <small>المكسب: {gain}</small>
                  <small>المخاطرة: {risk}</small>
                  <em>صعوبة التنفيذ: {difficulty}</em>
                  <Badge tone={priority === "عالية" ? "green" : "amber"}>أولوية التنفيذ: {priority}</Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="content-and-calendar">
            <article className="pi-card ad-pack">
              <div className="section-head">
                <div>
                  <h2>حزمة محتوى إعلاني</h2>
                  <p>أمثلة ثابتة بأسلوب توليدي. لا يوجد استدعاء نموذج ذكاء اصطناعي.</p>
                </div>
                <Sparkles size={22} />
              </div>
              <div className="ad-highlight">
                <span>عنوان إعلاني</span>
                <strong>رتّب حقيبتك في دقيقة، وسافر بدون فوضى.</strong>
              </div>
              <div className="ad-copy-grid">
                <div><span>كابشن Instagram</span><p>حقيبة صغيرة تجمع أدواتك اليومية في مكان واحد. مناسبة للسفر، الدوام، والنادي.</p></div>
                <div><span>فكرة Reel</span><p>لقطة فوضى داخل الحقيبة، ثم انتقال سريع بعد استخدام المنتج مع عرض الجيوب.</p></div>
                <div><span>CTA</span><p>اكتشف طريقة أسهل لتنظيم حقيبتك اليوم.</p></div>
              </div>
              <div className="angle-list">
                {adAngles.map((angle) => <Badge key={angle}>{angle}</Badge>)}
              </div>
            </article>

            <article className="pi-card calendar-card">
              <div className="section-head">
                <h2>تقويم محتوى 7 أيام</h2>
                <Badge tone="amber">تقويم تجريبي</Badge>
              </div>
              <div className="calendar-list">
                {calendar.map(([day, type, idea, goal, channel]) => (
                  <div key={day} className="calendar-row">
                    <strong>{day}</strong>
                    <span>{type}</span>
                    <p>{idea}</p>
                    <small>{goal} · {channel}</small>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="pi-card matrix-card">
            <div className="section-head">
              <h2>مصفوفة الفرص والمخاطر</h2>
              <Badge>نتائج تجريبية</Badge>
            </div>
            <div className="matrix-grid">
              {matrix.map(([zone, example]) => (
                <div key={zone}>
                  <strong>{zone}</strong>
                  <p>{example}</p>
                </div>
              ))}
            </div>
            <div className="executive-recommendation">
              <Lightbulb size={18} />
              التوصية التنفيذية: ابدأ باختبار محتوى استخدام واقعي قبل توسيع المخزون أو إطلاق خصومات.
            </div>
          </section>

          <section className="secondary-grid">
            <article className="pi-card">
              <h2>زوايا منافسة محتملة</h2>
              <p className="muted">أمثلة Benchmark افتراضية تحتاج تحققًا عند تفعيل البحث الخارجي.</p>
              <div className="benchmark-list">
                {competitorAngles.map((angle) => <div key={angle}>{angle}</div>)}
              </div>
            </article>

            <details className="pi-card secondary-details">
              <summary><Boxes size={18} /> تحليل المواد المحتملة <ChevronDown size={16} /></summary>
              <div className="detail-table">
                {materials.map(([material, confidence, reason, verify]) => (
                  <div key={material}>
                    <strong>{material}</strong>
                    <span>درجة الثقة: {confidence}</span>
                    <p>{reason}</p>
                    <small>ما يجب التحقق منه: {verify}</small>
                  </div>
                ))}
              </div>
              <div className="warning-panel">
                <AlertTriangle size={18} />
                تحليل المواد من الصورة أو الرابط تقديري ولا يعتمد عليه للتصنيع أو الشراء قبل تأكيد المورد وطلب عينة.
              </div>
            </details>

            <details className="pi-card secondary-details">
              <summary><Truck size={18} /> Supplier Discovery Preview <ChevronDown size={16} /></summary>
              <div className="detail-table">
                {suppliers.map(([category, needed, criteria, risk]) => (
                  <div key={category}>
                    <strong>{category}</strong>
                    <span>ما المطلوب البحث عنه: {needed}</span>
                    <p>معايير التحقق: {criteria}</p>
                    <small>مخاطر محتملة: {risk}</small>
                  </div>
                ))}
              </div>
              <div className="warning-panel">
                <AlertTriangle size={18} />
                اقتراح الموردين يتطلب لاحقًا تكاملًا مع مصادر خارجية وتحققًا بشريًا قبل الاعتماد.
              </div>
            </details>
          </section>

          <section className="pi-card governance-card">
            <div className="section-head">
              <h2>ضوابط الحوكمة والمخاطر</h2>
              <ShieldCheck size={22} />
            </div>
            <div className="governance-grid">
              {[
                "لا نسخ لتصاميم أو صور المنافسين",
                "لا جزم بالخامات من الصورة فقط",
                "لا اعتماد مورد قبل عينة وتحقق",
                "لا تسعير نهائي دون مقارنة سوقية",
                "لا تحليل بيانات شخصية أو غير عامة",
                "لا إنشاء حملة أو تعديل ملف استراتيجي تلقائيًا في هذه المرحلة",
              ].map((item) => (
                <div key={item}><CheckCircle2 size={15} />{item}</div>
              ))}
            </div>
          </section>

          <section className="pi-card next-actions-card">
            <div className="next-actions-copy">
              <h2>الخطوة التالية</h2>
              <p>كل الأزرار تجريبية ولا تنشئ سجلات أو حملات أو تكاملات.</p>
              <div className="next-bridge">
                <div>
                  <h3>الخطوة التالية المقترحة</h3>
                  <p>
                    المسار الأساسي هو إنشاء حملة من المنتج، لأن تحليل المنتج ينتج هدفًا وجمهورًا وزوايا ورسائل وجدولًا،
                    وليس مجرد قطعة محتوى واحدة. في هذا النموذج لا يتم تمرير بيانات أو إنشاء سجلات فعلية.
                  </p>
                </div>
                <div className="angle-list">
                  <Badge>Prototype</Badge>
                  <Badge tone="amber">لا يوجد إنشاء فعلي</Badge>
                  <Badge tone="slate">لا يوجد تمرير بيانات</Badge>
                </div>
              </div>
            </div>
            <div className="next-buttons">
              <button type="button" onClick={() => handlePrototypeNavigate("campaigns", { campaignOrigin: "product-intelligence" })}><Megaphone size={16} /> إنشاء حملة من هذا المنتج</button>
              <button type="button" onClick={() => handlePrototypeNavigate("content")}><BarChart3 size={16} /> إنشاء محتوى فقط</button>
              <button type="button" className="secondary" onClick={() => handlePrototypeAction("حفظ التقرير غير مفعل في النموذج التجريبي.")}><FileText size={16} /> حفظ كتقرير</button>
              <button type="button" className="secondary" onClick={() => handlePrototypeAction("البحث عن الموردين يتطلب تكاملًا خارجيًا وتحققًا لاحقًا.")}><Truck size={16} /> البحث عن موردين لاحقًا</button>
            </div>
            {notice ? <div className="notice">{notice}</div> : null}
          </section>
        </>
      ) : (
        <section className="empty-analysis pi-card">
          <PackageSearch size={42} />
          <h2>ابدأ بعرض التحليل التجريبي</h2>
          <p>اضغط "تحليل المنتج" لعرض بيانات ثابتة توضح شكل تجربة استوديو تحليل المنتج.</p>
        </section>
      )}
    </main>
  );
}
