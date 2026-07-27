# Vascular Clinic — Sitio web

Página web de una sola sección continua (landing page) para **Vascular Clinic**, Panamá.
Todo el sitio está diseñado con un solo objetivo: que el visitante entienda los servicios
y las sedes, y termine **escribiendo por WhatsApp al +507 6986-6587** para agendar su cita.

HTML, CSS y JavaScript puros. **Sin librerías, sin frameworks, sin compilación.**

---

## Ver el sitio

Abre `index.html` con doble clic. También puedes levantarlo en un servidor local:

```bash
python -m http.server 8000
```

Y visitar `http://localhost:8000`.

---

## Estructura

```
├── index.html          Todo el contenido y los textos
├── privacidad.html     Política de Privacidad y de Cookies
├── terminos.html       Términos y Condiciones
├── css/
│   ├── styles.css      Colores, tipografía, layout y componentes
│   └── animations.css  Todas las animaciones
├── js/
│   ├── main.js         WhatsApp, scroll, menú, FAQ, canvas
│   └── cookies.js      Banner de cookies y consentimiento
├── assets/
│   ├── logo.png        Logo recortado, fondo transparente (header y favicon)
│   └── logo-blanco.png Versión en blanco, para el footer oscuro
├── Dockerfile          Usado por EasyPanel para construir la imagen
├── nginx.conf          Compresión, caché y cabeceras de seguridad
└── Logo (1).png        Logo original (no se usa en el sitio, se conserva)
```

> El original tenía mucho espacio en blanco alrededor, lo que hacía que el logo se viera
> diminuto en el header. Los dos archivos de `assets/` son el mismo logo ya recortado, con
> el fondo en transparente.

---

## Cómo editar lo más común

### Cambiar el número de WhatsApp

Está en **un solo lugar**: [`js/main.js`](js/main.js), línea ~28.

```js
var WHATSAPP = '50769866587';   // +507 6986-6587
```

Formato internacional, **sin `+`, sin espacios ni guiones**.

> Los enlaces del HTML también traen el número como respaldo por si el JavaScript falla.
> Si cambias el número, busca y reemplaza `50769866587` en `index.html` también
> (en el editor: `Ctrl + H`).

### Cambiar el mensaje que se escribe solo en WhatsApp

Cada botón lleva su mensaje en el atributo `data-wa` dentro de `index.html`:

```html
<a class="btn btn--primary js-wa"
   data-wa="Hola, quiero agendar: Escleroterapia (Dra. Lady Pineda). ¿Qué disponibilidad tienen?">
```

Cambia solo el texto entre comillas. El script se encarga de codificarlo.

Así sabes **desde qué sección** te escribió cada paciente, sin instalar analítica.

### Agregar o quitar una sede

En `index.html`, busca `id="sedes"`. Copia un bloque `<article class="venue">` completo
y cambia tres cosas: el número (`01`, `02`…), el nombre y el enlace de Google Maps.

Recuerda actualizar también la lista de sedes en el **footer** y el contador `data-count="7"`
del hero.

### Agregar las direcciones reales de las sedes

Dentro de cada `<article class="venue">`, justo debajo del `<h3 class="venue__name">`,
puedes añadir:

```html
<p class="venue__addr">Calle 50, Ciudad de Panamá</p>
```

Y en `css/styles.css` agrega el estilo:

```css
.venue__addr{ color:var(--gris); font-size:.9rem; margin-bottom:1rem; }
```

### Agregar o cambiar un servicio

En `index.html`, busca `id="servicios"`. Cada servicio es un `<article class="service">`
con: nombre, doctor, descripción, duración y el botón de WhatsApp.

**Los precios no se muestran a propósito** — el chip dice "Consultar precio por WhatsApp".
Es una decisión de marketing: genera la conversación en vez de que el paciente decida solo
mirando un número. Si algún día quieres mostrarlos, cambia el texto del
`<span class="chip chip--price">`.

### Poner fotos reales de los doctores

Guarda las fotos en `assets/` (por ejemplo `dra-pineda.jpg`). En `index.html`, dentro de
`id="doctores"`, reemplaza el bloque del monograma:

```html
<span class="doctor__avatar">…</span>
```

por:

```html
<img src="assets/dra-pineda.jpg" alt="Dra. Lady Pineda" class="doctor__photo">
```

La clase `.doctor__photo` ya existe en el CSS. Hay un comentario en el HTML que te indica
el punto exacto.

### Banner de cookies y páginas legales

El banner **no está en el HTML**: lo construye [`js/cookies.js`](js/cookies.js), así existe en un
solo lugar y las tres páginas lo comparten. Para cambiar su texto, edita ese archivo.

La respuesta se guarda en `localStorage` bajo `vc_consent`, con dos valores posibles:
`todas` (aceptó también las analíticas) o `esenciales`.

**Cuando agregues el píxel de Meta o Google Analytics** para tus campañas, engánchalo al
consentimiento en vez de cargarlo siempre:

```js
window.addEventListener('vc:consent', function (e) {
  if (e.detail === 'todas') {
    // aquí va el script de analítica
  }
});
```

El enlace **"Configurar cookies"** del footer (atributo `data-abrir-cookies`) vuelve a mostrar
el banner para que el visitante cambie de opinión.

> **Importante:** el texto legal está redactado para **Galenus AI** como plataforma SaaS
> (menciona cuentas de usuario, contraseñas y datos de pacientes almacenados). Esta web es
> solo informativa y no recopila ningún dato. Conviene que un abogado adapte el texto a este
> sitio en concreto.

### Cambiar los colores

Todo está en `:root`, al inicio de [`css/styles.css`](css/styles.css):

```css
--azul: #164A8A;
--rojo: #D81F3C;
```

Cambiar esas dos líneas actualiza el sitio completo.

### Bajarle a las animaciones

Todas viven en [`css/animations.css`](css/animations.css), agrupadas y numeradas por
sección. Para apagar una, comenta el bloque correspondiente. Las más llamativas:

| Quiero apagar… | Bloque en `animations.css` |
|---|---|
| La pantalla de carga inicial | `1. PRELOADER` |
| Los blobs de color del fondo | `4. FONDO DEL HERO` |
| La cinta de texto que se desplaza | `5. MARQUEE` |
| El pulso del botón de WhatsApp | `10. BOTÓN FLOTANTE` |

La red de puntos del fondo se apaga en `js/main.js`, bloque `08. RED VASCULAR`.

> El sitio ya respeta la preferencia **"Reducir movimiento"** del sistema operativo:
> a quien la tenga activada se le muestra la página completa y estática.

---

## Publicar en EasyPanel

### 1. Repositorio

Ya está conectado a **https://github.com/Antonio598/vascular-clinic** (rama `main`).

### 2. Crear el servicio en EasyPanel

1. **Create Service → App**
2. En *Source*, elige **GitHub**, el repositorio `Antonio598/vascular-clinic` y la rama `main`
3. En *Build*, deja **Dockerfile** (EasyPanel lo detecta solo al encontrarlo en la raíz)
4. En *Domains*, agrega tu dominio y pon el **puerto 80**
5. Activa el certificado **SSL de Let's Encrypt**
6. Presiona **Deploy**

### 3. Actualizaciones futuras

```bash
git add .
git commit -m "Actualización de textos"
git push
```

Luego presiona **Deploy** en EasyPanel (o activa el auto-deploy por webhook).

> **Si un cambio no se ve:** EasyPanel reutiliza capas de Docker en caché.
> Usa la opción **Force rebuild** para reconstruir desde cero.

### Probar el Docker localmente (opcional)

```bash
docker build -t vascular .
docker run -p 8080:80 vascular
```

Y abre `http://localhost:8080`. Si se ve bien aquí, se verá bien en EasyPanel.

---

## Decisiones de marketing detrás del diseño

Estas no son decisiones estéticas: cada una responde a datos de conversión del sector salud.

- **Cero formularios.** En LATAM los enlaces directos a WhatsApp convierten entre 2 y 5 veces
  más que un formulario de contacto. Cada botón del sitio abre WhatsApp.
- **Un solo texto de CTA**, repetido en todas las secciones: *"Agendar por WhatsApp"*.
  Cuando el texto del botón cambia de sección en sección, el visitante duda.
- **Las señales de confianza van pegadas al botón**, no en una sección aparte. Por eso debajo
  del CTA principal dice *"Te respondemos por WhatsApp y confirmamos tu horario"*.
- **Lenguaje de cuidado, no de presión.** En salud, la urgencia agresiva resta confianza.
- **La sección "¿Es tu caso?" va antes que los servicios.** El paciente primero necesita
  reconocerse en un síntoma; recién entonces le interesa el tratamiento.
- **Los horarios no se publican.** Se convirtieron en el motivo principal para escribir:
  *"Escríbenos y te decimos el próximo cupo disponible"*. Esto además resuelve el problema
  real de que la agenda cambia por sede y por especialista.
- **Sin testimonios inventados.** El espacio está libre para cuando tengas reseñas reales.

---

## Notas técnicas

- **Sin JavaScript el sitio funciona igual**: todo el contenido es visible y los botones de
  WhatsApp siguen abriendo el chat (con un mensaje genérico).
- **SEO**: incluye datos estructurados `MedicalClinic` y `FAQPage`, meta tags de Open Graph
  y descripción optimizada.
- **Accesibilidad**: navegación por teclado, `aria-expanded` en el menú y el FAQ, contraste
  AA y soporte de `prefers-reduced-motion`.
- **Rendimiento**: cero peticiones a servidores externos (sin Google Fonts, sin CDN).
  La red de puntos del fondo se apaga en móvil, fuera de pantalla y con la pestaña oculta.

---

## Pendientes sugeridos

- [ ] Agregar las direcciones escritas de cada sede
- [ ] Agregar fotos de la Dra. Pineda y el Dr. Camaño
- [ ] Agregar testimonios reales de pacientes (con su autorización)
- [ ] Registrar el dominio y conectarlo en EasyPanel
- [ ] Crear el perfil de Google Business de cada sede y enlazarlo
