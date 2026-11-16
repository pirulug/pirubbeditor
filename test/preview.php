<?php
function sanitize_url($rawUrl) {
  $decoded = html_entity_decode(trim($rawUrl), ENT_QUOTES, 'UTF-8');
  if ($decoded === '') return '';

  $normalized = preg_replace('/[\x00-\x1F\x7F\s]+/', '', $decoded);

  if (
    strpos($normalized, '#') === 0 ||
    strpos($normalized, '/') === 0 ||
    strpos($normalized, './') === 0 ||
    strpos($normalized, '../') === 0
  ) {
    return htmlspecialchars($decoded, ENT_QUOTES, 'UTF-8');
  }

  if (preg_match('/^([a-zA-Z][a-zA-Z0-9+.-]*):/', $normalized, $m)) {
    $scheme = strtolower($m[1]);
    if (in_array($scheme, ['http', 'https', 'mailto'], true)) {
      return htmlspecialchars($decoded, ENT_QUOTES, 'UTF-8');
    }
    return '';
  }

  return htmlspecialchars($decoded, ENT_QUOTES, 'UTF-8');
}

function sanitize_css_dimension($rawVal) {
  $clean = trim(str_replace(['"', "'"], '', html_entity_decode($rawVal, ENT_QUOTES, 'UTF-8')));
  if ($clean === '') return '';
  if (strtolower($clean) === 'auto') return 'auto';
  if (preg_match('/^\d+$/', $clean)) return "{$clean}px";
  if (preg_match('/^\d+(?:\.\d+)?(?:px|%|em|rem|pt)$/i', $clean)) return $clean;
  return '';
}

function sanitize_color($rawColor) {
  $clean = trim(str_replace(['"', "'"], '', html_entity_decode($rawColor, ENT_QUOTES, 'UTF-8')));
  if ($clean === '') return '';
  if (preg_match('/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $clean)) return $clean;
  if (preg_match('/^[a-zA-Z]{1,30}$/', $clean)) return $clean;
  if (preg_match('/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/', $clean)) return $clean;
  return '';
}

function sanitize_font_size($rawSize) {
  $clean = trim(str_replace(['"', "'"], '', html_entity_decode($rawSize, ENT_QUOTES, 'UTF-8')));
  if ($clean === '') return '';
  if (preg_match('/^\d+$/', $clean)) return "{$clean}px";
  if (preg_match('/^\d+(?:\.\d+)?(?:px|em|rem|%|pt)$/i', $clean)) return $clean;
  return '';
}

function bbcode_to_html($text) {
  if ($text === '') return '';

  // 1. Extraer bloques [code] para preservar su contenido literal sin procesar otros BBCode ni <br>
  $codeBlocks = [];
  $text = preg_replace_callback(
    '/\[code(?:=([a-zA-Z0-9_-]+))?\](.*?)\[\/code\]/is',
    function ($matches) use (&$codeBlocks) {
      $lang = isset($matches[1]) && $matches[1] !== '' ? preg_replace('/[^a-zA-Z0-9_-]/', '', $matches[1]) : 'markup';
      $code = htmlspecialchars($matches[2], ENT_QUOTES, 'UTF-8');
      $class = $lang !== 'markup' ? 'language-' . $lang : '';
      $placeholder = "\x00PIRUCODE_" . count($codeBlocks) . "\x00";
      $codeBlocks[] = $class !== '' ? "<pre><code class=\"$class\">$code</code></pre>" : "<pre><code>$code</code></pre>";
      return $placeholder;
    },
    $text
  );

  // 2. Escapar HTML crudo en el resto del texto (prevención XSS)
  $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');

  // Listas
  $text = preg_replace_callback(
    '/\[(ul|ol)\](.*?)\[\/\1\]/is',
    function ($matches) {
      $content = preg_replace('/\s*\[li\]\s*/is', '[li]', $matches[2]);
      $content = preg_replace('/\s*\[\/li\]\s*/is', '[/li]', $content);
      return "<{$matches[1]}>" . $content . "</{$matches[1]}>";
    },
    $text
  );

  $text = preg_replace_callback(
    '/\[li\](.*?)\[\/li\]/is',
    function ($matches) {
      return "<li>" . trim($matches[1]) . "</li>";
    },
    $text
  );

  // Imágenes con dimensiones y alineación
  $text = preg_replace_callback(
    '/\[img(?:\s+([^\]]+)|=(\d+)[xX](\d+))?\](.*?)\[\/img\]/is',
    function ($matches) {
      $attrs = $matches[1] ?? '';
      $w_eq = $matches[2] ?? '';
      $h_eq = $matches[3] ?? '';
      $safeSrc = sanitize_url($matches[4]);
      if ($safeSrc === '') return '';

      $style = '';
      if ($w_eq && $h_eq) {
        $style .= "width:{$w_eq}px;height:{$h_eq}px;";
      } elseif ($attrs) {
        if (preg_match('/width=([^\s\]]+)/i', $attrs, $wm)) {
          $w = sanitize_css_dimension($wm[1]);
          if ($w !== '') $style .= "width:{$w};";
        }
        if (preg_match('/height=([^\s\]]+)/i', $attrs, $hm)) {
          $h = sanitize_css_dimension($hm[1]);
          if ($h !== '') $style .= "height:{$h};";
        }
        if (preg_match('/align=([^\s\]]+)/i', $attrs, $am)) {
          $a = strtolower(trim(str_replace(['"', "'"], '', $am[1])));
          if ($a === 'left') $style .= "float:left;margin:0 1rem 0.5rem 0;display:inline-block;";
          elseif ($a === 'right') $style .= "float:right;margin:0 0 0.5rem 1rem;display:inline-block;";
          elseif ($a === 'center') $style .= "display:block;margin:0.5rem auto;";
        }
      }

      $styleAttr = $style ? " style=\"$style\"" : "";
      return "<img src=\"$safeSrc\"$styleAttr alt=\"Image\" />";
    },
    $text
  );

  // YouTube con dimensiones
  $text = preg_replace_callback(
    '/\[youtube(?:\s+([^\]]+)|=(\d+)[xX](\d+))?\](.*?)\[\/youtube\]/is',
    function ($matches) {
      $attrs = $matches[1] ?? '';
      $w_eq = $matches[2] ?? '';
      $h_eq = $matches[3] ?? '';
      $id = trim(html_entity_decode($matches[4], ENT_QUOTES, 'UTF-8'));
      if (!preg_match('/^[a-zA-Z0-9_-]{6,20}$/', $id)) return '';

      $style = 'max-width:100%;';
      if ($w_eq && $h_eq) {
        $style .= "width:{$w_eq}px;height:{$h_eq}px;";
      } elseif ($attrs) {
        if (preg_match('/width=([^\s\]]+)/i', $attrs, $wm)) {
          $w = sanitize_css_dimension($wm[1]);
          if ($w !== '') $style .= "width:{$w};";
        }
        if (preg_match('/height=([^\s\]]+)/i', $attrs, $hm)) {
          $h = sanitize_css_dimension($hm[1]);
          if ($h !== '') $style .= "height:{$h};";
        }
      }

      return "<lite-youtube contenteditable=\"false\" videoid=\"$id\" style=\"$style\"></lite-youtube>";
    },
    $text
  );

  // Enlaces [url] y [jdownloader] con validación de URL
  $text = preg_replace_callback(
    '/\[url=(.*?)\](.*?)\[\/url\]/is',
    function ($m) {
      $safeUrl = sanitize_url($m[1]);
      return $safeUrl !== '' ? "<a href=\"$safeUrl\" target=\"_blank\" rel=\"noopener noreferrer\">{$m[2]}</a>" : $m[2];
    },
    $text
  );

  $text = preg_replace_callback(
    '/\[url\](.*?)\[\/url\]/is',
    function ($m) {
      $safeUrl = sanitize_url($m[1]);
      return $safeUrl !== '' ? "<a href=\"$safeUrl\" target=\"_blank\" rel=\"noopener noreferrer\">$safeUrl</a>" : $m[1];
    },
    $text
  );

  $text = preg_replace_callback(
    '/\[jdownloader=(.*?)\](.*?)\[\/jdownloader\]/is',
    function ($m) {
      $safeUrl = sanitize_url($m[1]);
      return $safeUrl !== '' ? "<a href=\"$safeUrl\" class=\"jdownloader-link\" target=\"_blank\" rel=\"noopener noreferrer\">{$m[2]}</a>" : $m[2];
    },
    $text
  );

  $text = preg_replace_callback(
    '/\[jdownloader\](.*?)\[\/jdownloader\]/is',
    function ($m) {
      $safeUrl = sanitize_url($m[1]);
      return $safeUrl !== '' ? "<a href=\"$safeUrl\" class=\"jdownloader-link\" target=\"_blank\" rel=\"noopener noreferrer\">Descargar con JDownloader</a>" : $m[1];
    },
    $text
  );

  // Color y tamaño con validación
  $text = preg_replace_callback(
    '/\[color=(.*?)\](.*?)\[\/color\]/is',
    function ($m) {
      $safeColor = sanitize_color($m[1]);
      return $safeColor !== '' ? "<span style=\"color:$safeColor\">{$m[2]}</span>" : $m[2];
    },
    $text
  );

  $text = preg_replace_callback(
    '/\[size=(.*?)\](.*?)\[\/size\]/is',
    function ($m) {
      $safeSize = sanitize_font_size($m[1]);
      return $safeSize !== '' ? "<span style=\"font-size:$safeSize\">{$m[2]}</span>" : $m[2];
    },
    $text
  );

  // Etiquetas simples de BBCode a HTML
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
    '/\[quote\](.*?)\[\/quote\]/is'        => '<blockquote>$1</blockquote>',
    '/\[left\](.*?)\[\/left\]/is'          => '<div style="text-align:left">$1</div>',
    '/\[center\](.*?)\[\/center\]/is'      => '<div style="text-align:center">$1</div>',
    '/\[right\](.*?)\[\/right\]/is'        => '<div style="text-align:right">$1</div>',
    '/\[sup\](.*?)\[\/sup\]/is'            => '<sup>$1</sup>',
    '/\[sub\](.*?)\[\/sub\]/is'            => '<sub>$1</sub>',
    '/\[spoiler\](.*?)\[\/spoiler\]/is'    => '<div class="spoiler"><button type="button" class="spoiler-toggle" contenteditable="false">Mostrar Spoiler</button><div class="spoiler-content" style="display:none;">$1</div></div>',
    '/\[vip\](.*?)\[\/vip\]/is'            => '<div class="vip-box"><div class="vip-header" contenteditable="false"><i class="fas fa-star"></i> Contenido VIP</div><div class="vip-content">$1</div></div>',
  ];

  foreach ($bbcode_patterns as $pattern => $replacement) {
    $text = preg_replace($pattern, $replacement, $text);
  }

  $text = str_replace("\n", '<br>', $text);

  // 3. Restaurar bloques [code]
  if (!empty($codeBlocks)) {
    $text = preg_replace_callback('/\x00PIRUCODE_(\d+)\x00/', function ($m) use ($codeBlocks) {
      return $codeBlocks[(int)$m[1]] ?? '';
    }, $text);
  }

  return $text;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $inputText = $_POST['text'] ?? '';
  echo bbcode_to_html($inputText);
}
