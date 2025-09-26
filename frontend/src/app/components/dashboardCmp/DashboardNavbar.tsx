"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNavbar({ userName, onLogout }: { userName?: string; onLogout?: () => void }) {
  const pathname = usePathname();
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/user", label: "Jobs" },
    { href: "/dashboard", label: "Dashboard" },
  ];
  return (
    <nav className="navbar navbar-light bg-white border-bottom shadow-sm dashboard-navbar">
      <div className="container px-3 d-lg-flex align-items-center">
        <Link className="navbar-brand fw-semibold text-primary d-flex align-items-center gap-2" href="/dashboard">
          <img src="/globe.svg" alt="Logo" width={24} height={24} />
          <span>Company Dashboard</span>
        </Link>

        {/* Mobile toggler (offcanvas) */}
        <button
          className="navbar-toggler d-md-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#dashboardOffcanvas"
          aria-controls="dashboardOffcanvas"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Desktop menu (>= 992px) */}
        <div className="d-none d-lg-flex align-items-center flex-grow-1 justify-content-between">
          <div className="flex-grow-1 d-flex align-items-center">
            <ul className="navbar-nav  mb-0 gap-3 mx-lg-auto d-flex  align-items-center">
              {navLinks.map((l) => {
                const isActive = pathname === l.href || pathname.startsWith(l.href + "/");
                return (
                  <li key={l.href} className="nav-item">
                    <Link className={`nav-link ${isActive ? "active" : "text-dark"}`} aria-current={isActive ? "page" : undefined} href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="ms-3 d-none d-lg-block" style={{ minWidth: 220 }}>
              <input className="form-control form-control-sm" placeholder="Search jobs..." />
            </div>
          </div>
          <div className="d-flex align-items-center gap-3 ms-lg-3">
            <span className="text-muted">{userName ? `Hi, ${userName}` : ""}</span>
            {onLogout ? (
              <button className="btn btn-primary btn-sm" onClick={onLogout}>Logout</button>
            ) : (
              <Link className="btn btn-primary btn-sm" href="/logout">Logout</Link>
            )}
          </div>
        </div>
      </div>

      {/* Offcanvas for mobile */}
      <div className="offcanvas offcanvas-end" tabIndex={-1} id="dashboardOffcanvas" aria-labelledby="dashboardOffcanvasLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="dashboardOffcanvasLabel">Menu</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body d-flex flex-column">
          <div className="mb-3">
            <input className="form-control" placeholder="Search jobs..." />
          </div>
          <ul className="navbar-nav mb-3">
            {navLinks.map((l) => (
              <li key={l.href} className="nav-item">
                <Link className="nav-link" href={l.href} data-bs-dismiss="offcanvas">{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto d-flex align-items-center gap-2">
            <span className="text-muted flex-grow-1">{userName ? `Hi, ${userName}` : ""}</span>
            {onLogout ? (
              <button className="btn btn-primary btn-sm" onClick={onLogout} data-bs-dismiss="offcanvas">Logout</button>
            ) : (
              <Link className="btn btn-primary btn-sm" href="/logout" data-bs-dismiss="offcanvas">Logout</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


