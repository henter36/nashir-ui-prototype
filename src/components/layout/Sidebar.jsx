import {
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  storeSetup: ShieldCheck,
  campaigns: Megaphone,
  content: FileText,
  review: CheckCircle2,
  settings: Settings,
};

const labelMap = {
  dashboard: "لوحة التحكم",
  storeSetup: "العلامة التجارية",
  campaigns: "الحملات",
  content: "المحتوى",
  review: "المراجعة",
  settings: "الإعدادات",
};

export default function Sidebar({
  screens = [],
  activeScreen,
  setActiveScreen,
}) {
  const orderedScreens = screens.filter((screen) =>
    ["dashboard", "storeSetup", "campaigns", "content", "review", "settings"].includes(
      screen.id
    )
  );

  return (
    <aside className="ref-sidebar">
      <style>{styles}</style>

      <div className="ref-brand">
        <div className="ref-brand-mark">
          <Sparkles size={22} />
        </div>

        <div>
          <strong>Marketing OS</strong>
          <span>Lite</span>
        </div>
      </div>

      <nav className="ref-nav">
        {orderedScreens.map((screen) => {
          const Icon = iconMap[screen.id] || screen.icon || LayoutDashboard;
          const isActive = activeScreen === screen.id;
          const disabled = screen.enabled === false;

          return (
            <button
              key={screen.id}
              type="button"
              className={`ref-nav-item ${isActive ? "active" : ""}`}
              disabled={disabled}
              onClick={() => {
                if (!disabled) setActiveScreen(screen.id);
              }}
            >
              <Icon size={21} />
              <span>{labelMap[screen.id] || screen.label}</span>
            </button>
          );
        })}

        <button type="button" className="ref-nav-item muted">
          <Clock3 size={21} />
          <span>سجل النشاط</span>
        </button>
      </nav>

      <div className="ref-sidebar-bottom">
        <button type="button" className="ref-help-card">
          <Headphones size={22} />
          <div>
            <strong>الدعم والمساعدة</strong>
            <span>مركز المساعدة</span>
          </div>
        </button>

        <button type="button" className="ref-collapse">
          <Store size={18} />
          <span>طي القائمة</span>
        </button>
      </div>
    </aside>
  );
}

const styles = `
.ref-sidebar {
  grid-area: sidebar;
  min-height: 100vh;
  background: #ffffff;
  border-inline-start: 1px solid #e5e7eb;
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: sticky;
  top: 0;
}

.ref-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 6px 14px;
}

.ref-brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #0f766e;
  background: #ecfeff;
  border: 1px solid #ccfbf1;
}

.ref-brand strong {
  display: inline-block;
  color: #0f172a;
  font-size: 25px;
  line-height: 1;
  letter-spacing: -0.04em;
}

.ref-brand span {
  color: #14b8a6;
  font-size: 16px;
  font-weight: 800;
  margin-inline-start: 5px;
}

.ref-nav {
  display: grid;
  gap: 14px;
}

.ref-nav-item {
  min-height: 66px;
  width: 100%;
  border: 0;
  background: transparent;
  color: #374151;
  border-radius: 18px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  font-family: inherit;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.18s ease;
}

.ref-nav-item:hover {
  background: #f8fafc;
}

.ref-nav-item.active {
  color: #0f766e;
  background: linear-gradient(135deg, #ecfdf5, #eefdfb);
}

.ref-nav-item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ref-nav-item.muted {
  color: #475569;
}

.ref-sidebar-bottom {
  margin-top: auto;
  display: grid;
  gap: 14px;
}

.ref-help-card,
.ref-collapse {
  width: 100%;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 18px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: inherit;
  color: #374151;
  cursor: pointer;
}

.ref-help-card strong {
  display: block;
  font-size: 14px;
}

.ref-help-card span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-top: 3px;
}

.ref-collapse {
  justify-content: center;
  font-weight: 800;
  background: #fff;
}

@media (max-width: 980px) {
  .ref-sidebar {
    min-height: auto;
    position: static;
    border-inline-start: 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .ref-nav {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ref-nav-item {
    min-height: 48px;
    justify-content: center;
    font-size: 13px;
    padding: 0 10px;
  }

  .ref-sidebar-bottom {
    display: none;
  }
}
`;