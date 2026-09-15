(() => {
  const section = document.querySelector('.portfolio-motion');
  const stage = section.querySelector('.portfolio-stage');
  const canvas = document.querySelector('#portfolio-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx || !('createImageBitmap' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cache = new Map();
  const pending = new Set();
  const failed = new Set();
  const count = 50;
  let target = 0, drawn = -1, active = false, raf = 0, revision = 0;
  const chapterNumber = document.querySelector('#chapter-number');
  const chapterTitle = document.querySelector('#chapter-title');
  const chapterDescription = document.querySelector('#chapter-description');
  const chapters = [
    ['01', 'O contexto', 'Toda história começa com um lugar.'],
    ['02', 'A arquitetura', 'Linhas, espaços e novas possibilidades.'],
    ['03', 'Os detalhes', 'Uma aproximação que revela valor.']
  ];
  let chapter = -1;
  const clamp = n => Math.min(1, Math.max(0, n));
  const smooth = n => n * n * (3 - 2 * n);
  function draw() {
    if (!cache.size) return;
    const index = [...cache.keys()].sort((a,b) => Math.abs(a-target)-Math.abs(b-target))[0];
    if (index === drawn) return;
    const frame = cache.get(index);
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
    drawn = index;
    canvas.dataset.frame = String(index + 1);
    canvas.style.opacity = '1';
  }
  function requestFrame(index) {
    if (cache.has(index) || pending.has(index) || failed.has(index)) return;
    pending.add(index);
    const generation = revision;
    fetch(`ezgif-6f0d38f3732351ee-jpg/ezgif-frame-${String(index+1).padStart(3,'0')}.jpg`)
      .then(response => { if (!response.ok) throw Error('Frame indisponível'); return response.blob(); })
      .then(blob => createImageBitmap(blob, { resizeWidth: canvas.width, resizeHeight: canvas.height, resizeQuality: 'medium' }))
      .then(bitmap => {
        if (generation !== revision) { bitmap.close(); return; }
        cache.set(index, bitmap);
        while (cache.size > 16) {
          const farthest = [...cache.keys()].sort((a,b) => Math.abs(b-target)-Math.abs(a-target))[0];
          cache.get(farthest).close(); cache.delete(farthest);
        }
        draw();
      })
      .catch(() => failed.add(index))
      .finally(() => { pending.delete(index); if (active) preload(); });
  }
  function preload() {
    if (reduced.matches) return;
    const candidates = [target];
    for (let distance=1; distance<=5; distance++) candidates.push(target+distance,target-distance);
    for (const index of candidates) {
      if (pending.size >= 3) break;
      if (index >= 0 && index < count) requestFrame(index);
    }
  }
  function tick() {
    raf = 0;
    if (!active || reduced.matches || document.hidden) return;
    const bounds = section.getBoundingClientRect();
    const travel = section.offsetHeight - stage.offsetHeight;
    const progress = clamp(-bounds.top / Math.max(1,travel));
    stage.style.setProperty('--progress', progress);
    target = Math.round(clamp(progress/.94)*(count-1));
    const nextChapter = progress < .34 ? 0 : progress < .68 ? 1 : 2;
    if (nextChapter !== chapter) {
      chapter = nextChapter;
      [chapterNumber.textContent, chapterTitle.textContent, chapterDescription.textContent] = chapters[chapter];
    }
    draw(); preload();
    raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf && active && !reduced.matches) raf=requestAnimationFrame(tick); }
  function resize() {
    const width = innerWidth < 761 ? 800 : 1280;
    if (canvas.width !== width) {
      revision++; cache.forEach(frame=>frame.close()); cache.clear();
      canvas.width=width; canvas.height=Math.round(width*9/16); drawn=-1;
    }
    start();
  }
  function mode() {
    section.classList.toggle('sequence-enabled', !reduced.matches);
    if (reduced.matches) { cancelAnimationFrame(raf); raf=0; }
    else start();
  }
  new IntersectionObserver(entries => {
    active=entries[0].isIntersecting;
    if (active) start(); else { cancelAnimationFrame(raf); raf=0; }
  }, { rootMargin:'500px 0px' }).observe(section);
  window.addEventListener('resize', resize, {passive:true});
  document.addEventListener('visibilitychange', start);
  reduced.addEventListener('change', mode);
  resize(); mode();
})();
