/* ============================================================
   VICKY'S FASHION — Design Studio (configurator)
   Realistic, editorial studio models whose garments take the
   real cloth, lining, piping and buttons chosen on the right.
   Faces/hair/hands are drawn as an elevated fashion-lookbook
   illustration; garments are filled with the actual fabric
   pattern and then given a hand-authored light-and-shadow
   "drape" layer so the cloth reads as real cloth on a body.
   ============================================================ */
(function(){
  const stage=document.querySelector('[data-stage]');
  if(!stage) return;

  /* Skin / hair palettes */
  const SKIN="#e3bd94", SKIN_SH="#c69a6d", SKIN_HI="#f2d9b8", SKIN_DK="#a9784f",
        HAIR_M="#2b241d", HAIR_M2="#443a2e", HAIR_F="#3a2b20", HAIR_F2="#5a4433",
        SHOE="#26241f", SHOE_HI="#44403a", LIP_F="#b26b63";

  const state={
    mode:"photo",                  // photo | illustrated
    gender:"male",
    garment:"two-piece",           // two-piece | three-piece | tuxedo | shirt
    suit:"nvy-120",
    shirt:"wht-pop",
    lining:"ln-burg",
    piping:"pp-none",
    button:"bt-horn"
  };

  /* ============ PHOTOGRAPHIC MODELS (real photos, live recolour) ============ */
  const MODELS={
    male:{ base:"assets/img/studio/male_base.jpg", suit:"assets/img/studio/male_suit.png",
           shirt:"assets/img/studio/male_shirt.png", w:768, h:1152, garment:"Three-Piece Suit",
           btnR:5, buttons:[[383,372],[383,405],[382,438],[369,468],           // waistcoat column
             [241,508,2.6],[244,516,2.6],[247,524,2.6],                          // left cuff
             [509,508,2.6],[506,516,2.6],[503,524,2.6]] },                       // right cuff
    female:{ base:"assets/img/studio/female_base.jpg", suit:"assets/img/studio/female_suit.png",
             shirt:"assets/img/studio/female_shirt.png", w:768, h:1152, garment:"Skirt Suit",
             btnR:6, buttons:[[388,381]] }                                  // blazer button
  };
  // preload model layers
  Object.keys(MODELS).forEach(g=>{
    const M=MODELS[g]; M.img={};
    ["base","suit","shirt"].forEach(k=>{ const im=new Image(); im.src=M[k]; M.img[k]=im; });
  });
  function imgReady(im){
    return new Promise(res=>{ if(im.complete && im.naturalWidth) res(im);
      else { im.addEventListener("load",()=>res(im),{once:true}); im.addEventListener("error",()=>res(im),{once:true}); } });
  }
  // fabric weave rasterised into a seamless tile for canvas fill
  const tileCache={};
  function tilePromise(fab){
    if(tileCache[fab.id]) return imgReady(tileCache[fab.id]);
    const t=OPTPattern.tileSize(fab), n=Math.max(1,Math.ceil(110/t)), s=t*n;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><defs>${OPTPattern.patternDef(fab,1)}</defs><rect width="${s}" height="${s}" fill="url(#pat_${fab.id})"/></svg>`;
    const im=new Image(); im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
    tileCache[fab.id]=im; return imgReady(im);
  }
  function compositeRegion(ctx, tileImg, shadeImg, M){
    const off=document.createElement("canvas"); off.width=M.w; off.height=M.h; const o=off.getContext("2d");
    const pat=o.createPattern(tileImg,"repeat"); o.fillStyle=pat; o.fillRect(0,0,M.w,M.h);
    o.globalCompositeOperation="multiply"; o.drawImage(shadeImg,0,0,M.w,M.h);
    o.globalCompositeOperation="destination-in"; o.drawImage(shadeImg,0,0,M.w,M.h);
    ctx.drawImage(off,0,0);
  }
  let photoToken=0;
  function renderPhoto(){
    const my=++photoToken, g=state.gender, M=MODELS[g];
    let cv=stage.querySelector("canvas[data-photo]");
    if(!cv){ stage.innerHTML=`<canvas data-photo width="${M.w}" height="${M.h}" style="width:100%;max-width:430px;height:auto;border-radius:12px;display:block;margin:0 auto"></canvas>`; cv=stage.querySelector("canvas[data-photo]"); }
    cv.width=M.w; cv.height=M.h;
    const ctx=cv.getContext("2d");
    const suit=fabricById(state.suit), shirt=fabricById(state.shirt);
    Promise.all([imgReady(M.img.base),imgReady(M.img.suit),imgReady(M.img.shirt),tilePromise(suit),tilePromise(shirt)])
      .then(([base,suitShade,shirtShade,suitTile,shirtTile])=>{
        if(my!==photoToken) return;            // superseded by a newer selection
        ctx.clearRect(0,0,M.w,M.h);
        ctx.drawImage(base,0,0,M.w,M.h);
        compositeRegion(ctx, suitTile, suitShade, M);
        compositeRegion(ctx, shirtTile, shirtShade, M);
        drawButtons(ctx, M);
      });
    updateSummary();
  }
  function drawButtons(ctx, M){
    const col=(BUTTONS.find(b=>b.id===state.button)||{}).color||"#222";
    const dr=M.btnR||5;
    (M.buttons||[]).forEach(([x,y,rr])=>{
      const r=rr||dr;
      const g=ctx.createRadialGradient(x-r*0.35, y-r*0.35, r*0.15, x, y, r);
      g.addColorStop(0, OPTPattern.shade(col,0.4));
      g.addColorStop(0.55, col);
      g.addColorStop(1, OPTPattern.shade(col,-0.4));
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.closePath();
      ctx.fillStyle=g; ctx.fill();
      ctx.lineWidth=Math.max(1,r*0.2); ctx.strokeStyle="rgba(0,0,0,0.5)"; ctx.stroke();
      // subtle stitch highlight
      ctx.beginPath(); ctx.arc(x,y,r*0.5,0,Math.PI*2); ctx.strokeStyle="rgba(0,0,0,0.25)"; ctx.lineWidth=0.6; ctx.stroke();
    });
  }

  /* ---- read ?fabric= to preselect ---- */
  const params=new URLSearchParams(location.search);
  const pf=params.get('fabric');
  if(pf){ const f=fabricById(pf); if(f){ if(f.category!=="shirt"&&SUITINGS.find(s=>s.id===pf))state.suit=pf; if(SHIRTINGS.find(s=>s.id===pf))state.shirt=pf; } }

  /* Shared gradient / studio defs (static; patterns are appended later) */
  function studioDefs(pre){
    return `
      <radialGradient id="${pre}_floor" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#000" stop-opacity="0.20"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${pre}_bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f3f1ee"/>
        <stop offset="0.62" stop-color="#e7e6e4"/>
        <stop offset="1" stop-color="#d5d4d2"/>
      </linearGradient>
      <linearGradient id="${pre}_skinV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKIN_HI}"/>
        <stop offset="0.5" stop-color="${SKIN}"/>
        <stop offset="1" stop-color="${SKIN_SH}"/>
      </linearGradient>
      <linearGradient id="${pre}_lightL" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0.16"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.16"/>
      </linearGradient>`;
  }

  /* ============ MALE FIGURE ============ */
  function maleFigure(){
    const three = state.garment==="three-piece";
    const tux   = state.garment==="tuxedo";
    const shirtOnly = state.garment==="shirt";
    const tieColor = tux? "#141416" : (PIPINGS.find(p=>p.id===state.piping)?.color || "#7a1f2b");
    const P="m";

    /* ---- head, hair, face ---- */
    const head=`
      <!-- neck -->
      <path d="M212,214 q18,10 36,0 l3,34 q-21,16 -42,0 Z" fill="${SKIN_SH}"/>
      <path d="M212,214 q18,10 36,0 l1,12 q-19,12 -38,0 Z" fill="#000" opacity="0.12"/>
      <!-- ears -->
      <ellipse cx="185" cy="150" rx="9" ry="15" fill="${SKIN}"/>
      <ellipse cx="275" cy="150" rx="9" ry="15" fill="${SKIN_SH}"/>
      <!-- face -->
      <path d="M186,138 C182,96 200,64 230,64 C260,64 278,96 274,138
               C271,168 254,196 230,198 C206,196 189,168 186,138 Z" fill="url(#${P}_skinV)"/>
      <!-- cheek/jaw shadow (light from upper-left) -->
      <path d="M256,120 C266,142 262,176 236,196 C250,176 252,150 248,126 Z" fill="${SKIN_DK}" opacity="0.35"/>
      <!-- brows -->
      <path d="M200,128 q12,-7 26,-2" fill="none" stroke="#2a2018" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
      <path d="M236,126 q12,-5 22,2" fill="none" stroke="#2a2018" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
      <!-- eyes (almond) -->
      <path d="M204,140 q7,-5 15,0 q-7,4.5 -15,0 Z" fill="#fdfbf7"/>
      <circle cx="211.5" cy="140" r="3" fill="#3a2a1c"/><circle cx="211.5" cy="139.5" r="1.1" fill="#120d08"/>
      <path d="M204,140 q7,-5.4 15,0" fill="none" stroke="#241a12" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M241,140 q7,-5 15,0 q-7,4.5 -15,0 Z" fill="#fdfbf7"/>
      <circle cx="248.5" cy="140" r="3" fill="#3a2a1c"/><circle cx="248.5" cy="139.5" r="1.1" fill="#120d08"/>
      <path d="M241,140 q7,-5.4 15,0" fill="none" stroke="#241a12" stroke-width="1.5" stroke-linecap="round"/>
      <!-- nose -->
      <path d="M230,146 l-6,22 q6,5 12,0 Z" fill="${SKIN_SH}" opacity="0.55"/>
      <path d="M230,148 l-5,20" fill="none" stroke="${SKIN_DK}" stroke-width="1.4" opacity="0.4"/>
      <!-- lips -->
      <path d="M218,180 q12,7 24,0 q-12,4 -24,0 Z" fill="#9c6a56" opacity="0.85"/>
      <path d="M220,182 q10,5 20,0" fill="none" stroke="#7c4f40" stroke-width="1.5" opacity="0.6"/>
      <!-- hair (short, side part, light from left) -->
      <path d="M181,140 C173,92 196,52 230,52 C266,52 289,94 279,142
               C276,120 268,108 258,104 C256,86 242,78 230,78 C214,78 202,86 197,104
               C190,108 184,120 181,140 Z" fill="${HAIR_M}"/>
      <path d="M197,104 C205,92 220,86 234,90 C222,86 210,92 205,106 Z" fill="${HAIR_M2}" opacity="0.9"/>
      <path d="M181,140 C176,116 184,104 194,100 C188,112 184,126 184,140 Z" fill="#000" opacity="0.18"/>`;

    /* ---- shirt collar / tie base (always present under jacket) ---- */
    const shirtCore = shirtOnly ? `
      <!-- full dress shirt -->
      <path class="shirt" d="M150,238 C126,244 116,262 114,290 L108,470 Q98,486 98,500 L214,500 L216,236
                              C196,250 172,252 150,238 Z"/>
      <path class="shirt" d="M310,238 C334,244 344,262 346,290 L352,470 Q362,486 362,500 L246,500 L244,236
                              C264,250 288,252 310,238 Z"/>
      <path class="shirt" d="M214,500 L246,500 L246,236 L214,236 Z"/>
      <!-- placket + collar -->
      <path class="shirtDark" d="M226,236 L234,236 L232,500 L228,500 Z"/>
      <path class="shirtDark" d="M230,232 L204,238 L224,270 Z"/>
      <path class="shirtDark" d="M230,232 L256,238 L236,270 Z"/>
      <!-- buttons down placket -->
      ${[286,326,366,406,446].map(y=>`<circle class="button" cx="230" cy="${y}" r="3.4"/>`).join('')}
      <!-- sleeves -->
      <path class="shirt" d="M150,238 C120,250 106,288 92,360 L74,452 L104,462 L120,388 C128,332 140,300 156,282 Z"/>
      <path class="shirt" d="M310,238 C340,250 354,288 368,360 L386,452 L356,462 L340,388 C332,332 320,300 304,282 Z"/>
    ` : `
      <!-- shirt V + collar behind jacket -->
      <path class="shirt" d="M198,238 L262,238 L230,360 Z"/>
      <path class="shirtDark" d="M230,232 L206,238 L226,266 Z"/>
      <path class="shirtDark" d="M230,232 L254,238 L234,266 Z"/>
      <!-- tie -->
      <path d="M223,240 L237,240 L233,262 L227,262 Z" fill="${tieColor}"/>
      <path d="M227,262 L233,262 L240,368 L230,384 L220,368 Z" fill="${tieColor}"/>
      <path d="M227,262 L233,262 L234,280 L226,280 Z" fill="#000" opacity="0.22"/>
      <path d="M220,368 L240,368 L230,384 Z" fill="#000" opacity="0.25"/>
    `;

    /* ---- trousers or bare legs ---- */
    const lower = shirtOnly ? `
      <path d="M170,500 L214,500 L210,690 L182,690 Z" fill="${SKIN}"/>
      <path d="M246,500 L290,500 L278,690 L250,690 Z" fill="${SKIN_SH}"/>
    ` : `
      <!-- trousers -->
      <path class="suit" d="M150,486 L226,486 L222,700 Q222,834 214,858 L176,858 Q170,720 176,640 L160,560 Z"/>
      <path class="suit" d="M234,486 L310,486 L300,560 L284,640 Q290,720 284,858 L246,858 Q238,834 238,700 Z"/>
      <!-- crease highlights + inseam shadow -->
      <path d="M196,520 L192,840" stroke="#fff" stroke-width="3" opacity="0.10"/>
      <path d="M266,520 L268,840" stroke="#fff" stroke-width="3" opacity="0.08"/>
      <path d="M230,492 L230,700" stroke="#000" stroke-width="6" opacity="0.10"/>
      <!-- trouser break folds -->
      <path d="M176,820 Q196,830 214,820 L214,842 Q196,850 176,842 Z" fill="#000" opacity="0.12"/>
      <path d="M246,820 Q266,830 284,820 L284,842 Q266,850 246,842 Z" fill="#000" opacity="0.12"/>
      <!-- shoes -->
      <path d="M168,856 Q166,882 176,886 L216,886 Q222,880 216,864 L214,856 Z" fill="${SHOE}"/>
      <path d="M170,860 Q188,866 210,860" fill="none" stroke="${SHOE_HI}" stroke-width="2" opacity="0.7"/>
      <path d="M246,856 L244,864 Q238,880 244,886 L284,886 Q294,882 292,856 Z" fill="${SHOE}"/>
      <path d="M250,860 Q270,866 290,860" fill="none" stroke="${SHOE_HI}" stroke-width="2" opacity="0.7"/>
    `;

    /* ---- jacket ---- */
    const jacket = shirtOnly ? "" : `
      <!-- jacket body: right panel (behind), then left overlaps at center -->
      <path class="suit" d="M230,236 L286,232 C316,238 330,262 334,300 L346,430 Q350,470 336,494
                            L262,500 Q244,500 236,492 L230,300 Z"/>
      <path class="suit" d="M230,236 L174,232 C144,238 130,262 126,300 L114,430 Q110,470 124,494
                            L198,500 Q216,500 224,492 L230,300 Z"/>
      <!-- center front shadow -->
      <path d="M230,300 L230,494" stroke="#000" stroke-width="4" opacity="0.12"/>
      <!-- inner lining facings -->
      <path class="lining" d="M198,238 L230,360 L214,360 Q184,286 186,244 Q190,238 198,238 Z"/>
      <path class="lining" d="M262,238 L230,360 L246,360 Q276,286 274,244 Q270,238 262,238 Z"/>
      <!-- lapels -->
      <path class="suit lapelL" d="M198,238 L156,236 Q168,238 170,290 L176,312 L230,360 L230,326 Z"/>
      <path class="suit lapelR" d="M262,238 L304,236 Q292,238 290,290 L284,312 L230,360 L230,326 Z"/>
      ${tux?`
        <path class="tuxfacing" d="M198,238 L156,236 Q168,238 170,290 L176,312 L230,360 L230,326 Z" opacity="0.55"/>
        <path class="tuxfacing" d="M262,238 L304,236 Q292,238 290,290 L284,312 L230,360 L230,326 Z" opacity="0.55"/>
      `:""}
      <!-- lapel piping/edge -->
      <path class="piping" fill="none" d="M198,238 L230,326 L230,360"/>
      <path class="piping" fill="none" d="M262,238 L230,326 L230,360"/>
      <!-- breast pocket square -->
      <path d="M168,320 l32,-4 l-3,-16 l-32,4 Z" fill="#f6f3ec" opacity="0.92"/>
      <path d="M168,320 l32,-4" stroke="#000" stroke-width="0.8" opacity="0.15"/>
      <!-- hip welt pockets w/ piping -->
      <path class="piping" fill="none" d="M132,420 L176,414"/>
      <rect x="132" y="420" width="46" height="5" rx="1.5" fill="#000" opacity="0.14" transform="rotate(-4 155 422)"/>
      <path class="piping" fill="none" d="M284,414 L328,420"/>
      <rect x="282" y="420" width="46" height="5" rx="1.5" fill="#000" opacity="0.14" transform="rotate(4 305 422)"/>
      <!-- front buttons -->
      <circle class="button" cx="230" cy="372" r="5.4"/>
      <circle class="button" cx="230" cy="414" r="5.4"/>
      ${three?`
        <!-- waistcoat behind jacket opening -->
        <path class="suit" d="M200,238 L260,238 L250,360 L230,392 L210,360 Z"/>
        <path class="piping" fill="none" d="M200,238 L230,392 L260,238"/>
        ${[288,312,336,360].map(y=>`<circle class="button" cx="230" cy="${y}" r="3.6"/>`).join('')}
      `:""}
      <!-- sleeves -->
      <path class="suit" d="M174,236 C142,248 128,286 114,360 L96,452 Q94,470 104,478 L134,470 L150,388 C158,330 168,300 186,282 Z"/>
      <path class="suit" d="M286,236 C318,248 332,286 346,360 L364,452 Q366,470 356,478 L326,470 L310,388 C302,330 292,300 274,282 Z"/>
      <!-- sleeve buttons -->
      ${[0,1,2].map(i=>`<circle class="button" cx="${110+i*5}" cy="${462-i*2}" r="2.2"/>`).join('')}
      ${[0,1,2].map(i=>`<circle class="button" cx="${350-i*5}" cy="${462-i*2}" r="2.2"/>`).join('')}
    `;

    /* ---- hands ---- */
    const hands = shirtOnly ? `
      <ellipse cx="86" cy="470" rx="13" ry="17" fill="${SKIN}"/>
      <ellipse cx="374" cy="470" rx="13" ry="17" fill="${SKIN_SH}"/>
    ` : `
      <ellipse cx="116" cy="486" rx="13" ry="17" fill="${SKIN}"/>
      <ellipse cx="344" cy="486" rx="13" ry="17" fill="${SKIN_SH}"/>
    `;

    /* ---- drape: light & shadow OVER the cloth ---- */
    const drape = shirtOnly ? `
      <g class="form" style="pointer-events:none">
        <path d="M118,290 C112,340 106,410 100,470 L120,470 C126,400 130,330 138,296 Z" fill="#000" opacity="0.10"/>
        <path d="M300,296 C308,330 312,400 318,470 L340,470 C334,410 328,340 322,290 Z" fill="#000" opacity="0.14"/>
        <path d="M170,250 C160,320 158,410 150,494 L176,494 C182,410 182,320 190,258 Z" fill="#fff" opacity="0.10"/>
        <path d="M214,236 L246,236 L246,500 L214,500 Z" fill="#000" opacity="0.05"/>
      </g>` : `
      <g class="form" style="pointer-events:none">
        <!-- armscye shadows -->
        <path d="M186,258 C176,300 176,360 172,430 C186,360 194,300 202,266 Z" fill="#000" opacity="0.13"/>
        <path d="M274,266 C282,300 290,360 304,430 C300,360 300,300 290,258 Z" fill="#000" opacity="0.17"/>
        <!-- side-body shadows -->
        <path d="M126,300 C118,360 112,420 118,486 L136,482 C130,420 132,360 140,308 Z" fill="#000" opacity="0.12"/>
        <path d="M334,300 C342,360 348,420 342,490 L322,486 C328,420 328,360 320,308 Z" fill="#000" opacity="0.18"/>
        <!-- chest highlight (light from upper-left) -->
        <path d="M176,300 C170,350 172,420 190,480 C186,420 188,352 196,312 Z" fill="#fff" opacity="0.12"/>
        <!-- lapel roll highlight + under-lapel shadow -->
        <path d="M200,240 L228,330 L222,330 Q196,290 194,250 Z" fill="#fff" opacity="0.12"/>
        <path d="M260,240 L232,330 L238,330 Q264,290 266,250 Z" fill="#000" opacity="0.12"/>
        <!-- sleeve fold shadows -->
        <path d="M120,340 C112,390 104,440 122,472 C118,440 122,392 132,352 Z" fill="#000" opacity="0.12"/>
        <path d="M340,340 C348,390 356,440 338,472 C342,440 338,392 328,352 Z" fill="#000" opacity="0.15"/>
        <path d="M134,300 C128,350 124,420 138,470 C136,420 140,352 148,312 Z" fill="#fff" opacity="0.08"/>
        <!-- hem shadow -->
        <path d="M120,486 Q230,506 340,486 L340,498 Q230,516 120,498 Z" fill="#000" opacity="0.10"/>
      </g>`;

    return `
    <svg viewBox="0 0 460 900" xmlns="http://www.w3.org/2000/svg" aria-label="Men's model" role="img">
      <defs data-defs>${studioDefs(P)}</defs>
      <rect width="460" height="900" fill="url(#${P}_bg)"/>
      <ellipse cx="230" cy="884" rx="150" ry="20" fill="url(#${P}_floor)"/>
      ${lower}
      ${head}
      ${shirtCore}
      ${jacket}
      ${hands}
      ${drape}
    </svg>`;
  }

  /* ============ FEMALE FIGURE ============ */
  function femaleFigure(){
    const tux   = state.garment==="tuxedo";
    const three = state.garment==="three-piece";
    const shirtOnly = state.garment==="shirt";
    const tieColor = tux? "#141416" : (PIPINGS.find(p=>p.id===state.piping)?.color || "#7a1f2b");
    const P="f";

    const head=`
      <!-- neck -->
      <path d="M216,210 q14,9 28,0 l3,30 q-17,13 -34,0 Z" fill="${SKIN_SH}"/>
      <path d="M216,210 q14,9 28,0 l1,10 q-15,10 -30,0 Z" fill="#000" opacity="0.10"/>
      <!-- hair behind shoulders -->
      <path d="M182,120 C168,220 176,300 196,352 L214,346 C196,290 190,210 196,150 Z" fill="${HAIR_F}"/>
      <path d="M278,120 C292,220 284,300 264,352 L246,346 C264,290 270,210 264,150 Z" fill="${HAIR_F}"/>
      <!-- face -->
      <path d="M192,140 C189,100 206,70 230,70 C254,70 271,100 268,140
               C265,170 250,196 230,198 C210,196 195,170 192,140 Z" fill="url(#${P}_skinV)"/>
      <path d="M254,120 C262,144 258,176 236,196 C248,176 250,150 247,126 Z" fill="${SKIN_DK}" opacity="0.28"/>
      <!-- brows -->
      <path d="M204,130 q11,-5 22,-1" fill="none" stroke="#3a2b1f" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>
      <path d="M236,129 q10,-4 20,2" fill="none" stroke="#3a2b1f" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>
      <!-- eyes w/ lashes -->
      <ellipse cx="212" cy="142" rx="6.8" ry="3.3" fill="#fdfbf7"/><circle cx="213" cy="142" r="3" fill="#4a2f1c"/><circle cx="213" cy="141.6" r="1.1" fill="#140f0a"/>
      <path d="M205,140 q7,-4 14,0" fill="none" stroke="#241a12" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="248" cy="142" rx="6.8" ry="3.3" fill="#fdfbf7"/><circle cx="247" cy="142" r="3" fill="#4a2f1c"/><circle cx="247" cy="141.6" r="1.1" fill="#140f0a"/>
      <path d="M241,140 q7,-4 14,0" fill="none" stroke="#241a12" stroke-width="1.6" stroke-linecap="round"/>
      <!-- nose -->
      <path d="M230,148 l-4,18 q4,4 9,0 Z" fill="${SKIN_SH}" opacity="0.45"/>
      <!-- lips -->
      <path d="M219,178 q11,8 22,0 q-11,4 -22,0 Z" fill="${LIP_F}"/>
      <path d="M221,179 q9,6 18,0" fill="none" stroke="#8f4d45" stroke-width="1.3" opacity="0.7"/>
      <path d="M219,178 q11,-4 22,0" fill="none" stroke="#c98079" stroke-width="1.2" opacity="0.7"/>
      <!-- hair front (centre part, soft sweep) -->
      <path d="M190,142 C184,92 206,58 230,58 C254,58 276,92 270,142
               C266,116 256,104 246,102 C244,86 238,80 230,80 C222,80 216,86 214,102
               C204,104 194,116 190,142 Z" fill="${HAIR_F}"/>
      <path d="M214,102 C210,90 220,80 230,80 C224,84 220,92 220,104 Z" fill="${HAIR_F2}" opacity="0.9"/>
      <path d="M190,142 C186,118 194,106 202,102 C196,116 192,130 192,142 Z" fill="#000" opacity="0.14"/>`;

    const shirtCore = shirtOnly ? `
      <path class="shirt" d="M162,236 C140,244 132,262 132,290 L126,452 Q118,470 118,486 L218,486 L220,234
                              C204,248 182,250 162,236 Z"/>
      <path class="shirt" d="M298,236 C320,244 328,262 328,290 L334,452 Q342,470 342,486 L242,486 L240,234
                              C258,248 278,250 298,236 Z"/>
      <path class="shirt" d="M218,486 L242,486 L242,234 L218,234 Z"/>
      <path class="shirtDark" d="M230,230 L208,236 L226,262 Z"/>
      <path class="shirtDark" d="M230,230 L252,236 L234,262 Z"/>
      ${[280,316,352,388,424].map(y=>`<circle class="button" cx="230" cy="${y}" r="3"/>`).join('')}
      <path class="shirt" d="M162,236 C136,248 124,286 112,352 L96,438 L122,448 L136,384 C144,330 152,300 166,282 Z"/>
      <path class="shirt" d="M298,236 C324,248 336,286 348,352 L364,438 L338,448 L324,384 C316,330 308,300 294,282 Z"/>
    ` : `
      <path class="shirt" d="M204,236 L256,236 L230,344 Z"/>
      <path class="shirtDark" d="M230,230 L210,236 L228,260 Z"/>
      <path class="shirtDark" d="M230,230 L250,236 L232,260 Z"/>
      ${tux?`
        <path d="M224,238 L236,238 L233,258 L227,258 Z" fill="${tieColor}"/>
        <path d="M227,258 L233,258 L239,352 L230,366 L221,352 Z" fill="${tieColor}"/>
      `:""}
    `;

    const lower = shirtOnly ? `
      <path d="M176,486 L218,486 L214,676 L188,676 Z" fill="${SKIN}"/>
      <path d="M242,486 L284,486 L272,676 L246,676 Z" fill="${SKIN_SH}"/>
    ` : (three ? `
      <!-- tailored trousers (women's) -->
      <path class="suit" d="M158,474 L228,474 L224,690 Q224,824 216,846 L182,846 Q176,712 182,636 L166,556 Z"/>
      <path class="suit" d="M232,474 L302,474 L294,556 L278,636 Q284,712 278,846 L244,846 Q236,824 236,690 Z"/>
      <path d="M198,506 L194,830" stroke="#fff" stroke-width="2.6" opacity="0.10"/>
      <path d="M262,506 L264,830" stroke="#fff" stroke-width="2.6" opacity="0.08"/>
      <path d="M230,478 L230,690" stroke="#000" stroke-width="5" opacity="0.10"/>
      <path d="M182,846 Q206,852 222,846 L216,864 Q198,870 184,864 Z" fill="${SHOE}"/>
      <path d="M238,846 Q254,852 278,846 L276,864 Q262,870 244,864 Z" fill="${SHOE}"/>
    ` : `
      <!-- pencil skirt -->
      <path class="suit" d="M172,458 L288,458 L300,632 Q230,650 160,632 Z"/>
      <path d="M230,462 V636" stroke="#000" stroke-width="2" opacity="0.08"/>
      <path d="M196,470 C190,540 188,600 196,632" stroke="#fff" stroke-width="3" opacity="0.10" fill="none"/>
      <path d="M300,632 Q230,650 160,632 L160,640 Q230,658 300,640 Z" fill="#000" opacity="0.12"/>
      <!-- legs + heels -->
      <path d="M190,636 Q184,720 186,806 L204,806 Q208,720 208,636 Z" fill="${SKIN}"/>
      <path d="M252,636 Q256,720 256,806 L274,806 Q272,720 266,636 Z" fill="${SKIN_SH}"/>
      <path d="M184,806 L206,806 L208,824 L200,836 L184,824 Z" fill="${SHOE}"/>
      <path d="M200,836 L214,858" stroke="${SHOE}" stroke-width="4"/>
      <path d="M254,806 L276,806 L276,824 L260,836 L252,824 Z" fill="${SHOE}"/>
      <path d="M260,836 L248,858" stroke="${SHOE}" stroke-width="4"/>
    `);

    const jacket = shirtOnly ? "" : `
      <!-- fitted blazer, nipped waist -->
      <path class="suit" d="M230,234 L280,230 C310,236 322,258 326,296 L338,404 Q342,446 322,470
                            L262,478 Q244,478 236,470 L230,296 Z"/>
      <path class="suit" d="M230,234 L180,230 C150,236 138,258 134,296 L122,404 Q118,446 138,470
                            L198,478 Q216,478 224,470 L230,296 Z"/>
      <path d="M230,296 L230,470" stroke="#000" stroke-width="3.5" opacity="0.12"/>
      <path class="lining" d="M204,236 L230,344 L216,344 Q190,282 192,244 Q196,236 204,236 Z"/>
      <path class="lining" d="M256,236 L230,344 L244,344 Q270,282 268,244 Q264,236 256,236 Z"/>
      <path class="suit lapelL" d="M204,236 L166,234 Q178,236 180,286 L186,306 L230,344 L230,312 Z"/>
      <path class="suit lapelR" d="M256,236 L294,234 Q282,236 280,286 L274,306 L230,344 L230,312 Z"/>
      ${tux?`
        <path class="tuxfacing" d="M204,236 L166,234 Q178,236 180,286 L186,306 L230,344 L230,312 Z" opacity="0.55"/>
        <path class="tuxfacing" d="M256,236 L294,234 Q282,236 280,286 L274,306 L230,344 L230,312 Z" opacity="0.55"/>
      `:""}
      <path class="piping" fill="none" d="M204,236 L230,312 L230,344"/>
      <path class="piping" fill="none" d="M256,236 L230,312 L230,344"/>
      <path class="piping" fill="none" d="M140,392 L178,386"/>
      <rect x="140" y="392" width="40" height="4.5" rx="1.5" fill="#000" opacity="0.13" transform="rotate(-4 160 394)"/>
      <path class="piping" fill="none" d="M282,386 L320,392"/>
      <rect x="280" y="392" width="40" height="4.5" rx="1.5" fill="#000" opacity="0.13" transform="rotate(4 300 394)"/>
      <circle class="button" cx="230" cy="356" r="4.6"/>
      <circle class="button" cx="230" cy="392" r="4.6"/>
      <!-- sleeves (slimmer) -->
      <path class="suit" d="M180,234 C150,246 138,284 126,352 L110,438 Q108,456 118,464 L146,456 L160,384 C168,328 176,300 192,282 Z"/>
      <path class="suit" d="M280,234 C310,246 322,284 334,352 L350,438 Q352,456 342,464 L314,456 L300,384 C292,328 284,300 268,282 Z"/>
    `;

    const hands = shirtOnly ? `
      <ellipse cx="108" cy="452" rx="11" ry="15" fill="${SKIN}"/>
      <ellipse cx="352" cy="452" rx="11" ry="15" fill="${SKIN_SH}"/>
    ` : `
      <ellipse cx="130" cy="470" rx="11" ry="15" fill="${SKIN}"/>
      <ellipse cx="330" cy="470" rx="11" ry="15" fill="${SKIN_SH}"/>
    `;

    const drape = shirtOnly ? `
      <g class="form" style="pointer-events:none">
        <path d="M134,290 C128,340 122,400 118,470 L138,470 C144,400 148,336 152,296 Z" fill="#000" opacity="0.10"/>
        <path d="M308,296 C312,336 316,400 322,470 L342,470 C338,400 332,340 326,290 Z" fill="#000" opacity="0.14"/>
        <path d="M176,250 C168,320 168,406 162,486 L186,486 C190,406 190,320 196,262 Z" fill="#fff" opacity="0.10"/>
      </g>` : `
      <g class="form" style="pointer-events:none">
        <path d="M192,258 C184,300 184,356 182,420 C192,356 198,300 206,266 Z" fill="#000" opacity="0.12"/>
        <path d="M268,266 C276,300 282,356 292,420 C288,356 288,300 280,258 Z" fill="#000" opacity="0.16"/>
        <path d="M134,296 C126,352 122,404 130,470 L146,466 C140,404 142,352 150,304 Z" fill="#000" opacity="0.12"/>
        <path d="M326,296 C334,352 338,404 330,470 L314,466 C320,404 320,352 312,304 Z" fill="#000" opacity="0.17"/>
        <path d="M182,296 C176,346 178,410 194,466 C190,410 192,348 200,308 Z" fill="#fff" opacity="0.12"/>
        <path d="M206,238 L228,318 L222,318 Q198,282 200,248 Z" fill="#fff" opacity="0.12"/>
        <path d="M254,238 L232,318 L238,318 Q262,282 260,248 Z" fill="#000" opacity="0.12"/>
        <path d="M128,340 C120,388 114,432 130,464 C126,432 130,388 140,350 Z" fill="#000" opacity="0.12"/>
        <path d="M332,340 C340,388 346,432 330,464 C334,432 330,388 320,350 Z" fill="#000" opacity="0.15"/>
      </g>`;

    return `
    <svg viewBox="0 0 460 900" xmlns="http://www.w3.org/2000/svg" aria-label="Women's model" role="img">
      <defs data-defs>${studioDefs(P)}</defs>
      <rect width="460" height="900" fill="url(#${P}_bg)"/>
      <ellipse cx="230" cy="868" rx="140" ry="18" fill="url(#${P}_floor)"/>
      ${lower}
      ${head}
      ${shirtCore}
      ${jacket}
      ${hands}
      ${drape}
    </svg>`;
  }

  /* ============ RENDER ============ */
  function paint(){
    if(state.mode==="photo"){ renderPhoto(); return; }
    renderIllustrated();
  }
  function renderIllustrated(){
    stage.innerHTML = state.gender==="male"? maleFigure() : femaleFigure();
    const svg=stage.querySelector('svg'); const defs=svg.querySelector('[data-defs]');
    const suit=fabricById(state.suit), shirt=fabricById(state.shirt);
    OPTPattern.ensure(defs, suit, 1);
    OPTPattern.ensure(defs, shirt, 1);
    const suitFill=OPTPattern.fillRef(suit), shirtFill=OPTPattern.fillRef(shirt);
    svg.querySelectorAll('.suit').forEach(el=>el.setAttribute('fill',suitFill));
    svg.querySelectorAll('.shirt').forEach(el=>el.setAttribute('fill',shirtFill));
    svg.querySelectorAll('.shirtDark').forEach(el=>{el.setAttribute('fill',OPTPattern.shade(shirt.palette.base,-0.12));});
    const lin=LININGS.find(l=>l.id===state.lining).color;
    svg.querySelectorAll('.lining').forEach(el=>el.setAttribute('fill',lin));
    svg.querySelectorAll('.tuxfacing').forEach(el=>el.setAttribute('fill', OPTPattern.shade(suit.palette.base,-0.3)));
    const pip=PIPINGS.find(p=>p.id===state.piping).color;
    svg.querySelectorAll('.piping').forEach(el=>{
      if(pip){ el.setAttribute('stroke',pip); el.setAttribute('stroke-width','2.6'); el.setAttribute('stroke-linejoin','round'); }
      else { el.setAttribute('stroke','none'); }
    });
    const bt=BUTTONS.find(b=>b.id===state.button).color;
    svg.querySelectorAll('.button').forEach(el=>{el.setAttribute('fill',bt);el.setAttribute('stroke','rgba(0,0,0,.28)');el.setAttribute('stroke-width','0.7');});
    updateSummary();
  }

  /* ============ CONTROLS ============ */
  function segBtns(name, opts, cur){
    return opts.map(o=>`<button data-seg="${name}" data-val="${o.v}" class="${o.v===cur?'active':''}">${o.l}</button>`).join('');
  }
  function fabSwatchBtns(list, cur, key){
    return list.map(f=>`<button class="swatch-btn ${f.id===cur?'active':''}" data-fab="${key}" data-val="${f.id}" title="${f.name}">${OPTPattern.swatch(f,60,60)}</button>`).join('');
  }
  function colorBtns(list, cur, key){
    return list.map(c=>{
      if(c.color===null) return `<button class="chip-btn ${c.id===cur?'active':''}" data-color="${key}" data-val="${c.id}">${c.name}</button>`;
      return `<button class="swatch-btn color ${c.id===cur?'active':''}" data-color="${key}" data-val="${c.id}" title="${c.name}" style="background:${c.color}"></button>`;
    }).join('');
  }

  const controls=document.querySelector('[data-controls]');
  function buildControls(){
    const suitName=fabricById(state.suit).name, shirtName=fabricById(state.shirt).name;
    controls.innerHTML=`
      <div class="group" data-garmentgroup>
        <label>Garment <span class="val">${label('garment')}</span></label>
        <div class="seg">${segBtns('garment',[{v:'two-piece',l:'Two-Piece'},{v:'three-piece',l:'Three-Piece'},{v:'tuxedo',l:'Tuxedo'},{v:'shirt',l:'Shirt'}],state.garment)}</div>
      </div>
      <div class="group" data-suitgroup>
        <label>Suit Cloth <span class="val" data-suitname>${suitName}</span></label>
        <div class="fab-scroll"><div class="opt-row">${fabSwatchBtns(SUITINGS,state.suit,'suit')}</div></div>
      </div>
      <div class="group">
        <label>Shirt Cloth <span class="val" data-shirtname>${shirtName}</span></label>
        <div class="fab-scroll"><div class="opt-row">${fabSwatchBtns(SHIRTINGS,state.shirt,'shirt')}</div></div>
      </div>
      <div class="group" data-liningroup>
        <label>Lining <span class="val">${LININGS.find(l=>l.id===state.lining).name}</span></label>
        <div class="opt-row">${colorBtns(LININGS,state.lining,'lining')}</div>
      </div>
      <div class="group" data-pipinggroup>
        <label>Piping / Edge <span class="val">${PIPINGS.find(p=>p.id===state.piping).name}</span></label>
        <div class="opt-row">${colorBtns(PIPINGS,state.piping,'piping')}</div>
      </div>
      <div class="group">
        <label>Buttons <span class="val">${BUTTONS.find(b=>b.id===state.button).name}</span></label>
        <div class="opt-row">${colorBtns(BUTTONS,state.button,'button')}</div>
      </div>`;
    reflectGarment();
  }
  function label(k){
    if(k==='garment'){
      if(state.mode==='photo') return MODELS[state.gender].garment;
      return ({'two-piece':'Two-Piece Suit','three-piece':'Three-Piece Suit','tuxedo':'Tuxedo','shirt':'Shirt Only'})[state.garment];
    }
  }
  function reflectGarment(){
    const photo=state.mode==='photo';
    const gg=controls.querySelector('[data-garmentgroup]'); if(gg) gg.style.display=photo?'none':'';
    const shirtOnly=(!photo)&&state.garment==='shirt';
    controls.querySelector('[data-suitgroup]').style.display=shirtOnly?'none':'';
    controls.querySelector('[data-liningroup]').style.display=shirtOnly?'none':'';
    controls.querySelector('[data-pipinggroup]').style.display=shirtOnly?'none':'';
  }

  controls.addEventListener('click',e=>{
    const seg=e.target.closest('[data-seg]');
    if(seg){ state.garment=seg.getAttribute('data-val'); buildControls(); paint(); return; }
    const fab=e.target.closest('[data-fab]');
    if(fab){ const key=fab.getAttribute('data-fab'); state[key]=fab.getAttribute('data-val');
      fab.parentElement.querySelectorAll('.swatch-btn').forEach(b=>b.classList.toggle('active',b===fab));
      const nm=controls.querySelector(key==='suit'?'[data-suitname]':'[data-shirtname]'); if(nm)nm.textContent=fabricById(state[key]).name;
      paint(); return; }
    const col=e.target.closest('[data-color]');
    if(col){ const key=col.getAttribute('data-color'); state[key]=col.getAttribute('data-val');
      col.parentElement.querySelectorAll('[data-color]').forEach(b=>b.classList.toggle('active',b===col));
      const lab=col.closest('.group').querySelector('.val');
      const src=key==='lining'?LININGS:key==='piping'?PIPINGS:BUTTONS;
      if(lab)lab.textContent=src.find(x=>x.id===state[key]).name;
      paint(); return; }
  });

  /* Mode toggle (Photographic / Illustrated) */
  document.querySelectorAll('[data-mode]').forEach(b=>{
    b.addEventListener('click',()=>{
      state.mode=b.getAttribute('data-mode');
      document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));
      buildControls();
      paint();
    });
  });

  /* Gender toggle (outside controls) */
  document.querySelectorAll('[data-gender]').forEach(b=>{
    b.addEventListener('click',()=>{
      state.gender=b.getAttribute('data-gender');
      document.querySelectorAll('[data-gender]').forEach(x=>x.classList.toggle('active',x===b));
      if(state.mode!=='photo') { /* illustrated: no garment change */ }
      buildControls();          // garment label may depend on gender in photo mode
      paint();
    });
  });

  /* Summary */
  function updateSummary(){
    const s=document.querySelector('[data-summary]'); if(!s)return;
    const showSuit = state.mode==='photo' || state.garment!=='shirt';
    const rows=[['Model',state.gender==='male'?'Men’s':'Women’s'],
      ['Garment',label('garment')]];
    if(showSuit) rows.push(['Suit cloth',fabricById(state.suit).name]);
    rows.push(['Shirt cloth',fabricById(state.shirt).name]);
    if(showSuit){
      rows.push(['Lining',LININGS.find(l=>l.id===state.lining).name]);
      rows.push(['Piping',PIPINGS.find(p=>p.id===state.piping).name]);
    }
    rows.push(['Buttons',BUTTONS.find(b=>b.id===state.button).name]);
    s.querySelector('ul').innerHTML=rows.map(r=>`<li><span>${r[0]}</span><span>${r[1]}</span></li>`).join('');
    const link=s.querySelector('[data-request]');
    if(link){
      const body=encodeURIComponent('I would like to commission the following from Vicky\'s Fashion:\n\n'+rows.map(r=>r[0]+': '+r[1]).join('\n')+'\n\nName:\nPreferred date/time for a fitting:');
      link.href='mailto:hello@vickysfashion.com?subject='+encodeURIComponent('Made-to-Measure enquiry')+'&body='+body;
    }
  }

  /* init */
  buildControls();
  paint();
})();
