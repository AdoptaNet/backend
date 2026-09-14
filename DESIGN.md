# DESIGN.md — Adoptanet (Backend: Sistema de Correos Transaccionales)

Especificación de diseño adaptada para las plantillas de correo electrónico transaccionales de Adoptanet, renderizadas mediante **React Email** (`@react-email/components`) y enviadas a través de **Resend**.

**Fuente de verdad visual:** `frontend/DESIGN.md` (Figma del equipo "Tesis", archivo *Adoptanet — Sistema de diseño y mockups*).

> [!NOTE]
> Este archivo no reemplaza el diseño original, sino que adapta las reglas y tokens del diseño web a las restricciones técnicas de los clientes de correo electrónico (Gmail, Outlook, Apple Mail, Yahoo).

---

## 1. Restricciones Técnicas en Correos Electrónicos

A diferencia del frontend web (Next.js), los clientes de correo:
1. **No ejecutan JavaScript:** No se pueden utilizar componentes basados en interactividad ni bibliotecas como shadcn/ui o Radix UI.
2. **Soporte CSS limitado:** Outlook (Windows) usa el motor de renderizado de Microsoft Word (no soporta Flexbox, CSS Grid, variables CSS `--nombre` ni la etiqueta `<button>` nativa).
3. **Estilos en línea (Inline Styles):** Todos los estilos deben ser aplicados directamente en las etiquetas o procesados por React Email a tablas HTML (`<table>`, `<tr>`, `<td>`).

---

## 2. Tokens de Color (Idénticos al Frontend)

| Token | Hex | Uso en Emails |
|---|---|---|
| `verde-900` | `#0E2C25` | Texto sobre botones ámbar, acentos muy oscuros |
| `verde-700` | `#1D5147` | **Primario de marca.** Cabecera, botones institucionales |
| `verde-500` | `#2E7D6E` | Enlaces y acentos activos |
| `verde-50`  | `#EDF5F2` | Fondo de badges de éxito/aprobado |
| `ambar-500` | `#F0A202` | **Acento.** Botón de acción principal del adoptante |
| `ambar-100` | `#FCEBC9` | Fondo de razones y notas destacadas |
| `azul-600`  | `#2C6E9B` | Estado: solicitud enviada / en revisión |
| `azul-100`  | `#DCEAF3` | Fondo de estado en revisión |
| `coral-600` | `#B94328` | Estado: solicitud rechazada / alertas |
| `coral-100` | `#F8DED8` | Fondo de alertas o errores |
| `tinta-900` | `#14201C` | Texto principal de lectura |
| `tinta-600` | `#4B5A55` | Texto secundario y descriptivo |
| `tinta-400` | `#8A9793` | Texto tenue (pie de página, avisos legales) |
| `superficie`| `#FFFFFF` | Fondo de la tarjeta contenedora del correo |
| `fondo`     | `#F5F3EE` | Fondo general del correo (área exterior) |
| `linea`     | `#DEE4E1` | Borde de la tarjeta y líneas divisoras (`<Hr>`) |

---

## 3. Tipografía y Jerarquía

En correos se utiliza una pila de fuentes seguras para web con soporte tipográfico limpio:

`font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;`

| Estilo | Peso | Tamaño / Interlineado | Color | Uso |
|---|---|---|---|---|
| **Logo / Marca** | 800 | 22px / 28px | `verde-700` (`#1D5147`) | Cabecera del correo |
| **Título del correo** | 700 | 22px / 28px | `tinta-900` (`#14201C`) | Encabezado principal del mensaje |
| **Subtítulo** | 600 | 16px / 22px | `verde-700` o `tinta-900` | Encabezados de sección interna |
| **Cuerpo de texto** | 400 | 15px / 24px | `tinta-600` (`#4B5A55`) | Párrafos e instrucciones |
| **Cuerpo destacado** | 600 | 15px / 24px | `tinta-900` (`#14201C`) | Nombres de mascotas, adoptantes, fechas |
| **Botón (CTA)** | 600 | 15px / 20px | Según variante | Botón de acción |
| **Pie de página** | 400 | 12px / 18px | `tinta-400` (`#8A9793`) | Términos, desuscripción y aclaraciones |

---

## 4. Componentes Base para Emails

### 4.1 Envoltorio Base (`BaseEmailLayout`)
Estructura unificada para todos los correos del sistema:
* **Ancho máximo:** `580px`.
* **Fondo exterior:** `#F5F3EE` (`fondo`).
* **Tarjeta central:** `#FFFFFF` (`superficie`), borde de 1px `#DEE4E1` (`linea`), radio de `12px` (`xl`), padding interno de `32px` (escritorio) y `20px` (móvil).
* **Cabecera:** Logotipo / marca textual "🐾 AdoptaNet" alineada al centro o izquierda.
* **Pie institucional:** Mensaje explicativo ("Adoptanet — Plataforma para la optimización del proceso de adopción de animales rescatados en el Perú"), año actual y enlaces informativos.

### 4.2 Botón (`EmailButton`)
Renderizado con `<Button>` de `@react-email/components`:
* **Variante Primaria (Adoptante):** Fondo `ambar-500` (`#F0A202`), texto `verde-900` (`#0E2C25`), radio de `8px`.
* **Variante Secundaria (Institucional / Rescatista):** Fondo `verde-700` (`#1D5147`), texto blanco (`#FFFFFF`), radio de `8px`.
* Altura cómoda para toque en pantallas táctiles (`min-height: 44px`, padding `12px 24px`).

### 4.3 Chips / Badges de Estado (`EmailBadge`)
Pastillas de estado con borde redondeado `9999px`:
* **En revisión:** Fondo `azul-100` (`#DCEAF3`), texto `azul-600` (`#2C6E9B`).
* **Aprobada:** Fondo `verde-50` (`#EDF5F2`), texto `verde-700` (`#1D5147`).
* **Rechazada:** Fondo `coral-100` (`#F8DED8`), texto `coral-600` (`#B94328`).

---

## 5. Ubicación en Código

* **Tokens de diseño:** `src/modules/notifications/presentation/templates/theme/email-theme.ts`
* **Layout envoltorio:** `src/modules/notifications/presentation/templates/components/base-email-layout.tsx`
* **Componentes base:** `src/modules/notifications/presentation/templates/components/`
* **Plantillas:** `src/modules/notifications/presentation/templates/`
