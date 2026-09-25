# PiruBbEditor

Idioma: **Español** | [English](README.md)

PiruBbEditor es un editor de texto enriquecido BBCode WYSIWYG moderno, ligero y modular desarrollado en JavaScript vanilla y Sass (SCSS). Permite alternar fluidamente entre una vista visual interactiva y la edición de código BBCode en tiempo real.

## Características principales

* **Doble modo de edición**: Modo visual (WYSIWYG) con edición directa en el DOM y modo de código BBCode tradicional.
* **Conversión bidireccional limpia**: Conversor integrado entre BBCode y HTML tanto del lado del cliente (JavaScript) como del servidor (PHP).
* **Control interactivo de imágenes**: Marco de redimensión con puntos de arrastre en las cuatro esquinas, placa informativa de dimensiones en tiempo real y barra flotante con preajustes de tamaño (100%, 50%, 25%, original), opciones de flotación/alineación y eliminación.
* **Navegación inteligente con teclado**: Salida fluida de citas (quote), spoilers, bloques VIP, encabezados y listas al presionar Enter en líneas vacías.
* **Historial de cambios**: Atajos de teclado para deshacer (`Ctrl+Z`) y rehacer (`Ctrl+Y`).
* **Formato hexadecimal estricto**: Conversión y almacenamiento consistente de colores en formato `#rrggbb`.
* **Sin dependencias obsoletas**: Manipulación moderna de rangos del DOM sin uso de `document.execCommand`.
* **Soporte de tema oscuro**: Estilos adaptables mediante clases de tema oscuro.

## Instalación

### Vía script compilado (dist)

Incluye la hoja de estilos y el archivo JavaScript generado en la carpeta `dist`:

```html
<link rel="stylesheet" href="dist/css/pirubbeditor.css" />
<script src="dist/js/pirubbeditor.js"></script>
```

### Inicialización básica

Puedes inicializar el editor a partir de un elemento `<textarea>` o un contenedor `<div>`:

```html
<!-- Desde un textarea -->
<textarea id="mi-editor">[b]Texto inicial[/b]</textarea>

<!-- O desde un div -->
<div id="mi-editor-div">[h1]Título[/h1]</div>

<script>
  const editor = new PiruBbEditor("#mi-editor", {
    previewType: "js"
  });
</script>
```

## Opciones de configuración

El constructor `PiruBbEditor(target, options)` acepta las siguientes opciones:

| Opción | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `toolbar` | `Array<string>` | *(Todas las herramientas)* | Lista de botones a incluir en la barra de herramientas. |
| `previewType` | `string` | `"js"` | Tipo de procesamiento para la vista previa: `"js"` (cliente) o `"php"` (servidor). |
| `previewUrl` | `string` | `"preview.php"` | URL del script backend en caso de usar `previewType: "php"`. |
| `value` | `string` | `""` | Contenido inicial en formato BBCode. |

### Configuración de barra de herramientas

Herramientas disponibles:

* `heading`: Menú desplegable para párrafo y encabezados H1 a H6.
* `bold`: Negrita (`[b]...[/b]`).
* `italic`: Cursiva (`[i]...[/i]`).
* `underline`: Subrayado (`[u]...[/u]`).
* `strike`: Tachado (`[s]...[/s]`).
* `quote`: Cita en bloque (`[quote]...[/quote]`).
* `ol`: Lista ordenada (`[ol][li]...[/li][/ol]`).
* `ul`: Lista desordenada (`[ul][li]...[/li][/ul]`).
* `li`: Elemento de lista (`[li]...[/li]`).
* `left`: Alinear texto a la izquierda (`[left]...[/left]`).
* `center`: Centrar texto (`[center]...[/center]`).
* `right`: Alinear texto a la derecha (`[right]...[/right]`).
* `url`: Enlace con modal para URL y texto visible (`[url=...]...[/url]`).
* `image`: Imagen con modal para URL y dimensiones (`[img width=... height=...]...[/img]`).
* `color`: Selector de color con paleta hexadecimal y picker nativo (`[color=#rrggbb]...[/color]`).
* `size`: Tamaño de fuente (`[size=18]...[/size]`).
* `spoiler`: Contenedor colapsable (`[spoiler]...[/spoiler]`).
* `jdownloader`: Enlace especial para JDownloader (`[jdownloader]...[/jdownloader]`).
* `vip`: Contenedor exclusivo para contenido VIP (`[vip]...[/vip]`).
* `youtube`: Video de YouTube con dimensiones opcionales (`[youtube width=... height=...]...[/youtube]`).
* `code`: Bloque de código preformateado (`[code]...[/code]`).

Ejemplo de barra personalizada:

```javascript
const editor = new PiruBbEditor("#mi-editor", {
  toolbar: [
    "heading",
    "bold",
    "italic",
    "underline",
    "url",
    "image",
    "color",
    "quote",
    "spoiler",
    "vip"
  ]
});
```

## API de JavaScript

La instancia del editor expone los siguientes métodos:

### `getValue()`
Devuelve el contenido actual en formato BBCode.

```javascript
const bbcode = editor.getValue();
```

### `setValue(bbcode)`
Establece el contenido del editor en formato BBCode y actualiza la vista visual.

```javascript
editor.setValue("[b]Nuevo contenido[/b]");
```

### `getHTML()`
Devuelve el contenido convertido a formato HTML.

```javascript
const html = editor.getHTML();
```

### `toggleCodeView()`
Alterna entre el modo visual (WYSIWYG) y el modo de código BBCode.

```javascript
editor.toggleCodeView();
```

### `undo()` / `redo()`
Deshace o rehace la última acción en el historial.

```javascript
editor.undo();
editor.redo();
```

## Estructura del proyecto

```text
pirubbeditor/
├── dist/
│   ├── css/
│   │   └── pirubbeditor.css
│   └── js/
│       └── pirubbeditor.js
├── src/
│   ├── js/
│   │   ├── buttons/       # Controladores de botones individuales
│   │   ├── components/    # Barra de herramientas y componentes estructurales
│   │   ├── utils/         # Conversores, eventos, redimensionador y modales
│   │   ├── editor.js      # Clase principal del editor
│   │   └── PiruBbEditor.js# Punto de entrada principal
│   └── scss/              # Hojas de estilo modulares
├── test/
│   ├── index.html         # Página de demostración y pruebas
│   └── preview.php        # Script backend de prueba para vista previa PHP
├── CHANGELOG.md
├── package.json
├── README.es.md
└── README.md
```

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo de licencia para más detalles.
