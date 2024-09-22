import wrapText from "../utils/wrapText";

export default function createYouTubeButton(editor) {
  const button = document.createElement("button");
  button.innerHTML = '<i class="fab fa-youtube"></i>';
  button.title = "YouTube";
  button.type = "button";
  button.addEventListener("click", () => handleYouTubeButton(editor));
  return button;
}

function handleYouTubeButton(editor) {
  const url = prompt("Introduce la URL del video de YouTube:");
  if (url === null || url.trim() === "") return;

  const videoId = extractYouTubeVideoId(url);
  if (videoId) {
    wrapText(editor, `[youtube]${videoId}[/youtube]`, "");
  } else {
    alert("URL de YouTube no válida");
  }
}

function extractYouTubeVideoId(url) {
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
