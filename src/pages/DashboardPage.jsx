import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  ImageIcon,
  Megaphone,
  Plus,
  Settings,
} from "lucide-react";

import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button.jsx";
import {
  dashboardKpis,
  latestCampaigns,
  channelPerformance,
  recentActivity,
  identityItems,
} from "../data/dashboardData.js";

const iconMap = {
    campaign: Megaphone,
    content: FileCheck2,
    approved: CheckCircle2,
    rejected: AlertTriangle,
  };
  
  function KpiCard({ item }) {
    const Icon = iconMap[item.icon] || BarChart3;
  
    return (
      <Card className={`kpi-card kpi-${item.tone}`}>
        <div className="kpi-content">
          <div>
            <div className="kpi-title">{item.title}</div>
            <div className="kpi-value">{item.value}</div>
            <div className="kpi-subtitle">{item.subtitle}</div>
          </div>
  
          <div className={`kpi-icon kpi-icon-${item.tone}`}>
            <Icon size={22} />
          </div>
        </div>
  
        <div className={`kpi-change kpi-change-${item.tone}`}>
          {item.change} عن الفترة السابقة
        </div>
      </Card>
    );
  }
  
  function MiniMetric({ label, value }) {
    return (
      <div className="mini-metric">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    );
  }
  
  function ContentPerformanceCard() {
    return (
      <Card className="content-performance-card">
        <div className="card-header">
          <div>
            <h3>أداء المحتوى آخر 7 أيام</h3>
            <p>تحليل مختصر للتفاعل والقنوات والمخرجات.</p>
          </div>
          <Badge tone="green">+18%</Badge>
        </div>
  
        <div className="mini-metrics-grid">
          <MiniMetric label="الوصول" value="3.6K" />
          <MiniMetric label="معدل التفاعل" value="12.4%" />
          <MiniMetric label="النقرات" value="285" />
          <MiniMetric label="التفاعلات" value="1.2K" />
        </div>
  
        <div className="performance-layout">
          <div className="chart-card">
            <div className="chart-title-row">
              <span>منحنى التفاعل</span>
              <strong>مستقر</strong>
            </div>
  
            <svg viewBox="0 0 600 150" className="line-chart">
              <line x1="20" y1="120" x2="590" y2="120" />
              <line x1="20" y1="75" x2="590" y2="75" className="grid-line" />
              <path
                d="M20 95 C90 70, 130 65, 190 92 C245 118, 270 50, 345 65 C425 82, 450 25, 515 42 C560 55, 570 88, 590 105"
                className="chart-line"
              />
              <path
                d="M20 95 C90 70, 130 65, 190 92 C245 118, 270 50, 345 65 C425 82, 450 25, 515 42 C560 55, 570 88, 590 105 L590 135 L20 135 Z"
                className="chart-area"
              />
            </svg>
          </div>
  
          <div className="channel-card">
            <div className="section-mini-title">الأداء حسب القناة</div>
  
            {channelPerformance.map((item) => (
              <div key={item.channel} className="channel-row">
                <div className="channel-row-head">
                  <span>{item.channel}</span>
                  <strong className={`text-${item.tone}`}>{item.label}</strong>
                </div>
                <div className="bar-track">
                  <span
                    className={`bar-fill bar-${item.tone}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
  
        <div className="insight-row">
          <div className="insight insight-good">
            <span>أفضل محتوى</span>
            <strong>Reel قصير + CTA مباشر</strong>
          </div>
          <div className="insight insight-warning">
            <span>يحتاج تحسين</span>
            <strong>Snapchat CTA وحقوق بعض الصور</strong>
          </div>
        </div>
      </Card>
    );
  }
  
  function LatestCampaignsCard({ onCreateCampaign }) {
    return (
      <Card className="latest-campaigns-card">
        <div className="card-header">
          <div>
            <h3>أحدث الحملات</h3>
            <p>حملات تحتاج متابعة أو مراجعة.</p>
          </div>
          <SecondaryButton icon={Plus} onClick={onCreateCampaign}>
            إنشاء
          </SecondaryButton>
        </div>
  
        <div className="campaign-table">
          <div className="campaign-table-head">
            <span>الحملة</span>
            <span>الحالة</span>
            <span>المرحلة</span>
            <span>آخر تحديث</span>
          </div>
  
          {latestCampaigns.map((campaign) => (
            <div key={campaign.name} className="campaign-row">
              <div className="campaign-main">
                <div className="campaign-thumb">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <strong>{campaign.name}</strong>
                  <small>{campaign.subtitle}</small>
                  <div className="campaign-progress">
                    <span style={{ width: `${campaign.progress}%` }} />
                  </div>
                </div>
              </div>
  
              <Badge tone={campaign.statusTone}>{campaign.status}</Badge>
              <span>{campaign.stage}</span>
              <span>{campaign.updatedAt}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  function RecentActivityCard() {
    return (
      <Card className="activity-card">
        <div className="card-header compact">
          <h3>النشاط الأخير</h3>
          <Badge tone="blue">Live</Badge>
        </div>
  
        <div className="activity-list">
          {recentActivity.map((item) => (
            <div key={item.title} className="activity-item">
              <div className={`activity-icon activity-${item.tone}`}>
                {item.tone === "green" ? (
                  <CheckCircle2 size={17} />
                ) : item.tone === "amber" ? (
                  <Clock3 size={17} />
                ) : (
                  <FileCheck2 size={17} />
                )}
              </div>
  
              <div>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  function IdentityCard() {
    return (
      <Card className="identity-card">
        <div className="card-header compact">
          <div>
            <h3>عناصر الهوية الأساسية</h3>
            <p>ما يؤثر مباشرة على جودة المحتوى.</p>
          </div>
          <Badge tone="amber">3 / 5</Badge>
        </div>
  
        <div className="identity-list">
          {identityItems.map((item) => (
            <div key={item.name} className="identity-row">
              <div className="identity-head">
                <strong>{item.name}</strong>
                <Badge tone={item.tone}>{item.status}</Badge>
              </div>
  
              <div className="bar-track">
                <span
                  className={`bar-fill bar-${item.tone}`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  function BrandCompletionCard() {
    return (
      <Card className="brand-completion-card">
        <h3>اكتمال ملف العلامة التجارية</h3>
  
        <div className="completion-content">
          <div className="progress-ring">
            <span>82%</span>
          </div>
  
          <div>
            <strong>جيد</strong>
            <p>تبقى 3 عناصر لإكمال الملف</p>
          </div>
        </div>
  
        <PrimaryButton icon={ClipboardCheck}>إكمال الآن</PrimaryButton>
      </Card>
    );
  }
  
  function FeaturedCampaignCard() {
    return (
      <Card className="side-mini-card">
        <h3>موجز الحملة النشطة</h3>
        <div className="featured-box">
          <div>
            <strong>إطلاق مجموعة الصيف</strong>
            <p>منتجات الصيف 2024</p>
          </div>
          <Badge tone="green">نشطة</Badge>
        </div>
      </Card>
    );
  }
  
  function PendingReviewsCard() {
    return (
      <Card className="pending-card">
        <h3>المراجعات المعلقة</h3>
        <div className="pending-number">6</div>
        <p>قطع محتوى بانتظار المراجعة</p>
        <Badge tone="amber">أولوية</Badge>
      </Card>
    );
  }
  
  export default function DashboardPage({ onCreateCampaign }) {
    return (
      <>
        <section className="dashboard-hero">
          <div>
            <div className="hero-title-row">
              <h1>مرحبًا، أحمد 👋</h1>
              <Badge tone="blue">لوحة التحكم</Badge>
            </div>
            <p>إليك نظرة عامة على أداء التسويق اليوم.</p>
          </div>
  
          <div className="hero-actions">
            <SecondaryButton>آخر 7 أيام</SecondaryButton>
            <PrimaryButton icon={Plus} onClick={onCreateCampaign}>
              إنشاء حملة
            </PrimaryButton>
          </div>
        </section>
  
        <section className="kpi-grid">
          {dashboardKpis.map((item) => (
            <KpiCard key={item.id} item={item} />
          ))}
        </section>
  
        <section className="dashboard-main-grid">
          <LatestCampaignsCard onCreateCampaign={onCreateCampaign} />
          <ContentPerformanceCard />
        </section>
  
        <section className="dashboard-lower-grid">
          <IdentityCard />
          <RecentActivityCard />
  
          <div className="side-stack">
            <BrandCompletionCard />
            <FeaturedCampaignCard />
            <PendingReviewsCard />
          </div>
        </section>
      </>
    );
  }