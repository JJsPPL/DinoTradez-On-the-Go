import React, { useEffect, useState } from "react";

interface TideEvent {
  time: string;
  type: string;
  height: string;
}

const NOAA_STATION_ID = "9439040"; // Astoria, OR (Lower Columbia River)
const NOAA_API_URL = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${NOAA_STATION_ID}&product=predictions&datum=MLLW&units=english&time_zone=lst_ldt&format=json&interval=hilo&date=today`;

export const DetailsTides: React.FC = () => {
  const [tides, setTides] = useState<TideEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(NOAA_API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.predictions) {
          setTides(data.predictions);
        } else {
          setError("No tide data available.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch tide data.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h3 className="font-semibold text-blue-800 mb-1">Tides (Astoria, OR)</h3>
      {loading && <div className="text-sm text-gray-500">Loading tides...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <ul className="text-gray-700 text-sm list-disc list-inside">
          {tides.map((tide, idx) => (
            <li key={idx}>
              <span className="capitalize">{tide.type}</span>: <span className="font-mono">{tide.time}</span> (<span className="font-mono">{tide.height} ft</span>)
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 text-xs text-blue-600">
        <a href="https://tidesandcurrents.noaa.gov/stationhome.html?id=9439040" target="_blank" rel="noopener noreferrer">
          NOAA Tides for Astoria, OR
        </a>
      </div>
    </div>
  );
}; 