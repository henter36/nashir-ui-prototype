import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  FileCheck2,
  Gift,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  Plus,
  Search,
  Settings,
  Sparkles,
  Store,
} from "lucide-react";
import "./styles.css";

const kpis = [
  {
    title: "إجمالي الحملات",
    value: "15",
    subtitle: "حملة هذا الشهر",
    change: "+7%",
    tone: "green",
    icon: Megaphone,
  },
  {
    title: "قطع المحتوى المنشأة",
    value: "156",
    subtitle: "قطعة محتوى",
    change: "+22%",
    tone: "blue",
    icon: FileCheck2,
  },
  {
    title: "المحتوى المعتمد",
    value: "42",
    subtitle: "جاهز للنشر اليدوي",
    change: "+18%",
    tone: "green",
    icon: CheckCircle2,
  },
  {
    title: "المحتوى المرفوض",
    value: "7",
    subtitle: "يحتاج تحسين",
    change: "-12%",
    tone: "red",
    icon: AlertTriangle,
  },
];

const latestCampaigns = [
  {
    name: "إطلاق مجموعة الصيف",
    subtitle: "منتجات الصيف 2024",
    status: "نشطة",
    statusTone: "green",
    stage: "تنفيذ",
    updatedAt: "منذ ساعتين",
    progress: 86,
  },
  {
    name: "عودة إلى المدرسة",
    subtitle: "حملة موسمية",
    status: "تحتاج مراجعة",
    statusTone: "amber",
    stage: "مراجعة",
    updatedAt: "منذ 5 ساعات",
    progress: 62,
  },
  {
    name: "عرض نهاية الأسبوع",
    subtitle: "خصم مؤقت",
    status: "مسودة",
    statusTone: "blue",
    stage: "مسودة",
    updatedAt: "منذ يوم",
    progress: 28,
  },
  {
    name: "خصومات العيد",
    subtitle: "حملة عروض",
    status: "مكتملة",
    statusTone: "green",
    stage: "معتمدة",
    updatedAt: "منذ يومين",
    progress: 91,
  },
];

const channelPerformance = [
  { name: "Instagram", value: 82, label: "تقدم قوي", tone: "green" },
  { name: "TikTok", value: 74, label: "تقدم قوي", tone: "green" },
  { name: "Snapchat", value: 58, label: "يتطلب تحسين", tone: "amber" },
  { name: "Email", value: 46, label: "بحاجة تعزيز", tone: "blue" },
];

const recentActivity = [
  {
    title: "تم اعتماد محتوى جديد",
    detail: "إطلاق مجموعة الصيف",
    time: "منذ 25 دقيقة",
    tone: "green",
  },
  {
    title: "تم إرسال 3 قطع محتوى للمراجعة",
    detail: "عرض نهاية الأسبوع",
    time: "منذ ساعة",
    tone: "amber",
  },
  {
    title: "تم تحديث نبرة العلامة",
    detail: "عودة إلى المدرسة",
    time: "منذ ساعتين",
    tone: "blue",
  },
  {
    title: "تم إنشاء محتوى جديد",
    detail: "مسودة Instagram",
    time: "منذ 3 ساعات",
    tone: "green",
  },
];

const identityItems = [
  { name: "اسم العلامة", status: "مكتمل", progress: 100, tone: "green" },
  { name: "وصف العلامة", status: "مكتمل", progress: 100, tone: "green" },
  { name: "نبرة العلامة", status: "بحاجة مراجعة", progress: 65, tone: "amber" },
  { name: "ألوان الهوية", status: "غير مكتمل", progress: 25, tone: "red" },
  { name: "الشعار والأصول", status: "بحاجة مراجعة", progress: 55, tone: "amber" },
];

const navItems = [
  { label: "لوحة التحكم", icon: LayoutDashboard, active: true },
  { label: "العلامة التجارية", icon: Store },
  { label: "الحملات", icon: Megaphone },
  { label: "المحتوى", icon: FileCheck2 },
  { label: "المراجعة", icon: CheckCircle2 },
  { label: "سجل النشاط", icon: Settings },
];

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function KpiCard({ item }) {
  const Icon = item.icon;

  return (
    <div className={`card kpi-card kpi-${item.tone}`}>
      <div className="kpi-main">
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
    </div>
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

function LatestCampaigns() {
  return (
    <div className="card latest-card">
      <div className="card-header">
        <div>
          <h3>أحدث الحملات</h3>
          <p>حملات تحتاج متابعة أو مراجعة.</p>
        </div>
        <button className="secondary-button">عرض الكل</button>
      </div>

      <div className="campaign-table">
        <div className="campaign-head">
          <span>الحملة</span>
          <span>الحالة</span>
          <span>المرحلة</span>
          <span>آخر تحديث</span>
        </div>

        {latestCampaigns.map((campaign) => (
          <div className="campaign-row" key={campaign.name}>
            <div className="campaign-main">
              <div className="campaign-thumb">
                <ImageIcon size={20} />
              </div>
              <div>
                <strong>{campaign.name}</strong>
                <small>{campaign.subtitle}</small>
                <div className="progress-track">
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
    </div>
  );
}

function ContentPerformance() {
  return (
    <div className="card performance-card">
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

      <div className="performance-inner">
        <div className="chart-box">
          <div className="chart-title">
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

        <div className="channel-box">
          <div className="section-mini-title">الأداء حسب القناة</div>

          {channelPerformance.map((item) => (
            <div className="channel-row" key={item.name}>
              <div className="channel-row-head">
                <span>{item.name}</span>
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
        <div className="insight good">
          <span>أفضل محتوى</span>
          <strong>Reel قصير + CTA مباشر</strong>
        </div>
        <div className="insight warning">
          <span>يحتاج تحسين</span>
          <strong>Snapchat CTA وحقوق بعض الصور</strong>
        </div>
      </div>
    </div>
  );
}

function IdentityCard() {
  return (
    <div className="card identity-card">
      <div className="card-header compact">
        <div>
          <h3>عناصر الهوية الأساسية</h3>
          <p>ما يؤثر مباشرة على جودة المحتوى.</p>
        </div>
        <Badge tone="amber">3 / 5</Badge>
      </div>

      <div className="identity-list">
        {identityItems.map((item) => (
          <div className="identity-row" key={item.name}>
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
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="card activity-card">
      <div className="card-header compact">
        <h3>النشاط الأخير</h3>
        <Badge tone="blue">Live</Badge>
      </div>

      <div className="activity-list">
        {recentActivity.map((item) => (
          <div className="activity-item" key={item.title}>
            <div className={`activity-icon activity-${item.tone}`}>
              {item.tone === "green" ? (
                <CheckCircle2 size={17} />
              ) : item.tone === "amber" ? (
                <AlertTriangle size={17} />
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
    </div>
  );
}

function SideStack() {
  return (
    <div className="side-stack">
      <div className="card brand-card">
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

        <button className="primary-button">إكمال الآن</button>
      </div>

      <div className="card side-mini-card">
        <h3>موجز الحملة النشطة</h3>
        <div className="featured-box">
          <div>
            <strong>إطلاق مجموعة الصيف</strong>
            <p>منتجات الصيف 2024</p>
          </div>
          <Badge tone="green">نشطة</Badge>
        </div>
      </div>

      <div className="card pending-card">
        <h3>المراجعات المعلقة</h3>
        <div className="pending-number">6</div>
        <p>قطع محتوى بانتظار المراجعة</p>
        <Badge tone="amber">أولوية</Badge>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Sparkles size={22} />
        </div>
        <div>
          <div className="brand-title">Marketing OS</div>
          <div className="brand-subtitle">ناشر · Marketing Workspace</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.label}
              className={`sidebar-item ${item.active ? "active" : ""}`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="workspace-switcher">
        <div className="workspace-icon">
          <Store size={19} />
        </div>
        <div>
          <div className="workspace-label">فريق العمل</div>
          <div className="workspace-name">متجر النمو</div>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={18} />
        <input placeholder="ابحث في ناشر..." />
      </div>

      <button className="icon-button" type="button">
        <Gift size={18} />
      </button>

      <button className="icon-button with-dot" type="button">
        <Bell size={18} />
      </button>

      <div className="user-chip">
        <div className="avatar">أ</div>
        <div>
          <div className="user-name">أحمد السعيد</div>
          <div className="user-role">Admin</div>
        </div>
      </div>
    </header>
  );
}

function Dashboard() {
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
          <button className="secondary-button">آخر 7 أيام</button>
          <button className="primary-button">
            <Plus size={18} />
            إنشاء حملة
          </button>
        </div>
      </section>

      <section className="kpi-grid">
        {kpis.map((item) => (
          <KpiCard key={item.title} item={item} />
        ))}
      </section>

      <section className="main-grid">
        <LatestCampaigns />
        <ContentPerformance />
      </section>

      <section className="lower-grid">
        <IdentityCard />
        <RecentActivity />
        <SideStack />
      </section>
    </>
  );
}

export default function App() {
  return (
    <div className="app-shell" dir="rtl">
      <Sidebar />
      <section className="app-main">
        <Topbar />
        <main className="page-container">
          <Dashboard />
        </main>
      </section>
    </div>
  );
}