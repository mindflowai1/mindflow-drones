(() => {
  'use strict';
  const config = window.AEROVISION || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const setMenu = open => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    navigation.classList.toggle('open', open);
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { setMenu(false); menuButton.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) setMenu(false); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
  document.querySelector('#year').textContent = new Date().getFullYear();

  const imageValue = path => `url(${JSON.stringify(path)})`;
  document.querySelectorAll('[data-media]').forEach(element => {
    const path = config.media?.[element.dataset.media];
    if (!path) return;
    element.style.backgroundImage = imageValue(path);
    element.querySelectorAll(':scope > small, :scope > span').forEach(label => { label.hidden = true; });
  });
  if (config.media?.hero || config.heroVideo) document.querySelector('.media-caption').hidden = true;
  if (config.heroVideo) {
    const hero = document.querySelector('.hero');
    const scene = document.querySelector('.scene-hero');
    const video = document.createElement('video');
    const poster = config.media?.hero || 'assets/hero-poster.jpg';
    scene.style.backgroundImage = imageValue(poster);
    video.poster = poster;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = !reducedMotion.matches;
    ['muted', 'playsinline', 'loop'].forEach(name => video.setAttribute(name, ''));
    video.preload = 'metadata';
    video.src = config.heroVideo;
    scene.append(video);

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className = 'hero-play-background';
    playButton.innerHTML = '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/></svg> Reproduzir fundo';
    playButton.hidden = true;
    hero.append(playButton);
    let visible = hero.getBoundingClientRect().bottom > 0 && hero.getBoundingClientRect().top < innerHeight;
    let blocked = false;
    let pending = false;
    const allowed = () => visible && !document.hidden && !reducedMotion.matches;
    const updateButton = () => { playButton.hidden = !blocked || !allowed(); };
    const attemptPlay = () => {
      if (!allowed() || pending || !video.paused) return;
      pending = true;
      // Keep play() directly in the gesture handler for Safari user activation.
      video.play().catch(error => {
        if (error.name !== 'AbortError') blocked = true;
      }).finally(() => { pending = false; updateButton(); });
    };
    video.addEventListener('playing', () => {
      if (!allowed()) { video.pause(); return; }
      blocked = false;
      scene.classList.add('hero-video-playing');
      updateButton();
    });
    video.addEventListener('error', () => {
      blocked = true;
      scene.classList.remove('hero-video-playing');
      updateButton();
    });
    const syncPlayback = () => {
      video.autoplay = !reducedMotion.matches;
      if (allowed()) attemptPlay();
      else video.pause();
      if (reducedMotion.matches) scene.classList.remove('hero-video-playing');
      updateButton();
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        syncPlayback();
      }).observe(hero);
    }
    playButton.addEventListener('click', attemptPlay);
    const retryOnGesture = () => { if (blocked) attemptPlay(); };
    document.addEventListener('touchend', retryOnGesture, { passive: true });
    document.addEventListener('click', retryOnGesture);
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pageshow', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);
    syncPlayback();
  }

  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll('.reveal').forEach((element, index) => {
      element.style.setProperty('--delay', `${(index % 3) * 65}ms`);
      revealObserver.observe(element);
    });
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.querySelectorAll('a').forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }), { rootMargin: '-25% 0px -45% 0px' });
    document.querySelectorAll('main > section').forEach(section => sectionObserver.observe(section));
  }

  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    document.querySelector('#service-select').value = link.dataset.service;
  }));
  const dialogs = document.querySelectorAll('dialog');
  const openDialog = dialog => { dialog.showModal(); document.body.classList.add('modal-open'); };
  dialogs.forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (dialog.id === 'video-dialog') document.querySelector('#portfolio-video').pause();
    });
  });
  document.querySelector('#film-open').addEventListener('click', () => {
    const film = config.films[0];
    const video = document.querySelector('#portfolio-video');
    video.src = film.video; video.poster = film.poster || '';
    openDialog(document.querySelector('#video-dialog'));
    video.play().catch(() => {});
  });
  const whatsapp = String(config.whatsapp || '').replace(/\D/g, '');
  const hasWhatsApp = /^\d{12,15}$/.test(whatsapp);
  if (hasWhatsApp) {
    document.querySelector('#submit-quote').firstChild.textContent = 'Continuar no WhatsApp ';
    document.querySelector('#form-note').textContent = 'A mensagem será preenchida. Revise e toque em Enviar no WhatsApp.';
  }
  document.querySelector('#quote-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const lines = ['Olá, Aerovision! Vim pelo site e gostaria de um orçamento para uma produção com drone.', '', `Nome: ${String(data.get('name')).trim()}`];
    lines.push(`Tipo de projeto: ${data.get('service')}`);
    const message = String(data.get('message') || '').trim();
    if (message) lines.push('', message);
    const summary = lines.join('\n');
    if (hasWhatsApp) {
      document.querySelector('#form-feedback').textContent = 'No WhatsApp, revise a mensagem e toque em Enviar para concluir.';
      window.location.assign(`https://wa.me/${whatsapp}?text=${encodeURIComponent(summary)}`);
    } else {
      document.querySelector('#quote-summary').value = summary;
      document.querySelector('#copy-status').textContent = '';
      openDialog(document.querySelector('#quote-dialog'));
    }
  });
  document.querySelector('#copy-quote').addEventListener('click', async () => {
    const summary = document.querySelector('#quote-summary');
    try {
      await navigator.clipboard.writeText(summary.value);
      document.querySelector('#copy-status').textContent = 'Pedido copiado. Ele ainda não foi enviado.';
    } catch {
      summary.focus(); summary.select();
      document.querySelector('#copy-status').textContent = 'Texto selecionado. Use a opção Copiar do seu dispositivo.';
    }
  });
})();
