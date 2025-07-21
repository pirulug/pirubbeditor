// Buttons
import bbCodeButton from "../buttons/bbCode";
import colorButton from "../buttons/color";
import imageButton from "../buttons/image";
import sizeButton from "../buttons/size";
import urlButton from "../buttons/url";
import youTubeButton from "../buttons/youtube";

// Components
import preview from "./preview";

// IMG
import jdownloaderIcon from "../../img/jdownloader.svg";
import shortIcon from "../../img/short.svg";

export default function toolbar(editor) {
  const toolbarButtons = {
    h1: () =>
      bbCodeButton(editor, "H1", "[h1]", "[/h1]", "fa-solid fa-heading fa-2xl"),
    h2: () =>
      bbCodeButton(editor, "H2", "[h2]", "[/h2]", "fa-solid fa-heading fa-xl"),
    h3: () =>
      bbCodeButton(editor, "H3", "[h3]", "[/h3]", "fa-solid fa-heading fa-lg"),
    h4: () =>
      bbCodeButton(editor, "H4", "[h4]", "[/h4]", "fa-solid fa-heading fa-sm"),
    h5: () =>
      bbCodeButton(editor, "H5", "[h5]", "[/h5]", "fa-solid fa-heading fa-xs"),
    h6: () =>
      bbCodeButton(editor, "H6", "[h6]", "[/h6]", "fa-solid fa-heading fa-2xs"),
    bold: () => bbCodeButton(editor, "Negrita", "[b]", "[/b]", "fas fa-bold"),
    italic: () =>
      bbCodeButton(editor, "Cursiva", "[i]", "[/i]", "fas fa-italic"),
    underline: () =>
      bbCodeButton(editor, "Subrayado", "[u]", "[/u]", "fas fa-underline"),
    strike: () =>
      bbCodeButton(editor, "Tachado", "[s]", "[/s]", "fas fa-strikethrough"),
    code: () =>
      bbCodeButton(editor, "Código", "[code]", "[/code]", "fas fa-code"),
    quote: () =>
      bbCodeButton(editor, "Cita", "[quote]", "[/quote]", "fa fa-quote-left"),
    ol: () =>
      bbCodeButton(editor, "Lista Ordenada", "[ol]", "[/ol]", "fas fa-list-ol"),
    ul: () =>
      bbCodeButton(
        editor,
        "Lista Desordenada",
        "[ul]",
        "[/ul]",
        "fas fa-list-ul"
      ),
    li: () =>
      bbCodeButton(editor, "Elemento de Lista", "[li]", "[/li]", "fas fa-list"),
    left: () =>
      bbCodeButton(
        editor,
        "Alinear a la Izquierda",
        "[left]",
        "[/left]",
        "fas fa-align-left"
      ),
    center: () =>
      bbCodeButton(
        editor,
        "Centrar",
        "[center]",
        "[/center]",
        "fas fa-align-center"
      ),
    right: () =>
      bbCodeButton(
        editor,
        "Alinear a la Derecha",
        "[right]",
        "[/right]",
        "fas fa-align-right"
      ),
    url: () => urlButton(editor),
    short: () =>
      bbCodeButton(
        editor,
        "Acortado",
        "[short]",
        "[/short]",
        null,
        shortIcon
      ),
    image: () => imageButton(editor),
    color: () => colorButton(editor),
    size: () => sizeButton(editor),
    spoiler: () =>
      bbCodeButton(
        editor,
        "Spoiler",
        "[spoiler]",
        "[/spoiler]",
        "fas fa-eye-slash"
      ),
    jdownloader: () =>
      bbCodeButton(
        editor,
        "JDownloader",
        "[jdownloader]",
        "[/jdownloader]",
        null,
        jdownloaderIcon
      ),
    vip: () => bbCodeButton(editor, "Vip", "[vip]", "[/vip]", "fas fa-star"),
    youtube: () => youTubeButton(editor),
    preview: () => preview(editor),
  };

  editor.toolbarOptions.forEach((option) => {
    if (toolbarButtons[option]) {
      editor.toolbar.appendChild(toolbarButtons[option]());
    }
  });
}
