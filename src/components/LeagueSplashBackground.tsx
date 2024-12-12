"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Champion {
  id: string;
  name: string;
}

export default function LeagueSplashBackground() {
  const [splashUrl, setSplashUrl] = useState<string | null>(null);
  const [championName, setChampionName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChampionSplash() {
      try {
        // Fetch the latest version and champions list
        const versionResponse = await fetch(
          "https://ddragon.leagueoflegends.com/api/versions.json",
        );
        const versions = await versionResponse.json();
        const latestVersion = versions[0];

        // Fetch champions list
        const championsResponse = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`,
        );
        const championsData = await championsResponse.json();

        // Convert champions object to array and remove any potential undefined values
        const champions: Champion[] = Object.values(championsData.data).filter(
          (champion): champion is Champion =>
            champion !== null && typeof champion === "object",
        );

        // Ensure we have champions
        if (champions.length === 0) {
          throw new Error("No champions found");
        }

        // Select a random champion - using non-null assertion after length check
        const randomChampion =
          champions[Math.floor(Math.random() * champions.length)]!;

        // Construct splash art URL
        const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${randomChampion.id}_0.jpg`;

        setSplashUrl(splashUrl);
        setChampionName(randomChampion.name);
      } catch (error) {
        console.error("Failed to fetch champion splash", error);
        setError("Failed to load champion splash");
      }
    }

    fetchChampionSplash();
  }, []);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
        {error}
      </div>
    );
  }

  if (!splashUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-800">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Image
        src={splashUrl}
        alt={`${championName || "Champion"} splash art`}
        fill
        priority
        className="object-cover"
      />
      {/* Dark overlay to improve readability */}
      <div className="absolute inset-0 bg-black opacity-70"></div>
      {championName && (
        <div className="absolute bottom-4 right-4 rounded bg-black bg-opacity-50 p-2 text-white">
          {championName}
        </div>
      )}
    </div>
  );
}
