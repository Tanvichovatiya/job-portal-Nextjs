"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12 md:flex md:justify-between md:items-start">
        {/* Logo & Description */}
        <div className="mb-8 md:mb-0 md:w-1/3">
          <Link href="/home" className="flex items-center space-x-3 mb-4">
            <img src="/logo/logo.png" alt="Job Portal Logo" className="h-10 w-auto" />
            
          </Link>
          <p className="text-gray-600 text-sm">
            Find your dream job with ease. Explore thousands of opportunities across multiple industries.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-8 md:mb-0 md:w-1/5">
          <h4 className="text-black font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/user" className="hover:text-gray-800 text-black transition">
                Jobs
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-gray-700 text-black transition">
                Profile
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-gray-700 text-black transition">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gray-700 text-black transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div className="mb-8 md:mb-0 md:w-1/5">
          <h4 className="text-black font-semibold mb-4">Resources</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/blog" className="hover:text-gray-800 text-black transition">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-gray-800 text-black transition">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-gray-800 text-black transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gray-800 text-black transition">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-300 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} JobPortal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
