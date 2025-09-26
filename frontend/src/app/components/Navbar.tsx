
"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" href="/">Job Portal</Link>
        <div className="d-flex gap-12">
          <Link className="nav-link text-light" href="/user">Jobs</Link>
          <Link className="nav-link text-light" href="/profile">Profile</Link>
          <Link className="nav-link text-light" href="/logout">Logout</Link>
        </div>
      </div>
    </nav>
  );
}
