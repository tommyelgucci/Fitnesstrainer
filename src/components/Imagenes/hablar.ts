/** Lee un término en alemán con la voz del navegador (si está disponible). */
export function hablarAleman(texto: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto.replace(/\(.*?\)/g, ''));
  u.lang = 'de-DE';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}
