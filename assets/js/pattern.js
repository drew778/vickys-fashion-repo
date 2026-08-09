/* ============================================================
   VICKY'S FASHION — Procedural weave engine
   Turns a fabric definition into an SVG <pattern> (for filling
   garments in the Design Studio) and into a finished swatch tile
   (for the catalogue). One source of truth for how cloth looks.
   ============================================================ */
(function(){
  function clamp(v){ return Math.max(0,Math.min(255,v)); }
  function shade(hex, amt){ // amt -1..1
    hex=hex.replace('#',''); if(hex.length===3) hex=hex.split('').map(c=>c+c).join('');
    let r=parseInt(hex.substr(0,2),16),g=parseInt(hex.substr(2,2),16),b=parseInt(hex.substr(4,2),16);
    const f=amt<0?0:255, t=Math.abs(amt);
    r=clamp(Math.round(r+(f-r)*t)); g=clamp(Math.round(g+(f-g)*t)); b=clamp(Math.round(b+(f-b)*t));
    return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
  }

  // Returns the inner markup of a <pattern> tile (without the wrapper).
  function tile(fab){
    const p=fab.palette, base=p.base;
    const yarn=p.yarn||shade(base,0.35);
    const w=fab.weave;
    const bg=`<rect width="100%" height="100%" fill="${base}"/>`;

    switch(w){
      case "solid":
        return `<rect width="20" height="20" fill="${base}"/>
                <path d="M0 0 L20 20 M-5 15 L5 25 M15 -5 L25 5" stroke="${shade(base,0.05)}" stroke-width="0.6" opacity="0.5"/>`;
      case "flannel":
        return `<rect width="24" height="24" fill="${base}"/>
                <rect width="24" height="24" fill="${shade(base,0.08)}" opacity="0.25"/>
                <path d="M0 6 H24 M0 12 H24 M0 18 H24" stroke="${shade(base,-0.06)}" stroke-width="2.4" opacity="0.15"/>`;
      case "barathea":
        return `<rect width="8" height="8" fill="${base}"/>
                <circle cx="2" cy="2" r="0.8" fill="${shade(base,0.12)}"/>
                <circle cx="6" cy="6" r="0.8" fill="${shade(base,0.12)}"/>
                <circle cx="6" cy="2" r="0.7" fill="${shade(base,-0.15)}"/>
                <circle cx="2" cy="6" r="0.7" fill="${shade(base,-0.15)}"/>`;
      case "twill":
        return `<rect width="8" height="8" fill="${base}"/>
                <path d="M-2 6 L6 -2 M2 10 L10 2 M-2 2 L2 -2" stroke="${yarn}" stroke-width="1.1" opacity="0.55"/>`;
      case "sharkskin":
        return `<rect width="10" height="10" fill="${base}"/>
                <path d="M-2 8 L8 -2 M3 13 L13 3" stroke="${yarn}" stroke-width="1.6" opacity="0.8"/>`;
      case "nailhead":
        return `<rect width="7" height="7" fill="${base}"/>
                <rect x="0" y="0" width="1.6" height="1.6" fill="${yarn}"/>
                <rect x="3.5" y="3.5" width="1.6" height="1.6" fill="${yarn}"/>`;
      case "birdseye":
        return `<rect width="8" height="8" fill="${base}"/>
                <circle cx="2" cy="2" r="1.5" fill="${yarn}"/><circle cx="2" cy="2" r="0.6" fill="${base}"/>
                <circle cx="6" cy="6" r="1.5" fill="${yarn}"/><circle cx="6" cy="6" r="0.6" fill="${base}"/>`;
      case "pinstripe":
        return `<rect width="9" height="9" fill="${base}"/>
                <line x1="1" y1="0" x2="1" y2="9" stroke="${yarn}" stroke-width="0.9" opacity="0.85"/>`;
      case "chalkstripe":
        return `<rect width="18" height="6" fill="${base}"/>
                <line x1="1.2" y1="0" x2="1.2" y2="6" stroke="${yarn}" stroke-width="1.6" opacity="0.9" stroke-dasharray="3 1.4"/>`;
      case "stripe": { // shirting vertical stripe
        const sw=p.w||6, gap=sw*2, tw=sw+gap;
        return `<rect width="${tw}" height="10" fill="${base}"/>
                <rect x="0" y="0" width="${sw}" height="10" fill="${yarn}"/>`;
      }
      case "endonend":
        return `<rect width="4" height="4" fill="${base}"/>
                <line x1="0.5" y1="0" x2="0.5" y2="4" stroke="${yarn}" stroke-width="1" opacity="0.9"/>`;
      case "oxford":
        return `<rect width="6" height="6" fill="${base}"/>
                <rect x="0" y="0" width="3" height="3" fill="${yarn}" opacity="0.5"/>
                <rect x="3" y="3" width="3" height="3" fill="${yarn}" opacity="0.5"/>`;
      case "windowpane":
        return `<rect width="28" height="28" fill="${base}"/>
                <path d="M0 0 H28 M0 0 V28" stroke="${yarn}" stroke-width="1.1" opacity="0.85"/>`;
      case "gingham": {
        const y=yarn;
        return `<rect width="16" height="16" fill="${base}"/>
                <rect x="0" y="0" width="8" height="16" fill="${y}" opacity="0.45"/>
                <rect x="0" y="0" width="16" height="8" fill="${y}" opacity="0.45"/>`;
      }
      case "tattersall": {
        const a=yarn, b=p.alt||shade(base,-0.3);
        return `<rect width="20" height="20" fill="${base}"/>
                <line x1="0" y1="0" x2="20" y2="0" stroke="${a}" stroke-width="0.9"/>
                <line x1="0" y1="0" x2="0" y2="20" stroke="${a}" stroke-width="0.9"/>
                <line x1="10" y1="0" x2="10" y2="20" stroke="${b}" stroke-width="0.9"/>
                <line x1="0" y1="10" x2="20" y2="10" stroke="${b}" stroke-width="0.9"/>`;
      }
      case "herringbone": {
        const y=yarn;
        return `<rect width="16" height="8" fill="${base}"/>
                <path d="M0 8 L4 0 L8 8 M8 8 L12 0 L16 8" fill="none" stroke="${y}" stroke-width="1.3" opacity="0.7"/>
                <path d="M0 0 L4 8 M8 0 L12 8" stroke="${shade(base,-0.08)}" stroke-width="0.6" opacity="0.4"/>`;
      }
      case "glen": {
        const dark=p.yarn||shade(base,-0.4), over=p.over||shade(base,-0.2);
        // houndstooth-ish base cells + overcheck
        return `<rect width="24" height="24" fill="${base}"/>
                <g fill="${dark}" opacity="0.7">
                  <rect x="0" y="0" width="6" height="6"/><rect x="6" y="6" width="6" height="6"/>
                  <path d="M12 0 h6 v3 h-3 v3 h-3 z"/><path d="M18 6 h6 v6 h-3 v-3 h-3 z"/>
                  <rect x="0" y="12" width="6" height="6"/><rect x="6" y="18" width="6" height="6"/>
                  <path d="M12 12 h6 v3 h-3 v3 h-3 z"/><path d="M18 18 h6 v6 h-3 v-3 h-3 z"/>
                </g>
                <path d="M0 0 H24 M0 12 H24 M0 0 V24 M12 0 V24" stroke="${over}" stroke-width="0.9" opacity="0.55"/>`;
      }
      default:
        return bg;
    }
  }

  const TILE_SIZE = {
    windowpane:28, glen:24, tattersall:20, gingham:16, herringbone:16, chalkstripe:18,
    solid:20, flannel:24, sharkskin:10, nailhead:7, birdseye:8, pinstripe:9, barathea:8,
    twill:8, oxford:6, endonend:4
  };

  function tileSize(fab){
    if(fab.weave==="stripe"){ const sw=fab.palette.w||6; return sw*3; }
    return TILE_SIZE[fab.weave]||20;
  }

  // <pattern> markup for injection into a shared <defs>
  function patternDef(fab, scale){
    scale = scale||1;
    const s = tileSize(fab)*scale;
    const h = (fab.weave==="stripe"? 10 : (fab.weave==="herringbone"?8:(fab.weave==="chalkstripe"?6:s)))*(fab.weave==="stripe"||fab.weave==="herringbone"||fab.weave==="chalkstripe"?scale:1);
    const th = (fab.weave==="stripe")? 10*scale : (fab.weave==="herringbone"?8*scale:(fab.weave==="chalkstripe"?6*scale:s));
    return `<pattern id="pat_${fab.id}" patternUnits="userSpaceOnUse" width="${s}" height="${th}" patternTransform="scale(${scale})">${tile(fab)}</pattern>`;
  }

  function fillRef(fab){ return `url(#pat_${fab.id})`; }

  // Ensure a fabric's pattern exists inside a given <defs> element (DOM)
  function ensure(defsEl, fab, scale){
    if(!defsEl) return;
    if(defsEl.querySelector('#pat_'+fab.id)) return;
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.innerHTML=patternDef(fab, scale||1);
    defsEl.appendChild(g.firstChild);
  }

  // Standalone finished swatch (string) for catalogue tiles
  function swatch(fab, w, h){
    w=w||300; h=h||300;
    const sc = Math.max(1, Math.round(w/120));
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${fab.name}">
      <defs>
        ${patternDef(fab, sc)}
        <linearGradient id="sheen_${fab.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
          <stop offset="0.35" stop-color="#ffffff" stop-opacity="0.02"/>
          <stop offset="1" stop-color="#000000" stop-opacity="0.14"/>
        </linearGradient>
        <radialGradient id="vig_${fab.id}" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
          <stop offset="1" stop-color="#000000" stop-opacity="0.28"/>
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#pat_${fab.id})"/>
      <rect width="${w}" height="${h}" fill="url(#sheen_${fab.id})"/>
      <rect width="${w}" height="${h}" fill="url(#vig_${fab.id})"/>
    </svg>`;
  }

  window.OPTPattern = { patternDef, fillRef, ensure, swatch, shade, tileSize };
})();
