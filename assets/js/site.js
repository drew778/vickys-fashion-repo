/* ============================================================
   VICKY'S FASHION — Site behaviours
   ============================================================ */
(function(){
  /* Header scroll state */
  const header=document.querySelector('.site-header');
  if(header && header.classList.contains('js-scroll')){
    const onScroll=()=>header.classList.toggle('scrolled',window.scrollY>40);
    onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
  }
  /* Mobile nav */
  const toggle=document.querySelector('.nav-toggle'), nav=document.querySelector('.nav');
  if(toggle&&nav){ toggle.addEventListener('click',()=>nav.classList.toggle('open')); }

  /* Reveal on scroll */
  const io=new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:.14});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

  /* ---------- Fabric catalogue ---------- */
  const grid=document.querySelector('[data-fabric-grid]');
  if(grid && window.OPTPattern){
    const source = grid.getAttribute('data-source')==='shirt' ? SHIRTINGS : SUITINGS;
    const collections=['All',...Array.from(new Set(source.map(f=>f.collection)))];
    const filterWrap=document.querySelector('[data-filters]');
    const countEl=document.querySelector('[data-count]');
    let active='All';

    function render(){
      const list=active==='All'?source:source.filter(f=>f.collection===active);
      grid.innerHTML=list.map(f=>`
        <article class="fabric reveal" data-id="${f.id}">
          <div class="swatch">${OPTPattern.swatch(f,300,225)}</div>
          <div class="meta">
            <div class="coll">${f.collection}</div>
            <h4>${f.name}</h4>
            <div class="spec">${f.comp} · ${f.weight}</div>
          </div>
        </article>`).join('');
      if(countEl) countEl.textContent=list.length+' cloths';
      grid.querySelectorAll('.fabric').forEach(el=>{
        el.classList.add('in');
        el.addEventListener('click',()=>openFabric(el.getAttribute('data-id'),source));
      });
    }
    if(filterWrap){
      filterWrap.innerHTML=collections.map((c,i)=>`<button class="chip${i===0?' active':''}" data-coll="${c}">${c}</button>`).join('')
        +'<span class="count" data-count></span>';
    }
    document.querySelector('[data-filters]')?.addEventListener('click',e=>{
      const b=e.target.closest('.chip'); if(!b)return;
      active=b.getAttribute('data-coll');
      document.querySelectorAll('[data-filters] .chip').forEach(c=>c.classList.toggle('active',c===b));
      render();
    });
    render();
  }

  /* Fabric modal */
  function openFabric(id,source){
    const f=source.find(x=>x.id===id)||fabricById(id); if(!f)return;
    let modal=document.querySelector('.modal');
    if(!modal){ modal=document.createElement('div'); modal.className='modal'; document.body.appendChild(modal); }
    modal.innerHTML=`
      <div class="modal__card">
        <button class="modal__close" aria-label="Close">×</button>
        <div class="modal__swatch">${OPTPattern.swatch(f,600,600)}</div>
        <div class="modal__body">
          <div class="coll">${f.collection}</div>
          <h3>${f.name}</h3>
          <p class="muted">A ${f.mill==='Jorge Carli'?'Jorge Carli exclusive':'house'} cloth, cut and canvassed to your measure.</p>
          <ul class="modal__spec">
            <li><span>Composition</span><span>${f.comp}</span></li>
            <li><span>Weight</span><span>${f.weight}</span></li>
            <li><span>Weave</span><span>${f.weave.replace(/-/g,' ')}</span></li>
            <li><span>Mill</span><span>${f.mill}</span></li>
          </ul>
          <a class="btn btn--brass" href="studio.html?fabric=${f.id}">Try it in the Studio</a>
        </div>
      </div>`;
    modal.classList.add('open');
    const close=()=>modal.classList.remove('open');
    modal.querySelector('.modal__close').addEventListener('click',close);
    modal.addEventListener('click',e=>{ if(e.target===modal) close(); });
    document.addEventListener('keydown',function esc(ev){ if(ev.key==='Escape'){close();document.removeEventListener('keydown',esc);} });
  }

  /* ---------- Lookbook lightbox ---------- */
  const shots=Array.from(document.querySelectorAll('[data-lightbox]'));
  if(shots.length){
    let box=document.querySelector('.lightbox');
    if(!box){
      box=document.createElement('div');box.className='lightbox';
      box.innerHTML=`<button class="lb-close" aria-label="Close">×</button>
        <button class="lb-nav lb-prev" aria-label="Previous">‹</button>
        <img alt="">
        <button class="lb-nav lb-next" aria-label="Next">›</button>`;
      document.body.appendChild(box);
    }
    const imgEl=box.querySelector('img'); let idx=0;
    const srcs=shots.map(s=>s.getAttribute('data-full')||s.querySelector('img').src);
    const show=i=>{ idx=(i+srcs.length)%srcs.length; imgEl.src=srcs[idx]; };
    shots.forEach((s,i)=>s.addEventListener('click',()=>{ show(i); box.classList.add('open'); }));
    box.querySelector('.lb-close').addEventListener('click',()=>box.classList.remove('open'));
    box.querySelector('.lb-prev').addEventListener('click',e=>{e.stopPropagation();show(idx-1);});
    box.querySelector('.lb-next').addEventListener('click',e=>{e.stopPropagation();show(idx+1);});
    box.addEventListener('click',e=>{ if(e.target===box) box.classList.remove('open'); });
    document.addEventListener('keydown',e=>{
      if(!box.classList.contains('open'))return;
      if(e.key==='Escape')box.classList.remove('open');
      if(e.key==='ArrowLeft')show(idx-1);
      if(e.key==='ArrowRight')show(idx+1);
    });
  }
})();
