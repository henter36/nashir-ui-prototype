import { useMemo, useState } from "react";
import {
  CheckCircle2,
  FileCheck2,
  LayoutDashboard,
  Megaphone,
  Settings,
  Store,
} from "lucide-react";

import AppShell from "./components/layout/AppShell.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import StoreSetupPage from "./pages/StoreSetupPage.jsx";
import CampaignWizardPage from "./pages/CampaignWizardPage.jsx";
import ContentStudioPage from "./pages/ContentStudioPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
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
      {
        id: "dashboard",
        label: "لوحة التحكم",
        icon: LayoutDashboard,
        enabled: true,
      },
      {
        id: "storeSetup",
        label: "إعداد المتجر",
        icon: Store,
        enabled: true,
      },
      {
        id: "campaigns",
        label: "الحملات",
        icon: Megaphone,
        enabled: true,
      },
      {
        id: "content",
        label: "المحتوى",
        icon: FileCheck2,
        enabled: true,
      },
      {
        id: "review",
        label: "المراجعة",
        icon: CheckCircle2,
        enabled: true,
      },
      {
        id: "settings",
        label: "الإعدادات",
        icon: Settings,
        enabled: true,
      },
    ],
    []
  );

  let pageContent = null;

  if (activeScreen === "dashboard") {
    pageContent = (
      <DashboardPage onCreateCampaign={() => setActiveScreen("campaigns")} />
    );
  }

  if (activeScreen === "storeSetup") {
    pageContent = <StoreSetupPage />;
  }
  if (activeScreen === "campaigns") {
    pageContent = <CampaignWizardPage />;
  }
  if (activeScreen === "content") {
    pageContent = <ContentStudioPage />;
  }
  if (activeScreen === "review") {
    pageContent = <ReviewPage />;
  }
  if (activeScreen === "settings") {
    pageContent = <SettingsPage />;
  }
  if (!pageContent) {
    pageContent = (
      <PlaceholderPage
        title="هذه الشاشة مؤجلة"
        description="لم يتم اعتماد تنفيذ هذه الشاشة بعد. سيتم تفعيلها بعد الانتهاء من إعداد المتجر ثم معالج إنشاء الحملة."
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