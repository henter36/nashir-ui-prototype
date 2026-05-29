import { useState } from "react";
import "./CreatorStudioPage.css";
import {
  ctxCampaignAngles,
  ctxAudienceSegments,
  ctxContentIdeas,
  ctxGovernanceTemplates,
  ctxPublishWindows,
  productionReadinessChecklist,
} from "../data/creatorStudioFlowFixture.js";
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

const flowActions = [
  { id: "fa1", label: "تحويل الأفكار إلى محتوى", desc: "افتح استوديو المحتوى لبناء نصوص ومنشورات من الأفكار المقترحة.", screen: "content", icon: FileText },
  { id: "fa2", label: "إنشاء حملة من التحليل", desc: "انطلق إلى معالج الحملات وابدأ حملة مستوحاة من هوية القناة.", screen: "campaigns", icon: Target },
  { id: "fa3", label: "جدولة محتوى مقترح", desc: "افتح جدولة النشر لتحديد أوقات النشر المثلى.", screen: "publishingQueue", icon: Calendar },
  { id: "fa4", label: "مراجعة القوالب والحوكمة", desc: "راجع الحوكمة والمطالبات المعتمدة قبل أي إنتاج فعلي.", screen: "promptGovernance", icon: ShieldCheck },
];

const _fbIdea     = { label: "غير محدد", type: "غير محدد", platform: "غير محدد" };
const _fbAngle    = { label: "غير محدد", audience: "غير محدد" };
const _fbSegment  = { label: "غير محدد" };
const _fbWindow   = { label: "غير محدد", note: "غير محدد" };
const _fbTemplate = { label: "غير محدد" };

function buildDestinationMapping(sel, opts) {
  const idea    = opts?.ideas?.find((i) => i.id === sel?.ideaId)       ?? opts?.ideas?.[0]     ?? _fbIdea;
  const angle   = opts?.angles?.find((a) => a.id === sel?.angleId)     ?? opts?.angles?.[0]    ?? _fbAngle;
  const segment = opts?.segments?.find((s) => s.id === sel?.segmentId) ?? opts?.segments?.[0]  ?? _fbSegment;
  const win     = opts?.windows?.find((w) => w.id === sel?.windowId)   ?? opts?.windows?.[0]   ?? _fbWindow;
  const tmpl    = opts?.templates?.find((t) => t.id === sel?.templateId) ?? opts?.templates?.[0] ?? _fbTemplate;
  return [
    {
      id: "dm1",
      destination: "استوديو المحتوى",
      fields: [
        { id: "dm1f1", label: "الفكرة المختارة", value: idea.label },
        { id: "dm1f2", label: "النوع والمنصة", value: `${idea.type} — ${idea.platform}` },
        { id: "dm1f3", label: "الجمهور", value: segment.label },
      ],
    },
    {
      id: "dm2",
      destination: "معالج الحملات",
      fields: [
        { id: "dm2f1", label: "زاوية الحملة", value: angle.label },
        { id: "dm2f2", label: "الجمهور المستهدف", value: angle.audience },
        { id: "dm2f3", label: "فكرة المحتوى", value: idea.label },
      ],
    },
    {
      id: "dm3",
      destination: "جدولة النشر",
      fields: [
        { id: "dm3f1", label: "نافذة النشر", value: win.label },
        { id: "dm3f2", label: "ملاحظة التوقيت", value: win.note },
        { id: "dm3f3", label: "الفكرة المجدولة", value: idea.label },
      ],
    },
    {
      id: "dm4",
      destination: "حوكمة المطالبات",
      fields: [
        { id: "dm4f1", label: "القالب المقترح", value: tmpl.label },
        { id: "dm4f2", label: "الجمهور", value: segment.label },
        { id: "dm4f3", label: "الحالة", value: "استشاري — يتطلب مراجعة بشرية" },
      ],
    },
  ];
}

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

export default function CreatorStudioPage({ onNavigate }) {
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [handleInput, setHandleInput] = useState("");
  const [analyzeStatus, setAnalyzeStatus] = useState("");

  const [selectedIdeaId, setSelectedIdeaId] = useState(ctxContentIdeas[0].id);
  const [selectedAngleId, setSelectedAngleId] = useState(ctxCampaignAngles[0].id);
  const [selectedSegmentId, setSelectedSegmentId] = useState(ctxAudienceSegments[0].id);
  const [selectedWindowId, setSelectedWindowId] = useState(ctxPublishWindows[0].id);
  const [selectedTemplateId, setSelectedTemplateId] = useState(ctxGovernanceTemplates[0].id);

  const destinationMapping = buildDestinationMapping(
    { ideaId: selectedIdeaId, angleId: selectedAngleId, segmentId: selectedSegmentId, windowId: selectedWindowId, templateId: selectedTemplateId },
    { ideas: ctxContentIdeas, angles: ctxCampaignAngles, segments: ctxAudienceSegments, windows: ctxPublishWindows, templates: ctxGovernanceTemplates }
  );

  const handleAnalyze = () => {
    setAnalyzeStatus("نموذج تجريبي — لا يوجد تحليل فعلي. البيانات المعروضة أدناه هي عينات ثابتة.");
  };

  return (
    <main className="cs-page" dir="rtl">
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
        <SectionHeader icon={BarChart3} title="ربط حساب القناة — قابل للربط لاحقًا" />
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
        <form
          className="cs-input-row"
          onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}
        >
          <input
            className="cs-text-input"
            type="text"
            placeholder="رابط الحساب أو الـ Handle — مثال: @lama.creates"
            value={handleInput}
            onChange={(e) => setHandleInput(e.target.value)}
            dir="ltr"
          />
          <button type="submit" className="cs-primary-btn">
            <Sparkles size={15} />
            <span>تحليل — نموذج تجريبي</span>
          </button>
        </form>
        {analyzeStatus && (
          <p className="cs-analyze-notice">{analyzeStatus}</p>
        )}
        <p className="cs-prototype-note">
          الزر أعلاه لا يرسل طلبات خارجية. البيانات أدناه ثابتة بغض النظر عن الإدخال.
        </p>
      </section>

      {/* 3. Interactive context selection */}
      <section className="cs-card cs-ctx-card">
        <SectionHeader icon={Lightbulb} title="اختيار السياق التجريبي" />
        <p className="cs-ctx-note">
          اختر من الخيارات أدناه — يُحدَّث سياق التحويل فوريًا في المتصفح فقط. لا تُخزَّن أي بيانات ولا تُنشأ سجلات.
        </p>
        {[
          { id: "sg1", label: "فكرة المحتوى",      options: ctxContentIdeas,        activeId: selectedIdeaId,     onSelect: setSelectedIdeaId },
          { id: "sg2", label: "زاوية الحملة",      options: ctxCampaignAngles,      activeId: selectedAngleId,    onSelect: setSelectedAngleId },
          { id: "sg3", label: "الجمهور المستهدف",  options: ctxAudienceSegments,    activeId: selectedSegmentId,  onSelect: setSelectedSegmentId },
          { id: "sg4", label: "نافذة النشر",       options: ctxPublishWindows,      activeId: selectedWindowId,   onSelect: setSelectedWindowId },
          { id: "sg5", label: "قالب الحوكمة",      options: ctxGovernanceTemplates, activeId: selectedTemplateId, onSelect: setSelectedTemplateId },
        ].map((group) => (
          <div key={group.id} className="cs-ctx-group">
            <div className="cs-ctx-group-label">{group.label}</div>
            <div className="cs-ctx-chips">
              {group.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`cs-chip${group.activeId === opt.id ? " cs-chip-active" : ""}`}
                  onClick={() => group.onSelect(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 4. Transfer context preview */}
      <section className="cs-card cs-mapping-card">
        <SectionHeader icon={Globe} title="مسودة سياق التحويل — للعرض فقط" />
        <p className="cs-mapping-notice">
          مسودة استشارية — لا تُخزَّن ولا تُنقَل فعليًا. أي استخدام يتطلب مراجعة بشرية كاملة قبل التطبيق.
        </p>
        <div className="cs-mapping-grid">
          {destinationMapping.map((dest) => (
            <div key={dest.id} className="cs-mapping-dest">
              <div className="cs-mapping-dest-head">
                <span className="cs-mapping-dest-title">{dest.destination}</span>
                <span className="cs-badge cs-badge-neutral">مسودة — للمراجعة</span>
              </div>
              <ul className="cs-mapping-field-list">
                {dest.fields.map((field) => (
                  <li key={field.id} className="cs-mapping-field">
                    <span className="cs-mapping-field-label">{field.label}</span>
                    <span className="cs-mapping-field-value">{field.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Channel identity summary */}
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

      {/* 6. Performance analysis */}
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

      {/* 7. Audience summary */}
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

      {/* 8. Strategic signal */}
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

      {/* 9. Strategy pillars + gaps */}
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

      {/* 10. Content ideas */}
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

      {/* 11. Weekly content calendar */}
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

      {/* 12. Generated content examples */}
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

      {/* 13. Competitor / gap analysis */}
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

      {/* 14. Governance and limits */}
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

      {/* 15. Production-readiness review */}
      <section className="cs-card cs-readiness-card">
        <SectionHeader icon={ShieldCheck} title="جاهزية التحويل للإنتاج — قائمة تحقق استشارية" />
        <p className="cs-readiness-note">
          هذه البنود استشارية فقط ولا تُعدَّل آليًا — كل بند مطلوب قبل أي استخدام إنتاجي فعلي.
        </p>
        <ul className="cs-readiness-list">
          {productionReadinessChecklist.map((item) => (
            <li key={item.id} className="cs-readiness-item">
              <div className="cs-readiness-row">
                <span className="cs-readiness-label">{item.label}</span>
                <span className={`cs-badge ${item.status === "required" ? "cs-badge-red" : "cs-badge-amber"}`}>
                  {item.status === "required" ? "إلزامي دائمًا" : "مطلوب"}
                </span>
              </div>
              <span className="cs-readiness-note-text">{item.note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 16. Flow navigation */}
      <section className="cs-card cs-flow-card">
        <SectionHeader icon={CheckCircle2} title="حوّل التحليل إلى إجراء — انتقال بروتوتايب فقط" />
        <p className="cs-flow-note">
          هذه الأزرار تنتقل بين صفحات النموذج التجريبي فقط — لا تُنشئ سجلات حقيقية ولا تُنفذ عمليات فعلية.
        </p>
        <div className="cs-flow-grid">
          {flowActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className="cs-flow-btn"
                onClick={() => typeof onNavigate === "function" && onNavigate(action.screen)}
              >
                <div className="cs-flow-icon">
                  <Icon size={18} />
                </div>
                <div className="cs-flow-body">
                  <div className="cs-flow-label">{action.label}</div>
                  <div className="cs-flow-desc">{action.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 17. CTA area */}
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
