import { lazy, Suspense, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Database,
  DollarSign,
  FileCheck2,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  Layers,
  Megaphone,
  Settings,
  Shield,
  Store,
  Users,
  Workflow,
  Wand2,
} from "lucide-react";

import AppShell from "./components/layout/AppShell.jsx";
import "./styles.css";

const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const StoreSetupPage = lazy(() => import("./pages/StoreSetupPage.jsx"));
const CampaignWizardPage = lazy(() => import("./pages/CampaignWizardPage.jsx"));
const CampaignsUnifiedPage = lazy(() => import("./pages/CampaignsUnifiedPage.jsx"));
const AnalyticsUnifiedPage = lazy(() => import("./pages/AnalyticsUnifiedPage.jsx"));
const AssetLibraryPage = lazy(() => import("./pages/AssetLibraryPage.jsx"));
const PublishingQueuePage = lazy(() => import("./pages/PublishingQueuePage.jsx"));
const TemplateEnginePage = lazy(() => import("./pages/TemplateEnginePage.jsx"));
const MultiPlatformPage = lazy(() => import("./pages/MultiPlatformPage.jsx"));
const TeamCollaborationPage = lazy(() => import("./pages/TeamCollaborationPage.jsx"));
const ContentStudioPage = lazy(() => import("./pages/ContentStudioPage.jsx"));
const ContentReviewPreviewUnifiedPage = lazy(() => import("./pages/ContentReviewPreviewUnifiedPage.jsx"));
const SystemAdminPage = lazy(() => import("./pages/SystemAdminPage.jsx"));
const SecretsAndKeysPage = lazy(() => import("./pages/SecretsAndKeysPage.jsx"));
const ModelRoutingPage = lazy(() => import("./pages/ModelRoutingPage.jsx"));
const ProductCatalogPage = lazy(() => import("./pages/ProductCatalogPage.jsx"));
const DataSourcesHubPage = lazy(() => import("./pages/DataSourcesHubPage.jsx"));
const PromptGovernancePage = lazy(() => import("./pages/PromptGovernancePage.jsx"));
const WorkflowRunsPage = lazy(() => import("./pages/WorkflowRunsPage.jsx"));
const CostMonitorPage = lazy(() => import("./pages/CostMonitorPage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));

function PlaceholderPage({ title, description }) {
  return (
    <section
      dir="rtl"
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          background: "#fff",
          border: "1px solid #e4e7df",
          borderRadius: 28,
          padding: 32,
          boxShadow: "0 8px 26px rgba(24, 38, 18, 0.04)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>{title}</h1>
        <p
          style={{
            color: "#6f746b",
            lineHeight: 1.9,
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          {description}
        </p>
      </div>
    </section>
  );
}

function PageLoadingFallback() {
  return (
    <section
      dir="rtl"
      style={{
        minHeight: "50vh",
        display: "grid",
        placeItems: "center",
        color: "#176b2c",
        fontWeight: 900,
      }}
    >
      جاري تحميل الصفحة...
    </section>
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState("dashboard");

  const screens = useMemo(
    () => [
      { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, enabled: true },
      { id: "storeSetup", label: "إعداد المتجر", icon: Store, enabled: true },
      { id: "productCatalog", label: "كتالوج المنتجات", icon: Store, enabled: true },
      { id: "dataSourcesHub", label: "مركز المصادر البياناتية", icon: Database, enabled: true },
      { id: "assetLibrary", label: "مكتبة الأصول", icon: FolderOpen, enabled: true },

      { id: "campaigns", label: "معالج الحملات", icon: Megaphone, enabled: true },
      { id: "campaignsList", label: "الحملات", icon: Megaphone, enabled: true },

      { id: "content", label: "المحتوى", icon: FileCheck2, enabled: true },
      { id: "contentReview", label: "المراجعة والمعاينة", icon: FileCheck2, enabled: true },
      { id: "publishingQueue", label: "جدولة النشر", icon: CalendarDays, enabled: true },

      { id: "analytics", label: "التحليلات", icon: BarChart3, enabled: true },

      { id: "templateEngine", label: "محرك القوالب", icon: Wand2, enabled: true },
      { id: "multiPlatform", label: "متعدد القنوات", icon: Layers, enabled: true },
      { id: "teamCollaboration", label: "تعاون الفريق", icon: Users, enabled: true },

      { id: "workflowRuns", label: "تشغيلات النظام", icon: Workflow, enabled: true },
      { id: "systemAdmin", label: "إدارة النظام", icon: Shield, enabled: true },
      { id: "secrets", label: "الأسرار والمفاتيح", icon: KeyRound, enabled: true },
      { id: "modelRouting", label: "توجيه النماذج", icon: Wand2, enabled: true },
      { id: "promptGovernance", label: "حوكمة المطالبات", icon: Wand2, enabled: true },
      { id: "costMonitor", label: "مراقبة التكلفة", icon: DollarSign, enabled: true },
      { id: "settings", label: "الإعدادات", icon: Settings, enabled: true },
    ],
    []
  );

  let pageContent = null;

  if (activeScreen === "dashboard") {
    pageContent = (
<DashboardPage
  onCreateCampaign={() => setActiveScreen("campaigns")}
  onOpenStoreSetup={() => setActiveScreen("storeSetup")}
  onOpenProductCatalog={() => setActiveScreen("productCatalog")}
  onOpenDataSources={() => setActiveScreen("dataSourcesHub")}
  onOpenCampaigns={() => setActiveScreen("campaignsList")}
  onOpenAssets={() => setActiveScreen("assetLibrary")}
  onOpenAnalytics={() => setActiveScreen("analytics")}
  onOpenReview={() => setActiveScreen("content")}
  onOpenPublishingQueue={() => setActiveScreen("publishingQueue")}
  onOpenMultiPlatform={() => setActiveScreen("multiPlatform")}
/>
    );
  }

  if (activeScreen === "storeSetup") pageContent = <StoreSetupPage />;
  if (activeScreen === "productCatalog") pageContent = <ProductCatalogPage />;
  if (activeScreen === "dataSourcesHub") pageContent = <DataSourcesHubPage />;
  if (activeScreen === "assetLibrary") pageContent = <AssetLibraryPage />;

  if (activeScreen === "campaigns") pageContent = <CampaignWizardPage />;

  if (activeScreen === "campaignsList") {
    pageContent = (
      <CampaignsUnifiedPage
        onCreateCampaign={() => setActiveScreen("campaigns")}
      />
    );
  }

  if (activeScreen === "content") pageContent = <ContentStudioPage />;
  if (activeScreen === "contentReview") pageContent = <ContentReviewPreviewUnifiedPage />;
  if (activeScreen === "publishingQueue") pageContent = <PublishingQueuePage />;
  if (activeScreen === "analytics") pageContent = <AnalyticsUnifiedPage />;

  if (activeScreen === "templateEngine") pageContent = <TemplateEnginePage />;
  if (activeScreen === "multiPlatform") pageContent = <MultiPlatformPage />;
  if (activeScreen === "teamCollaboration") pageContent = <TeamCollaborationPage />;

  if (activeScreen === "workflowRuns") pageContent = <WorkflowRunsPage />;
  if (activeScreen === "systemAdmin") pageContent = <SystemAdminPage />;
  if (activeScreen === "secrets") pageContent = <SecretsAndKeysPage />;
  if (activeScreen === "modelRouting") pageContent = <ModelRoutingPage />;
  if (activeScreen === "promptGovernance") pageContent = <PromptGovernancePage />;
  if (activeScreen === "costMonitor") pageContent = <CostMonitorPage />;
  if (activeScreen === "settings") pageContent = <SettingsPage />;

  if (!pageContent) {
    pageContent = (
      <PlaceholderPage
        title="هذه الشاشة مؤجلة"
        description="لم يتم اعتماد تنفيذ هذه الشاشة بعد."
      />
    );
  }

  return (
    <AppShell
      screens={screens}
      activeScreen={activeScreen}
      setActiveScreen={setActiveScreen}
    >
      <Suspense fallback={<PageLoadingFallback />}>
        {pageContent}
      </Suspense>
    </AppShell>
  );
}
