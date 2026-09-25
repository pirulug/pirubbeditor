# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.0.1] - 2026-09-25

### Añadido
* Arquitectura base del editor visual WYSIWYG para código BBCode en JavaScript vanilla y Sass.
* Barra de herramientas modular con soporte para configuración personalizada mediante array o atributos de datos (`data-toolbar`).
* Menú desplegable unificado de encabezados (`headingSelect`) para seleccionar formato de párrafo normal y títulos H1 a H6.
* Botones de formato básico: negrita (`[b]`), cursiva (`[i]`), subrayado (`[u]`), tachado (`[s]`).
* Botones de alineación: izquierda (`[left]`), centro (`[center]`), derecha (`[right]`) con aplicación directa de estilos sobre elementos de bloque.
* Botón de cita en bloque (`[quote]`) con navegación mediante teclado para insertar saltos y salir del bloque al pulsar doble Enter.
* Soporte para listas ordenadas (`[ol]`), desordenadas (`[ul]`) y elementos individuales (`[li]`).
* Contenedor de contenido colapsable (`[spoiler]`) con botón de alternancia editable y soporte de salida mediante Enter.
* Bloque de contenido exclusivo para miembros VIP (`[vip]`) con encabezado estilizado y área de contenido editable.
* Botón interactivo para enlaces de JDownloader (`[jdownloader]`).
* Modal interactivo para insertar enlaces (`[url]`) con campos independientes para la dirección URL y el texto visible a mostrar.
* Modal interactivo para insertar imágenes (`[img]`) con campos para URL y dimensiones opcionales (ancho y alto).
* Modal interactivo para insertar videos de YouTube (`[youtube]`) con compatibilidad para el componente `<lite-youtube>`.
* Selector de color con paleta rápida de tonos y selector nativo del sistema, forzando valores en formato hexadecimal `#rrggbb`.
* Selector interactivo de tamaño de fuente (`[size]`).
* Bloques de código preformateado (`[code]`).
* Módulo de redimensión interactiva para imágenes (`mediaResizer`) con marco de selección, puntos de arrastre en las 4 esquinas, placa informativa de dimensiones en tiempo real y barra flotante de opciones rápidas (100%, 50%, 25%, tamaño original, alineación/flotación y eliminación).
* Sistema de historial con soporte para Deshacer (`Ctrl+Z`) y Rehacer (`Ctrl+Y`) tanto en modo visual como en modo código.
* Conversión bidireccional sincronizada entre HTML y BBCode en cliente (`convertToHTML.js`, `convertToBBCode.js`) y servidor (`preview.php`).
* Soporte completo de estilos para tema oscuro (`_dark.scss`).

### Cambiado
* Sustitución del método obsoleto `document.execCommand` por manipulación nativa de rangos (`Range` y `Selection` de la API del DOM).
* Estandarización de colores hacia formato hexadecimal `#rrggbb` en lugar de representaciones `rgb(...)`.
* Optimización del cálculo de posición del cursor al hacer clic en líneas existentes, evitando que el foco salte automáticamente al final del editor.
