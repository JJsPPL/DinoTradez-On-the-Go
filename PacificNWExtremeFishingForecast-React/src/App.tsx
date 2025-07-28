import React from "react";
import { DetailsTides } from "./components/DetailsTides";

function DetailsSection() {
  return (
    <section className="mb-8">
      <div className="bg-white/90 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-2">Details</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Tides */}
          <DetailsTides />
          {/* Moon */}
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Moon Lineup</h3>
            <ul className="text-gray-700 text-sm list-disc list-inside">
              <li>Moon Overhead: <span className="font-mono">--:--</span></li>
              <li>Moon Rising: <span className="font-mono">--:--</span></li>
              <li>Moon Falling: <span className="font-mono">--:--</span></li>
            </ul>
            <div className="mt-2 text-xs text-blue-600"><a href="https://www.timeanddate.com/moon/" target="_blank" rel="noopener noreferrer">Moon Phases</a></div>
          </div>
          {/* Salmon Runs */}
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Salmon Runs</h3>
            <ul className="text-gray-700 text-sm list-disc list-inside">
              <li>Current Run: <span className="font-mono">--</span></li>
              <li>Next Peak: <span className="font-mono">--</span></li>
            </ul>
            <div className="mt-2 text-xs text-blue-600"><a href="https://wdfw.wa.gov/fishing/" target="_blank" rel="noopener noreferrer">WDFW Salmon Info</a></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ForecastSection() {
  return (
    <section className="mb-8">
      <div className="bg-white/90 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-2">Fishing Forecast</h2>
        <p className="text-gray-700 mb-4">View daily and calendar-based fishing forecasts for the Pacific Northwest. (Forecast calendar and details coming soon!)</p>
        {/* Forecast calendar/tabs will be implemented here */}
      </div>
    </section>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 text-gray-900">
      <header className="py-6 shadow bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight">Pacific NW Extreme Fishing Forecast</h1>
          <p className="text-lg text-blue-700 mt-1">Daily forecasts for fishing conditions in Washington and Oregon</p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <DetailsSection />
        <ForecastSection />
        <div className="bg-white/80 rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
          <p className="mb-2">This site provides up-to-date fishing forecasts, tide and moon data, salmon run info, and expert tips for the Pacific Northwest.</p>
          <p className="text-blue-600">Stay tuned as we upgrade the experience!</p>
        </div>
      </main>
      <footer className="py-4 text-center text-gray-600 bg-white/80 mt-8">
        &copy; {new Date().getFullYear()} Pacific NW Extreme Fishing Forecast
      </footer>
    </div>
  );
}

export default App;
