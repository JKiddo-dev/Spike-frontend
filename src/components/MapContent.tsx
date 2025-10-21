import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { getRoute } from "@/lib/api";
import "leaflet/dist/leaflet.css";
import TextInput from "./TextInput";


// --- ICONOS ---
const DefaultIcon = L.icon({
  iconUrl: "/images/marker-icon.png",
  iconRetinaUrl: "/images/marker-icon-2x.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapContent() {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  const position: LatLngExpression = [39.4699, -0.3763]; // Valencia

  function LocationSelector() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        if (points.length >= 2) {
          setPoints([[lat, lng]]);
          setDistance(null);
          setDuration(null);
          setRouteCoords([]);
        } else {
          setPoints([...points, [lat, lng]]);
        }
      },
    });
    return null;
  }

  async function handleCalculate() {
    if (points.length === 2) {
      const start: [number, number] = [points[0][1], points[0][0]]; // [lng, lat]
      const end: [number, number] = [points[1][1], points[1][0]];   // [lng, lat]

      try {
        const data = await getRoute(start, end);

        if (!data || !data.geometry || !Array.isArray(data.geometry)) {
          console.error("Ruta inválida", data);
          return;
        }

        setDistance(data.distance_km);
        setDuration(data.duration_min);

        const coords: [number, number][] = data.geometry.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );
        setRouteCoords(coords);
      } catch (err) {
        console.error("Error al calcular ruta:", err);
      }
    }
  }

  return (
  <div className="w-full flex flex-col items-center space-y-4">
    {/* NUEVO: campos de búsqueda */}
    <TextInput
      onLocationsReady={(coords) => {
        setPoints(coords.map(([lng, lat]) => [lat, lng])); // convertir para Leaflet
        setDistance(null);
        setDuration(null);
        setRouteCoords([]);
      }}
    />

    <MapContainer
      center={position}
      zoom={8}
      scrollWheelZoom={true}
      className="w-full h-[50vh] rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationSelector />

      {points.map((pos, i) => (
        <Marker key={i} position={pos}>
          <Popup>{`Punto ${i + 1}`}</Popup>
        </Marker>
      ))}

      {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" weight={5} />}
    </MapContainer>

    <div className="flex flex-col items-center space-y-2">
      {points.length === 2 && (
        <button
          onClick={handleCalculate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Calcular distancia
        </button>
      )}

      {distance && duration && (
        <div className="text-gray-700">
          <p>Distancia: {distance.toFixed(2)} km</p>
          <p>Duración: {duration.toFixed(1)} min</p>
        </div>
      )}
    </div>
  </div>
);
}
