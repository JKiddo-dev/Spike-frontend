export async function getRoute(start: [number, number], end: [number, number]) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseUrl}/route?start=${start.join(',')}&end=${end.join(',')}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error al obtener la ruta: ${res.statusText}`);
  }

  return res.json();
}
