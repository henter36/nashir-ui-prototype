import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Megaphone,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  deriveMetricsFromCampaigns,
  readCampaigns,
  refreshDashboardSummary,
  writeCampaignMetrics,
} from "../utils/campaignAnalyticsStore.js";

const CAMPAIGNS = [
  {
    id: "cmp-001",
    name: "إطلاق مجموعة الصيف",
    goal: "Launch",
    product: "عطر أرابيان أود",
    status: "active",
    stage: "مراجعة المحتوى",
    readiness: 84,
    channels: ["Instagram", "TikTok", "WhatsApp"],
    budget: "5,000 SAR",
    updatedAt: "منذ ساعتين",
    owner: "أحمد",
    period: "10 مارس → 15 مارس",
    performance: { reach: "38K", conversions: "124", roi: "2.4x", cpa: "18 SAR" },
    outputs: [
      ["Caption Instagram", "معتمد", "Instagram", "نص إعلاني قصير جاهز للمراجعة النهائية."],
      ["Reel Script", "مراجعة", "TikTok", "سكريبت فيديو قصير يحتاج CTA أوضح."],
      ["WhatsApp Message", "معتمد", "WhatsApp", "رسالة مباشرة لإعادة التنشيط."],
      ["Email Subject", "مسودة", "Email", "عنوان بريدي يحتاج تحسين."],
    ],
    edits: [
      ["تم تعديل الرسالة الرئيسية", "أحمد", "منذ 35 دقيقة"],
      ["تم طلب مراجعة Reel Script", "سارة", "منذ ساعة"],
      ["تم تحديث الجمهور المستهدف", "System", "منذ ساعتين"],
    ],
  },
  {
    id: "cmp-002",
    name: "عودة إلى المدرسة",
    goal: "Sales",
    product: "حذاء رياضي نايك",
    status: "review",
    stage: "بانتظار الاعتماد",
    readiness: 68,
    channels: ["Snapchat", "Instagram"],
    budget: "3,500 SAR",
    updatedAt: "منذ 5 ساعات",
    owner: "سارة",
    period: "01 أغسطس → 10 أغسطس",
    performance: { reach: "21K", conversions: "86", roi: "1.8x", cpa: "24 SAR" },
    outputs: [
      ["Story Offer", "مراجعة", "Snapchat", "رسالة عرض قصيرة تحتاج مراجعة."],
      ["Instagram Caption", "مسودة", "Instagram", "نص تعريفي مبدئي."],
    ],
    edits: [
      ["تم تغيير القناة الأساسية إلى Snapchat", "سارة", "منذ 3 ساعات"],
      ["تم إضافة منتج مستهدف", "محمد", "منذ 5 ساعات"],
    ],
  },
  {
    id: "cmp-003",
    name: "عرض نهاية الأسبوع",
    goal: "Retention",
    product: "كريم مرطب نيفيا",
    status: "draft",
    stage: "استكمال البيانات",
    readiness: 46,
    channels: ["WhatsApp", "Email"],
    budget: "1,200 SAR",
    updatedAt: "منذ يوم",
    owner: "محمد",
    period: "الخميس → السبت",
    performance: { reach: "12K", conversions: "44", roi: "1.2x", cpa: "31 SAR" },
    outputs: [
      ["WhatsApp Draft", "مسودة", "WhatsApp", "رسالة أولية لإعادة التنشيط."],
      ["Email Draft", "مسودة", "Email", "بريد يحتاج عرضًا أوضح."],
    ],
    edits: [["تم إنشاء الحملة كمسودة", "محمد", "منذ يوم"]],
  },
  {
    id: "cmp-004",
    name: "خصومات العيد",
    goal: "Awareness",
    product: "ساعة كاسيو",
    status: "approved",
    stage: "جاهزة للنشر اليدوي",
    readiness: 92,
    channels: ["Instagram", "Twitter(X)", "Email"],
    budget: "7,000 SAR",
    updatedAt: "منذ يومين",
    owner: "أحمد",
    period: "عيد الأضحى",
    performance: { reach: "46K", conversions: "168", roi: "3.1x", cpa: "15 SAR" },
    outputs: [
      ["Instagram Carousel", "معتمد", "Instagram", "تصميم ونص معتمدان."],
      ["Email Offer", "معتمد", "Email", "بريد عرض جاهز للتصدير."],
    ],
    edits: [
      ["تم اعتماد الحملة", "أحمد", "منذ يومين"],
      ["تم تحديث الميزانية", "System", "منذ 3 أيام"],
    ],
  },
];

const STATUS_MAP = {
  active: { label: "نشطة", className: "green" },
  review: { label: "تحتاج مراجعة", className: "amber" },
  draft: { label: "مسودة", className: "slate" },
  approved: { label: "معتمدة", className: "blue" },
};

const FILTERS = [
  ["all", "الكل"],
  ["active", "نشطة"],
  ["review", "تحتاج مراجعة"],
  ["draft", "مسودة"],
  ["approved", "معتمدة"],
];

const TABS = [
  ["overview", "نظرة عامة"],
  ["outputs", "المخرجات"],
  ["performance", "الأداء"],
  ["changes", "التعديلات"],
];

function getCampaignProductName(campaign = {}) {
  return campaign.productSnapshot?.name || campaign.product || "غير محدد";
}

function getProductReferenceLabel(campaign = {}) {
  return campaign.productId ? "مرتبط بمنتج محفوظ" : "مرجع المنتج غير متوفر";
}

export default function CampaignsUnifiedPage({ onCreateCampaign = () => {} }) {
  const [campaignList, setCampaignList] = useState(() => readCampaigns(CAMPAIGNS));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(CAMPAIGNS[0].id);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const reloadCampaigns = () => {
      const nextCampaigns = readCampaigns(CAMPAIGNS);
      const nextMetrics = deriveMetricsFromCampaigns(nextCampaigns);

      setCampaignList(nextCampaigns);
      writeCampaignMetrics(nextMetrics);
      refreshDashboardSummary(nextCampaigns, nextMetrics);
    };

    window.addEventListener("focus", reloadCampaigns);
    window.addEventListener("storage", reloadCampaigns);
    window.addEventListener("nashir-campaigns-updated", reloadCampaigns);
    window.addEventListener("nashir-campaign-metrics-updated", reloadCampaigns);

    return () => {
      window.removeEventListener("focus", reloadCampaigns);
      window.removeEventListener("storage", reloadCampaigns);
      window.removeEventListener("nashir-campaigns-updated", reloadCampaigns);
      window.removeEventListener("nashir-campaign-metrics-updated", reloadCampaigns);
    };
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaignList.filter((campaign) => {
      const searchText = `${campaign.name} ${getCampaignProductName(campaign)} ${campaign.goal} ${campaign.owner}`.toLowerCase();
      const matchesQuery = searchText.includes(query.toLowerCase());
      const matchesFilter = filter === "all" || campaign.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [campaignList, query, filter]);

  const selectedCampaign =
    campaignList.find((campaign) => campaign.id === selectedId) || campaignList[0];
  const latestWizardCampaign = useMemo(
    () => campaignList.find((campaign) =>
      (campaign.edits || []).some(([action]) => String(action || "").includes("معالج إنشاء الحملة"))
    ),
    [campaignList]
  );

  const stats = useMemo(
    () => ({
      total: campaignList.length,
      active: campaignList.filter((item) => item.status === "active").length,
      review: campaignList.filter((item) => item.status === "review").length,
      avgReadiness: campaignList.length
        ? Math.round(campaignList.reduce((sum, item) => sum + item.readiness, 0) / campaignList.length)
        : 0,
    }),
    [campaignList]
  );

  if (!selectedCampaign) return null;

  return (
    <main className="campaigns-unified-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow">
            <Megaphone size={15} />
            Campaigns Center
          </div>
          <h1>الحملات</h1>
          <p>
            صفحة موحدة تجمع قائمة الحملات وتفاصيل الحملة المختارة في نفس المكان،
            بدل التنقل بين قائمة منفصلة وصفحة تفاصيل منفصلة.
          </p>
        </div>

        <button type="button" className="primary-action" onClick={onCreateCampaign}>
          <Plus size={17} />
          إنشاء حملة
        </button>
      </section>

      <section className="screen-guidance-card">
        <div><span>هدف الشاشة</span><strong>عرض الحملات وحالتها وربطها بالمحتوى والمراجعة.</strong></div>
        <div><span>المدخلات</span><strong>الحملات المحفوظة، المنتج، الحالة، مخرجات المحتوى.</strong></div>
        <div><span>المخرجات</span><strong>حالة الحملة والإجراء التالي.</strong></div>
        <div><span>الإجراء التالي</span><strong>فتح التفاصيل أو المحتوى أو المراجعة.</strong></div>
        <div><span>ما لا يحدث هنا</span><strong>لا يتم تنفيذ حملة فعلية.</strong></div>
      </section>

      <section className="stats-grid">
        <Stat title="إجمالي الحملات" value={stats.total} icon={Megaphone} tone="green" />
        <Stat title="النشطة" value={stats.active} icon={Sparkles} tone="blue" />
        <Stat title="تحتاج مراجعة" value={stats.review} icon={AlertTriangle} tone="amber" />
        <Stat title="متوسط الجاهزية" value={`${stats.avgReadiness}%`} icon={BarChart3} tone="teal" />
      </section>

      <section className="wizard-reflection-card">
        <div className="card-header">
          <div>
            <h2>آخر حملة من المعالج</h2>
            <p>هذه مخرجات واجهية تجريبية تعكس آخر حملة محفوظة من معالج إنشاء الحملة.</p>
          </div>
          <span>{latestWizardCampaign ? "موجودة" : "فارغة"}</span>
        </div>
        {latestWizardCampaign ? (
          <div className="wizard-reflection-grid">
            <Info label="اسم الحملة" value={latestWizardCampaign.name} />
            <Info label="المنتج" value={getCampaignProductName(latestWizardCampaign)} />
            <Info label="الهدف" value={latestWizardCampaign.goal} />
            <Info label="القنوات" value={(latestWizardCampaign.channels || []).join("، ") || "غير محدد"} />
            <Info label="حالة المحتوى" value={(latestWizardCampaign.outputs || []).length ? "مخرجات أولية قابلة للمراجعة" : "لم يتم تجهيز مخرجات"} />
            <Info label="جاهزية المراجعة" value={latestWizardCampaign.readiness >= 60 ? "جاهزة مبدئيًا" : "تحتاج استكمال"} />
            <Info label="مرجع واجهي" value={getProductReferenceLabel(latestWizardCampaign)} />
            <Info label="الإجراء التالي" value="فتح استوديو المحتوى أو المراجعة والمعاينة." />
          </div>
        ) : (
          <div className="empty-wizard-state">لم يتم إنشاء حملة من المعالج بعد.</div>
        )}
      </section>

      <section className="toolbar-card">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            placeholder="ابحث باسم الحملة أو المنتج أو المسؤول..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="filter-row">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={filter === id ? "active" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="campaigns-layout">
        <article className="campaign-list-card">
          <div className="card-header">
            <div>
              <h2>قائمة الحملات</h2>
              <p>اختر حملة لعرض تفاصيلها مباشرة.</p>
            </div>
            <span>{filteredCampaigns.length} نتيجة</span>
          </div>

          <div className="campaign-list">
            {filteredCampaigns.map((campaign) => {
              const status = STATUS_MAP[campaign.status] || STATUS_MAP.draft;

              return (
                <button
                  key={campaign.id}
                  type="button"
                  className={`campaign-item ${
                    selectedCampaign.id === campaign.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedId(campaign.id);
                    setActiveTab("overview");
                  }}
                >
                  <div className="campaign-item-head">
                    <div className="campaign-main">
                      <div className="campaign-icon">
                        <Megaphone size={17} />
                      </div>
                      <div>
                        <strong>{campaign.name}</strong>
                        <small>{getCampaignProductName(campaign)} · {campaign.goal}</small>
                      </div>
                    </div>

                    <span className={`status-pill ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="campaign-item-meta">
                    <span>{campaign.stage}</span>
                    <span>{campaign.updatedAt}</span>
                  </div>

                  <div className="readiness-row">
                    <div className="track">
                      <i style={{ width: `${campaign.readiness}%` }} />
                    </div>
                    <small>{campaign.readiness}%</small>
                  </div>

                  <div className="channel-tags">
                    {campaign.channels.slice(0, 3).map((channel) => (
                      <span key={channel}>{channel}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <section className="campaign-detail-card">
          <div className="detail-header">
            <div className="detail-title">
              <div className="detail-icon">
                <Eye size={22} />
              </div>

              <div>
                <h2>{selectedCampaign.name}</h2>
                <p>{getCampaignProductName(selectedCampaign)} · {selectedCampaign.period}</p>
              </div>
            </div>

            <div className="detail-actions">
              <button type="button" className="secondary-action">
                <Edit3 size={16} />
                تعديل
              </button>
              <button type="button" className="primary-action compact">
                <Sparkles size={16} />
                توليد مخرجات
              </button>
            </div>
          </div>

          <div className="tabs">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={activeTab === id ? "active" : ""}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="detail-grid">
              <section className="detail-section">
                <h3>ملخص الحملة</h3>

                <div className="summary-grid">
                  <Info label="الحالة" value={(STATUS_MAP[selectedCampaign.status] || STATUS_MAP.draft).label} />
                  <Info label="المرحلة" value={selectedCampaign.stage} />
                  <Info label="الهدف" value={selectedCampaign.goal} />
                  <Info label="الميزانية" value={selectedCampaign.budget} />
                  <Info label="المسؤول" value={selectedCampaign.owner} />
                  <Info label="آخر تحديث" value={selectedCampaign.updatedAt} />
                </div>

                <div className="warning">
                  <AlertTriangle size={18} />
                  أي نشر فعلي يجب أن يمر عبر مراجعة بشرية وسجل تدقيق.
                </div>
              </section>

              <aside className="detail-section">
                <h3>جاهزية الحملة</h3>

                <div className="readiness-card">
                  <div className="ring">{selectedCampaign.readiness}%</div>
                  <div>
                    <strong>
                      {selectedCampaign.readiness >= 70 ? "جيدة" : "تحتاج استكمال"}
                    </strong>
                    <span>{selectedCampaign.stage}</span>
                  </div>
                </div>

                <h3 className="subhead">القنوات</h3>
                <div className="channel-tags large">
                  {selectedCampaign.channels.map((channel) => (
                    <span key={channel}>{channel}</span>
                  ))}
                </div>
              </aside>
            </div>
          )}

          {activeTab === "outputs" && (
            <div className="detail-section">
              <h3>مخرجات الحملة</h3>

              <div className="output-list">
                {selectedCampaign.outputs.map(([name, status, channel, text]) => (
                  <div key={name} className="output-row">
                    <div>
                      <strong>{name}</strong>
                      <span>{channel}</span>
                    </div>
                    <p>{text}</p>
                    <OutputStatus value={status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="detail-section">
              <h3>الأداء</h3>

              <div className="performance-grid">
                <Info label="الوصول" value={selectedCampaign.performance.reach} />
                <Info label="التحويلات" value={selectedCampaign.performance.conversions} />
                <Info label="ROI" value={selectedCampaign.performance.roi} />
                <Info label="CPA" value={selectedCampaign.performance.cpa} />
              </div>

              <div className="chart-card">
                <TrendingUp size={38} />
                <strong>أداء تقديري مرتبط بالحملة</strong>
                <span>المصدر الحالي Mock — لاحقًا يربط مع Analytics.</span>
              </div>
            </div>
          )}

          {activeTab === "changes" && (
            <div className="detail-section">
              <h3>سجل التعديلات</h3>

              <div className="timeline">
                {selectedCampaign.edits.map(([action, actor, time]) => (
                  <div key={`${action}-${time}`} className="timeline-row">
                    <Clock3 size={17} />
                    <div>
                      <strong>{action}</strong>
                      <span>{actor} · {time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
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

function Info({ label, value }) {
  return (
    <div className="info-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OutputStatus({ value }) {
  const className =
    value === "معتمد" ? "green" : value === "مراجعة" ? "amber" : "slate";

  return <span className={`output-status ${className}`}>{value}</span>;
}

const styles = `
.campaigns-unified-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.06), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.page-title,
.stat-card,
.toolbar-card,
.campaign-list-card,
.campaign-detail-card {
  border: 1px solid #e4e7df;
  background: #ffffff;
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
  max-width: 760px;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.primary-action,
.secondary-action {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.primary-action {
  color: #fff;
  background: #176b2c;
  border: 0;
  box-shadow: 0 12px 24px rgba(23, 107, 44, 0.16);
}

.primary-action.compact {
  min-height: 38px;
}

.secondary-action {
  background: #fff;
  color: #1f241d;
  border: 1px solid #e4e7df;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.wizard-reflection-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(24, 38, 18, 0.04);
  margin-bottom: 16px;
}

.wizard-reflection-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.empty-wizard-state {
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  color: #64748b;
  border-radius: 18px;
  padding: 14px;
  font-size: 13px;
  font-weight: 900;
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
  line-height: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 16px;
}

.stat-card.green .stat-icon,
.stat-card.teal .stat-icon {
  color: #176b2c;
  background: #eef7e9;
}

.stat-card.blue .stat-icon {
  color: #2563eb;
  background: #eff6ff;
}

.stat-card.amber .stat-icon {
  color: #92400e;
  background: #fffbeb;
}

.toolbar-card {
  min-height: 70px;
  padding: 14px;
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.search-box {
  height: 44px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 0 13px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: inherit;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.filter-row button {
  min-height: 36px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 0 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.filter-row button.active {
  color: #176b2c;
  background: #eef7e9;
  border-color: #176b2c;
}

.campaigns-layout {
  display: grid;
  grid-template-columns: 390px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.campaign-list-card,
.campaign-detail-card {
  padding: 18px;
}

.campaign-list-card {
  position: sticky;
  top: 96px;
  max-height: calc(100vh - 120px);
  overflow: auto;
}

.card-header,
.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.card-header h2,
.detail-header h2,
.detail-section h3 {
  margin: 0;
  font-size: 18px;
}

.card-header p,
.detail-header p {
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

.campaign-list {
  display: grid;
  gap: 10px;
}

.campaign-item {
  width: 100%;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 18px;
  padding: 13px;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.campaign-item.selected {
  border-color: #176b2c;
  background: #fbfdf9;
  box-shadow: 0 0 0 4px #eef7e9;
}

.campaign-item-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.campaign-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.campaign-icon,
.detail-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #176b2c;
  background: #eef7e9;
  flex: 0 0 auto;
}

.campaign-main strong {
  display: block;
  font-size: 13px;
}

.campaign-main small,
.campaign-item-meta span,
.readiness-row small {
  display: block;
  color: #6f746b;
  font-size: 11px;
  margin-top: 3px;
}

.status-pill,
.output-status {
  width: fit-content;
  min-height: 27px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0 9px;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 900;
}

.status-pill.green,
.output-status.green {
  color: #166534;
  background: #f0fdf4;
}

.status-pill.amber,
.output-status.amber {
  color: #92400e;
  background: #fffbeb;
}

.status-pill.slate,
.output-status.slate {
  color: #475569;
  background: #f8fafc;
}

.status-pill.blue {
  color: #1d4ed8;
  background: #eff6ff;
}

.campaign-item-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
}

.readiness-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.track {
  height: 7px;
  flex: 1;
  border-radius: 999px;
  background: #e4e7df;
  overflow: hidden;
}

.track i {
  display: block;
  height: 100%;
  background: #176b2c;
  border-radius: inherit;
}

.channel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.channel-tags span {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 900;
}

.channel-tags.large span {
  font-size: 11px;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.tabs {
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border: 1px solid #e4e7df;
  border-radius: 18px;
  background: #f7f8f4;
  margin-bottom: 16px;
}

.tabs button {
  min-height: 36px;
  border: 0;
  background: transparent;
  border-radius: 999px;
  padding: 0 13px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.tabs button.active {
  background: #176b2c;
  color: #fff;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
}

.detail-section {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 20px;
  padding: 16px;
}

.summary-grid,
.performance-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.info-card {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  padding: 13px;
}

.info-card span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.info-card strong {
  display: block;
  margin-top: 5px;
  font-size: 13px;
}

.warning {
  margin-top: 16px;
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #92400e;
  border-radius: 18px;
  padding: 13px;
  display: flex;
  gap: 8px;
  line-height: 1.8;
  font-size: 13px;
  font-weight: 800;
}

.readiness-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 14px;
}

.ring {
  width: 74px;
  height: 74px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 7px solid #176b2c;
  background: #fff;
  font-weight: 1000;
  flex: 0 0 auto;
}

.readiness-card strong {
  display: block;
}

.readiness-card span {
  display: block;
  color: #6f746b;
  margin-top: 4px;
  font-size: 12px;
}

.subhead {
  margin-top: 18px !important;
}

.output-list,
.timeline {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.output-row {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 13px;
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr) 90px;
  gap: 12px;
  align-items: center;
}

.output-row strong {
  display: block;
}

.output-row span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  margin-top: 3px;
}

.output-row p {
  margin: 0;
  color: #374151;
  line-height: 1.7;
  font-size: 13px;
}

.chart-card {
  min-height: 220px;
  margin-top: 14px;
  border: 1px solid #e4e7df;
  background: linear-gradient(135deg, #eef7e9, #fff);
  border-radius: 20px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #176b2c;
}

.chart-card strong,
.chart-card span {
  display: block;
}

.chart-card span {
  color: #6f746b;
  font-size: 12px;
}

.timeline-row {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  gap: 10px;
}

.timeline-row strong,
.timeline-row span {
  display: block;
}

.timeline-row span {
  margin-top: 3px;
  color: #6f746b;
  font-size: 12px;
}

@media (max-width: 1180px) {
  .stats-grid,
  .wizard-reflection-grid,
  .campaigns-layout,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .campaign-list-card {
    position: static;
    max-height: none;
  }
}

@media (max-width: 760px) {
  .campaigns-unified-page {
    padding: 16px;
  }

  .page-title,
  .toolbar-card,
  .detail-header {
    align-items: stretch;
    flex-direction: column;
  }

  .page-title h1 {
    font-size: 27px;
  }

  .stats-grid,
  .wizard-reflection-grid,
  .summary-grid,
  .performance-grid,
  .output-row {
    grid-template-columns: 1fr;
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
  margin-bottom: 14px;
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

@media (max-width: 1100px) {
  .screen-guidance-card { grid-template-columns: 1fr; }
}
`;
