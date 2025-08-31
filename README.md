# ProyectoFinal-Rodriguez — Simulador de Viajes ✈️

**Demo:** https://josegrt1.github.io/Proyectofinal-rodriguez  
**Repositorio:** https://github.com/josegrt1/Proyectofinal-rodriguez

Simulador interactivo de viajes (tipo ecommerce) que permite cotizar vuelos y hospedaje, agregar simulaciones al carrito, persistirlas y visualizar totales. Implementado con **HTML + CSS + JavaScript (ES Modules)**, usando **Luxon** (fechas) y **SweetAlert2** (modales), y datos remotos simulados con **JSON**.

---

## 🚀 Características

- Formulario de cotización con **origen, destino, fechas, pasajeros y hotel**.  
- **Cálculo de totales** según reglas de negocio (precios por origen/destino + hotel por día + pasajeros).  
- **Carrito (drawer)** con overlay, listado de simulaciones, eliminación de ítems y totales acumulados.  
- **Persistencia** con `localStorage`.  
- **Datos remotos simulados**: `viajes.json` (con *fallback* sin red).  
- **Fechas** con **Luxon** (validaciones y fecha de regreso).  
- **Modales** con **SweetAlert2** (sin `alert/prompt/confirm`).  
- **HTML semántico**, **accesibilidad** básica y **responsive**.

---

## 🧩 Tecnologías

- HTML5 semántico · CSS3 (responsive)  
- JavaScript **ES Modules**: `app.js`, `ui.js`, `api.js`, `storage.js`  
- **Luxon**, **SweetAlert2**, **localStorage**, **JSON**

---

## 📂 Estructura

```text
proyecto/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  ├─ app.js        # lógica principal + eventos + cálculo
│  ├─ ui.js         # render de DOM, drawer, estados de UI
│  ├─ api.js        # fetch de viajes.json + fallback sin red
│  └─ storage.js    # guardar/cargar/limpiar carrito (localStorage)
├─ data/
│  └─ viajes.json   # datos simulados (orígenes, destinos, precios)
└─ img/             # imágenes (hero, logos, etc.)


🗃️ Datos (JSON) — esquema

data/viajes.json (ejemplo general):

{
  "preciosOrigen": {
    "BUE": 150,
    "BOG": 120
  },
  "preciosBase": {
    "MIA": 650,
    "MAD": 800,
    "BOG": 350
  },
  "precioHotelPorDia": 45,
  "origenes": ["BUE", "BOG"],
  "destinos": ["MIA", "MAD", "BOG"]
}


preciosOrigen[origen] + preciosBase[destino] ⇒ costo vuelo unitario (por pasajero).

precioHotelPorDia * días ⇒ costo hotel unitario total (por pasajero).

Total del viaje = (vuelo unitario + hotel unitario) × pasajeros.

🧠 Lógica de negocio (resumen)

Función pura (parámetros + retorno) — ubicada en app.js:

function calcularTotales(DATA, { origen, destino, dias, pasajeros, hotel }) {
  const precioOrigen   = DATA?.preciosOrigen?.[origen] ?? 0;
  const precioDestino  = DATA?.preciosBase?.[destino] ?? 0;
  const precioHotelDia = hotel ? (DATA?.precioHotelPorDia ?? 0) : 0;

  const costoVueloUnit      = precioOrigen + precioDestino;   // por persona
  const costoHotelUnitTotal = precioHotelDia * dias;          // por persona
  const costoPorPersona     = costoVueloUnit + costoHotelUnitTotal;
  const total               = costoPorPersona * pasajeros;

  return { costoVueloUnit, costoHotelUnitTotal, costoPorPersona, total };
}

🧪 Uso

Abrir index.html (ideal con extensión Live Server de VS Code).

Completar el formulario (hay precarga de campos amistosa).

Presionar “Calcular viaje” → se muestran resultados y se puede agregar al carrito.

Abrir el carrito (icono en navbar) para ver, eliminar ítems y ver totales.

Los datos quedan guardados en localStorage, por lo que al recargar se conserva el carrito.

⚙️ Scripts útiles (opcional)

Desactivar logs en producción (snippet al inicio de app.js):

['log','warn','error','info','debug'].forEach(m => console[m] = () => {});


Formato de moneda recomendado:

const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
// fmt.format(total)

♿ Accesibilidad

Estructura semántica (header, nav, main, section, footer).

Mensajes con aria-live.

Drawer accesible (gestión de foco al abrir/cerrar recomendada).

Contrastes y estados de error visibles (.is-invalid).

✅ Checklist de la consigna

 Simulador interactivo 100% funcional.

 Datos remotos/JSON (con fallback).

 HTML interactivo generado desde JS.

 Uso de librerías externas (Luxon, SweetAlert2).

 Persistencia con localStorage.

 Flujo tipo ecommerce simulado (entrada → proceso → salida).

 Legibilidad: nombres claros, comentarios y módulos.

 Responsive y diseño moderno.

 Sin alert/prompt/confirm ni console.log en versión final.


📦 Deploy (GitHub Pages)

Settings → Pages

Build and deployment: “Deploy from a branch”

Branch: main – / (root)

Guardar. La URL queda como https://<usuario>.github.io/<repo>/.

📜 Licencia

MIT © 2025 José Rodríguez

