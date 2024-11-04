// src/app/components/SeriesDataForm.tsx
"use client"; // Indicate that this component will use client-side rendering
import { useState } from "react";

const SeriesDataForm = () => {
  const [seriesId, setSeriesId] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/getSeriesData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seriesId }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponseMessage(data.message);
      } else {
        setResponseMessage(data.error || "An error occurred.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setResponseMessage("Internal server error.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="seriesId">Enter Series ID:</label>
        <input
          type="text"
          id="seriesId"
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
          required
        />
        <button type="submit">Fetch Data</button>
      </form>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
};

export default SeriesDataForm;
