// js/api.js
export async function cargarDatos() {
  try {
    const res = await fetch("./data/viajes.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar viajes.json");
    return await res.json();
  } catch (e) {
    // Fallback mínimo para no romper la app sin red
    return {
      origenes: ["Rosario","Mendoza","Neuquén","Tucumán"],
      destinos: ["Buenos Aires","Córdoba","Bariloche","Salta"],
      preciosOrigen: { Rosario:25000, Mendoza:40000, Neuquén:35000, Tucumán:30000 },
      preciosBase:   { "Buenos Aires":50000, "Córdoba":60000, "Bariloche":90000, "Salta":75000 },
      precioHotelPorDia: 15000
    };
  }
}
