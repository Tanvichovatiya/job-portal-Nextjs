"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface Props {
  userName?: string;
  onLogout?: () => void;
}

export default function DashboardNavbar({ userName, onLogout }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // ensures this component only renders on client
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/job", label: "Jobs" },
    { href: "/applications", label: "Applications" },
    { href: "/companyProfile", label: "Profile" },
  ];

  if (!mounted) return null; // avoid SSR mismatch

  return (
    <nav className="bg-black text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 text-white font-semibold text-lg">
            <img src="/globe.svg" alt="Logo" className="w-6 h-6" />
            <span>Company Dashboard</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex lg:items-center lg:gap-6 ml-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 py-1 font-medium transition-colors duration-200 ease-in-out ${
                    isActive ? "text-white" : "text-white hover:text-gray-400"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            {userName && <span className="text-gray-200 ml-2">Hi, {userName}</span>}
            {onLogout ? (
              <button
                onClick={onLogout}
                className="ml-2 px-3 py-1 border border-gray-400 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white transition"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/logout"
                className="ml-2 px-3 py-1 border border-gray-400 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white transition"
              >
                Logout
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-black border-t border-gray-700">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-2 py-1 rounded-md font-medium transition-colors duration-200 ease-in-out ${
                    isActive ? "text-white" : "text-white hover:text-gray-400"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-2 mt-2">
              {userName && <span className="text-gray-200">Hi, {userName}</span>}
              {onLogout ? (
                <button
                  onClick={onLogout}
                  className="px-3 py-1 border border-gray-400 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white transition"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/logout"
                  className="px-3 py-1 border border-gray-400 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white transition"
                >
                  Logout
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
