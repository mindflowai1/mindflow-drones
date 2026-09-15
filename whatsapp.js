(() => {
  'use strict';
  const phone = String(window.AEROVISION?.whatsapp || '').replace(/\D/g, '');
  if (!/^\d{12,15}$/.test(phone)) return;
  const services = document.querySelector('#servicos');
  const hero = document.querySelector('#inicio');
  const mobile = matchMedia('(max-width: 760px)');
  const key = 'aerovision-whatsapp-seen';
  let seen = false;
  try { seen = sessionStorage.getItem(key) === '1'; } catch {}
  const remember = () => { seen = true; try { sessionStorage.setItem(key, '1'); } catch {} };
  const widget = document.createElement('aside');
  widget.className = 'whatsapp-widget';
  widget.setAttribute('aria-label', 'Contato pelo WhatsApp');
  widget.hidden = true;
  const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.5-4.7a8.5 8.5 0 1 1 16-4.2Z"/><path d="M8.3 7.5c-.8.6-.9 1.6-.4 2.7 1.1 2.5 3 4.3 5.5 5.2 1.1.4 2 .1 2.5-.7l.4-1-2.5-1.2-.9 1c-1.4-.6-2.5-1.7-3.2-3l.9-.9-1.2-2.4Z"/></svg>';
  widget.innerHTML = `<section class="whatsapp-panel" id="whatsapp-panel" aria-labelledby="whatsapp-title" hidden>
    <div class="whatsapp-heading"><span>${icon} AEROVISION</span><button class="whatsapp-close" type="button" aria-label="Recolher convite do WhatsApp"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>
    <h2 id="whatsapp-title">Vamos dar um novo olhar ao seu projeto?</h2>
    <p>Converse sobre sua produção em Lagoa Santa e região.</p>
    <a class="whatsapp-action" target="_blank" rel="noopener noreferrer">Conversar no WhatsApp <span aria-hidden="true"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a>
  </section><button class="whatsapp-launcher" type="button" aria-expanded="false" aria-controls="whatsapp-panel">${icon}<span>Vamos conversar?</span></button>`;
  document.body.append(widget);
  const panel = widget.querySelector('.whatsapp-panel');
  const launcher = widget.querySelector('.whatsapp-launcher');
  const close = widget.querySelector('.whatsapp-close');
  const action = widget.querySelector('.whatsapp-action');
  action.href = `https://wa.me/${phone}?text=${encodeURIComponent('Olá! Vim pelo site da Aerovision e gostaria de conversar sobre uma produção com drone.')}`;
  let ready = false;
  let timer = null;
  const expand = (open, focus = false) => {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    launcher.querySelector('span').textContent = open ? 'WhatsApp' : 'Vamos conversar?';
    if (focus) (open ? close : launcher).focus({ preventScroll: true });
  };
  const eligible = () => hero.getBoundingClientRect().bottom <= 90 && services.getBoundingClientRect().top < innerHeight * .65;
  const interrupted = () => document.hidden || !!document.querySelector('dialog[open], #quote-form:focus-within, .menu-toggle[aria-expanded="true"]');
  const update = () => {
    const allowed = eligible() && !interrupted();
    widget.hidden = !ready || !allowed;
    if (!allowed) { clearTimeout(timer); timer = null; return; }
    if (!ready && timer === null) {
      timer = setTimeout(() => {
        timer = null;
        if (!eligible() || interrupted()) return;
        ready = true;
        expand(!mobile.matches && !seen);
        remember();
        widget.hidden = false;
      }, 2000);
    }
  };
  launcher.addEventListener('click', () => { remember(); expand(panel.hidden, true); });
  close.addEventListener('click', () => { remember(); expand(false, true); });
  widget.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { remember(); expand(false, true); }
  });
  action.addEventListener('click', () => { remember(); expand(false); });
  let frame = 0;
  const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); }); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', schedule);
  document.addEventListener('visibilitychange', update);
  const observer = new MutationObserver(update);
  document.querySelectorAll('dialog').forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  observer.observe(document.querySelector('.menu-toggle'), { attributes: true, attributeFilter: ['aria-expanded'] });
  mobile.addEventListener('change', () => { if (mobile.matches) expand(false); update(); });
  update();
})();
