// LOCALSTORAGE HELPERS
const KEY = "viajes";           // historial (tal como lo tenías)
const KEY_CARRITO = "carrito";  // NUEVO: carrito

export function guardarHistorial(historial) {
  localStorage.setItem(KEY, JSON.stringify(historial));
}
export function cargarHistorial() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
export function limpiarHistorial() {
  localStorage.removeItem(KEY);
}

// ===== NUEVO: helpers de carrito =====
export function guardarCarrito(carrito) {
  localStorage.setItem(KEY_CARRITO, JSON.stringify(carrito));
}
export function cargarCarrito() {
  try {
    const raw = localStorage.getItem(KEY_CARRITO);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
export function limpiarCarrito() {
  localStorage.removeItem(KEY_CARRITO);
}
