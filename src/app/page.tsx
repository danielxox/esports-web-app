"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (!userId) {
        router.push("/sign-in");
      } else {
        router.push("/home");
      }
    }
  }, [isLoaded, userId, router]);

  return <div>Loading...</div>;
}
