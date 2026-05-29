import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  Globe,
  Heart,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X / Twitter", "Snapchat"];

const creatorProfile = {
  name: "لمى الشمري",
  handle: "@lama.creates",
  bio: "صانعة محتوى تقني وتعليمي | نصائح يومية للمرأة العاملة | 5+ سنوات في التسويق الرقمي",
  tags: ["تقنية", "تعليم", "ريادة أعمال", "إنتاجية", "تحفيز"],
  stats: [
    { id: "st1", label: "المتابعون", value: "127K" },
    { id: "st2", label: "متوسط التفاعل", value: "4.2%" },
    { id: "st3", label: "منشورات شهريًا", value: "22" },
    { id: "st4", label: "مشاهدات Reels", value: "890K" },
  ],
};

const performanceScores = [
  { id: "ps1", label: "انتظام النشر", value: 82 },
  { id: "ps2", label: "جودة التفاعل", value: 74 },
  { id: "ps3", label: "هوية بصرية واضحة", value: 68 },
  { id: "ps4", label: "قوة الـ Hook الأول", value: 88 },
  { id: "ps5", label: "وضوح الـ CTA", value: 61 },
  { id: "ps6", label: "تنوع أنواع المحتوى", value: 55 },
];

const contentPatterns = [
  { id: "cp1", type: "Reel تعليمي", share: "38%", tone: "green" },
  { id: "cp2", type: "Story تفاعلية", share: "27%", tone: "blue" },
  { id: "cp3", type: "Carousel نصائح", share: "21%", tone: "amber" },
  { id: "cp4", type: "صورة ملهمة", share: "14%", tone: "neutral" },
];

const audienceSegments = [
  { id: "as1", label: "نساء 25–34 — موظفات وصاحبات مشاريع", share: "44%" },
  { id: "as2", label: "نساء 18–24 — طالبات وخريجات جديدات", share: "29%" },
  { id: "as3", label: "مختلط 35+ — مهنيون متمرسون", share: "18%" },
  { id: "as4", label: "شرائح أخرى", share: "9%" },
];

const audienceCountries = [
  { id: "ac1", label: "السعودية", share: "52%" },
  { id: "ac2", label: "الإمارات", share: "18%" },
  { id: "ac3", label: "مصر", share: "12%" },
  { id: "ac4", label: "الكويت", share: "8%" },
  { id: "ac5", label: "باقي الدول", share: "10%" },
];

const peakTimes = [
  { id: "pt1", day: "الأحد", time: "20:00–22:00", note: "ذروة الأسبوع" },
  { id: "pt2", day: "الثلاثاء", time: "18:00–20:00", note: "قوي" },
  { id: "pt3", day: "الجمعة", time: "13:00–15:00", note: "متوسط — بعد صلاة الجمعة" },
];

const strategicSignal = {
  current: "صانعة محتوى تقني وتعليمي عام",
  suggested: "المرجع الأول للمرأة العاملة في الإنتاجية الرقمية وأدوات الذكاء الاصطناعي باللغة العربية",
  rationale: "البيانات الافتراضية تشير إلى تركيز عالٍ في شريحة النساء العاملات مع نسبة تفاعل أعلى من المتوسط في محتوى الأدوات التقنية — الزاوية أوضح وأقل منافسة.",
};

const strategyPillars = [
  {
    id: "spi1",
    icon: BookOpen,
    title: "التعليم والقيمة",
    desc: "محتوى عملي قابل للتطبيق الفوري — الأعلى حفظًا ومشاركةً في الجمهور الحالي.",
    strength: "عالية",
    tone: "green",
  },
  {
    id: "spi2",
    icon: Heart,
    title: "الإلهام والتحول",
    desc: "قصص نجاح حقيقية وتحولات ملموسة — تبني ثقة عاطفية وتمييزًا شخصيًا.",
    strength: "متوسطة",
    tone: "blue",
  },
  {
    id: "spi3",
    icon: Users,
    title: "المجتمع والتفاعل",
    desc: "تصويتات وأسئلة ونقاشات — تحفز التعليقات وتوسع الوصول بدون إنفاق إعلاني.",
    strength: "منخفضة",
    tone: "amber",
  },
  {
    id: "spi4",
    icon: Target,
    title: "المنتج والتوصية",
    desc: "مراجعات أدوات وتطبيقات — جسر للتسييل عبر الشراكات والأكواد الترويجية.",
    strength: "غير مفعّلة",
    tone: "neutral",
  },
];

const contentGaps = [
  { id: "cg1", gap: "لا يوجد محتوى Behind the Scenes — الجمهور يريد رؤية العملية لا فقط النتيجة." },
  { id: "cg2", gap: "غياب Collab مع صانعات مشابهات — فرصة توسع عضوي غير مستغلة." },
  { id: "cg3", gap: "ضعف التسييل المباشر — ربط أدوات التعليم بكود خصم لم يُختبر بعد." },
];

const contentIdeas = [
  { id: "ci1", title: "5 أدوات AI تستخدمها كل يوم — وكيف وفّرت 3 ساعات", type: "Reel", platform: "Instagram" },
  { id: "ci2", title: "طريقة تنظيم أسبوعي للمرأة العاملة — قابل للتطبيق من الغد", type: "Carousel", platform: "Instagram" },
  { id: "ci3", title: "سؤال: ما أكبر تحدٍّ تواجهينه في التوازن بين العمل والحياة؟", type: "Story — Poll", platform: "Instagram" },
  { id: "ci4", title: "كيف حوّلت ساعة في الصباح إلى روتين إنتاجية حقيقي", type: "Reel", platform: "TikTok" },
  { id: "ci5", title: "Notion vs Trello vs Asana — أيها يناسب المرأة العاملة فعلًا؟", type: "Carousel مقارنة", platform: "Instagram" },
  { id: "ci6", title: "يومي الحقيقي خلف الكاميرا — Behind the Scenes بلا فلترة", type: "Reel BTS", platform: "TikTok" },
];

const calendarRows = [
  { id: "cal1", day: "الأحد", type: "Reel تعليمي", topic: "5 أدوات AI يومية", channel: "Instagram" },
  { id: "cal2", day: "الاثنين", type: "Story", topic: "سؤال تفاعلي — تحدياتك", channel: "Instagram" },
  { id: "cal3", day: "الثلاثاء", type: "TikTok Reel", topic: "روتين صباح إنتاجي", channel: "TikTok" },
  { id: "cal4", day: "الأربعاء", type: "Carousel", topic: "Notion vs Trello", channel: "Instagram" },
  { id: "cal5", day: "الخميس", type: "Story BTS", topic: "خلف الكاميرا اليوم", channel: "Instagram" },
  { id: "cal6", day: "الجمعة", type: "منشور", topic: "اقتباس إلهامي أسبوعي", channel: "Instagram" },
  { id: "cal7", day: "السبت", type: "إعادة نشر", topic: "أفضل محتوى من الأسبوع", channel: "TikTok" },
];

const captionExamples = [
  {
    id: "cap1",
    type: "Hook افتتاحي",
    text: "لو أخبرتك إن ساعة واحدة في الصباح غيّرت كل يوم عملي — هل ستجربين؟",
  },
  {
    id: "cap2",
    type: "Caption Reel",
    text: "5 أدوات AI بسيطة وفّرت عليّ 3 ساعات يوميًا 👇 احفظي هذا المنشور قبل ما تروحين! #إنتاجية #تقنية #المرأة_العاملة",
  },
  {
    id: "cap3",
    type: "Script فيديو قصير",
    text: "\"اليوم رح أريكم كيف أنظم أسبوعي في أقل من 20 دقيقة — بدون تطبيقات معقدة، بدون فوضى.\"",
  },
];

const competitors = [
  { id: "comp1", name: "صانعة محتوى تقني — نموذج افتراضي", overlap: "عالي", diff: "تركيز على البرمجة — جمهور أقل تداخلًا مع المرأة العاملة." },
  { id: "comp2", name: "صانعة محتوى إنتاجية — نموذج افتراضي", overlap: "متوسط", diff: "محتوى إنجليزي بالدرجة الأولى — فرصة المحتوى العربي ميزة تنافسية." },
  { id: "comp3", name: "مدربة أعمال للمرأة — نموذج افتراضي", overlap: "منخفض", diff: "تركز على كوتشنج مدفوع — الفرق في نموذج التسييل لا في المحتوى." },
];

const governanceRules = [
  { id: "gr1", text: "لا نسخ محتوى المنافسين أو صياغتهم — حتى لو كانت بيانات عامة." },
  { id: "gr2", text: "البيانات المستخدمة عامة فقط — لا معلومات حسابات خاصة أو داخلية." },
  { id: "gr3", text: "مقاييس الأداء نماذج توضيحية — لا تعكس بيانات حساب حقيقية." },
  { id: "gr4", text: "المحتوى المُولَّد يتطلب مراجعة بشرية كاملة قبل أي نشر." },
  { id: "gr5", text: "يلتزم التحليل بسياسات المنصات وأُطر الامتثال القانوني المعمول بها." },
];

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="cs-section-header">
      <Icon size={18} className="cs-section-icon" />
      <h2>{title}</h2>
    </div>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div className="cs-score-row">
      <div className="cs-score-label">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="cs-score-track">
        <div className="cs-score-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function PillarCard({ icon: Icon, title, desc, strength, tone }) {
  return (
    <div className={`cs-pillar-card cs-tone-${tone}`}>
      <div className="cs-pillar-head">
        <div className="cs-pillar-icon">
          <Icon size={18} />
        </div>
        <div>
          <div className="cs-pillar-title">{title}</div>
          <span className={`cs-badge cs-badge-${tone}`}>{strength}</span>
        </div>
      </div>
      <p className="cs-pillar-desc">{desc}</p>
    </div>
  );
}

export default function CreatorStudioPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [handleInput, setHandleInput] = useState("");
  const [analyzeStatus, setAnalyzeStatus] = useState("");

  const handleAnalyze = () => {
    setAnalyzeStatus("نموذج تجريبي — لا يوجد تحليل فعلي. البيانات المعروضة أدناه هي عينات ثابتة.");
  };

  return (
    <main className="cs-page" dir="rtl">
      <style>{styles}</style>

      {/* 1. Page header */}
      <section className="cs-hero">
        <div>
          <div className="cs-eyebrow">
            <Sparkles size={13} />
            <span>Prototype — لا يوجد تحليل فعلي بعد</span>
          </div>
          <h1 className="cs-page-title">استوديو صانع المحتوى</h1>
          <p className="cs-page-desc">
            جميع البيانات والمقاييس والتوصيات المعروضة هي نماذج توضيحية ثابتة فقط.
            لا يتم سحب بيانات حقيقية من أي منصة ولا تُنفَّذ أي عمليات AI حقيقية في هذا النموذج.
          </p>
        </div>
      </section>

      {/* 2. Channel/account input panel */}
      <section className="cs-card cs-input-panel">
        <SectionHeader icon={BarChart3} title="تحليل قناة صانع المحتوى" />
        <div className="cs-platform-chips">
          {PLATFORMS.map((platform) => (
            <button
              key={platform}
              type="button"
              className={`cs-chip ${selectedPlatform === platform ? "cs-chip-active" : ""}`}
              onClick={() => setSelectedPlatform(platform)}
            >
              {platform}
            </button>
          ))}
        </div>
        <div className="cs-input-row">
          <input
            className="cs-text-input"
            type="text"
            placeholder="رابط الحساب أو الـ Handle — مثال: @lama.creates"
            value={handleInput}
            onChange={(e) => setHandleInput(e.target.value)}
            dir="ltr"
          />
          <button type="button" className="cs-primary-btn" onClick={handleAnalyze}>
            <Sparkles size={15} />
            <span>تحليل — نموذج تجريبي</span>
          </button>
        </div>
        {analyzeStatus && (
          <p className="cs-analyze-notice">{analyzeStatus}</p>
        )}
        <p className="cs-prototype-note">
          الزر أعلاه لا يرسل طلبات خارجية. البيانات أدناه ثابتة بغض النظر عن الإدخال.
        </p>
      </section>

      {/* 3. Channel identity summary */}
      <section className="cs-card cs-identity-card">
        <SectionHeader icon={Users} title="هوية الحساب — بيانات توضيحية" />
        <div className="cs-identity-grid">
          <div className="cs-identity-left">
            <div className="cs-avatar">ل</div>
            <div>
              <div className="cs-creator-name">{creatorProfile.name}</div>
              <div className="cs-creator-handle">{creatorProfile.handle}</div>
              <div className="cs-creator-platform">{selectedPlatform}</div>
            </div>
          </div>
          <div className="cs-identity-right">
            <p className="cs-creator-bio">{creatorProfile.bio}</p>
            <div className="cs-tags-row">
              {creatorProfile.tags.map((tag) => (
                <span key={tag} className="cs-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="cs-stats-row">
          {creatorProfile.stats.map((stat) => (
            <div key={stat.id} className="cs-stat-box">
              <div className="cs-stat-value">{stat.value}</div>
              <div className="cs-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Performance analysis */}
      <section className="cs-two-col">
        <article className="cs-card">
          <SectionHeader icon={TrendingUp} title="تحليل الأداء" />
          <div className="cs-score-list">
            {performanceScores.map((score) => (
              <ScoreBar key={score.id} label={score.label} value={score.value} />
            ))}
          </div>
        </article>
        <article className="cs-card">
          <SectionHeader icon={FileText} title="أنماط المحتوى" />
          <div className="cs-pattern-list">
            {contentPatterns.map((pattern) => (
              <div key={pattern.id} className="cs-pattern-row">
                <span className={`cs-badge cs-badge-${pattern.tone}`}>{pattern.share}</span>
                <span className="cs-pattern-label">{pattern.type}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* 5. Audience summary */}
      <section className="cs-card">
        <SectionHeader icon={Globe} title="ملخص الجمهور — بيانات توضيحية" />
        <div className="cs-audience-grid">
          <div>
            <h3 className="cs-sub-heading">الشرائح</h3>
            {audienceSegments.map((seg) => (
              <div key={seg.id} className="cs-audience-row">
                <span className="cs-audience-share">{seg.share}</span>
                <span>{seg.label}</span>
              </div>
            ))}
          </div>
          <div>
            <h3 className="cs-sub-heading">الدول</h3>
            <div className="cs-country-list">
              {audienceCountries.map((country) => (
                <div key={country.id} className="cs-audience-row">
                  <span className="cs-audience-share">{country.share}</span>
                  <span>{country.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="cs-sub-heading">أوقات الذروة</h3>
            {peakTimes.map((peak) => (
              <div key={peak.id} className="cs-peak-row">
                <div className="cs-peak-day">{peak.day}</div>
                <div className="cs-peak-time">{peak.time}</div>
                <div className="cs-muted">{peak.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Strategic signal */}
      <section className="cs-card cs-signal-card">
        <SectionHeader icon={Lightbulb} title="إشارة استراتيجية مقترحة — للنقاش فقط" />
        <div className="cs-signal-grid">
          <div className="cs-signal-box cs-signal-current">
            <div className="cs-signal-label">الوضع الحالي</div>
            <div className="cs-signal-text">{strategicSignal.current}</div>
          </div>
          <div className="cs-signal-arrow">←</div>
          <div className="cs-signal-box cs-signal-suggested">
            <div className="cs-signal-label">الاقتراح</div>
            <div className="cs-signal-text">{strategicSignal.suggested}</div>
          </div>
        </div>
        <p className="cs-signal-rationale">{strategicSignal.rationale}</p>
        <p className="cs-prototype-note">
          هذا اقتراح واجهي تجريبي — لا يُعدَّل الملف الشخصي تلقائيًا ويتطلب مراجعة يدوية.
        </p>
      </section>

      {/* 7. Strategy pillars + gaps */}
      <section className="cs-card">
        <SectionHeader icon={Target} title="ركائز الاستراتيجية" />
        <div className="cs-pillars-grid">
          {strategyPillars.map((pillar) => (
            <PillarCard
              key={pillar.id}
              icon={pillar.icon}
              title={pillar.title}
              desc={pillar.desc}
              strength={pillar.strength}
              tone={pillar.tone}
            />
          ))}
        </div>
        <h3 className="cs-sub-heading cs-gaps-heading">الثغرات الاستراتيجية</h3>
        <ul className="cs-gap-list">
          {contentGaps.map((item) => (
            <li key={item.id} className="cs-gap-item">
              <AlertTriangle size={14} className="cs-gap-icon" />
              <span>{item.gap}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 8. Content ideas */}
      <section className="cs-card">
        <SectionHeader icon={Lightbulb} title="أفكار محتوى مقترحة — نماذج توضيحية" />
        <div className="cs-ideas-grid">
          {contentIdeas.map((idea) => (
            <div key={idea.id} className="cs-idea-card">
              <div className="cs-idea-meta">
                <span className="cs-badge cs-badge-neutral">{idea.type}</span>
                <span className="cs-muted">{idea.platform}</span>
              </div>
              <div className="cs-idea-title">{idea.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Weekly content calendar */}
      <section className="cs-card">
        <SectionHeader icon={Calendar} title="جدول محتوى أسبوعي — نموذج توضيحي" />
        <div className="cs-calendar-table">
          <div className="cs-cal-head">
            <span>اليوم</span>
            <span>النوع</span>
            <span>الموضوع</span>
            <span>المنصة</span>
          </div>
          {calendarRows.map((row) => (
            <div key={row.id} className="cs-cal-row">
              <span className="cs-cal-day">{row.day}</span>
              <span className="cs-badge cs-badge-neutral">{row.type}</span>
              <span>{row.topic}</span>
              <span className="cs-muted">{row.channel}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Generated content examples */}
      <section className="cs-card">
        <SectionHeader icon={Sparkles} title="أمثلة محتوى مُولَّد — توضيحية فقط، تتطلب مراجعة بشرية" />
        <div className="cs-captions-list">
          {captionExamples.map((ex) => (
            <div key={ex.id} className="cs-caption-card">
              <div className="cs-caption-type">{ex.type}</div>
              <blockquote className="cs-caption-text">{ex.text}</blockquote>
            </div>
          ))}
        </div>
        <p className="cs-prototype-note">
          هذه نصوص نموذجية ثابتة — لا يُولِّد النظام محتوى حقيقيًا في هذا النموذج التجريبي.
        </p>
      </section>

      {/* 11. Competitor / gap analysis */}
      <section className="cs-card">
        <SectionHeader icon={BarChart3} title="تحليل المنافسين — بيانات افتراضية فقط، لا بحث فعلي" />
        <div className="cs-competitor-table">
          <div className="cs-comp-head">
            <span>المنافس</span>
            <span>التداخل</span>
            <span>نقطة التمييز</span>
          </div>
          {competitors.map((comp) => (
            <div key={comp.id} className="cs-comp-row">
              <span className="cs-comp-name">{comp.name}</span>
              <span className={`cs-badge cs-badge-${comp.overlap === "عالي" ? "red" : comp.overlap === "متوسط" ? "amber" : "green"}`}>
                {comp.overlap}
              </span>
              <span className="cs-comp-diff">{comp.diff}</span>
            </div>
          ))}
        </div>
        <p className="cs-prototype-note">
          المنافسون أعلاه نماذج افتراضية — لا يتم سحب بيانات أو مسح منصات في هذا النموذج.
        </p>
      </section>

      {/* 12. Governance and limits */}
      <section className="cs-card cs-governance-card">
        <SectionHeader icon={ShieldCheck} title="الحوكمة والحدود" />
        <ul className="cs-gov-list">
          {governanceRules.map((rule) => (
            <li key={rule.id} className="cs-gov-item">
              <ShieldCheck size={14} className="cs-gov-icon" />
              <span>{rule.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 13. CTA area */}
      <section className="cs-card cs-cta-card">
        <SectionHeader icon={CheckCircle2} title="الخطوات التالية — نموذج تجريبي" />
        <p className="cs-cta-note">
          هذه الأزرار لا تنفذ أي عمليات فعلية. الوظائف تتطلب ربط API وحوكمة وموافقة قبل التفعيل.
        </p>
        <div className="cs-cta-buttons">
          <button type="button" className="cs-primary-btn" disabled>
            <FileText size={15} />
            <span>تصدير التقرير — غير متاح في النموذج</span>
          </button>
          <button type="button" className="cs-secondary-btn" disabled>
            <Calendar size={15} />
            <span>جدولة المحتوى — غير متاح في النموذج</span>
          </button>
          <button type="button" className="cs-secondary-btn" disabled>
            <Video size={15} />
            <span>توليد Script — يتطلب ربط AI</span>
          </button>
          <button type="button" className="cs-secondary-btn" disabled>
            <Clock3 size={15} />
            <span>تحديث الملف الاستراتيجي — يتطلب مراجعة يدوية</span>
          </button>
        </div>
      </section>
    </main>
  );
}

const styles = `
.cs-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(124, 58, 237, 0.05), transparent 30%),
    radial-gradient(circle at bottom left, rgba(20, 184, 166, 0.04), transparent 34%),
    #f6f8fb;
  color: #111827;
  font-family: "Inter", "Tajawal", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cs-hero {
  margin-bottom: 4px;
}

.cs-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  border-radius: 999px;
  background: #f5f3ff;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
}

.cs-page-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px;
}

.cs-page-desc {
  font-size: 13px;
  color: #6b7280;
  max-width: 680px;
  margin: 0;
  line-height: 1.6;
}

.cs-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 22px;
}

.cs-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

@media (max-width: 700px) {
  .cs-two-col { grid-template-columns: 1fr; }
}

.cs-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.cs-section-header h2 {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.cs-section-icon {
  color: #7c3aed;
  flex-shrink: 0;
}

.cs-sub-heading {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 10px;
}

.cs-prototype-note {
  font-size: 11px;
  color: #9ca3af;
  margin: 10px 0 0;
  padding: 8px 10px;
  background: #f9fafb;
  border-radius: 6px;
  border-inline-start: 3px solid #d1d5db;
  line-height: 1.5;
}

.cs-muted {
  font-size: 12px;
  color: #9ca3af;
}

/* Badges */
.cs-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.cs-badge-green  { background: #dcfce7; color: #166534; }
.cs-badge-blue   { background: #dbeafe; color: #1d4ed8; }
.cs-badge-amber  { background: #fef3c7; color: #92400e; }
.cs-badge-red    { background: #fee2e2; color: #991b1b; }
.cs-badge-neutral{ background: #f3f4f6; color: #374151; }

/* Platform chips */
.cs-platform-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.cs-chip {
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.cs-chip:hover {
  background: #f5f3ff;
  border-color: #7c3aed;
}

.cs-chip-active {
  background: #7c3aed;
  border-color: #7c3aed;
  color: #fff;
}

/* Input row */
.cs-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.cs-text-input {
  flex: 1;
  min-width: 220px;
  padding: 9px 13px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  background: #fff;
  outline: none;
}

.cs-text-input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.cs-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 8px;
  background: #7c3aed;
  color: #fff;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.cs-primary-btn:hover:not(:disabled) {
  background: #6d28d9;
}

.cs-primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cs-secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.cs-secondary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cs-analyze-notice {
  font-size: 12px;
  color: #7c3aed;
  background: #f5f3ff;
  border-radius: 6px;
  padding: 8px 12px;
  margin: 0 0 8px;
}

/* Identity */
.cs-identity-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: start;
  margin-bottom: 16px;
}

.cs-identity-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cs-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cs-creator-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.cs-creator-handle {
  font-size: 13px;
  color: #7c3aed;
  direction: ltr;
  text-align: right;
}

.cs-creator-platform {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.cs-creator-bio {
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 10px;
}

.cs-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cs-tag {
  padding: 3px 10px;
  border-radius: 999px;
  background: #f5f3ff;
  color: #7c3aed;
  font-size: 11px;
  font-weight: 600;
}

.cs-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  border-top: 1px solid #f3f4f6;
  padding-top: 14px;
}

@media (max-width: 600px) {
  .cs-stats-row { grid-template-columns: repeat(2, 1fr); }
}

.cs-stat-box {
  text-align: center;
}

.cs-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #7c3aed;
}

.cs-stat-label {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

/* Score bars */
.cs-score-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cs-score-row {}

.cs-score-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #374151;
  margin-bottom: 4px;
}

.cs-score-label strong {
  color: #7c3aed;
}

.cs-score-track {
  height: 6px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.cs-score-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 999px;
  transition: width 0.4s ease;
}

/* Pattern list */
.cs-pattern-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cs-pattern-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #374151;
}

.cs-pattern-label {
  flex: 1;
}

/* Audience */
.cs-audience-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 700px) {
  .cs-audience-grid { grid-template-columns: 1fr; }
}

.cs-audience-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  padding: 5px 0;
  border-bottom: 1px solid #f3f4f6;
}

.cs-audience-share {
  font-size: 13px;
  font-weight: 700;
  color: #7c3aed;
  white-space: nowrap;
  min-width: 36px;
}

.cs-peak-row {
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
}

.cs-peak-day {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.cs-peak-time {
  font-size: 12px;
  color: #374151;
  direction: ltr;
  text-align: right;
}

/* Strategic signal */
.cs-signal-grid {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.cs-signal-box {
  flex: 1;
  min-width: 200px;
  padding: 12px 14px;
  border-radius: 8px;
}

.cs-signal-current {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.cs-signal-suggested {
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
}

.cs-signal-label {
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.cs-signal-text {
  font-size: 13px;
  color: #111827;
  font-weight: 500;
  line-height: 1.5;
}

.cs-signal-arrow {
  font-size: 20px;
  color: #7c3aed;
  flex-shrink: 0;
}

.cs-signal-rationale {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 8px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
}

/* Strategy pillars */
.cs-pillars-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .cs-pillars-grid { grid-template-columns: 1fr; }
}

.cs-pillar-card {
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
}

.cs-tone-green  { border-inline-start: 3px solid #16a34a; background: #f0fdf4; }
.cs-tone-blue   { border-inline-start: 3px solid #2563eb; background: #eff6ff; }
.cs-tone-amber  { border-inline-start: 3px solid #d97706; background: #fffbeb; }
.cs-tone-neutral{ border-inline-start: 3px solid #9ca3af; background: #f9fafb; }

.cs-pillar-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}

.cs-pillar-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cs-pillar-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.cs-pillar-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.55;
  margin: 0;
}

/* Gaps */
.cs-gaps-heading {
  margin-top: 4px;
  margin-bottom: 10px;
}

.cs-gap-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cs-gap-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  padding: 8px 12px;
  background: #fffbeb;
  border-radius: 6px;
  border: 1px solid #fde68a;
}

.cs-gap-icon {
  color: #d97706;
  flex-shrink: 0;
  margin-top: 1px;
}

/* Content ideas */
.cs-ideas-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 600px) {
  .cs-ideas-grid { grid-template-columns: 1fr; }
}

.cs-idea-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  background: #f9fafb;
}

.cs-idea-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.cs-idea-title {
  font-size: 13px;
  color: #111827;
  line-height: 1.5;
}

/* Calendar */
.cs-calendar-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cs-cal-head {
  display: grid;
  grid-template-columns: 90px 130px 1fr 90px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #f3f4f6;
}

.cs-cal-row {
  display: grid;
  grid-template-columns: 90px 130px 1fr 90px;
  padding: 8px 10px;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #f9fafb;
}

.cs-cal-row:hover {
  background: #f9fafb;
  border-radius: 6px;
}

.cs-cal-day {
  font-weight: 600;
  color: #111827;
}

/* Captions */
.cs-captions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cs-caption-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  background: #fafafa;
}

.cs-caption-type {
  font-size: 11px;
  font-weight: 700;
  color: #7c3aed;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

.cs-caption-text {
  font-size: 13px;
  color: #111827;
  margin: 0;
  line-height: 1.6;
  border-inline-start: 3px solid #ddd6fe;
  padding-inline-start: 12px;
}

/* Competitors */
.cs-competitor-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cs-comp-head {
  display: grid;
  grid-template-columns: 1fr 80px 1.5fr;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #f3f4f6;
}

.cs-comp-row {
  display: grid;
  grid-template-columns: 1fr 80px 1.5fr;
  padding: 8px 10px;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #f9fafb;
}

.cs-comp-name {
  color: #111827;
  font-weight: 500;
}

.cs-comp-diff {
  font-size: 12px;
  color: #6b7280;
}

/* Governance */
.cs-governance-card {
  border-inline-start: 3px solid #059669;
}

.cs-gov-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cs-gov-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  line-height: 1.55;
}

.cs-gov-icon {
  color: #059669;
  flex-shrink: 0;
  margin-top: 1px;
}

/* CTA */
.cs-cta-card {
  border-inline-start: 3px solid #7c3aed;
}

.cs-cta-note {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 14px;
  line-height: 1.5;
}

.cs-cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
`;
