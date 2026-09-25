import { applyFormat } from "../utils/formatHelper.js";

function getHtmlWrapperForBBCode(tagStart, tagEnd) {
  const map = {
    "[h1]": "<h1></h1>",
    "[h2]": "<h2></h2>",
    "[h3]": "<h3></h3>",
    "[h4]": "<h4></h4>",
    "[h5]": "<h5></h5>",
    "[h6]": "<h6></h6>",
    "[b]": "<strong></strong>",
    "[i]": "<em></em>",
    "[u]": "<u></u>",
    "[s]": "<s></s>",
    "[quote]": "<blockquote></blockquote>",
    "[code]": "<pre><code></code></pre>",
    "[ol]": "<ol><li></li></ol>",
    "[ul]": "<ul><li></li></ul>",
    "[li]": "<li></li>",
    "[left]": "<div style=\"text-align:left\"></div>",
    "[center]": "<div style=\"text-align:center\"></div>",
    "[right]": "<div style=\"text-align:right\"></div>",
    "[spoiler]":
      "<div class=\"spoiler\"><button type=\"button\" class=\"spoiler-toggle\" contenteditable=\"false\">Ocultar Spoiler</button><div class=\"spoiler-content\" style=\"display:block;\"></div></div>",
    "[vip]": "<span class=\"vip\"></span>",
    "[short]": "<a href=\"#\"></a>",
  };

  return map[tagStart] || "<span></span>";
}

export default function createBBCodeButton(
  editor,
  name,
  tagStart,
  tagEnd,
  iconClass = null,
  svgPath = null
) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = name;
  button.innerHTML = svgPath || `<i class="${iconClass}"></i>`;

  const htmlWrapper = getHtmlWrapperForBBCode(tagStart, tagEnd);
  button.addEventListener("click", () => {
    applyFormat(editor, tagStart, tagEnd, htmlWrapper);
  });

  return button;
}
