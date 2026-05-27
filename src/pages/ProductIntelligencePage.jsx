import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  ImageUp,
  Link2,
  Lightbulb,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const productIdentity = [
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
      {scores.map(([,], index) => {
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

export default function ProductIntelligencePage() {
  const [inputMode, setInputMode] = useState("image");
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [notice, setNotice] = useState("");

  const summaryScore = useMemo(
    () => Math.round(radarScores.reduce((sum, [, score]) => sum + score, 0) / radarScores.length),
    []
  );

  const handlePrototypeAction = (label) => {
    setNotice(`${label}: إجراء تجريبي فقط — لا يتم إنشاء سجل أو استدعاء API.`);
  };

  return (
    <main className="product-intelligence-page" dir="rtl">
      <style>{styles}</style>

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
          <button type="button" className="primary-action" onClick={() => setHasAnalysis(true)}>
            <Sparkles size={16} />
            تحليل المنتج
          </button>
        </div>
      </section>

      {hasAnalysis ? (
        <>
          <section className="summary-grid">
            <article className="pi-card identity-card">
              <div className="section-head">
                <h2>فهم المنتج</h2>
                <Badge tone="slate">نتائج تجريبية</Badge>
              </div>
              <div className="info-grid">
                {productIdentity.map(([label, value]) => (
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
            <div>
              <h2>الخطوة التالية</h2>
              <p>كل الأزرار تجريبية ولا تنشئ سجلات أو حملات أو تكاملات.</p>
            </div>
            <div className="next-buttons">
              <button type="button" onClick={() => handlePrototypeAction("حفظ كتقرير")}><FileText size={16} /> حفظ كتقرير</button>
              <button type="button" onClick={() => handlePrototypeAction("إنشاء محتوى حملة")}><BarChart3 size={16} /> إنشاء محتوى حملة</button>
              <button type="button" onClick={() => handlePrototypeAction("البحث عن موردين لاحقًا")}><Truck size={16} /> البحث عن موردين لاحقًا</button>
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

const styles = `
.product-intelligence-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background: #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}
.pi-hero,.pi-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  box-shadow: 0 10px 28px rgba(24, 38, 18, 0.04);
}
.pi-hero {
  padding: 22px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}
.pi-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eef7e9;
  color: #176b2c;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 10px;
}
.pi-hero h1,.pi-card h2 {
  margin: 0;
}
.pi-hero h1 {
  font-size: 34px;
}
.pi-hero p,.section-head p,.muted,.next-actions-card p {
  color: #6f746b;
  line-height: 1.8;
  margin: 8px 0 0;
}
.pi-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  background: #eef7e9;
  color: #176b2c;
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
}
.pi-badge.amber { background: #fff7ed; color: #9a3412; }
.pi-badge.slate { background: #f1f5f9; color: #475569; }
.progress-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.progress-strip div {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 18px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #6f746b;
  font-weight: 900;
}
.progress-strip div.active {
  border-color: #176b2c;
  background: #eef7e9;
  color: #176b2c;
}
.progress-strip span {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: currentColor;
  color: #fff;
  display: inline-grid;
  place-items: center;
  font-size: 12px;
}
.pi-card { padding: 18px; margin-bottom: 16px; }
.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.input-modes,.summary-grid,.content-and-calendar,.secondary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.input-modes button {
  border: 1px solid #e4e7df;
  background: #fbfdf9;
  border-radius: 18px;
  padding: 14px;
  text-align: right;
  display: grid;
  gap: 8px;
  font: inherit;
  cursor: pointer;
}
.input-modes button.selected {
  border-color: #176b2c;
  background: #eef7e9;
}
.input-modes span,.score-row span,.info-row span,.signal-grid span,.decision-card span,.ad-copy-grid span {
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}
.input-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  margin-top: 14px;
  align-items: end;
}
.file-placeholder,.url-placeholder {
  min-height: 48px;
  border: 1px dashed #cbd5c0;
  background: #fbfdf9;
  border-radius: 16px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 9px;
}
.file-placeholder input {
  max-width: 220px;
}
.url-placeholder {
  display: grid;
  align-items: stretch;
}
.url-placeholder input {
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
}
.primary-action,.next-buttons button {
  min-height: 46px;
  border: 0;
  border-radius: 16px;
  background: #176b2c;
  color: #fff;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
}
.info-grid,.signal-grid,.ad-copy-grid,.governance-grid,.matrix-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.info-row,.signal-grid div,.ad-copy-grid div,.matrix-grid div {
  border: 1px solid #e4e7df;
  background: #fbfdf9;
  border-radius: 16px;
  padding: 12px;
}
.info-row strong,.signal-grid strong {
  display: block;
  margin-top: 5px;
  line-height: 1.6;
}
.score-summary {
  display: grid;
  grid-template-columns: 220px 1fr;
  align-items: center;
  gap: 14px;
}
.radar-chart {
  width: 220px;
  max-width: 100%;
}
.score-summary strong {
  display: block;
  font-size: 42px;
  color: #176b2c;
}
.score-list {
  display: grid;
  gap: 8px;
}
.score-row div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.score-track {
  height: 9px;
  border-radius: 999px;
  background: #edf1e8;
  overflow: hidden;
  margin-top: 6px;
}
.score-track i {
  display: block;
  height: 100%;
  background: #176b2c;
  border-radius: inherit;
}
.warning-panel,.executive-recommendation,.notice {
  border: 1px solid #fed7aa;
  background: #fff7ed;
  color: #9a3412;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.7;
  font-weight: 850;
  margin-top: 12px;
}
.decision-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.decision-card h3 {
  margin: 0 0 10px;
}
.decision-card p,.ad-copy-grid p,.matrix-grid p {
  margin: 5px 0 10px;
  line-height: 1.7;
}
.recommendation-list,.calendar-list,.benchmark-list,.detail-table {
  display: grid;
  gap: 10px;
}
.recommendation-row,.calendar-row,.benchmark-list div,.detail-table div {
  border: 1px solid #e4e7df;
  border-radius: 16px;
  padding: 12px;
  background: #fbfdf9;
}
.recommendation-row {
  display: grid;
  grid-template-columns: 34px 1.2fr 1fr 1fr auto auto;
  gap: 10px;
  align-items: center;
}
.recommendation-row > span {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #176b2c;
  color: #fff;
  display: inline-grid;
  place-items: center;
  font-weight: 900;
}
.recommendation-row small,.recommendation-row em,.calendar-row small,.detail-table small,.detail-table span {
  color: #6f746b;
  line-height: 1.6;
  font-size: 12px;
  font-style: normal;
}
.ad-pack {
  background: linear-gradient(135deg, #fff, #eef7e9);
}
.ad-highlight {
  border: 1px solid #d9ead7;
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 12px;
}
.ad-highlight strong {
  display: block;
  font-size: 24px;
  margin-top: 5px;
}
.angle-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.calendar-row {
  display: grid;
  grid-template-columns: 70px 80px 1fr;
  gap: 8px;
  align-items: center;
}
.calendar-row p {
  margin: 0;
  line-height: 1.6;
}
.calendar-row small {
  grid-column: 3;
}
.secondary-details summary {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
}
.detail-table {
  margin-top: 12px;
}
.governance-grid div {
  border: 1px solid #d9ead7;
  background: #f5fbf1;
  border-radius: 16px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #176b2c;
  font-weight: 850;
}
.next-actions-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.next-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.empty-analysis {
  min-height: 240px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #6f746b;
}
@media (max-width: 1100px) {
  .summary-grid,.content-and-calendar,.secondary-grid,.decision-grid {
    grid-template-columns: 1fr;
  }
  .recommendation-row {
    grid-template-columns: 34px 1fr;
  }
}
@media (max-width: 720px) {
  .product-intelligence-page { padding: 14px; }
  .pi-hero,.section-head,.next-actions-card {
    display: grid;
  }
  .progress-strip,.input-modes,.input-fields,.info-grid,.signal-grid,.ad-copy-grid,.matrix-grid,.governance-grid {
    grid-template-columns: 1fr;
  }
  .score-summary {
    grid-template-columns: 1fr;
  }
  .calendar-row {
    grid-template-columns: 1fr;
  }
  .calendar-row small {
    grid-column: auto;
  }
}
`;
