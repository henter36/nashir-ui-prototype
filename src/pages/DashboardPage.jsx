import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  FileCheck2,
  FolderOpen,
  ImageIcon,
  Layers,
  Megaphone,
  Plus,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import {
  deriveDashboardSummary,
  formatCompactNumber,
  readCampaignMetrics,
  readCampaigns,
  refreshDashboardSummary,
} from "../utils/campaignAnalyticsStore.js";
import {
  readLatestStoreStrategicPlan,
} from "../utils/storeStrategicPlanStore.js";
import { readProductCatalog } from "../utils/productCatalogStore.js";
import { readAssetLibrary } from "../utils/assetLibraryStore.js";
import { readCampaignContent } from "../utils/campaignContentStore.js";

const periodLabels = ["اليوم", "آخر 7 أيام", "هذا الشهر"];

function strategicPlanNextAction(plan) {
  return plan?.planJson?.nextAction || "راجع آخر خطة استراتيجية محفوظة قبل إنشاء حملة.";
}

function getCampaignProductName(campaign = {}) {
  return campaign.productSnapshot?.name || campaign.product || "منتج غير محدد";
}

export default function DashboardPage({
  onCreateCampaign = () => {},
  onOpenStoreSetup = () => {},
  onOpenProductCatalog = () => {},
  onOpenDataSources = () => {},
  onOpenCampaigns = () => {},
  onOpenAssets = () => {},
  onOpenAnalytics = () => {},
  onOpenReview = () => {},
  onOpenPublishingQueue = () => {},
  onOpenMultiPlatform = () => {},
}) {
  const [period, setPeriod] = useState("آخر 7 أيام");
  const [campaignList, setCampaignList] = useState(() => readCampaigns([]));
  const [campaignMetrics, setCampaignMetrics] = useState(() => readCampaignMetrics([]));
  const [products, setProducts] = useState(() => readProductCatalog([]));
  const [assets, setAssets] = useState(() => readAssetLibrary([]));
  const [contentItems, setContentItems] = useState(() => readCampaignContent([]));
  const [latestStrategicPlan, setLatestStrategicPlan] = useState(() =>
    readLatestStoreStrategicPlan(null)
  );

  useEffect(() => {
    const reloadDashboard = () => {
      const nextCampaigns = readCampaigns([]);
      const nextMetrics = readCampaignMetrics([]);

      refreshDashboardSummary(nextCampaigns, nextMetrics);
      setCampaignList(nextCampaigns);
      setCampaignMetrics(nextMetrics);
      setProducts(readProductCatalog([]));
      setAssets(readAssetLibrary([]));
      setContentItems(readCampaignContent([]));
      setLatestStrategicPlan(readLatestStoreStrategicPlan(null));
    };

    window.addEventListener("focus", reloadDashboard);
    window.addEventListener("storage", reloadDashboard);
    window.addEventListener("nashir-campaigns-updated", reloadDashboard);
    window.addEventListener("nashir-campaign-metrics-updated", reloadDashboard);
    window.addEventListener("nashir-dashboard-summary-updated", reloadDashboard);
    window.addEventListener("nashir-store-strategic-plan-updated", reloadDashboard);
    window.addEventListener("nashir-product-catalog-updated", reloadDashboard);
    window.addEventListener("nashir-asset-library-updated", reloadDashboard);
    window.addEventListener("nashir-campaign-content-updated", reloadDashboard);

    return () => {
      window.removeEventListener("focus", reloadDashboard);
      window.removeEventListener("storage", reloadDashboard);
      window.removeEventListener("nashir-campaigns-updated", reloadDashboard);
      window.removeEventListener("nashir-campaign-metrics-updated", reloadDashboard);
      window.removeEventListener("nashir-dashboard-summary-updated", reloadDashboard);
      window.removeEventListener("nashir-store-strategic-plan-updated", reloadDashboard);
      window.removeEventListener("nashir-product-catalog-updated", reloadDashboard);
      window.removeEventListener("nashir-asset-library-updated", reloadDashboard);
      window.removeEventListener("nashir-campaign-content-updated", reloadDashboard);
    };
  }, []);

  const quickActions = useMemo(
    () => [
      ["إعداد المتجر", "أكمل بيانات المتجر والهوية", Store, onOpenStoreSetup],
      ["كتالوج المنتجات", "راجع المنتجات قبل الحملة", Store, onOpenProductCatalog],
      ["مصادر البيانات", "افحص الروابط والتكاملات", Database, onOpenDataSources],
      ["إنشاء حملة", "ابدأ من المعالج الرسمي", Megaphone, onCreateCampaign],
      ["المحتوى والمراجعة", "راجع النصوص والمخرجات", FileCheck2, onOpenReview],
      ["جدولة النشر", "جهّز خطة النشر", CalendarDays, onOpenPublishingQueue],
      ["متعدد القنوات", "تحقق من جاهزية القنوات", Layers, onOpenMultiPlatform],
      ["التحليلات", "راجع الأداء والمؤشرات", BarChart3, onOpenAnalytics],
    ],
    [
      onCreateCampaign,
      onOpenAnalytics,
      onOpenDataSources,
      onOpenMultiPlatform,
      onOpenProductCatalog,
      onOpenPublishingQueue,
      onOpenReview,
      onOpenStoreSetup,
    ]
  );

  const summary = useMemo(
    () => deriveDashboardSummary(campaignList, campaignMetrics),
    [campaignList, campaignMetrics]
  );
  const recentCampaigns = campaignList.slice(0, 4);
  const needsReviewContent = contentItems.filter((item) =>
    ["needs_review", "review", "ready"].includes(item.status) || item.approval === "needs_review"
  ).length;
  const unconfirmedAssets = assets.filter((asset) => asset.rightsStatus !== "allowed").length;
  const readyAssets = assets.filter((asset) => asset.status === "ready").length;
  const videoAssets = assets.filter((asset) => asset.type === "video").length;
  const imageAssets = assets.filter((asset) => asset.type === "image").length;
  const avgProductReadiness = products.length
    ? Math.round(products.reduce((sum, product) => sum + Number(product.readiness || 0), 0) / products.length)
    : 0;
  const planReadiness = latestStrategicPlan ? Number(latestStrategicPlan.confidence || 0) : 0;
  const operationalReadiness = Math.round(
    [summary.avgReadiness, avgProductReadiness, planReadiness].filter((value) => Number.isFinite(value) && value > 0)
      .reduce((sum, value, _index, list) => sum + value / list.length, 0)
  );
  const assetMetrics = [
    ["صور محفوظة", products.length || assets.length ? String(imageAssets) : "لا توجد أصول محفوظة بعد", imageAssets ? "green" : "amber"],
    ["حقوق غير مؤكدة", assets.length ? String(unconfirmedAssets) : "لا توجد أصول محفوظة بعد", unconfirmedAssets ? "amber" : "green"],
    ["فيديوهات محفوظة", assets.length ? String(videoAssets) : "لا توجد أصول محفوظة بعد", videoAssets ? "green" : "amber"],
    ["أصول قابلة للمراجعة", assets.length ? String(readyAssets) : "لا توجد أصول محفوظة بعد", readyAssets ? "green" : "amber"],
  ];
  const channelSet = new Set(campaignList.flatMap((campaign) => campaign.channels || (campaign.channel ? [campaign.channel] : [])));
  const readyContent = contentItems.filter((item) => item.status === "ready" || item.approval === "approved").length;
  const priorityGaps = [
    !latestStrategicPlan ? "لا توجد خطة استراتيجية محفوظة بعد." : "",
    !campaignList.length ? "لا توجد حملات محفوظة بعد." : "",
    !products.length ? "لا توجد منتجات محفوظة بعد." : "",
    !assets.length ? "لا توجد أصول محفوظة بعد." : "",
  ].filter(Boolean);
  const priorities = [
    {
      title: latestStrategicPlan ? "راجع الخطة والحملة التالية" : "استكمل خطة المتجر",
      body: latestStrategicPlan
        ? strategicPlanNextAction(latestStrategicPlan)
        : "لا توجد خطة استراتيجية محفوظة بعد. ابدأ من إعداد المتجر لحفظ خطة واجهية.",
      action: "فتح إعداد المتجر",
      icon: Database,
      tone: latestStrategicPlan ? "green" : "amber",
      onClick: onOpenStoreSetup,
    },
    {
      title: assets.length ? "راجع الأصول غير المؤكدة" : "استكمل مكتبة الأصول",
      body: assets.length
        ? `${unconfirmedAssets} أصل يحتاج مراجعة حقوق قبل استخدامه في الحملات.`
        : "لا توجد أصول محفوظة بعد.",
      action: "فتح مكتبة الأصول",
      icon: FolderOpen,
      tone: unconfirmedAssets || !assets.length ? "amber" : "green",
      onClick: onOpenAssets,
    },
    {
      title: contentItems.length ? "جهّز المخرجات للمراجعة" : "أنشئ مخرجات حملة",
      body: contentItems.length
        ? `${needsReviewContent} مخرج يحتاج مراجعة أو اعتمادًا واجهيًا.`
        : "لا توجد مخرجات حملة محفوظة بعد.",
      action: contentItems.length ? "فتح المراجعة" : "إنشاء حملة",
      icon: Layers,
      tone: needsReviewContent ? "blue" : "amber",
      onClick: contentItems.length ? onOpenReview : onCreateCampaign,
    },
  ];
  const activities = useMemo(() => {
    const rows = [];

    if (latestStrategicPlan) {
      rows.push(["آخر خطة استراتيجية محفوظة", "إعداد المتجر", latestStrategicPlan.updatedAt ? new Date(latestStrategicPlan.updatedAt).toLocaleDateString("ar-SA") : "محفوظة محليًا", "green"]);
    }
    if (campaignList[0]) {
      rows.push([campaignList[0].name, "الحملات", campaignList[0].updatedAt || "محفوظة محليًا", "blue"]);
    }
    if (contentItems[0]) {
      rows.push([contentItems[0].title, "استوديو المحتوى", contentItems[0].updatedAt ? new Date(contentItems[0].updatedAt).toLocaleDateString("ar-SA") : "محفوظ محليًا", "amber"]);
    }

    return rows.length ? rows : [["لا توجد بيانات محفوظة بعد", "بيانات النموذج الأولي", "ابدأ من إعداد المتجر", "amber"]];
  }, [campaignList, contentItems, latestStrategicPlan]);
  const dashboardKpis = [
    {
      title: "الحملات النشطة",
      value: String(campaignList.length),
      subtitle: campaignList.length ? `${summary.reviewCampaigns} تحتاج متابعة` : "لا توجد حملات محفوظة بعد.",
      tone: "green",
      icon: Megaphone,
    },
    {
      title: "محتوى ينتظر اعتمادًا",
      value: String(needsReviewContent),
      subtitle: contentItems.length ? "راجع قبل الجدولة" : "لا توجد مخرجات محفوظة بعد",
      tone: "amber",
      icon: AlertTriangle,
    },
    {
      title: "أصول غير مؤكدة",
      value: String(unconfirmedAssets),
      subtitle: assets.length ? "حقوق استخدام تحتاج مراجعة" : "لا توجد أصول محفوظة بعد",
      tone: "blue",
      icon: FolderOpen,
    },
    {
      title: "جاهزية التشغيل",
      value: `${operationalReadiness || 0}%`,
      subtitle: latestStrategicPlan ? "من بيانات النموذج الأولي" : "لا توجد خطة استراتيجية محفوظة بعد.",
      tone: "green",
      icon: Store,
    },
  ];
  const strategicSummary = useMemo(() => {
    const planJson = latestStrategicPlan?.planJson || {};
    const findFact = (rows, label) => {
      const found = Array.isArray(rows)
        ? rows.find(([candidate]) => candidate === label)
        : null;
      return found?.[1] || "";
    };
    const topProduct = Array.isArray(planJson.priorityProducts)
      ? planJson.priorityProducts[0]
      : null;
    const risks = Array.isArray(planJson.risks) ? planJson.risks : [];

    if (latestStrategicPlan) {
      return {
        growthReadiness: findFact(planJson.summary, "مرحلة جاهزية المتجر") || "آخر خطة استراتيجية محفوظة",
        opportunity: topProduct?.name
          ? `تحويل ${topProduct.name} إلى حملة اختبارية مركزة.`
          : "آخر خطة استراتيجية محفوظة متاحة للمراجعة.",
        risk: risks[0] || "لا توجد فجوة حرجة في آخر خطة محفوظة.",
        nextAction: planJson.nextAction || "راجع آخر خطة استراتيجية محفوظة قبل إنشاء حملة.",
        status: latestStrategicPlan.status === "ready_for_review" ? "جاهزة للمراجعة" : "مسودة",
      };
    }

    return {
      growthReadiness: summary.avgReadiness >= 80 ? "مرتفعة" : summary.avgReadiness >= 65 ? "متوسطة" : "تحتاج استكمال",
      opportunity: products[0]?.name
        ? `تحويل ${products[0].name} إلى حملة اختبارية مركزة.`
        : "لا توجد خطة استراتيجية محفوظة بعد.",
      risk: Number(summary.reviewCampaigns || 0) > 0
        ? "وجود محتوى أو حملات تحتاج مراجعة قبل التوسع."
        : priorityGaps[0] || "الأصول والقنوات تحتاج متابعة قبل زيادة النشر.",
      nextAction: Number(summary.reviewCampaigns || 0) > 0
        ? "راجع المحتوى المنتظر قبل الجدولة."
        : "ابدأ من إعداد المتجر لحفظ خطة استراتيجية.",
      status: "لا توجد خطة استراتيجية محفوظة بعد.",
    };
  }, [latestStrategicPlan, priorityGaps, products, summary.avgReadiness, summary.reviewCampaigns]);

  return (
    <main className="dashboard-grid-page" dir="rtl">
      <style>{styles}</style>

      <section className="hero">
        <div>
          <div className="kicker">
            <Sparkles size={15} />
            مركز قيادة ناشر
          </div>
          <h1>مرحبًا، أحمد 👋</h1>
          <p>ملخص تنفيذي سريع للحملات، المحتوى، جاهزية النشر، والتنبيهات التي تحتاج قرارًا.</p>
        </div>

        <div className="hero-actions">
          <div className="period-switch" aria-label="فلتر الفترة التجريبي">
            {periodLabels.map((item) => (
              <button
                key={item}
                type="button"
                className={period === item ? "active" : ""}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button type="button" className="primary-button" onClick={onCreateCampaign}>
            <Plus size={17} />
            إنشاء حملة
          </button>
        </div>
      </section>

      <section className="screen-guidance-card">
        <div><span>هدف الشاشة</span><strong>عرض ملخص تنفيذي لحالة المتجر والحملات والخطة.</strong></div>
        <div><span>المدخلات</span><strong>ملخصات المتجر، الخطة، الحملات، الجاهزية.</strong></div>
        <div><span>المخرجات</span><strong>أهم فرصة، أهم خطر، والإجراء التالي.</strong></div>
        <div><span>الإجراء التالي</span><strong>الانتقال للشاشة التي تحتاج استكمالًا.</strong></div>
        <div><span>ما لا يحدث هنا</span><strong>الأرقام والمؤشرات هنا نموذجية وليست تشغيلًا إنتاجيًا.</strong></div>
      </section>

      <section className="prototype-data-note">
        <Database size={17} />
        <span>تعكس هذه اللوحة بيانات النموذج الأولي المحفوظة محليًا، وليست أرقامًا تشغيلية أو تحليلات إنتاجية.</span>
      </section>

      <section className="kpi-grid">
        {dashboardKpis.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className={`kpi-card ${item.tone}`}>
              <div className="kpi-icon">
                <Icon size={18} />
              </div>
              <div>
                <span>{item.title}</span>
                <strong>{item.value}</strong>
                <small>{item.subtitle} · {period}</small>
              </div>
            </article>
          );
        })}
      </section>

      <article className="card strategic-summary-card">
        <CardHeader
          title="ملخص الخطة الاستراتيجية"
          description={latestStrategicPlan ? "يعرض أهم نتيجة من آخر خطة استراتيجية محفوظة، والتفاصيل الكاملة تبقى في إعداد المتجر." : "لا توجد خطة استراتيجية محفوظة بعد."}
          icon={Sparkles}
          action={<span className="prototype-note">{latestStrategicPlan ? "آخر خطة استراتيجية محفوظة" : "بدون خطة محفوظة"}</span>}
        />
        <p className="strategy-note">هذه توصيات واجهية مشتقة من بيانات الإعداد الحالية، وليست تحليلًا إنتاجيًا.</p>
        <div className="strategy-summary-grid">
          <Mini title="درجة جاهزية النمو" value={strategicSummary.growthReadiness} />
          <Mini title="أهم فرصة" value={strategicSummary.opportunity} />
          <Mini title="أهم خطر" value={strategicSummary.risk} />
          <Mini title="الإجراء التالي" value={strategicSummary.nextAction} />
          <Mini title="حالة الخطة" value={strategicSummary.status} />
        </div>
      </article>

      <article className="card social-summary-card">
        <CardHeader
          title="ملخص التحليل الاجتماعي"
          description="مؤشرات واجهية خفيفة مرتبطة بتصميم موصلات Instagram وTikTok."
          icon={Megaphone}
          action={<span className="prototype-note">لا يتم سحب بيانات فعلية</span>}
        />
        <div className="strategy-summary-grid">
          <Mini title="أقوى قناة اجتماعية" value={summary.topChannel || "Instagram"} />
          <Mini title="أهم فرصة اجتماعية" value="تحويل المنتج الأعلى جاهزية إلى Reel أو TikTok قصير." />
          <Mini title="أهم خطر اجتماعي" value="الاعتماد على بيانات اجتماعية دون موصل مصرح." />
          <Mini title="الإجراء التالي" value="تجهيز موصل مصرح قبل استخدام التحليل الاجتماعي." />
        </div>
      </article>

      <SectionTitle title="أداء الحملات" description="آخر الحملات التي تحتاج متابعة أو قرار." />

      <section className="middle-row">
        <article className="card campaigns-card">
          <CardHeader
            title="الحملات القريبة"
            description="حالة مختصرة للجاهزية والقناة والتحديث الأخير."
            icon={Megaphone}
            action={
              <button type="button" className="mini-button" onClick={onOpenCampaigns}>
                عرض الكل
              </button>
            }
          />

          <div className="campaign-table">
            {recentCampaigns.map((campaign) => (
              <button
                key={campaign.id || campaign.name}
                type="button"
                className="campaign-row"
                onClick={onOpenCampaigns}
              >
                <div className="campaign-main">
                  <div className="campaign-thumb">
                    <ImageIcon size={17} />
                  </div>
                  <div>
                    <strong>{campaign.name}</strong>
                    <span>{getCampaignProductName(campaign)}</span>
                  </div>
                </div>

                <Status tone={campaign.tone}>{formatCampaignStatus(campaign.status)}</Status>

                <div className="readiness-cell">
                  <i>
                    <b style={{ width: `${campaign.readiness}%` }} />
                  </i>
                  <small>{campaign.readiness}%</small>
                </div>

                <span className="channel-pill">{campaign.channel || campaign.channels?.[0] || "عام"}</span>
                <small className="muted">{campaign.updatedAt || campaign.updated}</small>
              </button>
            ))}
          </div>
        </article>
      </section>

      <SectionTitle title="المحتوى والنشر" description="جاهزية الأصول والقنوات قبل الانتقال إلى النشر والتحليلات." />

      <section className="bottom-row">
        <article className="card small-card">
          <CardHeader
            title="جاهزية الأصول"
            description="ما يؤثر على قرار استخدام الأصول."
            icon={FolderOpen}
          />

          <div className="box-grid">
            {assetMetrics.map(([label, value, tone]) => (
              <div key={label} className={`metric-box ${tone}`}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <button type="button" className="secondary-button wide" onClick={onOpenAssets}>
            إدارة مكتبة الأصول
          </button>
        </article>

        <article className="card small-card">
          <CardHeader
            title="النشر والقنوات"
            description="ما قبل الجدولة والتحقق متعدد القنوات."
            icon={Layers}
          />

          <div className="box-grid">
            <Mini title="قنوات مستخدمة" value={channelSet.size ? String(channelSet.size) : "لا توجد حملات محفوظة بعد."} />
            <Mini title="جاهزية القنوات" value={campaignList.length ? `${Math.min(100, Math.max(35, summary.avgReadiness))}%` : "لا توجد حملات محفوظة بعد."} />
            <Mini title="مخرجات جاهزة" value={contentItems.length ? `${readyContent}/${contentItems.length}` : "لا توجد مخرجات محفوظة بعد"} />
            <Mini title="تحتاج موافقة" value={String(needsReviewContent)} />
          </div>

          <div className="split-buttons">
            <button type="button" className="secondary-button" onClick={onOpenPublishingQueue}>جدولة النشر</button>
            <button type="button" className="secondary-button" onClick={onOpenMultiPlatform}>متعدد القنوات</button>
          </div>
        </article>

        <article className="card small-card">
          <CardHeader
            title="الأداء والنشاط"
            description="مؤشرات سريعة قبل فتح التحليلات."
            icon={BarChart3}
          />

          <div className="box-grid compact-metrics">
            <Mini title="الوصول" value={formatCompactNumber(summary.reach)} />
            <Mini title="التحويلات" value={formatCompactNumber(summary.conversions)} />
            <Mini title="أفضل قناة" value={summary.topChannel} />
            <Mini title="ROI تقديري" value={`${summary.roi}x`} />
          </div>

          <div className="activity-list">
            {activities.map(([title, source, time, tone]) => (
              <div key={`${title}-${time}`} className="activity-row">
                <div className={`dot ${tone}`} />
                <div>
                  <strong>{title}</strong>
                  <span>{source} · {time}</span>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="secondary-button wide" onClick={onOpenAnalytics}>
            عرض التحليلات
          </button>
        </article>
      </section>

      <SectionTitle title="التنبيهات والتوصيات" description="قرارات تشغيلية تحتاج مراجعة قبل توسيع الحملات." />

      <section className="support-row">
        <article className="card readiness-card">
          <CardHeader
            title="جاهزية التشغيل"
            description="العناصر التي تغذي الحملات قبل التوليد أو النشر."
            icon={Store}
          />

          <div className="readiness-summary">
            <div className="ring">{summary.avgReadiness}%</div>
            <div>
              <strong>{summary.avgReadiness >= 70 ? "جيد، لكن غير مكتمل" : "يحتاج استكمال"}</strong>
              <span>المنتجات والمصادر جاهزة مبدئيًا، والأصول تحتاج مراجعة حقوق.</span>
            </div>
          </div>

          <div className="compact-list">
            {[
              ["الخطة الاستراتيجية", latestStrategicPlan ? (latestStrategicPlan.status === "ready_for_review" ? "جاهزة للمراجعة" : "مسودة") : "لا توجد خطة استراتيجية محفوظة بعد", latestStrategicPlan ? "green" : "amber"],
              ["كتالوج المنتجات", products.length ? `${products.length} عناصر` : "لا توجد منتجات محفوظة بعد", products.length ? "green" : "amber"],
              ["الحملات", campaignList.length ? `${campaignList.length} حملات` : "لا توجد حملات محفوظة بعد.", campaignList.length ? "green" : "amber"],
              ["الأصول", assets.length ? `${unconfirmedAssets} تحتاج مراجعة` : "لا توجد أصول محفوظة بعد", assets.length && !unconfirmedAssets ? "green" : "amber"],
            ].map(([label, value, tone]) => (
              <InfoRow key={label} label={label} value={value} tone={tone} />
            ))}
          </div>

          <div className="split-buttons">
            <button type="button" className="secondary-button" onClick={onOpenStoreSetup}>إعداد المتجر</button>
            <button type="button" className="secondary-button" onClick={onOpenDataSources}>مصادر البيانات</button>
          </div>
        </article>

        <article className="card next-action-card">
          <CardHeader
            title="الأولويات التالية"
            description="ثلاث قرارات عملية بدل إجراء واحد قد لا يناسب كل حالة."
            icon={ShieldCheck}
          />

          <div className="priority-list">
            {priorities.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`priority-row ${item.tone}`}>
                  <div className="action-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                  <button type="button" onClick={item.onClick}>
                    {item.action}
                    <ArrowLeft size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="quick-actions-card">
        <CardHeader
          title="اختصارات الرحلة الأساسية"
          description="روابط مباشرة لأكثر الشاشات استخدامًا."
          icon={ShieldCheck}
        />
        <div className="quick-actions-grid">
          {quickActions.map(([title, description, Icon, onClick]) => (
            <button key={title} type="button" className="quick-action" onClick={onClick}>
              <span className="quick-icon"><Icon size={18} /></span>
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <ArrowLeft size={15} />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function CardHeader({ title, description, icon: Icon, action }) {
  return (
    <div className="card-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action || (
        <div className="header-icon">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, tone }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

function Status({ tone, children }) {
  return <span className={`status ${tone}`}>{children}</span>;
}

function formatCampaignStatus(status) {
  const map = {
    active: "نشطة",
    review: "تحتاج مراجعة",
    draft: "مسودة",
    approved: "معتمدة",
  };

  return map[status] || status;
}

function Mini({ title, value }) {
  return (
    <div className="metric-box">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.dashboard-grid-page {
  min-height: calc(100vh - 80px);
  padding: 22px;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.055), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.hero,
.quick-actions-card,
.kpi-card,
.card {
  background: #ffffff;
  border: 1px solid #e4e7df;
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(24, 38, 18, 0.028);
}

.hero {
  min-height: 112px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.kicker {
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

.hero h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  letter-spacing: 0;
}

.hero p {
  margin: 7px 0 0;
  max-width: 760px;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.hero-actions,
.button-row,
.split-buttons {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.period-switch {
  min-height: 40px;
  padding: 4px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  display: flex;
  gap: 4px;
}

.period-switch button {
  border: 0;
  background: transparent;
  border-radius: 12px;
  padding: 0 10px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.period-switch button.active {
  background: #176b2c;
  color: #fff;
}

.primary-button,
.secondary-button,
.ghost-button,
.mini-button {
  min-height: 40px;
  border-radius: 14px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
}

.primary-button {
  color: #fff;
  border: 0;
  background: #176b2c;
  box-shadow: 0 10px 20px rgba(23, 107, 44, 0.14);
}

.secondary-button,
.ghost-button,
.mini-button {
  color: #1f241d;
  background: #fff;
  border: 1px solid #e4e7df;
}

.mini-button {
  min-height: 34px;
  padding: 0 12px;
  font-size: 12px;
}

.wide {
  width: 100%;
}

.quick-actions-card {
  padding: 15px;
  margin-bottom: 12px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.quick-action {
  min-height: 68px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.quick-action:hover {
  border-color: #176b2c;
  background: #eef7e9;
}

.quick-icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #fff;
  color: #176b2c;
}

.quick-action strong,
.quick-action small {
  display: block;
}

.quick-action small {
  margin-top: 4px;
  color: #6f746b;
  font-size: 11px;
  line-height: 1.5;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.strategic-summary-card,
.social-summary-card {
  margin-bottom: 16px;
}

.strategy-note {
  margin: -4px 0 12px;
  color: #66715f;
  font-size: 12px;
  line-height: 1.7;
  font-weight: 800;
}

.strategy-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.prototype-note {
  width: fit-content;
  border: 1px solid #d9ead7;
  background: #eef7e9;
  color: #176b2c;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 900;
}

.kpi-card {
  height: 88px;
  padding: 12px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.kpi-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #eef7e9;
  color: #176b2c;
}

.kpi-card.blue .kpi-icon { color: #2563eb; background: #eff6ff; }
.kpi-card.amber .kpi-icon { color: #92400e; background: #fffbeb; }

.kpi-card span,
.metric-box span,
.info-row span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.kpi-card strong {
  display: block;
  margin-top: 4px;
  font-size: 22px;
  line-height: 1;
}

.kpi-card small {
  display: block;
  margin-top: 4px;
  color: #6f746b;
  font-size: 11px;
  line-height: 1.35;
}

.section-title {
  margin: 14px 2px 8px;
}

.section-title h2 {
  margin: 0;
  color: #1f241d;
  font-size: 16px;
  line-height: 1.35;
}

.section-title p {
  margin: 4px 0 0;
  color: #6f746b;
  font-size: 12px;
  line-height: 1.6;
}

.support-row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 12px;
  align-items: stretch;
  margin-bottom: 12px;
}

.middle-row,
.bottom-row { margin-bottom: 12px; }

.bottom-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
}

.card { padding: 15px; }
.support-row .card { min-height: 270px; }
.small-card { min-height: 268px; display: flex; flex-direction: column; }

.card-header {
  min-height: 48px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.card-header h2 { margin: 0; color: #1f241d; font-size: 16px; line-height: 1.35; }
.card-header p { margin: 5px 0 0; color: #6f746b; font-size: 12px; line-height: 1.7; }

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #176b2c;
  background: #eef7e9;
  flex: 0 0 auto;
}

.priority-list { display: grid; gap: 10px; }

.priority-row {
  min-height: 78px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.priority-row.green { border-color: #d9ead7; background: #f7fbf3; }
.priority-row.amber { border-color: #fde68a; background: #fffaf0; }
.priority-row.blue { border-color: #bfdbfe; background: #eff6ff; }

.action-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 16px;
  color: #fff;
  background: #176b2c;
}

.priority-row.amber .action-icon { background: #d97706; }
.priority-row.blue .action-icon { background: #2563eb; }

.priority-row strong { display: block; font-size: 14px; }
.priority-row p { margin: 5px 0 0; color: #4d5f4a; line-height: 1.65; font-size: 12px; }
.priority-row button {
  min-height: 36px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 14px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.readiness-summary {
  min-height: 84px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 12px;
}

.ring {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 7px solid #176b2c;
  box-shadow: inset 0 0 0 6px #eef7e9;
  font-weight: 1000;
  flex: 0 0 auto;
}

.readiness-summary strong { display: block; }
.readiness-summary span { display: block; color: #6f746b; margin-top: 5px; line-height: 1.6; font-size: 12px; }

.compact-list { display: grid; gap: 6px; margin-bottom: 12px; }

.info-row {
  min-height: 34px;
  border-bottom: 1px solid #e4e7df;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-row strong { font-size: 12px; }
.info-row strong.green { color: #166534; }
.info-row strong.amber { color: #92400e; }

.split-buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }

.campaign-table { border: 1px solid #e4e7df; border-radius: 18px; overflow: hidden; }

.campaign-row {
  width: 100%;
  min-height: 58px;
  display: grid;
  grid-template-columns: minmax(240px, 1.4fr) 130px 130px 115px 95px;
  gap: 10px;
  align-items: center;
  text-align: right;
  border: 0;
  border-top: 1px solid #e4e7df;
  background: #fff;
  padding: 10px 13px;
  font-family: inherit;
  cursor: pointer;
}

.campaign-row:first-child { border-top: 0; }
.campaign-row:hover { background: #fbfdf9; }

.campaign-main { display: flex; gap: 10px; align-items: center; }
.campaign-thumb { width: 36px; height: 34px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 12px; color: #176b2c; background: #eef7e9; }
.campaign-main strong { display: block; color: #1f241d; font-size: 13px; }
.campaign-main span, .muted { display: block; margin-top: 4px; color: #6f746b; font-size: 11px; }

.status {
  width: fit-content;
  min-height: 27px;
  border-radius: 999px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
}
.status.green { color: #166534; background: #f0fdf4; }
.status.amber { color: #92400e; background: #fffbeb; }
.status.slate { color: #475569; background: #f8fafc; }
.status.blue { color: #1d4ed8; background: #eff6ff; }

.readiness-cell { display: flex; align-items: center; gap: 8px; }
.readiness-cell i { width: 74px; height: 7px; overflow: hidden; border-radius: 999px; background: #e4e7df; }
.readiness-cell b { display: block; height: 100%; background: #176b2c; }
.readiness-cell small { color: #1f241d; font-size: 11px; font-weight: 900; }
.channel-pill { width: fit-content; border: 1px solid #e4e7df; background: #fff; border-radius: 999px; padding: 5px 9px; font-size: 10px; font-weight: 900; }

.box-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-bottom: 12px; }
.compact-metrics { margin-bottom: 8px; }
.metric-box { min-height: 64px; border: 1px solid #e4e7df; background: #f7f8f4; border-radius: 15px; padding: 10px; }
.metric-box strong { display: block; margin-top: 6px; color: #1f241d; font-size: 18px; }
.metric-box.green strong { color: #166534; }
.metric-box.amber strong { color: #92400e; }

.activity-list { display: grid; gap: 8px; margin-bottom: 12px; }
.activity-row { min-height: 50px; border: 1px solid #e4e7df; background: #f7f8f4; border-radius: 15px; padding: 9px; display: flex; align-items: flex-start; gap: 9px; }
.dot { width: 9px; height: 9px; margin-top: 8px; border-radius: 999px; flex: 0 0 auto; }
.dot.green { background: #16a34a; }
.dot.blue { background: #2563eb; }
.dot.amber { background: #f59e0b; }
.activity-row strong { display: block; font-size: 12px; }
.activity-row span { display: block; margin-top: 3px; color: #6f746b; font-size: 11px; }

@media (max-width: 1320px) {
  .support-row,
  .bottom-row,
  .quick-actions-grid { grid-template-columns: 1fr; }
  .kpi-grid,
  .strategy-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .campaign-row { grid-template-columns: 1fr; }
  .small-card { min-height: auto; }
  .priority-row { grid-template-columns: 48px minmax(0, 1fr); }
  .priority-row button { grid-column: 2; width: fit-content; }
}

@media (max-width: 760px) {
  .dashboard-grid-page { padding: 16px; }
  .hero,
  .hero-actions,
  .button-row { align-items: stretch; flex-direction: column; }
  .hero h1 { font-size: 27px; }
  .kpi-grid,
  .strategy-summary-grid,
  .box-grid,
  .split-buttons { grid-template-columns: 1fr; }
  .primary-button,
  .secondary-button,
  .ghost-button { width: 100%; }
  .period-switch { width: 100%; overflow:auto; }
}

.screen-guidance-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(24, 38, 18, 0.028);
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.screen-guidance-card div {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 14px;
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

@media (max-width: 1180px) {
  .screen-guidance-card { grid-template-columns: 1fr; }
}
`;
