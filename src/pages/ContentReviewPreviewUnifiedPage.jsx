import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Edit3,
  Eye,
  FileText,
  ImageIcon,
  Mail,
  Megaphone,
  MessageCircle,
  MonitorSmartphone,
  PlayCircle,
  RefreshCw,
  Search,
  Send,
  Smartphone,
  Sparkles,
  Wand2,
} from "lucide-react";
import { readCampaigns } from "../utils/campaignAnalyticsStore.js";
import { readCampaignContent } from "../utils/campaignContentStore.js";
import {
  refreshReviewItemsFromSources,
  updateReviewContent,
  updateReviewStatus,
} from "../utils/reviewPreviewStore.js";

const CAMPAIGNS = [
  {
    id: "cmp-001",
    name: "إطلاق مجموعة الصيف",
    product: "عطر أرابيان أود",
    status: "نشطة",
    readiness: 84,
    channels: ["Instagram", "TikTok", "WhatsApp"],
  },
  {
    id: "cmp-002",
    name: "عودة إلى المدرسة",
    product: "حذاء رياضي نايك",
    status: "تحتاج مراجعة",
    readiness: 68,
    channels: ["Snapchat", "Instagram"],
  },
  {
    id: "cmp-003",
    name: "عرض نهاية الأسبوع",
    product: "كريم مرطب نيفيا",
    status: "مسودة",
    readiness: 46,
    channels: ["WhatsApp", "Email"],
  },
  {
    id: "cmp-004",
    name: "خصومات العيد",
    product: "ساعة كاسيو",
    status: "معتمدة",
    readiness: 92,
    channels: ["Instagram", "Email"],
  },
];

const CONTENT_ITEMS = [
  {
    id: "cnt-001",
    campaignId: "cmp-001",
    title: "Caption Instagram",
    type: "Caption",
    channel: "Instagram",
    platform: "Instagram",
    status: "ready",
    risk: "low",
    icon: FileText,
    content:
      "اكتشف عطر أرابيان أود بتجربة فاخرة تناسب الهدايا والمناسبات. عرض خاص لفترة محدودة — اطلب الآن قبل انتهاء الكمية.",
    notes: ["CTA واضح", "يناسب Instagram", "لا توجد ادعاءات عالية المخاطر"],
  },
  {
    id: "cnt-002",
    campaignId: "cmp-001",
    title: "Reel Script",
    type: "Video Script",
    channel: "TikTok",
    platform: "TikTok",
    status: "review",
    risk: "medium",
    icon: PlayCircle,
    content:
      "المشهد 1: لقطة قريبة للعطر.\nالمشهد 2: إبراز التغليف كهدية.\nالمشهد 3: دعوة للطلب الآن مع عرض محدود.",
    notes: ["يحتاج CTA أقوى", "مناسب لفيديو 15 ثانية", "يفضل إضافة لقطة استخدام واقعية"],
  },
  {
    id: "cnt-003",
    campaignId: "cmp-001",
    title: "WhatsApp Message",
    type: "Direct Message",
    channel: "WhatsApp",
    platform: "WhatsApp",
    status: "approved",
    risk: "low",
    icon: MessageCircle,
    content:
      "مرحبًا، جهزنا لك عرضًا خاصًا على عطر أرابيان أود لفترة محدودة. شاهد التفاصيل واطلب مباشرة من الرابط.",
    notes: ["مختصر", "جاهز للإرسال اليدوي", "لا إرسال تلقائي"],
  },
  {
    id: "cnt-004",
    campaignId: "cmp-002",
    title: "Snapchat Story",
    type: "Story",
    channel: "Snapchat",
    platform: "Snapchat",
    status: "review",
    risk: "medium",
    icon: ImageIcon,
    content:
      "استعد للعودة للمدرسة بخيارات عملية ومريحة. شاهد العرض واختر ما يناسبك اليوم.",
    notes: ["الصورة تحتاج مراجعة مقاس", "CTA متوسط القوة"],
  },
  {
    id: "cnt-005",
    campaignId: "cmp-002",
    title: "Instagram Caption",
    type: "Caption",
    channel: "Instagram",
    platform: "Instagram",
    status: "draft",
    risk: "low",
    icon: FileText,
    content:
      "عودة المدرسة تبدأ بخطوة مريحة. اكتشف حذاء رياضي نايك بسعر مناسب وتجربة شراء سهلة.",
    notes: ["مسودة", "تحتاج تحسين العرض"],
  },
  {
    id: "cnt-006",
    campaignId: "cmp-003",
    title: "Email Offer",
    type: "Email",
    channel: "Email",
    platform: "Email",
    status: "draft",
    risk: "low",
    icon: Mail,
    content:
      "العنوان: عرض نهاية الأسبوع\n\nاحصل على كريم مرطب نيفيا بسعر خاص لفترة محدودة. العرض متاح حتى نهاية الأسبوع.",
    notes: ["العنوان يحتاج نسخة بديلة", "لا توجد صور مرتبطة"],
  },
  {
    id: "cnt-007",
    campaignId: "cmp-004",
    title: "Carousel Instagram",
    type: "Carousel",
    channel: "Instagram",
    platform: "Instagram",
    status: "approved",
    risk: "low",
    icon: ImageIcon,
    content:
      "خصومات العيد على ساعة كاسيو. تصميم عملي وسعر مناسب لفترة محدودة.",
    notes: ["معتمد", "جاهز للجدولة اليدوية"],
  },
];

const STATUS_META = {
  draft: ["مسودة", "slate"],
  review: ["تحتاج مراجعة", "amber"],
  ready: ["جاهز للمراجعة", "blue"],
  approved: ["معتمد", "green"],
  rejected: ["مرفوض", "red"],
};

const RISK_META = {
  low: ["منخفض", "green"],
  medium: ["متوسط", "amber"],
  high: ["مرتفع", "red"],
};

const PLATFORMS = ["Instagram", "TikTok", "Snapchat", "WhatsApp", "Email"];

export default function ContentReviewPreviewPage() {
  const [campaignList, setCampaignList] = useState(() => readCampaigns(CAMPAIGNS));
  const [contentItems, setContentItems] = useState(() =>
    refreshReviewItemsFromSources({
      contentSeed: CONTENT_ITEMS,
      campaignSeed: CAMPAIGNS,
      reviewSeed: CONTENT_ITEMS,
    })
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState("all");
  const [selectedContentId, setSelectedContentId] = useState(CONTENT_ITEMS[0].id);
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editorText, setEditorText] = useState(CONTENT_ITEMS[0].content);
  const [reviewNote, setReviewNote] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const reloadReviewState = () => {
      setCampaignList(readCampaigns(CAMPAIGNS));
      readCampaignContent(CONTENT_ITEMS);
      setContentItems(
        refreshReviewItemsFromSources({
          contentSeed: CONTENT_ITEMS,
          campaignSeed: CAMPAIGNS,
          reviewSeed: CONTENT_ITEMS,
        })
      );
    };

    window.addEventListener("focus", reloadReviewState);
    window.addEventListener("storage", reloadReviewState);
    window.addEventListener("nashir-campaigns-updated", reloadReviewState);
    window.addEventListener("nashir-campaign-content-updated", reloadReviewState);
    window.addEventListener("nashir-review-preview-updated", reloadReviewState);

    return () => {
      window.removeEventListener("focus", reloadReviewState);
      window.removeEventListener("storage", reloadReviewState);
      window.removeEventListener("nashir-campaigns-updated", reloadReviewState);
      window.removeEventListener("nashir-campaign-content-updated", reloadReviewState);
      window.removeEventListener("nashir-review-preview-updated", reloadReviewState);
    };
  }, []);

  const filteredContent = useMemo(() => {
    return contentItems.filter((item) => {
      const campaign = campaignList.find((c) => c.id === item.campaignId);
      const text = `${item.title} ${item.type} ${item.channel} ${campaign?.name || ""} ${campaign?.product || ""}`
        .toLowerCase();

      const matchesCampaign =
        selectedCampaignId === "all" || item.campaignId === selectedCampaignId;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesSearch = text.includes(query.toLowerCase());

      return matchesCampaign && matchesStatus && matchesSearch;
    });
  }, [campaignList, contentItems, query, selectedCampaignId, statusFilter]);

  const selectedContent =
    contentItems.find((item) => item.id === selectedContentId) || contentItems[0];

  const selectedCampaign =
    campaignList.find((campaign) => campaign.id === selectedContent.campaignId) ||
    campaignList[0];

  const stats = useMemo(() => {
    const scope =
      selectedCampaignId === "all"
        ? contentItems
        : contentItems.filter((item) => item.campaignId === selectedCampaignId);

    return {
      total: scope.length,
      approved: scope.filter((item) => item.status === "approved").length,
      review: scope.filter((item) => item.status === "review" || item.status === "ready").length,
      draft: scope.filter((item) => item.status === "draft").length,
    };
  }, [contentItems, selectedCampaignId]);

  const selectContent = (item) => {
    setSelectedContentId(item.id);
    setEditorText(item.content);
    setPlatform(item.platform);
    setReviewNote("");
    setCopied(false);
  };

  const updateStatus = (status) => {
    const next = updateReviewStatus(selectedContent.id, status, editorText, CONTENT_ITEMS);
    setContentItems(next);
  };

  const saveEdit = () => {
    const next = updateReviewContent(selectedContent.id, editorText, CONTENT_ITEMS);
    setContentItems(next);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(editorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="content-review-preview-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow">
            <MonitorSmartphone size={15} />
            Content + Review + Live Preview
          </div>
          <h1>مركز المحتوى والمراجعة والمعاينة</h1>
          <p>
            صفحة موحدة لاختيار حملة، عرض كل مخرجاتها مباشرة، مراجعة المحتوى،
            وتغيير المعاينة حسب المنصة قبل النشر.
          </p>
        </div>

        <div className="title-actions">
          <button type="button" className="secondary-button">
            <Download size={16} />
            تصدير
          </button>
          <button type="button" className="primary-button">
            <Sparkles size={16} />
            توليد مخرجات جديدة
          </button>
        </div>
      </section>

      <section className="toolbar">
        <div className="campaign-picker">
          <label>الحملة</label>
          <select
            value={selectedCampaignId}
            onChange={(event) => {
              setSelectedCampaignId(event.target.value);
              const first =
                event.target.value === "all"
                  ? contentItems[0]
                  : contentItems.find((item) => item.campaignId === event.target.value);
              if (first) selectContent(first);
            }}
          >
            <option value="all">كل الحملات</option>
            {campaignList.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            placeholder="ابحث في المحتوى أو الحملات..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="filter-row">
          {[
            ["all", "الكل"],
            ["draft", "مسودة"],
            ["review", "مراجعة"],
            ["ready", "جاهز"],
            ["approved", "معتمد"],
            ["rejected", "مرفوض"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={statusFilter === id ? "active" : ""}
              onClick={() => setStatusFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="stats-grid">
        <Stat title="إجمالي المحتوى" value={stats.total} icon={FileText} tone="blue" />
        <Stat title="معتمد" value={stats.approved} icon={CheckCircle2} tone="green" />
        <Stat title="ينتظر مراجعة" value={stats.review} icon={Clock3} tone="amber" />
        <Stat title="مسودات" value={stats.draft} icon={Edit3} tone="slate" />
      </section>

      <section className="workspace-grid">
        <aside className="content-list-card">
          <div className="card-header">
            <div>
              <h2>مخرجات المحتوى</h2>
              <p>
                {selectedCampaignId === "all"
                  ? "كل الحملات"
                  : selectedCampaign.name}
              </p>
            </div>
            <span>{filteredContent.length}</span>
          </div>

          <div className="content-list">
            {filteredContent.map((item) => {
              const Icon = item.icon;
              const status = STATUS_META[item.status];
              const campaign = campaignList.find((c) => c.id === item.campaignId);

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`content-item ${selectedContent.id === item.id ? "selected" : ""}`}
                  onClick={() => selectContent(item)}
                >
                  <div className="content-main">
                    <div className="content-icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{campaign?.name} · {item.channel}</span>
                    </div>
                  </div>

                  <div className="content-meta">
                    <StatusBadge meta={status} />
                    <RiskBadge risk={item.risk} />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="editor-card">
          <div className="card-header">
            <div>
              <h2>{selectedContent.title}</h2>
              <p>
                {selectedCampaign.name} · {selectedContent.type} · {selectedContent.channel}
              </p>
            </div>
            <div className="header-actions">
              <button type="button" className="secondary-button small" onClick={copyText}>
                <Copy size={15} />
                {copied ? "تم النسخ" : "نسخ"}
              </button>
              <button type="button" className="secondary-button small" onClick={saveEdit}>
                <RefreshCw size={15} />
                حفظ التعديل
              </button>
            </div>
          </div>

          <textarea
            className="editor-textarea"
            value={editorText}
            onChange={(event) => setEditorText(event.target.value)}
          />

          <div className="review-panel">
            <div>
              <h3>قرار المراجعة</h3>
              <p>الاعتماد هنا لا يعني النشر. النشر يتم من Publishing Queue فقط.</p>
            </div>

            <textarea
              className="review-note"
              value={reviewNote}
              placeholder="أضف ملاحظة مراجعة..."
              onChange={(event) => setReviewNote(event.target.value)}
            />

            <div className="review-actions">
              <button type="button" className="approve" onClick={() => updateStatus("approved")}>
                <CheckCircle2 size={16} />
                اعتماد
              </button>
              <button type="button" className="request" onClick={() => updateStatus("review")}>
                <AlertTriangle size={16} />
                طلب تعديل
              </button>
              <button type="button" className="reject" onClick={() => updateStatus("rejected")}>
                رفض
              </button>
            </div>
          </div>

          <div className="source-notes">
            <h3>ملاحظات ومخاطر</h3>
            {selectedContent.notes.map((note) => (
              <div key={note}>
                <AlertTriangle size={15} />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="preview-card">
          <div className="card-header">
            <div>
              <h2>المعاينة الحية</h2>
              <p>محاكاة المنصة قبل الجدولة أو النشر.</p>
            </div>
            <Eye size={21} />
          </div>

          <div className="platform-switch">
            {PLATFORMS.map((item) => (
              <button
                key={item}
                type="button"
                className={platform === item ? "active" : ""}
                onClick={() => setPlatform(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <PlatformPreview platform={platform} content={editorText} item={selectedContent} />

          <div className="preview-warning">
            <ShieldText />
          </div>
        </aside>
      </section>
    </main>
  );
}

function ShieldText() {
  return (
    <>
      <AlertTriangle size={17} />
      <span>
        المعاينة محاكاة فقط. لا يوجد نشر أو إرسال فعلي من هذه الصفحة.
      </span>
    </>
  );
}

function PlatformPreview({ platform, content, item }) {
  if (platform === "Email") {
    return (
      <div className="email-preview">
        <div className="email-top">
          <Mail size={18} />
          <strong>Newsletter Preview</strong>
        </div>
        <h3>{item.title}</h3>
        <p>{content}</p>
        <button>CTA: اطلب الآن</button>
      </div>
    );
  }

  if (platform === "WhatsApp") {
    return (
      <div className="whatsapp-preview">
        <div className="chat-bubble">
          <MessageCircle size={16} />
          <p>{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-preview">
      <div className="phone-header">
        <Smartphone size={16} />
        <strong>{platform}</strong>
      </div>
      <div className="phone-media">
        <ImageIcon size={42} />
      </div>
      <p>{content}</p>
      <button>اطلب الآن</button>
    </div>
  );
}

function Stat({ title, value, icon: Icon, tone }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
      <div className="stat-icon">
        <Icon size={21} />
      </div>
    </article>
  );
}

function StatusBadge({ meta }) {
  return <span className={`status-badge ${meta[1]}`}>{meta[0]}</span>;
}

function RiskBadge({ risk }) {
  const meta = RISK_META[risk];
  return <span className={`risk-badge ${meta[1]}`}>خطر {meta[0]}</span>;
}

const styles = `
.content-review-preview-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.06), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.page-title,
.toolbar,
.stat-card,
.content-list-card,
.editor-card,
.preview-card {
  border: 1px solid #e4e7df;
  background: #fff;
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

.eyebrow {
  width: fit-content;
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #176b2c;
  background: #eef7e9;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 10px;
}

.page-title h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.page-title p {
  margin: 7px 0 0;
  max-width: 850px;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.title-actions,
.header-actions,
.review-actions {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
}

.primary-button,
.secondary-button {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  border: 0;
  color: #fff;
  background: #176b2c;
}

.secondary-button {
  border: 1px solid #e4e7df;
  background: #fff;
  color: #1f241d;
}

.secondary-button.small {
  min-height: 36px;
  padding: 0 12px;
  font-size: 12px;
}

.toolbar {
  min-height: 74px;
  padding: 14px;
  display: grid;
  grid-template-columns: 260px minmax(260px, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.campaign-picker {
  display: grid;
  gap: 6px;
}

.campaign-picker label {
  font-size: 11px;
  color: #6f746b;
  font-weight: 900;
}

.campaign-picker select,
.search-box input {
  font-family: inherit;
}

.campaign-picker select {
  min-height: 42px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 16px;
  padding: 0 12px;
}

.search-box {
  height: 42px;
  border: 1px solid #e4e7df;
  border-radius: 999px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.search-box input {
  border: 0;
  outline: 0;
  background: transparent;
  width: 100%;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.filter-row button {
  min-height: 34px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 0 11px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.filter-row button.active {
  color: #176b2c;
  background: #eef7e9;
  border-color: #176b2c;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stat-card {
  min-height: 104px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}

.stat-card span {
  color: #6f746b;
  font-size: 13px;
  font-weight: 900;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 30px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 16px;
}

.stat-card.blue .stat-icon {
  color: #2563eb;
  background: #eff6ff;
}

.stat-card.green .stat-icon {
  color: #166534;
  background: #f0fdf4;
}

.stat-card.amber .stat-icon {
  color: #92400e;
  background: #fffbeb;
}

.stat-card.slate .stat-icon {
  color: #475569;
  background: #f8fafc;
}

.workspace-grid {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}

.content-list-card,
.editor-card,
.preview-card {
  padding: 18px;
}

.content-list-card,
.preview-card {
  position: sticky;
  top: 96px;
  max-height: calc(100vh - 120px);
  overflow: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}

.card-header p {
  margin: 5px 0 0;
  color: #6f746b;
  font-size: 12px;
  line-height: 1.7;
}

.card-header > span {
  color: #176b2c;
  background: #eef7e9;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 900;
}

.content-list {
  display: grid;
  gap: 10px;
}

.content-item {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 18px;
  padding: 13px;
  width: 100%;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.content-item.selected {
  border-color: #176b2c;
  background: #fbfdf9;
  box-shadow: 0 0 0 4px #eef7e9;
}

.content-main {
  display: flex;
  gap: 10px;
  align-items: center;
}

.content-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #eef7e9;
  color: #176b2c;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.content-main strong,
.content-main span {
  display: block;
}

.content-main strong {
  font-size: 13px;
}

.content-main span {
  color: #6f746b;
  font-size: 11px;
  margin-top: 3px;
}

.content-meta {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.status-badge,
.risk-badge {
  min-height: 26px;
  border-radius: 999px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
}

.status-badge.green,
.risk-badge.green {
  color: #166534;
  background: #f0fdf4;
}

.status-badge.amber,
.risk-badge.amber {
  color: #92400e;
  background: #fffbeb;
}

.status-badge.blue {
  color: #1d4ed8;
  background: #eff6ff;
}

.status-badge.slate {
  color: #475569;
  background: #f8fafc;
}

.status-badge.red,
.risk-badge.red {
  color: #991b1b;
  background: #fef2f2;
}

.editor-textarea {
  width: 100%;
  min-height: 250px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  font-family: inherit;
  line-height: 1.9;
  resize: vertical;
  outline: 0;
}

.review-panel,
.source-notes,
.preview-warning {
  margin-top: 16px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 14px;
}

.review-panel h3,
.source-notes h3 {
  margin: 0;
  font-size: 16px;
}

.review-panel p {
  margin: 5px 0 12px;
  color: #6f746b;
  font-size: 12px;
}

.review-note {
  width: 100%;
  min-height: 88px;
  border: 1px solid #e4e7df;
  border-radius: 16px;
  padding: 12px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 12px;
}

.review-actions button {
  min-height: 38px;
  border-radius: 14px;
  padding: 0 12px;
  display: inline-flex;
  gap: 7px;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.review-actions .approve {
  border: 0;
  background: #176b2c;
  color: #fff;
}

.review-actions .request {
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #92400e;
}

.review-actions .reject {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.source-notes {
  display: grid;
  gap: 8px;
}

.source-notes div {
  display: flex;
  gap: 8px;
  color: #92400e;
  font-size: 12px;
  font-weight: 800;
}

.platform-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 16px;
}

.platform-switch button {
  min-height: 34px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 0 11px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.platform-switch button.active {
  color: #176b2c;
  background: #eef7e9;
  border-color: #176b2c;
}

.phone-preview {
  border: 10px solid #111827;
  border-radius: 34px;
  background: #fff;
  padding: 14px;
  min-height: 520px;
}

.phone-header {
  display: flex;
  gap: 8px;
  align-items: center;
  border-bottom: 1px solid #e4e7df;
  padding-bottom: 10px;
}

.phone-media {
  height: 220px;
  margin: 14px 0;
  border-radius: 22px;
  background: linear-gradient(135deg, #eef7e9, #eff6ff);
  display: grid;
  place-items: center;
  color: #176b2c;
}

.phone-preview p {
  line-height: 1.8;
  white-space: pre-line;
}

.phone-preview button,
.email-preview button {
  width: 100%;
  min-height: 40px;
  border: 0;
  border-radius: 14px;
  background: #176b2c;
  color: #fff;
  font-weight: 900;
}

.whatsapp-preview {
  min-height: 420px;
  background: #e9f7ef;
  border-radius: 22px;
  padding: 18px;
  display: flex;
  align-items: flex-end;
}

.chat-bubble {
  max-width: 90%;
  border-radius: 20px 20px 4px 20px;
  background: #fff;
  padding: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
}

.chat-bubble p,
.email-preview p {
  line-height: 1.8;
  white-space: pre-line;
}

.email-preview {
  border: 1px solid #e4e7df;
  border-radius: 22px;
  background: #fff;
  padding: 16px;
}

.email-top {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e4e7df;
  padding-bottom: 10px;
}

.preview-warning {
  border-color: #fde68a;
  background: #fff7e6;
  color: #92400e;
  display: flex;
  gap: 8px;
  line-height: 1.7;
  font-size: 12px;
  font-weight: 800;
}

@media (max-width: 1300px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .content-list-card,
  .preview-card {
    position: static;
    max-height: none;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .content-review-preview-page {
    padding: 16px;
  }

  .page-title,
  .title-actions,
  .card-header {
    align-items: stretch;
    flex-direction: column;
  }

  .page-title h1 {
    font-size: 27px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .phone-preview {
    min-height: auto;
  }
}
`;
