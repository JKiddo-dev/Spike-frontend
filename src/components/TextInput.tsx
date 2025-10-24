"use client";

import { useState } from "react";

type Props = {
  onLocationsReady: (coords: [[number, number], [number, number]]) => void;
};

export default function LocationInputs({ onLocationsReady }: Props) {
  const [placeA, setPlaceA] = useState("");
  const [placeB, setPlaceB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCoords(place: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${baseUrl}/route/geocode?place=${encodeURIComponent(place)}`);
    if (!res.ok) throw new Error(`Error al buscar "${place}"`);
    const data = await res.json();
    return [data.lng, data.lat] as [number, number]; 
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const [start, end] = await Promise.all([fetchCoords(placeA), fetchCoords(placeB)]);
      onLocationsReady([start, end]);
    } catch (err) {
      console.error(err);
      setError("No se pudieron obtener las coordenadas. Revisa los nombres.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 mb-4">
      <input
        type="text"
        value={placeA}
        onChange={(e) => setPlaceA(e.target.value)}
        placeholder="Origen (ej: Valencia)"
        className="border rounded px-3 py-2 w-64"
        required
      />
      <input
        type="text"
        value={placeB}
        onChange={(e) => setPlaceB(e.target.value)}
        placeholder="Destino (ej: Alicante)"
        className="border rounded px-3 py-2 w-64"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Buscando..." : "Buscar ruta"}
      </button>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </form>
  );
}
