// js/ui.js

// Helper
const $ = (sel) => document.querySelector(sel);

// ===========================
// Refs de DOM centralizadas
// ===========================
export function getDOM() {
  return {
    // Formulario
    formulario: $("#formularioViaje"),
    selectOrigen: $("#origen"),
    selectDestino: $("#destino"),
    inputHotel: $("#hotel"),

    // Drawer / carrito
    btnCart: $("#btnCart"),
    drawerOverlay: $("#drawerOverlay"),
    drawerClose: $("#drawerClose"),

    carritoList: $("#carritoList"),
    carritoTotal: $("#carritoTotal"),
    btnVaciarCarrito: $("#btnVaciarCarrito"),
    btnComprarCarrito: $("#btnComprarCarrito"),
  };
}

// ===========================
// Selects de origen/destino
// ===========================
export function cargarOpciones(select, opciones = [], precios = {}, placeholder = "Seleccioná") {
  if (!select) return;
  select.innerHTML = "";

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = placeholder;
  select.appendChild(opt0);

  (opciones || []).forEach((op) => {
    const opt = document.createElement("option");
    opt.value = op;
    const precio = precios?.[op] ?? 0;
    opt.textContent = precio ? `${op} ($${precio.toLocaleString()})` : op;
    select.appendChild(opt);
  });
}

// ===========================
// Mensajes accesibles
// ===========================
export function setMsg(tipo = "info", texto = "") {
  const cont = $("#mensajes");
  if (!cont) {
    console[tipo === "error" ? "error" : "log"](texto);
    return;
  }
  cont.setAttribute("aria-live", tipo === "error" ? "assertive" : "polite");
  cont.setAttribute("role", tipo === "error" ? "alert" : "status");
  cont.textContent = texto;
  cont.classList.remove("ok", "info", "error");
  if (texto) cont.classList.add(tipo);
}

// ===========================
// Validación visual
// ===========================
export function clearInvalid() {
  document.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
}
export function markInvalid(el) {
  if (el && el.classList) el.classList.add("is-invalid");
}

// ===========================
// Loader + submit enabled
// ===========================
export function setLoading(isLoading) {
  $("#loader")?.classList.toggle("hidden", !isLoading);
}

export function setSubmitEnabled(enabled) {
  const btn = $("#btnCalcular");
  if (btn) btn.disabled = !enabled;
}

// ===========================
// Drawer helpers (carrito)
// ===========================
export function abrirDrawer() {
  const drawer = $("#cartDrawer");
  const overlay = $("#drawerOverlay");
  if (!drawer || !overlay) return;
  drawer.classList.remove("hidden");
  drawer.classList.add("open");
  overlay.classList.remove("hidden");
  overlay.classList.add("visible");
}

export function cerrarDrawer() {
  const drawer = $("#cartDrawer");
  const overlay = $("#drawerOverlay");
  if (!drawer || !overlay) return;
  drawer.classList.remove("open");
  overlay.classList.remove("visible");
  setTimeout(() => {
    drawer.classList.add("hidden");
    overlay.classList.add("hidden");
  }, 280);
}

export function toggleDrawer() {
  const drawer = $("#cartDrawer");
  if (!drawer) return;
  drawer.classList.contains("open") ? cerrarDrawer() : abrirDrawer();
}

// ===========================
// Helper de moneda (es-AR)
// ===========================
export const formatMoney = (n) =>
  Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

// ===========================
// UI Carrito (en drawer)
// ===========================
export function mostrarCarrito(carrito = []) {
  const ul = $("#carritoList");
  const totalBox = $("#carritoTotal");
  const badge = $("#cartBadge");
  const btnVaciar = $("#btnVaciarCarrito");
  const btnComprar = $("#btnComprarCarrito");

  if (!ul || !totalBox) return;

  // badge con cantidad
  if (badge) badge.textContent = String(carrito.length);

  // Habilitar / deshabilitar acciones del drawer
  const hayItems = carrito.length > 0;
  if (btnVaciar) {
    btnVaciar.disabled = !hayItems;
    btnVaciar.setAttribute("aria-disabled", String(!hayItems));
  }
  if (btnComprar) {
    btnComprar.disabled = !hayItems;
    btnComprar.setAttribute("aria-disabled", String(!hayItems));
  }

  // Render
  ul.innerHTML = "";
  if (!hayItems) {
    const li = document.createElement("li");
    li.textContent = "Carrito vacío.";
    ul.appendChild(li);
    totalBox.textContent = "";
    ul.onclick = null; // limpia delegación previa
    return;
  }

  let total = 0;
  carrito.forEach((v, i) => {
    const t = (typeof v?.total === "number")
      ? v.total
      : (typeof v?.costos?.total === "number" ? v.costos.total : 0);
    total += Number(t || 0);

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${i + 1}. ${v.origen} ➝ ${v.destino} | ${v.pasajeros ?? 1} pax | ${v.salidaStr} → ${v.regresoStr}</span>
      <div style="display:flex;gap:.4rem;align-items:center;">
        <strong>${formatMoney(t)}</strong>
        <button class="btn-del secondary" data-index="${i}" aria-label="Eliminar del carrito ${i + 1}">Eliminar</button>
      </div>`;
    ul.appendChild(li);
  });

  totalBox.textContent = `Total del carrito: ${formatMoney(total)}`;

  // Delegación para eliminar
  ul.onclick = (ev) => {
    const btn = ev.target.closest(".btn-del");
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    ul.dispatchEvent(new CustomEvent("carrito:eliminar", { detail: { index: idx } }));
  };
}
