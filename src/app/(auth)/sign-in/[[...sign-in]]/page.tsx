"use client";

import { SignIn } from "@clerk/nextjs";
import LeagueSplashBackground from "~/components/LeagueSplashBackground";

export default function SignInPage() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center">
      <div className="absolute inset-0 z-0">
        <LeagueSplashBackground />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <SignIn />
      </div>
    </div>
  );
}
