/**
 * Inline script run before the first paint: applies the saved theme (or the system preference)
 * so the page never flashes the wrong colours. Keep it tiny and dependency-free.
 */
const script = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';requestAnimationFrame(function(){requestAnimationFrame(function(){r.classList.add('theme-ready')})})}catch(e){}})();`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
