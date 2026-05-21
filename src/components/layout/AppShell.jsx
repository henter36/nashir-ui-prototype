import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell({
  screens = [],
  activeScreen,
  setActiveScreen,
  children,
}) {
  return (
    <div className="nashir-ref-shell" dir="rtl">
      <style>{styles}</style>

      <Sidebar
        screens={screens}
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
      />

      <section className="nashir-ref-main">
        <Topbar />
        <div className="nashir-ref-content">{children}</div>
      </section>
    </div>
  );
}

const styles = `
.nashir-ref-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-template-areas: "main sidebar";
  background: #f6f8fb;
  color: #111827;
  font-family: "Inter", "Tajawal", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.nashir-ref-main {
  grid-area: main;
  min-width: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nashir-ref-content {
  min-width: 0;
  flex: 1;
}

@media (max-width: 980px) {
  .nashir-ref-shell {
    grid-template-columns: 1fr;
    grid-template-areas:
      "sidebar"
      "main";
  }
}
`;