// js/app.js
import { cargarDatos } from "./api.js";
import {
  guardarCarrito, cargarCarrito, limpiarCarrito
} from "./storage.js";
import {
  getDOM,
  cargarOpciones,
  setMsg,
  clearInvalid,
  markInvalid,
  mostrarCarrito,
  setLoading,
  setSubmitEnabled,
  // Drawer helpers
  abrirDrawer, cerrarDrawer, toggleDrawer
} from "./ui.js";

/* ===========================
   Helper de cálculo reutilizable
   =========================== */
function calcularTotales(DATA, { origen, destino, dias, pasajeros, hotel }) {
  const precioOrigen   = DATA?.preciosOrigen?.[origen] ?? 0;
  const precioDestino  = DATA?.preciosBase?.[destino] ?? 0;
  const precioHotelDia = hotel ? (DATA?.precioHotelPorDia ?? 0) : 0;

  const costoVueloUnit      = precioOrigen + precioDestino;   // por persona
  const costoHotelUnitTotal = precioHotelDia * dias;          // por persona (todo el viaje)
  const totalPorPersona     = costoVueloUnit + costoHotelUnitTotal;
  const total               = totalPorPersona * pasajeros;

  return {
    total,
    totalPorPersona,
    costoOrigen:  precioOrigen * pasajeros,
    costoDestino: precioDestino * pasajeros,
    costoHotel:   costoHotelUnitTotal * pasajeros
  };
}

let DATA = null;

// ========= DOM refs =========
const {
  formulario,
  selectOrigen,
  selectDestino,
  inputHotel,

  // Drawer / carrito
  btnCart,
  drawerOverlay,
  drawerClose,
  carritoList,
  btnVaciarCarrito,
  btnComprarCarrito
} = getDOM();

// Deshabilitar "Calcular" hasta que haya datos + selección válida
setSubmitEnabled(false);

// ========= Estado =========
let carrito = cargarCarrito() || [];
mostrarCarrito(carrito);
// aseguro estado del CTA de compra del drawer
if (btnComprarCarrito) btnComprarCarrito.disabled = carrito.length === 0;

// ========= Carga inicial =========
document.addEventListener("DOMContentLoaded", async () => {
  try {
    setLoading(true);

    DATA = await cargarDatos();
    cargarOpciones(selectOrigen, DATA.origenes, DATA.preciosOrigen, "Elegí un origen");
    cargarOpciones(selectDestino, DATA.destinos, DATA.preciosBase, "Elegí un destino");

    // Prefill con la última simulación del carrito (si existe)
    const last = carrito[carrito.length - 1];
    if (last) {
      selectOrigen && (selectOrigen.value = last.origen);
      selectDestino && (selectDestino.value = last.destino);
      const $salida  = document.querySelector("#fechaSalida");
      const $regreso = document.querySelector("#fechaRegreso");
      const $pax     = document.querySelector("#pasajeros");
      if ($salida)  $salida.value  = last.fechaSalida;
      if ($regreso) $regreso.value = last.fechaRegreso;
      if ($pax)     $pax.value     = last.pasajeros ?? 1;
    }

    evaluarDisponibilidadSubmit();
  } catch (err) {
    // sin console.log en la entrega final
    setMsg("error", "No se pudieron cargar los datos de viajes.");
  } finally {
    setLoading(false);
  }
});

// ========= Validación con Luxon y cálculo de días =========
function validarFormulario() {
  clearInvalid();

  const origen  = selectOrigen?.value || "";
  const destino = selectDestino?.value || "";

  const $salida  = document.querySelector("#fechaSalida");
  const $regreso = document.querySelector("#fechaRegreso");
  const salidaStr  = $salida?.value || "";
  const regresoStr = $regreso?.value || "";

  const $pasajeros = document.querySelector("#pasajeros");
  const pasajeros = Number($pasajeros?.value ?? 1) || 1;

  const errors = {};

  if (!origen)  errors.origen  = "Seleccioná un origen.";
  if (!destino) errors.destino = "Seleccioná un destino.";
  if (origen && destino && origen === destino) {
    errors.destino = "El origen y el destino no pueden ser iguales.";
  }

  const { DateTime } = luxon;
  const hoy = DateTime.now().startOf("day");
  const salida  = salidaStr  ? DateTime.fromISO(salidaStr)  : null;
  const regreso = regresoStr ? DateTime.fromISO(regresoStr) : null;

  if (!salida || !salida.isValid || salida < hoy) {
    errors.fechaSalida = "La salida debe ser válida y no puede ser pasada.";
  }
  if (!regreso || !regreso.isValid) {
    errors.fechaRegreso = "Ingresá una fecha de regreso válida.";
  }
  if (!errors.fechaSalida && !errors.fechaRegreso && regreso <= salida) {
    errors.fechaRegreso = "La fecha de regreso debe ser posterior a la de salida.";
  }

  if (!Number.isFinite(pasajeros) || pasajeros < 1) {
    errors.pasajeros = "Indicá cuántos pasajeros (mínimo 1).";
  }

  if (Object.keys(errors).length) {
    const campo = Object.keys(errors)[0];
    setMsg("error", errors[campo]);
    if (campo === "origen") markInvalid(selectOrigen);
    if (campo === "destino") markInvalid(selectDestino);
    if (campo === "fechaSalida")  markInvalid($salida);
    if (campo === "fechaRegreso") markInvalid($regreso);
    if (campo === "pasajeros")    markInvalid($pasajeros);
    return { ok: false };
  }

  const dias = Math.max(1, Math.round(regreso.diff(salida, "days").days));

  return {
    ok: true,
    values: { origen, destino, fechaSalida: salidaStr, fechaRegreso: regresoStr, dias, pasajeros }
  };
}

// ========= Habilitar/Deshabilitar botón =========
function evaluarDisponibilidadSubmit() {
  if (!DATA) return setSubmitEnabled(false);

  const origen = selectOrigen?.value || "";
  const destino = selectDestino?.value || "";
  const salidaStr  = document.querySelector("#fechaSalida")?.value || "";
  const regresoStr = document.querySelector("#fechaRegreso")?.value || "";
  const pax = Number(document.querySelector("#pasajeros")?.value ?? 1);

  const okOrigenDestino = origen && destino && origen !== destino;
  let okFechas = false;
  if (salidaStr && regresoStr) {
    const { DateTime } = luxon;
    const s = DateTime.fromISO(salidaStr);
    const r = DateTime.fromISO(regresoStr);
    okFechas = s.isValid && r.isValid && r > s;
  }

  // exige pax >= 1 también
  setSubmitEnabled(okOrigenDestino && okFechas && pax >= 1);
}

["#origen","#destino","#fechaSalida","#fechaRegreso","#pasajeros","#hotel"].forEach(sel => {
  document.querySelector(sel)?.addEventListener("input", evaluarDisponibilidadSubmit);
  document.querySelector(sel)?.addEventListener("change", evaluarDisponibilidadSubmit);
});

// ========= Submit =========
formulario?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = document.querySelector("#btnCalcular");
  if (btn) btn.disabled = true;

  const { ok, values } = validarFormulario();
  if (!ok) { if (btn) btn.disabled = false; return; }

  const hotel = !!inputHotel?.checked;

  // Totales a través del helper
  const costos = calcularTotales(DATA, { ...values, hotel });
  const total = costos.total;
  const totalPorPersona = costos.totalPorPersona;

  // Fechas formateadas
  const salidaStr  = luxon.DateTime.fromISO(values.fechaSalida).toFormat("dd/MM/yyyy");
  const regresoStr = luxon.DateTime.fromISO(values.fechaRegreso).toFormat("dd/MM/yyyy");

  // Viaje con totales
  const viaje = {
    ...values,
    hotel,
    salidaStr,
    regresoStr,
    total,
    totalPorPersona,
    costos
  };

  // 👉 Directo al carrito
  carrito.push(viaje);
  guardarCarrito(carrito);
  mostrarCarrito(carrito);
  if (btnComprarCarrito) btnComprarCarrito.disabled = carrito.length === 0;
  setMsg("ok", "🧺 Agregado al carrito.");
  abrirDrawer();

  await Swal.fire({
    icon: "success",
    title: "Simulación agregada",
    html: `
      <div style="text-align:left">
        <p><strong>Origen:</strong> ${viaje.origen}</p>
        <p><strong>Destino:</strong> ${viaje.destino}</p>
        <p><strong>Salida:</strong> ${viaje.salidaStr}</p>
        <p><strong>Regreso:</strong> ${viaje.regresoStr}</p>
        <p><strong>Días:</strong> ${viaje.dias}</p>
        <p><strong>Pasajeros:</strong> ${viaje.pasajeros}</p>
        <p><strong>Hotel:</strong> ${viaje.hotel ? "Sí" : "No"}</p>
        <hr/>
        <p><strong>Total por persona:</strong> $${viaje.totalPorPersona.toLocaleString()}</p>
        <p><strong>Total:</strong> $${viaje.total.toLocaleString()}</p>
      </div>
    `,
    confirmButtonText: "Ver carrito"
  });

  if (btn) btn.disabled = false;
});

// ===== Util para abrir Google Flights =====
function abrirGoogleFlights(viaje) {
  if (!viaje) return;
  const ORI = viaje.origen;
  const DES = viaje.destino;
  const sal = viaje.fechaSalida;   // "YYYY-MM-DD"
  const reg = viaje.fechaRegreso;  // "YYYY-MM-DD"
  const hash = `#flt=${encodeURIComponent(ORI)}.${encodeURIComponent(DES)}.${sal}*${encodeURIComponent(DES)}.${encodeURIComponent(ORI)}.${reg};c:ARS;e:1;sd:1;t:f`;
  const url  = `https://www.google.com/travel/flights?hl=es-419&curr=ARS${hash}`;
  window.open(url, "_blank", "noopener");
}

// ===== Acciones del carrito (en drawer) =====
carritoList?.addEventListener("carrito:eliminar", (ev) => {
  const idx = ev.detail?.index;
  if (idx == null) return;
  Swal.fire({
    icon: "warning",
    title: "Eliminar del carrito",
    text: "¿Seguro que querés eliminar este ítem?",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then((r) => {
    if (!r.isConfirmed) return;
    carrito.splice(idx, 1);
    guardarCarrito(carrito);
    mostrarCarrito(carrito);
    if (btnComprarCarrito) btnComprarCarrito.disabled = carrito.length === 0;
    setMsg("info", "Ítem eliminado del carrito.");
  });
});

btnVaciarCarrito?.addEventListener("click", () => {
  if (!carrito.length) return;
  Swal.fire({
    icon: "warning",
    title: "Vaciar carrito",
    text: "¿Seguro que querés vaciar el carrito?",
    showCancelButton: true,
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar"
  }).then((r) => {
    if (!r.isConfirmed) return;
    limpiarCarrito();
    carrito = [];
    mostrarCarrito(carrito);
    if (btnComprarCarrito) btnComprarCarrito.disabled = carrito.length === 0;
    setMsg("info", "🧹 Carrito vacío.");
  });
});

btnComprarCarrito?.addEventListener("click", () => {
  if (!carrito.length) {
    setMsg("info", "Tu carrito está vacío.");
    return;
  }
  carrito.forEach((v) => abrirGoogleFlights(v));
  Swal.fire({ icon: "info", title: "Abriendo búsquedas", text: "Se abrieron las rutas en Google Flights." });
});

// ===== Drawer: abrir/cerrar desde UI =====
btnCart?.addEventListener("click", toggleDrawer);
drawerOverlay?.addEventListener("click", cerrarDrawer);
drawerClose?.addEventListener("click", cerrarDrawer);
document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") cerrarDrawer(); });
document.getElementById("btnAbrirCarritoHome")?.addEventListener("click", abrirDrawer);

// ========= Botón "Limpiar formulario" =========
document.querySelector("#btnReset")?.addEventListener("click", () => {
  const $salida  = document.querySelector("#fechaSalida");
  const $regreso = document.querySelector("#fechaRegreso");
  const $pax     = document.querySelector("#pasajeros");

  if (selectOrigen)  selectOrigen.value = "";
  if (selectDestino) selectDestino.value = "";
  if ($salida)  $salida.value = "";
  if ($regreso) $regreso.value = "";
  if ($pax)     $pax.value = 1;

  setMsg("info", "Formulario limpio.");
  setSubmitEnabled(false);
});

// ========= UX fechas mínimas =========
(() => {
  const $salida  = document.querySelector("#fechaSalida");
  const $regreso = document.querySelector("#fechaRegreso");
  if (!$salida || !$regreso) return;
  const hoyStr = luxon.DateTime.now().toFormat("yyyy-LL-dd");
  $salida.min = hoyStr;
  $regreso.min = hoyStr;
  $salida.addEventListener("change", () => {
    if ($salida.value) {
      $regreso.min = $salida.value;
      if ($regreso.value && $regreso.value <= $salida.value) $regreso.value = "";
    }
  });
})();

// ===== Typewriter (modo ticker-friendly) =====
(function initTypewriter(){
  const el = document.getElementById("typeText");
  if (!el) return;

  // Si quieres volver al efecto de “escribir/borrar”, pon esto en false.
  const USE_TICKER = true;

  const mensajes = [
    "Crea un itinerario de 7 días por buenos aires y el mundo ✨",
    "Encontrá vuelos baratos a Bariloche en octubre 🏔️",
    "Simulá 5 días con hotel incluido 🏖️",
    "seguro que no sabes que regalar el 14 de febrero ? Prepara una escapada romántica a Mendoza 🍷",
    "Tus vacaciones a lo desconocido ? dicen que en cordoba hay seres de otro planeta 👽"
  ];

  if (USE_TICKER) {
    // ✅ Modo ticker: mostrar texto completo y rotarlo cada N segundos
    let i = 0;
    const ROTACION_MS = 8000; // cambia la frase cada 8s (ajústalo a gusto)

    function setFrase() {
      el.textContent = mensajes[i];
      i = (i + 1) % mensajes.length;
      // Si pegaste el script del ticker que ajusta duración,
      // no hace falta hacer nada más: el MutationObserver ya sincroniza.
    }

    setFrase();
    setInterval(setFrase, ROTACION_MS);
    return;
  }

  // ✍️ Modo original (escribir/borrar) — solo si USE_TICKER = false
  let i = 0;      // índice del mensaje
  let j = 0;      // índice del carácter
  let borrando = false;
  const pausaEntreMensajes = 1200;
  const velEscribir = 28;
  const velBorrar = 18;

  function tick(){
    const msg = mensajes[i];

    if (!borrando) {
      el.textContent = msg.slice(0, j++);
      if (j <= msg.length) {
        setTimeout(tick, velEscribir);
      } else {
        borrando = true;
        setTimeout(tick, pausaEntreMensajes);
      }
    } else {
      el.textContent = msg.slice(0, j--);
      if (j >= 0) {
        setTimeout(tick, velBorrar);
      } else {
        borrando = false;
        i = (i + 1) % mensajes.length;
        setTimeout(tick, 180);
      }
    }
  }
  tick();

  document.getElementById("typeNext")?.addEventListener("click", () => {
    borrando = false; j = 0; i = (i + 1) % mensajes.length;
  });
})();
