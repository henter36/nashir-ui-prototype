import { Bell, Gift, Search, Store } from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="workspace-switcher">
        <div className="workspace-icon">
          <Store size={19} />
        </div>
        <div>
          <div className="workspace-label">فريق العمل</div>
          <div className="workspace-name">متجر النمو</div>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={18} />
        <input placeholder="ابحث في ناشر..." />
        <kbd>⌘ K</kbd>
      </div>

      <button className="icon-button" type="button">
        <Gift size={18} />
      </button>

      <button className="icon-button with-dot" type="button">
        <Bell size={18} />
      </button>

      <div className="user-chip">
        <div className="avatar">أ</div>
        <div>
          <div className="user-name">أحمد السعيد</div>
          <div className="user-role">Admin</div>
        </div>
      </div>
    </header>
  );
}