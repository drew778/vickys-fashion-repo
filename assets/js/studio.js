/* ============================================================
   VICKY'S FASHION — Design Studio (configurator)
   Photographic studio models whose garments take the real
   cloth, buttons (and, in the open-jacket look, lining and
   piping) chosen on the right. The cloth pattern is rasterised
   to a tile, laid over the garment cut-out and multiplied by
   the photo's own light so it reads as real cloth on a body.
   ============================================================ */
(function(){
  const stage=document.querySelector('[data-stage]');
  if(!stage) return;

  const state={
    gender:"male",
    look:"front",                  // front | open
    suit:"nvy-120",
    shirt:"wht-pop",
    lining:"ln-burg",
    piping:"pp-none",
    button:"bt-horn"
  };

  /* ============ PHOTOGRAPHIC MODELS (real photos, live recolour) ============ */
  const D="assets/img/studio/";
  const MODELS={
    male:{ w:768, h:1152, garment:"Three-Piece Suit", btnR:5, looks:{
      front:{ base:D+"male_base.jpg", suit:D+"male_suit.png", shirt:D+"male_shirt.png",
              buttons:[[338,393],[325,453],                                      // jacket front buttons
                [383,372],[383,405],[382,438],[369,468],                         // waistcoat column
                [241,508,2.6],[244,516,2.6],[247,524,2.6],                       // left cuff
                [509,508,2.6],[506,516,2.6],[503,524,2.6]] },                    // right cuff
      open:{ base:D+"male_open_base.jpg", suit:D+"male_open_suit.png", shirt:D+"male_open_shirt.png",
             lining:D+"male_open_lining.png", piping:D+"male_open_piping.png",
             buttons:[[388,343,4.5],[388,374,4.5],[387,405,4.5],[387,437,4.5],[386,468,4.5]] } } },
    female:{ w:768, h:1152, garment:"Skirt Suit", btnR:6, looks:{
      front:{ base:D+"female_base.jpg", suit:D+"female_suit.png", shirt:D+"female_shirt.png",
              buttons:[[388,381]] },                                             // blazer button
      open:{ base:D+"female_open_base.jpg", suit:D+"female_open_suit.png", shirt:D+"female_open_shirt.png",
             lining:D+"female_open_lining.png", piping:D+"female_open_piping.png",
             buttons:[] } } }
  };
  // preload model layers
  Object.keys(MODELS).forEach(g=>{
    Object.values(MODELS[g].looks).forEach(L=>{ L.img={};
      ["base","suit","shirt","lining","piping"].forEach(k=>{ if(!L[k])return;
        const im=new Image(); im.src=L[k]; L.img[k]=im; }); });
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
  function compositeRegion(ctx, fill, shadeImg, M){
    // fill: an image tile (repeated pattern) or a solid CSS colour string
    const off=document.createElement("canvas"); off.width=M.w; off.height=M.h; const o=off.getContext("2d");
    o.fillStyle=(typeof fill==="string")? fill : o.createPattern(fill,"repeat");
    o.fillRect(0,0,M.w,M.h);
    o.globalCompositeOperation="multiply"; o.drawImage(shadeImg,0,0,M.w,M.h);
    o.globalCompositeOperation="destination-in"; o.drawImage(shadeImg,0,0,M.w,M.h);
    ctx.drawImage(off,0,0);
  }
  let photoToken=0;
  function renderPhoto(){
    const my=++photoToken, g=state.gender, M=MODELS[g], L=M.looks[state.look]||M.looks.front;
    let cv=stage.querySelector("canvas[data-photo]");
    if(!cv){ stage.innerHTML=`<canvas data-photo width="${M.w}" height="${M.h}" style="width:100%;max-width:430px;height:auto;border-radius:12px;display:block;margin:0 auto"></canvas>`; cv=stage.querySelector("canvas[data-photo]"); }
    cv.width=M.w; cv.height=M.h;
    const ctx=cv.getContext("2d");
    const suit=fabricById(state.suit), shirt=fabricById(state.shirt);
    const layers=[imgReady(L.img.base),imgReady(L.img.suit),imgReady(L.img.shirt),tilePromise(suit),tilePromise(shirt)];
    if(L.img.lining) layers.push(imgReady(L.img.lining));
    if(L.img.piping) layers.push(imgReady(L.img.piping));
    Promise.all(layers)
      .then(([base,suitShade,shirtShade,suitTile,shirtTile,liningShade,pipingShade])=>{
        if(my!==photoToken) return;            // superseded by a newer selection
        ctx.clearRect(0,0,M.w,M.h);
        ctx.drawImage(base,0,0,M.w,M.h);
        compositeRegion(ctx, suitTile, suitShade, M);
        compositeRegion(ctx, shirtTile, shirtShade, M);
        if(liningShade){
          const lin=LININGS.find(l=>l.id===state.lining).color;
          compositeRegion(ctx, lin, liningShade, M);
          if(pipingShade){
            // "None" piping reads as a self-coloured lining edge
            const pip=PIPINGS.find(p=>p.id===state.piping).color || lin;
            compositeRegion(ctx, pip, pipingShade, M);
          }
        }
        drawButtons(ctx, L, M);
      });
    updateSummary();
  }
  function drawButtons(ctx, L, M){
    const col=(BUTTONS.find(b=>b.id===state.button)||{}).color||"#222";
    const dr=M.btnR||5;
    (L.buttons||[]).forEach(([x,y,rr])=>{
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

  /* ============ RENDER ============ */
  function paint(){ renderPhoto(); }

  /* ============ CONTROLS ============ */
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
      <div class="group">
        <label>Suit Cloth <span class="val" data-suitname>${suitName}</span></label>
        <div class="fab-scroll"><div class="opt-row">${fabSwatchBtns(SUITINGS,state.suit,'suit')}</div></div>
      </div>
      <div class="group">
        <label>Shirt Cloth <span class="val" data-shirtname>${shirtName}</span></label>
        <div class="fab-scroll"><div class="opt-row">${fabSwatchBtns(SHIRTINGS,state.shirt,'shirt')}</div></div>
      </div>
      <div class="group">
        <label>Lining <span class="val">${LININGS.find(l=>l.id===state.lining).name}</span></label>
        <div class="opt-row">${colorBtns(LININGS,state.lining,'lining')}</div>
      </div>
      <div class="group">
        <label>Piping / Edge <span class="val">${PIPINGS.find(p=>p.id===state.piping).name}</span></label>
        <div class="opt-row">${colorBtns(PIPINGS,state.piping,'piping')}</div>
      </div>
      <div class="group">
        <label>Buttons <span class="val">${BUTTONS.find(b=>b.id===state.button).name}</span></label>
        <div class="opt-row">${colorBtns(BUTTONS,state.button,'button')}</div>
      </div>`;
  }

  controls.addEventListener('click',e=>{
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

  /* Gender toggle (outside controls) */
  document.querySelectorAll('[data-gender]').forEach(b=>{
    b.addEventListener('click',()=>{
      state.gender=b.getAttribute('data-gender');
      document.querySelectorAll('[data-gender]').forEach(x=>x.classList.toggle('active',x===b));
      paint();
    });
  });

  /* Look toggle (Front / Jacket Open) */
  document.querySelectorAll('[data-look]').forEach(b=>{
    b.addEventListener('click',()=>{
      state.look=b.getAttribute('data-look');
      document.querySelectorAll('[data-look]').forEach(x=>x.classList.toggle('active',x===b));
      paint();
    });
  });

  /* Summary */
  function updateSummary(){
    const s=document.querySelector('[data-summary]'); if(!s)return;
    const rows=[['Model',state.gender==='male'?'Men’s':'Women’s'],
      ['Garment',MODELS[state.gender].garment],
      ['Suit cloth',fabricById(state.suit).name],
      ['Shirt cloth',fabricById(state.shirt).name],
      ['Lining',LININGS.find(l=>l.id===state.lining).name],
      ['Piping',PIPINGS.find(p=>p.id===state.piping).name],
      ['Buttons',BUTTONS.find(b=>b.id===state.button).name]];
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
