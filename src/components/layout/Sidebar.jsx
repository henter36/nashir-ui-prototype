import { Sparkles, HelpCircle } from "lucide-react";

const groups = [
  {
    title: "الرئيسية",
    ids: [
      "dashboard",
      "storeSetup",
      "productCatalog",
      "productIntelligence",
      "dataSourcesHub",
      "assetLibrary",
    ],
  },
  {
    title: "الحملات والمحتوى",
    ids: [
      "campaigns",
      "campaignsList",
      "content",
      "publishingQueue",
    ],
  },
  {
    title: "التحليلات والقنوات",
    ids: [
      "analytics",
      "templateEngine",
      "multiPlatform",
      "teamCollaboration",
    ],
  },
  {
    title: "الإدارة والحوكمة",
    ids: [
      "workflowRuns",
      "systemAdmin",
      "secrets",
      "modelRouting",
      "promptGovernance",
      "costMonitor",
      "settings",
    ],
  },
];

export default function Sidebar({ screens = [], activeScreen, setActiveScreen }) {
  const screenMap = new Map(screens.map((screen) => [screen.id, screen]));

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
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
          {groups.map((group) => {
            const groupScreens = group.ids
              .map((id) => screenMap.get(id))
              .filter(Boolean);

            if (!groupScreens.length) return null;

            return (
              <div key={group.title} className="sidebar-group">
                <div className="sidebar-group-title">{group.title}</div>

                <div className="sidebar-group-list">
                  {groupScreens.map((screen) => {
                    const Icon = screen.icon;
                    const isActive = activeScreen === screen.id;

                    return (
                      <button
                        key={screen.id}
                        type="button"
                        disabled={!screen.enabled}
                        onClick={() => screen.enabled && setActiveScreen(screen.id)}
                        className={[
                          "sidebar-item",
                          isActive ? "active" : "",
                          !screen.enabled ? "disabled" : "",
                        ].join(" ")}
                      >
                        <Icon size={18} />
                        <span>{screen.label}</span>
                        {!screen.enabled && <em>لاحقًا</em>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-help">
            <div className="help-row">
              <HelpCircle size={18} />
              <span>مركز المساعدة</span>
            </div>
          </div>

          <div className="plan-card">
            <div className="plan-title">باقة النمو</div>
            <div className="plan-note">تنتهي في 24 يوم</div>
            <div className="plan-progress">
              <span />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
