import ViewMap from "@/components/ViewMap";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Spike de Rutas</h1>
      <ViewMap />
    </main>
  );
}
