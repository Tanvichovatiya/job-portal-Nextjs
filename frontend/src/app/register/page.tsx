"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "../../../lib/socket";
import { setAuth } from "../../../lib/auth";
import Link from "next/link";
import RegisterForm from "../components/RegisterForm";

export default function LoginForm() {
  
      

  return (
    <>
      <RegisterForm />
    </>
  );
}
