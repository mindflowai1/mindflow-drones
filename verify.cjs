const { chromium } = require('C:/Users/mathe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const [width, height] of [[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[375,667],[320,740]]) {
    await page.setViewportSize({width,height});
    await page.goto('http://127.0.0.1:4173');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const layout = await page.evaluate(() => ({width: document.documentElement.scrollWidth, sections:[...document.querySelectorAll('main>section')].map(s=>({id:s.id,height:Math.round(s.getBoundingClientRect().height),overflow:s.scrollHeight-s.clientHeight}))}));
    assert.ok(layout.width <= width, `Horizontal overflow at ${width}`);
    assert.ok(layout.sections.every(s=>s.overflow<3), `Section clipping at ${width}: ${JSON.stringify(layout)}`);
    console.log(`${width}x${height}`, JSON.stringify(layout));
    if(width===1440) await page.screenshot({path:'desktop-preview.png',fullPage:true});
    if(width===390) await page.screenshot({path:'mobile-preview.png',fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4173');
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
  await page.locator('#navigation a[href="#contato"]').first().click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  await page.locator('[name=name]').fill('Teste Aerovision');
  await page.locator('[name=phone]').fill('(31) 99999-9999');
  await page.locator('.step-next').click();
  await page.locator('#service-select').selectOption('Evolução de obras');
  await page.locator('[name=message]').fill('Registro mensal de obra em Lagoa Santa.');
  await page.locator('#submit-quote').click();
  assert.ok(await page.locator('#quote-dialog').isVisible());
  assert.match(await page.locator('#quote-summary').inputValue(),/Registro mensal/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#quote-dialog').isVisible(),false);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:900});
  for (const progress of [0,.45,.96,.2]) {
    await page.evaluate(p=>{const s=document.querySelector('#portfolio');window.scrollTo({top:s.offsetTop+(s.offsetHeight-document.querySelector('.portfolio-stage').offsetHeight)*p,behavior:'instant'})},progress);
    await page.waitForTimeout(900);
    const state=await page.evaluate(()=>({frame:document.querySelector('#portfolio-canvas').dataset.frame,sticky:Math.round(document.querySelector('.portfolio-stage').getBoundingClientRect().top),chapter:document.querySelector('#chapter-title').textContent}));
    console.log('SEQUENCE',progress,state);
    assert.equal(state.sticky,0);
    assert.ok(Number(state.frame)>0);
    if(progress===.96) assert.equal(state.frame,'50');
    if(progress===.45) assert.ok(Number(state.frame)>10);
    if(progress===.2) assert.ok(Number(state.frame)<20);
    if(progress===.45) await page.screenshot({path:'portfolio-motion-preview.png'});
    if(progress===0) await page.screenshot({path:'portfolio-layout-desktop.png'});
    const overlap=await page.evaluate(()=>{const a=document.querySelector('.motion-heading').getBoundingClientRect(),b=document.querySelector('.motion-picture').getBoundingClientRect();return a.right>b.left && a.left<b.right && a.bottom>b.top && a.top<b.bottom});
    assert.equal(overlap,false,'Texto sobre o filme');
  }
  await page.setViewportSize({width:1902,height:822});
  await page.evaluate(()=>window.scrollTo({top:document.querySelector('#portfolio').offsetTop,behavior:'instant'}));
  await page.waitForTimeout(400);
  const fit=await page.evaluate(()=>{const stage=document.querySelector('.portfolio-stage').getBoundingClientRect(),g=document.querySelector('.portfolio-gallery').getBoundingClientRect();return g.top>=stage.top+76 && g.bottom<=stage.bottom});
  assert.ok(fit,'Galeria deve caber no desktop largo');
  await page.screenshot({path:'portfolio-wide-preview.png'});
  await page.setViewportSize({width:390,height:844});
  for (const progress of [0,.5,.96]) {
    await page.evaluate(p=>{const s=document.querySelector('#portfolio');window.scrollTo({top:s.offsetTop+(s.offsetHeight-document.querySelector('.portfolio-stage').offsetHeight)*p,behavior:'instant'})},progress);
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
    if(progress===.96) await page.screenshot({path:'portfolio-mobile-ending.png'});
  }
  await page.locator('#film-open').click();
  assert.ok(await page.locator('#video-dialog').isVisible());
  await page.keyboard.press('Escape');
  await page.locator('a[data-service="Lançamentos"]').click();
  assert.equal(await page.locator('#service-select').inputValue(),'Lançamentos');
  for (const [width,height] of [[1440,900],[390,844]]) {
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(()=>window.scrollTo({top:document.querySelector('#sobre').offsetTop,behavior:'instant'}));
    await page.waitForTimeout(300);
    await page.screenshot({path:`about-${width}.png`});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: menu, formulário, diálogo, portfólio, serviço e console.');
  await browser.close();
})().catch(error=>{ console.error(error);process.exit(1); });
