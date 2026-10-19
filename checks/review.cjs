/** Run after npm run build. Optional CHROMIUM_EXECUTABLE_PATH selects a local browser. */
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const { chromium }=require('playwright');
const root=path.join(process.cwd(),'dist');
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,pathname==='/'?'index.html':'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{}),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  try {
    const page=await browser.newPage({viewport:{width:1672,height:941}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.getByRole('button',{name:'Seguimiento',exact:true}).click();
    await page.locator('canvas').waitFor();await page.waitForTimeout(1800);
    await page.getByRole('button',{name:/CO3 · Reparación/}).click();
    await page.getByRole('button',{name:'Seguir',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Seguir',exact:true}).getAttribute('aria-pressed'),'true');
    await page.waitForTimeout(700);
    const canvas=await page.locator('canvas').boundingBox();
    await page.mouse.move(canvas.x+canvas.width*.45,canvas.y+canvas.height*.65);await page.mouse.down();await page.mouse.move(canvas.x+canvas.width*.55,canvas.y+canvas.height*.65,{steps:6});await page.mouse.up();
    assert.equal(await page.getByRole('button',{name:'Seguir',exact:true}).getAttribute('aria-pressed'),'false');
    await page.getByRole('button',{name:'Vista general',exact:true}).click();await page.waitForTimeout(1500);
    await page.screenshot({path:'checks/scene.png'});
    const slider=page.getByRole('slider',{name:'Línea de tiempo'});await slider.focus();await page.keyboard.press('Home');assert.equal(await slider.getAttribute('aria-valuenow'),'0');
    await page.keyboard.press('ArrowRight');assert.equal(await slider.getAttribute('aria-valuenow'),'1');
    await page.getByRole('button',{name:'Reproducir',exact:true}).click();await page.waitForTimeout(450);await page.getByRole('button',{name:'Pausar',exact:true}).click();assert.ok(Number(await slider.getAttribute('aria-valuenow'))>1);
    // Set a comparable instant using the pointer, using the real shared timeline.
    const box=await slider.boundingBox();await page.mouse.click(box.x+box.width*.85,box.y+box.height/2);
    const results=[];
    for(const [width,height] of [[1672,941],[1920,1080],[1366,768],[1147,597]]) {
      await page.setViewportSize({width,height});await page.waitForTimeout(500);
      const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,detailOverflow:[...document.querySelectorAll('.rdetail__head,.rdetail__body')].some(el=>el.scrollWidth>el.clientWidth+2)}));
      assert.equal(layout.overflow,false,`page overflow at ${width}`);assert.equal(layout.detailOverflow,false,`detail overflow at ${width}`);results.push({width,height,...layout});
    }
    await page.setViewportSize({width:1672,height:941});await page.getByRole('button',{name:'2D',exact:true}).click();await page.waitForTimeout(300);await page.screenshot({path:'checks/map-1672.png'});
    await page.getByRole('textbox',{name:'Buscar recurso'}).fill('KDX-305');assert.equal(await page.locator('.rcard').count(),1);await page.getByRole('textbox',{name:'Buscar recurso'}).fill('');
    await page.getByRole('button',{name:'Alertas 3',exact:true}).click();await page.getByRole('button',{name:'Seguimiento',exact:true}).click();assert.equal(await page.locator('.rcard--sel').innerText().then(x=>x.includes('CO3')),true);
    assert.deepEqual(errors,[]);console.log(JSON.stringify({errors,checks:'3D selection, manual camera, follow, keyboard replay, play/pause, 4 viewports, 2D, search, navigation',results},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
