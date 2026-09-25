import wrapText from "../utils/wrapText.js";

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function extractYouTubeVideoId(url) {
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

function handleYouTubeButton(editor) {
  const url = prompt("Introduce la URL del video de YouTube:");
  if (!url || !url.trim()) return;

  const videoId = extractYouTubeVideoId(url.trim());
  if (videoId) {
    wrapText(editor, `[youtube]${videoId}[/youtube]`, "");
  } else {
    alert("URL de YouTube no válida");
  }
}

export default function createYouTubeButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "YouTube";
  button.innerHTML = "<i class=\"fab fa-youtube\"></i>";
  button.addEventListener("click", () => handleYouTubeButton(editor));
  return button;
}
