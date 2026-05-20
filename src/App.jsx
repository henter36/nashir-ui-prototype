import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  Layers,
  Megaphone,
  MonitorSmartphone,
  Settings,
  Shield,
  Sparkles,
  Store,
  Users,
  Wand2,
} from "lucide-react";

import AppShell from "./components/layout/AppShell.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import OnboardingFlowPage from "./pages/OnboardingFlowPage.jsx";
import StoreSetupPage from "./pages/StoreSetupPage.jsx";
import CampaignWizardPage from "./pages/CampaignWizardPage.jsx";
import CampaignIntakePage from "./pages/CampaignIntakePage.jsx";
import CampaignsListPage from "./pages/CampaignsListPage.jsx";
import CampaignDetailPage from "./pages/CampaignDetailPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import AssetLibraryPage from "./pages/AssetLibraryPage.jsx";
import PublishingQueuePage from "./pages/PublishingQueuePage.jsx";
import DualGuidedIntakePage from "./pages/DualGuidedIntakePage.jsx";
import TemplateEnginePage from "./pages/TemplateEnginePage.jsx";
import LivePreviewPage from "./pages/LivePreviewPage.jsx";
import MultiPlatformPage from "./pages/MultiPlatformPage.jsx";
import SmartAnalyticsPage from "./pages/SmartAnalyticsPage.jsx";
import TeamCollaborationPage from "./pages/TeamCollaborationPage.jsx";
import ContentStudioPage from "./pages/ContentStudioPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import SystemAdminPage from "./pages/SystemAdminPage.jsx";
import SecretsAndKeysPage from "./pages/SecretsAndKeysPage.jsx";
import ModelRoutingPage from "./pages/ModelRoutingPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import "./styles.css";

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

export default function App() {
  const [activeScreen, setActiveScreen] = useState("storeSetup");
  const screens = useMemo(
    () => [
      { id: "onboarding", label: "التهيئة الأولى", icon: Sparkles, enabled: true },
      { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, enabled: true },
      { id: "storeSetup", label: "إعداد المتجر", icon: Store, enabled: true },
      { id: "campaignIntake", label: "إنشاء حملة", icon: Megaphone, enabled: true },
      { id: "dualGuidedIntake", label: "الإدخال الذكي", icon: Wand2, enabled: true },
      { id: "campaignsList", label: "قائمة الحملات", icon: Megaphone, enabled: true },
      { id: "campaignDetail", label: "تفاصيل الحملة", icon: CheckCircle2, enabled: true },
      { id: "templateEngine", label: "محرك القوالب", icon: Wand2, enabled: true },
      { id: "assetLibrary", label: "مكتبة الأصول", icon: FolderOpen, enabled: true },
      { id: "livePreview", label: "المعاينة الحية", icon: MonitorSmartphone, enabled: true },
      { id: "multiPlatform", label: "متعدد القنوات", icon: Layers, enabled: true },
      { id: "publishingQueue", label: "جدولة النشر", icon: CalendarDays, enabled: true },
      { id: "analytics", label: "التحليلات", icon: BarChart3, enabled: true },
      { id: "smartAnalytics", label: "التحليلات الذكية", icon: Sparkles, enabled: true },
      { id: "teamCollaboration", label: "تعاون الفريق", icon: Users, enabled: true },
      { id: "content", label: "المحتوى", icon: FileCheck2, enabled: true },
      { id: "review", label: "المراجعة", icon: CheckCircle2, enabled: true },
      { id: "campaigns", label: "معالج الحملات القديم", icon: Megaphone, enabled: true },
      { id: "systemAdmin", label: "إدارة النظام", icon: Shield, enabled: true },
      { id: "secrets", label: "الأسرار والمفاتيح", icon: KeyRound, enabled: true },
      { id: "modelRouting", label: "توجيه النماذج", icon: Wand2, enabled: true },
      { id: "settings", label: "الإعدادات", icon: Settings, enabled: true },
    ],
    []
  );

  let pageContent = null;

  if (activeScreen === "onboarding") {
    pageContent = <OnboardingFlowPage onFinish={() => setActiveScreen("dashboard")} />;
  }

  if (activeScreen === "dashboard") {
    pageContent = (
      <DashboardPage
        onCreateCampaign={() => setActiveScreen("campaignIntake")}
        onOpenStoreSetup={() => setActiveScreen("storeSetup")}
        onOpenCampaigns={() => setActiveScreen("campaignsList")}
        onOpenAssets={() => setActiveScreen("assetLibrary")}
        onOpenAnalytics={() => setActiveScreen("analytics")}
        onOpenReview={() => setActiveScreen("review")}
      />
    );
  }

  if (activeScreen === "storeSetup") pageContent = <StoreSetupPage />;
  if (activeScreen === "campaignIntake") pageContent = <CampaignIntakePage />;
  if (activeScreen === "dualGuidedIntake") pageContent = <DualGuidedIntakePage />;

  if (activeScreen === "campaignsList") {
    pageContent = (
      <CampaignsListPage
        onCreateCampaign={() => setActiveScreen("campaignIntake")}
      />
    );
  }

  if (activeScreen === "campaignDetail") pageContent = <CampaignDetailPage />;
  if (activeScreen === "templateEngine") pageContent = <TemplateEnginePage />;
  if (activeScreen === "assetLibrary") pageContent = <AssetLibraryPage />;
  if (activeScreen === "livePreview") pageContent = <LivePreviewPage />;
  if (activeScreen === "multiPlatform") pageContent = <MultiPlatformPage />;
  if (activeScreen === "publishingQueue") pageContent = <PublishingQueuePage />;
  if (activeScreen === "analytics") pageContent = <AnalyticsPage />;
  if (activeScreen === "smartAnalytics") pageContent = <SmartAnalyticsPage />;
  if (activeScreen === "teamCollaboration") pageContent = <TeamCollaborationPage />;
  if (activeScreen === "content") pageContent = <ContentStudioPage />;
  if (activeScreen === "review") pageContent = <ReviewPage />;
  if (activeScreen === "campaigns") pageContent = <CampaignWizardPage />;
  if (activeScreen === "systemAdmin") pageContent = <SystemAdminPage />;
  if (activeScreen === "secrets") pageContent = <SecretsAndKeysPage />;
  if (activeScreen === "modelRouting") pageContent = <ModelRoutingPage />;
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
      {pageContent}
    </AppShell>
  );
}
