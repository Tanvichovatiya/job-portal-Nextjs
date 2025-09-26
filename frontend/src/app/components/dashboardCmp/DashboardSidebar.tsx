"use client";
import Link from "next/link";

type SidebarItem = {
  href: string;
  label: string;
  icon?: string; // optional bootstrap icon class name
};

export default function DashboardSidebar({ items, activeHref }: { items: SidebarItem[]; activeHref?: string }) {
  return (
    <aside className="card shadow-sm position-sticky" style={{ top: "1rem" }}>
      <div className="list-group list-group-flush">
        {items.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`list-group-item list-group-item-action ${isActive ? "active" : ""}`}
            >
              {item.icon && <i className={`${item.icon} me-2`} aria-hidden="true" />}
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}


