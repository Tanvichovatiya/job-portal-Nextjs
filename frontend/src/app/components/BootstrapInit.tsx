"use client";
import { useEffect } from "react";

export default function BootstrapInit() {
  useEffect(() => {
    // Dynamically import Bootstrap JS for components like Navbar collapse
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return null;
}


