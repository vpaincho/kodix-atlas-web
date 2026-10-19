const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.join(process.cwd(),'dist');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);const file=p===root?path.join(root,'index.html'):p;if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});try{
 const page=await browser.newPage({viewport:{width:1672,height:941}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Do not make automated pan/zoom requests against OSM's public tile service.
 // Intercept tiles with a fixture; this verifies UI and local data, not remote cartography.
 await page.route('https://tile.openstreetmap.org/**',r=>process.env.STALL_TILES ? undefined : r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')}));
 await page.goto('http://127.0.0.1:'+server.address().port);await page.getByRole('navigation').getByRole('button',{name:'Campo',exact:true}).click();
 await page.getByRole('button',{name:'Encuadrar zona'}).waitFor();await page.waitForFunction(()=>!document.querySelector('.geo-map__tools button').disabled);
 const mapSize=await page.locator('.geo-map__canvas').boundingBox();assert.ok(mapSize.width>300&&mapSize.height>300,'map host has visible size');assert.ok(await page.locator('.maplibregl-ctrl-attrib').isVisible(),'attribution visible');await page.getByRole('button',{name:'Vista inclinada'}).click();assert.equal(await page.getByRole('button',{name:'Vista cenital'}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Encuadrar zona'}).click();
 const checkbox=page.getByRole('checkbox',{name:'Límite de Zona Cero'});await checkbox.uncheck();await checkbox.check();
 const data={type:'FeatureCollection',features:[{type:'Feature',properties:{name:'test'},geometry:{type:'Point',coordinates:[-67.86,-45.82]}}]};
 await page.locator('input[type=file]').setInputFiles({name:'pozos-prueba.geojson',mimeType:'application/geo+json',buffer:Buffer.from(JSON.stringify(data))});await page.getByText('1 elementos geográficos').waitFor();await page.getByRole('button',{name:'Quitar capa'}).click();
 await page.locator('input[type=file]').setInputFiles({name:'proyectado.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...data,features:[{...data.features[0],geometry:{type:'Point',coordinates:[585000,4920000]}}]}))});await page.getByRole('alert').filter({hasText:'WGS84'}).waitFor();
 for(const width of [1920,1672,1366,1147]){await page.setViewportSize({width,height:941});await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);}
 await page.setViewportSize({width:1672,height:941});await page.getByRole('button',{name:'Encuadrar zona'}).click();await page.waitForTimeout(1200);await page.screenshot({path:'checks/geography.png'});
 if(process.env.STALL_TILES){await page.getByRole('alert').filter({hasText:'no respondió'}).waitFor({timeout:20000});assert.equal(await page.getByRole('button',{name:'Encuadrar zona'}).isEnabled(),true);}
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,checks:['map initialization','camera','boundary','local import','invalid CRS','four widths'],remoteTiles:'mocked; not verified',errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
