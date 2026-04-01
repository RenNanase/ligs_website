/**
 * Theme initialization for first paint. Uses server themeId (admin's choice from DB).
 * Inline CSS is applied immediately during HTML parse; no script execution delay.
 * Sync with themes in lib/theme-context.tsx
 */
const THEME_DATA: Record<string, { primary: string; accent: string; bg: string; bgPrimary: string }> = {
  default: { primary: "#40826D", accent: "#F0531C", bg: "#FFF5EE", bgPrimary: "#E8F3EF" },
  ocean: { primary: "#2563EB", accent: "#F97316", bg: "#F0F9FF", bgPrimary: "#EFF6FF" },
  royal: { primary: "#213745", accent: "#ff5b8e", bg: "#ead9c9", bgPrimary: "#E8EEF2" },
  forest: { primary: "#014421", accent: "#e4af2b", bg: "#f6e9d9", bgPrimary: "#E6F0EA" },
  avocado: { primary: "#558700", accent: "#f05010", bg: "#fffae1", bgPrimary: "#F0F7E6" },
  evergreen: { primary: "#05503c", accent: "#fdca00", bg: "#Fcfff1", bgPrimary: "#fffff" },
}

export const THEME_STORAGE_KEY = "ligs-theme"

function hexToHsl(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Returns inline CSS for the selected theme. Applied as first element in body for immediate
 * first-paint—no script execution delay. For "default", returns empty string (globals.css has it).
 */
export function getThemeInitStyle(serverThemeId?: string): string {
  if (!serverThemeId || serverThemeId === "default") return ""
  const theme = THEME_DATA[serverThemeId]
  if (!theme) return ""
  const primary = hexToHsl(theme.primary)
  const accent = hexToHsl(theme.accent)
  const bg = hexToHsl(theme.bg)
  const bgPrimary = hexToHsl(theme.bgPrimary)
  return `:root{--primary:${primary}!important;--accent:${accent}!important;--background:${bg}!important;--secondary:${bg}!important;--ring:${primary}!important;--sidebar-background:${primary}!important;--sidebar-primary:${accent}!important;--bg-primary:${bgPrimary}!important}`
}

/** @deprecated Use getThemeInitStyle for first paint. Kept for ThemeProvider fallback. */
export function getThemeInitScript(serverThemeId?: string): string {
  const data = JSON.stringify(THEME_DATA)
  const server = serverThemeId && serverThemeId !== "default" ? JSON.stringify(serverThemeId) : "null"
  return `(function(){
var d=${data};
var s=${server};
var k=s||localStorage.getItem("${THEME_STORAGE_KEY}");
if(!k||k==="default")return;
var t=d[k];
if(!t)return;
function h(x){var r=parseInt(x.slice(1,3),16)/255,g=parseInt(x.slice(3,5),16)/255,b=parseInt(x.slice(5,7),16)/255;var M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2,s=0,H=0;if(M!==m){var D=M-m;s=l>0.5?D/(2-M-m):D/(M+m);switch(M){case r:H=((g-b)/D+(g<b?6:0))/6;break;case g:H=((b-r)/D+2)/6;break;case b:H=((r-g)/D+4)/6;break}}return Math.round(H*360)+" "+Math.round(s*100)+"% "+Math.round(l*100)+"%"}
var r=document.documentElement;
r.style.setProperty("--primary",h(t.primary));
r.style.setProperty("--accent",h(t.accent));
r.style.setProperty("--background",h(t.bg));
r.style.setProperty("--secondary",h(t.bg));
r.style.setProperty("--ring",h(t.primary));
r.style.setProperty("--sidebar-background",h(t.primary));
r.style.setProperty("--sidebar-primary",h(t.accent));
r.style.setProperty("--bg-primary",h(t.bgPrimary));
})();`
}
