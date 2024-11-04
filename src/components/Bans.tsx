// src/components/Bans.tsx
export function Bans({ bans }) {
  return (
    <div>
      {bans.map((ban, index) => (
        <div key={index} className="mb-2 rounded-md border bg-gray-50 p-4">
          <p>Team: {ban.teamTag}</p>
          <p>Banned Champion: {ban.championName}</p>
          <p>Pick Turn: {ban.pickTurn}</p>
        </div>
      ))}
    </div>
  );
}
