import { Sparkles, HelpCircle } from "lucide-react";

export default function Sidebar({ screens, activeScreen, setActiveScreen }) {
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
        {screens.map((screen) => {
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
              <Icon size={19} />
              <span>{screen.label}</span>
              {!screen.enabled && <em>لاحقًا</em>}
            </button>
          );
        })}
      </nav>

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
    </aside>
  );
}