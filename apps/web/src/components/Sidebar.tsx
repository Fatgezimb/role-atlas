import { BarChart3, Bell, BriefcaseBusiness, Database, Map, RadioTower, Settings, Wifi } from "lucide-react";
import { Brand } from "./Brand";

const navItems = [
  { label: "Jobs", icon: BriefcaseBusiness, active: true },
  { label: "Remote", icon: Wifi },
  { label: "Map", icon: Map },
  { label: "Analytics", icon: BarChart3 },
  { label: "Saved", icon: RadioTower }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Brand />
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button className={`nav-item ${item.active ? "active" : ""}`} key={item.label} type="button">
              <Icon size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item compact" type="button">
          <Bell size={19} />
          <span>Alerts</span>
          <strong>3</strong>
        </button>
        <button className="nav-item compact" type="button">
          <Database size={19} />
          <span>Sources</span>
        </button>
        <button className="nav-item compact" type="button">
          <Settings size={19} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

