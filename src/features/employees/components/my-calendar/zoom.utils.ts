export function generateZoomLink(): string {
  const id = Math.floor(1_000_000_000 + Math.random() * 9_000_000_000);
  return `https://zoom.us/j/${id}`;
}
