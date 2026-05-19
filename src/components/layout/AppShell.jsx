import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell({ children, screens, activeScreen, setActiveScreen }) {
  return (
    <div className="app-shell" dir="rtl">
      <Sidebar
        screens={screens}
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
      />

      <section className="app-main">
        <Topbar />
        <main className="page-container">{children}</main>
      </section>
    </div>
  );
}