import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  Megaphone,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const campaignsSeed = [
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
  },
  {
    id: "cmp-004",
    name: "خصومات العيد",
    goal: "Awareness",
    product: "ساعة كاسيو",
    status: "approved",
    stage: "جاهزة للمحتوى",
    readiness: 92,
    channels: ["Instagram", "Twitter(X)", "Email"],
    budget: "7,000 SAR",
    updatedAt: "منذ يومين",
    owner: "أحمد",
  },
];

const statusMap = {
  active: { label: "نشطة", className: "green" },
  review: { label: "تحتاج مراجعة", className: "amber" },
  draft: { label: "مسودة", className: "slate" },
  approved: { label: "معتمدة", className: "blue" },
};

const filters = [
  ["all", "الكل"],
  ["active", "نشطة"],
  ["review", "تحتاج مراجعة"],
  ["draft", "مسودة"],
  ["approved", "معتمدة"],
];

export default function CampaignsListPage({ onCreateCampaign = () => {} }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(campaignsSeed[0].id);

  const campaigns = useMemo(() => {
    return campaignsSeed.filter((campaign) => {
      const matchesQuery = `${campaign.name} ${campaign.product} ${campaign.goal}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesFilter = filter === "all" || campaign.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  const selectedCampaign = campaignsSeed.find((campaign) => campaign.id === selectedId) || campaignsSeed[0];

  const stats = useMemo(() => {
    return {
      total: campaignsSeed.length,
      active: campaignsSeed.filter((item) => item.status === "active").length,
      review: campaignsSeed.filter((item) => item.status === "review").length,
      avgReadiness: Math.round(
        campaignsSeed.reduce((sum, item) => sum + item.readiness, 0) / campaignsSeed.length
      ),
    };
  }, []);

  return (
    <main className="campaigns-list-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow">
            <Megaphone size={15} />
            Campaigns List
          </div>
          <h1>قائمة الحملات</h1>
          <p>
            هذه الصفحة هي مصدر تغذية Dashboard لاحقًا. تعرض الحملات، حالاتها،
            جاهزيتها، والقنوات المرتبطة بها.
          </p>
        </div>

        <button type="button" className="primary-action" onClick={onCreateCampaign}>
          <Plus size={17} />
          إنشاء حملة
        </button>
      </section>

      <section className="stats-grid">
        <Stat title="إجمالي الحملات" value={stats.total} icon={Megaphone} tone="green" />
        <Stat title="النشطة" value={stats.active} icon={Sparkles} tone="blue" />
        <Stat title="تحتاج مراجعة" value={stats.review} icon={AlertTriangle} tone="amber" />
        <Stat title="متوسط الجاهزية" value={`${stats.avgReadiness}%`} icon={BarChart3} tone="teal" />
      </section>

      <section className="toolbar-card">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            placeholder="ابحث باسم الحملة أو المنتج..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="filter-row">
          {filters.map(([id, label]) => (
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

        <button type="button" className="secondary-action">
          <SlidersHorizontal size={16} />
          ترتيب
        </button>
      </section>

      <section className="campaigns-layout">
        <article className="campaign-table-card">
          <div className="card-header">
            <div>
              <h2>الحملات</h2>
              <p>اختر حملة لرؤية تفاصيلها التشغيلية.</p>
            </div>
            <span>{campaigns.length} نتيجة</span>
          </div>

          <div className="campaign-table">
            <div className="table-head">
              <span>الحملة</span>
              <span>الحالة</span>
              <span>الجاهزية</span>
              <span>القنوات</span>
              <span>التحديث</span>
            </div>

            {campaigns.map((campaign) => {
              const status = statusMap[campaign.status];

              return (
                <button
                  key={campaign.id}
                  type="button"
                  className={`table-row ${selectedId === campaign.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(campaign.id)}
                >
                  <div className="campaign-main">
                    <div className="campaign-icon">
                      <Megaphone size={17} />
                    </div>
                    <div>
                      <strong>{campaign.name}</strong>
                      <small>{campaign.product} · {campaign.goal}</small>
                    </div>
                  </div>

                  <span className={`status-pill ${status.className}`}>{status.label}</span>

                  <div className="readiness-cell">
                    <div className="track"><i style={{ width: `${campaign.readiness}%` }} /></div>
                    <small>{campaign.readiness}%</small>
                  </div>

                  <div className="channel-tags">
                    {campaign.channels.slice(0, 2).map((channel) => (
                      <span key={channel}>{channel}</span>
                    ))}
                    {campaign.channels.length > 2 ? <span>+{campaign.channels.length - 2}</span> : null}
                  </div>

                  <span className="muted">{campaign.updatedAt}</span>
                </button>
              );
            })}
          </div>
        </article>

        <aside className="campaign-detail-card">
          <div className="detail-top">
            <div className="detail-icon">
              <Eye size={22} />
            </div>
            <div>
              <h2>{selectedCampaign.name}</h2>
              <p>{selectedCampaign.product}</p>
            </div>
          </div>

          <div className="detail-score">
            <div className="score-ring">{selectedCampaign.readiness}%</div>
            <div>
              <strong>جاهزية الحملة</strong>
              <span>{selectedCampaign.stage}</span>
            </div>
          </div>

          <Info label="الهدف" value={selectedCampaign.goal} />
          <Info label="الميزانية" value={selectedCampaign.budget} />
          <Info label="المسؤول" value={selectedCampaign.owner} />
          <Info label="آخر تحديث" value={selectedCampaign.updatedAt} />

          <div className="detail-section">
            <h3>القنوات</h3>
            <div className="channel-tags large">
              {selectedCampaign.channels.map((channel) => (
                <span key={channel}>{channel}</span>
              ))}
            </div>
          </div>

          <div className="warning-box">
            <Clock3 size={18} />
            <p>
              هذه البيانات Mock حاليًا. لاحقًا يجب أن تأتي من Campaigns API وتغذي
              Dashboard وContent Studio وReview.
            </p>
          </div>
        </aside>
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
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.campaigns-list-page {
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
.campaign-table-card,
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

.stat-card {
  min-height: 106px;
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
  font-size: 32px;
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
  grid-template-columns: minmax(260px, 1fr) auto auto;
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
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 16px;
  align-items: start;
}

.campaign-table-card,
.campaign-detail-card {
  padding: 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.card-header h2,
.campaign-detail-card h2 {
  margin: 0;
  font-size: 18px;
}

.card-header p,
.campaign-detail-card p {
  margin: 5px 0 0;
  color: #6f746b;
  font-size: 12px;
}

.card-header > span {
  color: #176b2c;
  background: #eef7e9;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 900;
}

.campaign-table {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1.35fr 0.75fr 0.75fr 0.9fr 0.7fr;
  gap: 12px;
  align-items: center;
  padding: 13px 14px;
}

.table-head {
  background: #f7f8f4;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.table-row {
  width: 100%;
  border: 0;
  border-top: 1px solid #e4e7df;
  background: #fff;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.table-row.selected {
  background: #fbfdf9;
}

.campaign-main {
  display: flex;
  align-items: center;
  gap: 11px;
}

.campaign-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #eef7e9;
  color: #176b2c;
  flex: 0 0 auto;
}

.campaign-main strong {
  display: block;
  font-size: 13px;
}

.campaign-main small,
.muted {
  display: block;
  color: #6f746b;
  font-size: 11px;
  margin-top: 3px;
}

.status-pill {
  width: fit-content;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 900;
}

.status-pill.green {
  color: #166534;
  background: #f0fdf4;
}

.status-pill.amber {
  color: #92400e;
  background: #fffbeb;
}

.status-pill.slate {
  color: #475569;
  background: #f8fafc;
}

.status-pill.blue {
  color: #1d4ed8;
  background: #eff6ff;
}

.readiness-cell {
  display: flex;
  align-items: center;
  gap: 7px;
}

.track {
  width: 74px;
  height: 7px;
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

.readiness-cell small {
  font-size: 11px;
  font-weight: 900;
}

.channel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.channel-tags span {
  border: 1px solid #e4e7df;
  background: #fff;
  color: #1f241d;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 900;
}

.channel-tags.large span {
  font-size: 11px;
}

.detail-top {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.detail-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #fff;
  background: #176b2c;
}

.detail-score {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 20px;
  padding: 14px;
  margin-bottom: 12px;
}

.score-ring {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  border: 7px solid #176b2c;
  background: #fff;
  display: grid;
  place-items: center;
  font-weight: 1000;
}

.detail-score strong {
  display: block;
}

.detail-score span {
  display: block;
  color: #6f746b;
  margin-top: 4px;
  font-size: 12px;
}

.info-row {
  min-height: 44px;
  border-bottom: 1px solid #e4e7df;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-row span {
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.info-row strong {
  font-size: 13px;
}

.detail-section {
  margin-top: 16px;
}

.detail-section h3 {
  margin: 0 0 10px;
  font-size: 15px;
}

.warning-box {
  margin-top: 16px;
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #92400e;
  border-radius: 18px;
  padding: 13px;
  display: flex;
  gap: 9px;
  align-items: flex-start;
}

.warning-box p {
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar-card,
  .campaigns-layout {
    grid-template-columns: 1fr;
  }

  .campaign-detail-card {
    position: static;
  }
}

@media (max-width: 760px) {
  .campaigns-list-page {
    padding: 16px;
  }

  .page-title {
    align-items: stretch;
    flex-direction: column;
  }

  .page-title h1 {
    font-size: 27px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .campaign-table {
    overflow-x: auto;
  }

  .table-head,
  .table-row {
    min-width: 820px;
  }
}
`;
