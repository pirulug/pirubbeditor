<?php
function bbcode_to_html($text) {

  // Primero, manejamos los bloques de código
  $text = preg_replace_callback(
    '/\[code(?:=([a-zA-Z0-9_]+))?\](.*?)\[\/code\]/is',
    function ($matches) {
      // Determinamos el lenguaje
      $lang = isset($matches[1]) ? $matches[1] : 'markup'; // Default to 'markup' if no language is specified
  
      // Escapamos el contenido del código para evitar problemas con HTML
      $code = htmlspecialchars($matches[2]);

      // Creamos la clase para PrismJS
      $class = $lang !== 'markup' ? 'language-' . $lang : '';

      // Devolvemos el HTML para PrismJS
      return "<pre><code class=\"$class\">$code</code></pre>";
    },
    $text
  );

  // Ahora manejamos las etiquetas de lista por separado
  $text = preg_replace_callback(
    '/\[(ul|ol)\](.*?)\[\/\1\]/is',
    function ($matches) {
      // Elimina saltos de línea y espacios adicionales dentro de [ul] o [ol]
      $content = preg_replace('/\s*\[li\]\s*/is', '[li]', $matches[2]);
      $content = preg_replace('/\s*\[\/li\]\s*/is', '[/li]', $content);
      return "<{$matches[1]}>" . $content . "</{$matches[1]}>";
    },
    $text
  );

  // Ahora manejamos las etiquetas [li]
  $text = preg_replace_callback(
    '/\[li\](.*?)\[\/li\]/is',
    function ($matches) {
      // Asegurarse de que no haya saltos de línea alrededor del contenido de [li]
      $content = trim($matches[1]);
      return "<li>" . $content . "</li>";
    },
    $text
  );
  // Imágenes con dimensiones y alineación
  $text = preg_replace_callback(
    '/\[img(?:\s+([^\]]+)|=(\d+)[xX](\d+))?\](.*?)\[\/img\]/is',
    function ($matches) {
      $attrs = isset($matches[1]) ? $matches[1] : '';
      $w_eq = isset($matches[2]) ? $matches[2] : '';
      $h_eq = isset($matches[3]) ? $matches[3] : '';
      $src = trim($matches[4]);

      $style = '';
      if ($w_eq && $h_eq) {
        $style .= "width:{$w_eq}px;height:{$h_eq}px;";
      } elseif ($attrs) {
        if (preg_match('/width=([^\s\]]+)/i', $attrs, $wm)) {
          $w = trim(str_replace(['"', "'"], '', $wm[1]));
          $style .= "width:" . (is_numeric($w) ? "{$w}px" : $w) . ";";
        }
        if (preg_match('/height=([^\s\]]+)/i', $attrs, $hm)) {
          $h = trim(str_replace(['"', "'"], '', $hm[1]));
          $style .= "height:" . (is_numeric($h) ? "{$h}px" : $h) . ";";
        }
        if (preg_match('/align=([^\s\]]+)/i', $attrs, $am)) {
          $a = strtolower(trim(str_replace(['"', "'"], '', $am[1])));
          if ($a === 'left') $style .= "float:left;margin:0 1rem 0.5rem 0;display:inline-block;";
          elseif ($a === 'right') $style .= "float:right;margin:0 0 0.5rem 1rem;display:inline-block;";
          elseif ($a === 'center') $style .= "display:block;margin:0.5rem auto;";
        }
      }

      $styleAttr = $style ? " style=\"$style\"" : "";
      return "<img src=\"$src\"$styleAttr alt=\"Image\" />";
    },
    $text
  );

  // YouTube con dimensiones y alineación
  $text = preg_replace_callback(
    '/\[youtube(?:\s+([^\]]+)|=(\d+)[xX](\d+))?\](.*?)\[\/youtube\]/is',
    function ($matches) {
      $attrs = isset($matches[1]) ? $matches[1] : '';
      $w_eq = isset($matches[2]) ? $matches[2] : '';
      $h_eq = isset($matches[3]) ? $matches[3] : '';
      $id = trim($matches[4]);

      $style = 'max-width:100%;';
      if ($w_eq && $h_eq) {
        $style .= "width:{$w_eq}px;height:{$h_eq}px;";
      } elseif ($attrs) {
        if (preg_match('/width=([^\s\]]+)/i', $attrs, $wm)) {
          $w = trim(str_replace(['"', "'"], '', $wm[1]));
          $style .= "width:" . (is_numeric($w) ? "{$w}px" : $w) . ";";
        }
        if (preg_match('/height=([^\s\]]+)/i', $attrs, $hm)) {
          $h = trim(str_replace(['"', "'"], '', $hm[1]));
          $style .= "height:" . (is_numeric($h) ? "{$h}px" : $h) . ";";
        }
      }

      return "<lite-youtube videoid=\"$id\" style=\"$style\"></lite-youtube>";
    },
    $text
  );

  // Etiquetas de BBCode a HTML
  $bbcode_patterns = [
    '/\[h1\](.*?)\[\/h1\]/is'              => '<h1>$1</h1>',
    '/\[h2\](.*?)\[\/h2\]/is'              => '<h2>$1</h2>',
    '/\[h3\](.*?)\[\/h3\]/is'              => '<h3>$1</h3>',
    '/\[h4\](.*?)\[\/h4\]/is'              => '<h4>$1</h4>',
    '/\[h5\](.*?)\[\/h5\]/is'              => '<h5>$1</h5>',
    '/\[h6\](.*?)\[\/h6\]/is'              => '<h6>$1</h6>',
    '/\[b\](.*?)\[\/b\]/is'                => '<strong>$1</strong>',
    '/\[i\](.*?)\[\/i\]/is'                => '<em>$1</em>',
    '/\[u\](.*?)\[\/u\]/is'                => '<u>$1</u>',
    '/\[s\](.*?)\[\/s\]/is'                => '<s>$1</s>',
    '/\[url\=(.*?)\](.*?)\[\/url\]/is'     => '<a href="$1">$2</a>',
    '/\[url\](.*?)\[\/url\]/is'            => '<a href="$1">$1</a>',
    '/\[quote\](.*?)\[\/quote\]/is'        => '<blockquote>$1</blockquote>',
    '/\[code\](.*?)\[\/code\]/is'          => '<pre><code>$1</code></pre>', // Manejamos los bloques de código más simples aquí
    '/\[color\=(.*?)\](.*?)\[\/color\]/is' => '<span style="color:$1">$2</span>',
    '/\[size\=(.*?)\](.*?)\[\/size\]/is'   => '<span style="font-size:$1">$2</span>',
    '/\[left\](.*?)\[\/left\]/is'          => '<div style="text-align:left">$1</div>',
    '/\[center\](.*?)\[\/center\]/is'      => '<div style="text-align:center">$1</div>',
    '/\[right\](.*?)\[\/right\]/is'        => '<div style="text-align:right">$1</div>',
    '/\[sup\](.*?)\[\/sup\]/is'            => '<sup>$1</sup>',
    '/\[sub\](.*?)\[\/sub\]/is'            => '<sub>$1</sub>',
    '/\[spoiler\](.*?)\[\/spoiler\]/is'    => '<div class="spoiler"><button class="spoiler-toggle">Show Spoiler</button><div class="spoiler-content" style="display:none;">$1</div></div>',
  ];

  // Reemplaza BBCode por HTML
  foreach ($bbcode_patterns as $pattern => $replacement) {
    $text = preg_replace($pattern, $replacement, $text);
  }

  // Manejo de líneas en listas
  $text = str_replace("\n", '<br>', $text);

  return $text;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $inputText = $_POST['text'] ?? '';
  echo bbcode_to_html($inputText);
}
