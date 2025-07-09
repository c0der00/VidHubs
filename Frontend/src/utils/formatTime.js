export default function formatTime(seconds) {
  seconds = Math.floor(seconds); 

  const hours = Math.floor(seconds / 3600);
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${minutes}:${secs}`
    : `${minutes}:${secs}`; 
}
