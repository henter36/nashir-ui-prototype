import {
  Bell,
  CalendarDays,
  ChevronDown,
  HelpCircle,
  Search,
  Store,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="ref-topbar" dir="rtl">
      <style>{styles}</style>

      <div className="ref-topbar-left">
        <div className="ref-avatar">أ</div>
        <button type="button" className="ref-icon-button">
          <ChevronDown size={17} />
        </button>
        <button type="button" className="ref-icon-button with-dot">
          <Bell size={18} />
        </button>
        <button type="button" className="ref-icon-button">
          <HelpCircle size={18} />
        </button>
      </div>

      <div className="ref-workspace-switcher">
        <Store size={20} />
        <div>
          <strong>متجر النمو</strong>
          <span>فريق العمل</span>
        </div>
        <ChevronDown size={17} />
      </div>

      <div className="ref-search">
        <Search size={18} />
        <input placeholder="ابحث في ناشر..." />
      </div>

      <button type="button" className="ref-date-mini">
        <CalendarDays size={17} />
        اليوم
      </button>
    </header>
  );
}

const styles = `
.ref-topbar {
  height: 80px;
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid #e5e7eb;
  backdrop-filter: blur(18px);
  display: grid;
  grid-template-columns: auto 300px minmax(260px, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 0 22px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.ref-topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ref-avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #111827;
  color: #fff;
  font-weight: 900;
}

.ref-icon-button {
  width: 42px;
  height: 42px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #374151;
  cursor: pointer;
  position: relative;
}

.ref-icon-button.with-dot::after {
  content: "";
  position: absolute;
  top: 8px;
  inset-inline-start: 9px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #10b981;
  box-shadow: 0 0 0 2px #fff;
}

.ref-workspace-switcher {
  min-height: 56px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 14px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ref-workspace-switcher strong {
  display: block;
  color: #111827;
  font-size: 15px;
}

.ref-workspace-switcher span {
  display: block;
  color: #64748b;
  margin-top: 2px;
  font-size: 12px;
}

.ref-search {
  height: 44px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
}

.ref-search input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-family: inherit;
  color: #111827;
}

.ref-date-mini {
  height: 42px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  border-radius: 999px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 1180px) {
  .ref-topbar {
    grid-template-columns: auto 260px 1fr;
  }

  .ref-date-mini {
    display: none;
  }
}

@media (max-width: 820px) {
  .ref-topbar {
    height: auto;
    padding: 14px;
    grid-template-columns: 1fr;
  }

  .ref-topbar-left,
  .ref-workspace-switcher,
  .ref-search {
    width: 100%;
  }
}
`;