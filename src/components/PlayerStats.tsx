// src/components/PlayerStats.tsx
export function PlayerStats({ playerStats }) {
  return (
    <div>
      {playerStats.map((stat) => (
        <div
          key={stat.summonerName}
          className="mb-2 rounded-md border bg-gray-50 p-4"
        >
          <p>Summoner: {stat.summonerName}</p>
          <p>Team: {stat.teamTag}</p>
          <p>
            KDA: {stat.kills}/{stat.deaths}/{stat.assists}
          </p>
          <p>Gold per Minute: {stat.goldPerMinute}</p>
        </div>
      ))}
    </div>
  );
}
