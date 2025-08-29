# Vuelos y Más – Simulador de viajes

Simulador interactivo que estima el costo de un viaje según **origen, destino, fechas, pasajeros y hotel**. Permite guardar simulaciones en un **carrito** (drawer lateral) y abrir búsquedas reales en **Google Flights**.

> **Demo:** https://josegrt1.github.io/Proyectofinal-rodriguez/  
> **Repo:** https://github.com/josegrt1/Proyectofinal-rodriguez

---

## ✨ Funcionalidades
- Formulario con validaciones (fechas, origen ≠ destino, pasajeros ≥ 1).
- Cálculo detallado: **por persona** y **total** (hotel opcional).
- **Carrito** lateral: agregar, eliminar, vaciar, total acumulado y badge.
- Persistencia con **localStorage**.
- Apertura de rutas reales en **Google Flights**.
- Mensajería y modales con **SweetAlert2**.
- Manejo de fechas con **Luxon**.
- Datos remotos desde `data/viajes.json` (carga asíncrona con `fetch` + **fallback**).

---

## 🧩 Tecnologías
- HTML5, CSS3, **JavaScript (ES Modules)**
- **Luxon** (fechas), **SweetAlert2** (modales)
- Tipografía **Inter** (Google Fonts)

---

## 📂 Estructura del proyecto

/css/style.css
/data/viajes.json
/img/...
/js/app.js
/js/ui.js
/js/api.js
/js/storage.js
index.html
README.md


---
🔧 Detalles técnicos

Helper de cálculo: calcularTotales (en app.js) para reutilizar la lógica de costos.

UI dinámica del carrito: render y delegación de eventos en ui.js; botones de Vaciar/Buscar se deshabilitan si no hay ítems.

Datos remotos: api.js carga data/viajes.json con fetch y posee fallback si falla la red.

♿ Accesibilidad

aria-live en los mensajes del simulador.

Drawer del carrito con role="dialog" y cierre con Esc.

Estados disabled en botones según contexto.

✅ Checklist

 Validaciones funcionando

 Librerías externas (Luxon, SweetAlert2)

 Datos remotos (JSON) + fetch asíncrono

 Flujo completo simulado (carrito + abrir Google Flights)

 Código modular y legible


 
