export default function convertToHTML(bbcode) {
  return bbcode
    .replace(/\[h1\](.*?)\[\/h1\]/g, "<h1>$1</h1>")
    .replace(/\[h2\](.*?)\[\/h2\]/g, "<h2>$1</h2>")
    .replace(/\[h3\](.*?)\[\/h3\]/g, "<h3>$1</h3>")
    .replace(/\[h4\](.*?)\[\/h4\]/g, "<h4>$1</h4>")
    .replace(/\[h5\](.*?)\[\/h5\]/g, "<h5>$1</h5>")
    .replace(/\[h6\](.*?)\[\/h6\]/g, "<h6>$1</h6>")
    .replace(/\[b\](.*?)\[\/b\]/g, "<strong>$1</strong>")
    .replace(/\[i\](.*?)\[\/i\]/g, "<em>$1</em>")
    .replace(/\[u\](.*?)\[\/u\]/g, "<u>$1</u>")
    .replace(/\[s\](.*?)\[\/s\]/g, "<s>$1</s>")
    .replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1">$2</a>')
    .replace(/\[url\](.*?)\[\/url\]/g, '<a href="$1">$1</a>')
    .replace(/\[img\](.*?)\[\/img\]/g, '<img src="$1" alt="Image">')
    .replace(
      /\[color=(.*?)\](.*?)\[\/color\]/g,
      '<span style="color:$1">$2</span>'
    )
    .replace(
      /\[size=(.*?)\](.*?)\[\/size\]/g,
      '<span style="font-size:$1">$2</span>'
    )
    .replace(
      /\[spoiler\](.*?)\[\/spoiler\]/g,
      '<div class="spoiler"><button class="spoiler-toggle">Show Spoiler</button><div class="spoiler-content" style="display:none;">$1</div></div>'
    )
    .replace(
      /\[youtube\](.*?)\[\/youtube\]/g,
      '<lite-youtube videoid="$1"></lite-youtube>'
    )
    .replace(
      /\[jdownloader\](.*?)\[\/jdownloader\]/g,
      '<a href="$1">JDownloader Link</a>'
    )
    .replace(/\[vip\](.*?)\[\/vip\]/g, '<span class="vip">$1</span>')
    .replace(/\[code\](.*?)\[\/code\]/g, "<pre><code>$1</code></pre>")
    .replace(/\[quote\](.*?)\[\/quote\]/g, "<blockquote>$1</blockquote>")
    .replace(
      /\[left\](.*?)\[\/left\]/g,
      '<div style="text-align:left">$1</div>'
    )
    .replace(
      /\[center\](.*?)\[\/center\]/g,
      '<div style="text-align:center">$1</div>'
    )
    .replace(
      /\[right\](.*?)\[\/right\]/g,
      '<div style="text-align:right">$1</div>'
    )
    .replace(/\n/g, "<br>")
    .replace(/\[ol\](.*?)\[\/ol\]/g, "<ol>$1</ol>")
    .replace(/\[ul\](.*?)\[\/ul\]/g, "<ul>$1</ul>")
    .replace(/\[li\](.*?)\[\/li\]/g, "<li>$1</li>");
}
