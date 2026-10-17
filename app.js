const $ = id => document.getElementById(id);
const S = {height:true, hot:true, spin:true, range:3, down:'#e5484d', mid:'#7b8494', up:'#30a46c'};
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const rnd = (a,b) => a + Math.random()*(b-a);
const fmt = p => (p>=0?'+':'') + p.toFixed(2) + ' %';
const rgb = h => { const n = parseInt(h.slice(1),16); return [n>>16&255, n>>8&255, n&255]; };

// Farbskala: -range (Verlust) ... 0 (neutral) ... +range (Gewinn)
function colorFor(pct, alpha = 1){
  const t = clamp(pct / S.range, -1, 1), a = rgb(S.mid), b = rgb(t < 0 ? S.down : S.up), k = Math.abs(t);
  return `rgba(${a.map((v,i) => Math.round(v + (b[i]-v)*k)).join(',')},${alpha})`;
}

// ---- Daten (aktuell simuliert) ----
// Datenquelle: Python-Backend (/api/snapshot). Läuft es nicht, gibt es simulierte Demo-Daten als Fallback.
const byIso = Object.fromEntries(COUNTRIES.map(c => [c.iso, c]));
let maxCap = 0, totalCap = 0;
const recalcCaps = () => { maxCap = Math.max(...COUNTRIES.map(c => c.cap)); totalCap = COUNTRIES.reduce((s,c) => s + c.cap, 0); };
recalcCaps();
const liveC = {}, liveK = {}, histC = {}, histK = {};
COUNTRIES.forEach(c => { liveC[c.iso] = rnd(-2,2); histC[c.iso] = Array(30).fill(liveC[c.iso]); });
COMPANIES.forEach(k => { liveK[k.name] = liveC[k.iso] + rnd(-1,1); histK[k.name] = Array(30).fill(liveK[k.name]);
  k._p = (90 - k.lat) * Math.PI/180; k._t = (90 - k.lng) * Math.PI/180; });
let updated = new Date();

const API = location.protocol.startsWith('http') && location.port === '8000' ? '' : 'http://127.0.0.1:8000';
let source = `Demo-Daten (simuliert) · ${COMPANIES.length} Firmen`, live = false, offline = false, liveStamp = null;

async function fetchSnapshot(){
  try { const r = await fetch(API + '/api/snapshot', {cache:'no-store'}); return r.ok ? await r.json() : null; }
  catch (e) { return null; }
}
// Fehlende Werte (Kürzel unbekannt, Börse zu) erscheinen als 0 % (neutral grau); Details unter /api/status
function applySnapshot(s, first){
  const put = (hist, v) => { if (first) hist.fill(v); else { hist.push(v); hist.shift(); } };
  let nOwn = 0, nRegion = 0;
  COUNTRIES.forEach(c => {
    if (c.own === undefined) c.own = c.index;
    let v = s.countries[c.iso];
    if (v !== undefined) { c.index = c.own; nOwn++; }
    else if (c.region && s.regions && s.regions[c.region]) {
      const r = s.regions[c.region]; v = r.pct; nRegion++;
      c.index = `Regions-Proxy: ${SUBREGION_DE[c.region] || c.region} (${r.label})`;
    } else c.index = c.own || 'Keine Börsendaten';
    liveC[c.iso] = v ?? 0; put(histC[c.iso], liveC[c.iso]);
  });
  COMPANIES.forEach(k => { liveK[k.name] = s.companies[k.name] ?? 0; put(histK[k.name], liveK[k.name]); });
  source = `Live · Yahoo Finance (verzögert) · ${Object.keys(s.companies).length}/${COMPANIES.length} Firmen, Länder: ${nOwn} direkt, ${nRegion} per Regions-Proxy`;
  updated = new Date(s.updated);
}
function simulate(){
  COUNTRIES.forEach(c => { liveC[c.iso] = clamp(liveC[c.iso]*0.92 + rnd(-.4,.4), -4, 4); histC[c.iso].push(liveC[c.iso]); histC[c.iso].shift(); });
  COMPANIES.forEach(k => { liveK[k.name] = clamp(liveC[k.iso]*0.6 + liveK[k.name]*0.3 + rnd(-.4,.4), -6, 6); histK[k.name].push(liveK[k.name]); histK[k.name].shift(); });
  updated = new Date();
}
async function tick(){
  const s = await fetchSnapshot();
  offline = !s && live;                                  // Backend war schon mal da: letzte Live-Werte behalten
  if (s) { const first = !live; live = true; if (s.updated !== liveStamp) { liveStamp = s.updated; applySnapshot(s, first); } }
  else if (!live) simulate();
  render(); panel(); if (tipFn) tip.innerHTML = tipFn();
}

// ---- Tooltips ----
const tip = $('tip'); let tipFn = null;
const moveTip = e => { tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY + 14) + 'px'; };
const showTip = (fn, e) => { tipFn = fn; tip.innerHTML = fn(); tip.hidden = false; moveTip(e); };
const hideTip = () => { tipFn = null; tip.hidden = true; };
const tipCountry = c => () => `<div class="tip"><b>${c.name}</b><div class="m">${c.index}</div><div class="big" style="color:${colorFor(liveC[c.iso])}">${fmt(liveC[c.iso])}</div><div class="m">Marktgewicht ca. ${c.cap} Bio. USD</div></div>`;
const tipCompany = k => () => `<div class="tip"><b>${k.name}</b><div class="m">${k.city} · ${byIso[k.iso].name}</div><div class="big" style="color:${colorFor(liveK[k.name])}">${fmt(liveK[k.name])}</div><div class="m">Börsenwert ca. ${k.cap} Mrd. USD</div></div>`;

// ---- Globus ----
const isoOf = f => f.properties.ISO_A3 !== '-99' ? f.properties.ISO_A3 : f.properties.ADM0_A3;
// Flache Länder bekommen winzig unterschiedliche Höhen, damit sich Grenzlinien und Wände
// benachbarter Länder nicht exakt überlagern (das war die Ursache des Flimmerns).
const flatAlt = iso => 0.006 + ([...iso].reduce((s,ch) => s + ch.charCodeAt(0), 0) % 8) * 0.0004;
const heightOf = iso => S.height ? 0.012 + Math.sqrt((byIso[iso] || {cap:0.05}).cap / maxCap) * 0.14 : flatAlt(iso);
let hovered = null, hoveredK = null, sel = null, focus = null, centered = false, hlRings = [], hlAlt = 0, hlFrom = 0, hlTarget = 0, hlT0 = 0, centerT0 = -1e9, prevPos = null;
const selCountry = f => sel && sel.type === 'country' && sel.f === f;
const hoverIso = () => hovered ? isoOf(hovered) : hoveredK ? hoveredK.iso : null;
// Hover und Auswahl heben Land und seine Firmen minimal an (gleiche Höhe, daher kein Höhen-Übergang beim Klick).
const raise = iso => !iso ? 0 : (iso === hoverIso() || (sel && sel.type === 'country' && isoOf(sel.f) === iso) ? 0.004 : 0);

const markers = new Map();
function makeMarker(k){
  const wrap = document.createElement('div'), b = document.createElement('b'), d = 9 + Math.sqrt(k.cap)/4.5;
  wrap.className = 'co'; b.style.width = b.style.height = d + 'px'; wrap.appendChild(b);
  // Auswahl direkt beim Drücken. Die Ereignisse gehen nicht an die Globus-Bibliothek weiter, sonst wird
  // zusätzlich das Land unter dem Marker angeklickt oder ein sich bewegender Marker verfehlt.
  b.addEventListener('pointerdown', e => { e.stopPropagation(); lastInput = performance.now(); if (e.button === 0) select({type:'company', k}); });
  ['pointerup','click','mousedown','mouseup'].forEach(n => b.addEventListener(n, e => e.stopPropagation()));
  b.addEventListener('mouseenter', e => { hoveredK = k; document.body.classList.add('on-marker'); showTip(tipCompany(k), e); render(); });
  b.addEventListener('mousemove', moveTip);
  b.addEventListener('mouseleave', () => { hoveredK = null; document.body.classList.remove('on-marker'); hideTip(); render(); });
  markers.set(k.name, {wrap, b, k});
  return wrap;
}

const globe = Globe()($('globe'))
  .width(innerWidth).height(innerHeight)
  .backgroundColor('rgba(0,0,0,0)').atmosphereColor('#6aa9ff')
  .polygonsTransitionDuration(700).htmlTransitionDuration(700)
  .polygonSideColor(() => '#141e32')
  .polygonLabel(f => { const c = byIso[isoOf(f)];
    return c ? tipCountry(c)() : `<div class="tip"><b>${f.properties.NAME}</b><div class="m">Keine Daten in der Demo</div></div>`; })
  .onPolygonHover(f => { hovered = f; render(); })
  .onPolygonClick(f => select({type:'country', f}))
  .onGlobeClick(() => select(null))
  .htmlLat('lat').htmlLng('lng')
  .htmlElement(k => (markers.get(k.name) || {}).wrap || makeMarker(k));
globe.globeMaterial().color.set('#12223f');
globe.controls().autoRotateSpeed = 0.5;
globe.pointOfView({lat:30, lng:10, altitude:2.3});
addEventListener('resize', () => { globe.width(innerWidth).height(innerHeight); sizeStars(); });

function render(){
  globe
    .polygonAltitude(f => { const c = byIso[isoOf(f)]; return (c ? heightOf(c.iso) : flatAlt(isoOf(f))) + raise(c && c.iso); })
    .polygonCapColor(f => { const c = byIso[isoOf(f)]; return c ? colorFor(liveC[c.iso]) : '#1c2740'; })
    .polygonStrokeColor(f => selCountry(f) ? '#ffffff' : '#6b7894')
    .htmlAltitude(k => heightOf(k.iso) + raise(k.iso) + 0.012);
  markers.forEach(({wrap, b, k}) => { b.style.background = colorFor(liveK[k.name]);
    wrap.classList.toggle('on', !!sel && sel.type === 'company' && sel.k === k); });
  $('status').textContent = `${source} · Stand ${updated.toLocaleTimeString('de-DE')}${offline ? ' · Backend nicht erreichbar (letzte Werte)' : ''}`;
}
const setMarkers = () => globe.htmlElementsData(S.hot ? COMPANIES : []);

// ---- Auswahl: Kamera zentriert kurz das Ziel, danach bleibt die Erde stehen und nur die Sterne drehen weiter ----
function geoInfo(f){ // Mittelpunkt des größten Landesteils
  const g = f.geometry, polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const ring = polys.reduce((a,p) => p[0].length > a[0].length ? p : a)[0];
  return {lng: ring.reduce((a,r) => a + r[0], 0)/ring.length, lat: ring.reduce((a,r) => a + r[1], 0)/ring.length};
}
function centerOnSel(){
  if (!sel) return;
  globe.pointOfView({lat:focus.lat, lng:focus.lng, altitude:globe.pointOfView().altitude}, 1200);
  centered = true; centerT0 = performance.now();
}
function ringsOf(f){ // Außenringe des Landes als Einheitsvektoren (für den Umriss-Overlay)
  const g = f.geometry, polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  return polys.map(p => p[0].map(([lng,lat]) => { const ph = (90-lat)*Math.PI/180, th = (90-lng)*Math.PI/180;
    return [Math.sin(ph)*Math.cos(th), Math.cos(ph), Math.sin(ph)*Math.sin(th)]; }));
}
function select(t){
  sel = t;
  hlRings = t && t.type === 'country' ? ringsOf(t.f) : [];
  if (hlRings.length) { const i = isoOf(t.f); hlAlt = hlFrom = hlTarget = (byIso[i] ? heightOf(i) : flatAlt(i)) + (i === hoverIso() ? 0.004 : 0); hlT0 = performance.now(); }
  if (t) { focus = t.type === 'company' ? {lat:t.k.lat, lng:t.k.lng} : geoInfo(t.f); centerOnSel(); }
  else centered = false;
  render(); panel();
}
// Nutzeraktivität (die Kamera zentriert ein Ziel nur einmal beim Anklicken, nie erneut)
let lastInput = -1e9, down = null;
// Nur echte Mausbewegung (mind. 3 px) zählt als Aktivität; unechte Ereignisse ohne Positionsänderung werden ignoriert.
let px0 = -1, py0 = -1;
addEventListener('pointermove', e => { if (Math.hypot(e.clientX-px0, e.clientY-py0) > 3) { px0 = e.clientX; py0 = e.clientY; lastInput = performance.now(); } }, {passive:true});
['pointerdown','wheel','touchstart','keydown'].forEach(n => addEventListener(n, () => lastInput = performance.now(), {passive:true}));
$('globe').addEventListener('pointerdown', e => down = {x:e.clientX, y:e.clientY});
addEventListener('pointerup', () => down = null);
$('globe').addEventListener('pointermove', e => { if (down && e.buttons && Math.hypot(e.clientX-down.x, e.clientY-down.y) > 5) centered = false; });
addEventListener('keydown', e => { if (e.key === 'Escape' && sel) select(null); });

// ---- Infopanel ----
function spark(h, p){
  const lo = Math.min(...h,-1), hi = Math.max(...h,1), y = v => 40 - (v-lo)/(hi-lo)*40;
  return `<svg viewBox="0 0 270 40" width="100%" height="40" aria-hidden="true"><line x1="0" x2="270" y1="${y(0)}" y2="${y(0)}" stroke="rgba(160,175,200,.3)" stroke-dasharray="3 3"/><polyline points="${h.map((v,i) => `${(i/(h.length-1)*270).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${colorFor(p)}" stroke-width="2"/></svg>`;
}
function panel(){
  const el = $('info'), x = '<button class="x" aria-label="Schließen">×</button>';
  if (!sel) { el.hidden = true; return; }
  el.hidden = false;
  if (sel.type === 'company') {
    const k = sel.k, c = byIso[k.iso], p = liveK[k.name];
    el.innerHTML = `${x}<h2>${k.name}</h2><div class="m">${k.city} · ${c.name}</div><div class="big" style="color:${colorFor(p)}">${fmt(p)}</div>${spark(histK[k.name], p)}
      <dl><dt>Börsenwert</dt><dd>${k.cap} Mrd. USD</dd><dt>Anteil am Landesmarkt</dt><dd>${(k.cap/(c.cap*1000)*100).toFixed(1)} %</dd>
      <dt>${c.index}</dt><dd style="color:${colorFor(liveC[c.iso])}">${fmt(liveC[c.iso])}</dd></dl>`;
    return;
  }
  const c = byIso[isoOf(sel.f)];
  if (!c) { el.innerHTML = `${x}<h2>${sel.f.properties.NAME}</h2><p class="m">Keine Daten in der Demo.</p>`; return; }
  const p = liveC[c.iso], firms = COMPANIES.filter(k => k.iso === c.iso).sort((a,b) => b.cap - a.cap);
  el.innerHTML = `${x}<h2>${c.name}</h2><div class="m">${c.index}</div><div class="big" style="color:${colorFor(p)}">${fmt(p)}</div>${spark(histC[c.iso], p)}
    <dl><dt>Marktgewicht</dt><dd>${c.cap} Bio. USD</dd><dt>Anteil (Demo-Welt)</dt><dd>${(c.cap/totalCap*100).toFixed(1)} %</dd>
    <dt>Rang</dt><dd>${[...COUNTRIES].sort((a,b) => b.cap - a.cap).indexOf(c) + 1} von ${COUNTRIES.length}</dd><dt>Firmen in der Demo</dt><dd>${firms.length}</dd></dl>
    ${firms.length ? '<div class="m">Größte Firmen</div><ul>' + firms.slice(0,5).map(k => `<li><span>${k.name} <span class="m">${k.city}</span></span><span style="color:${colorFor(liveK[k.name])}">${fmt(liveK[k.name])}</span></li>`).join('') + '</ul>' : ''}`;
}
$('info').addEventListener('click', e => { if (e.target.closest('.x')) select(null); });

// ---- Sterne: feste Richtungen im 3D-Raum, projiziert mit der Kameradrehung ----
const stars = Array.from({length:1000}, () => { const u = rnd(-1,1), t = rnd(0,6.2832), r = Math.sqrt(1-u*u);
  return {x:r*Math.cos(t), y:u, z:r*Math.sin(t), s:rnd(.5,1.6), p:rnd(0,6.28)}; });
const sc = $('stars'), sx = sc.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
const hlc = $('hl'), hx = hlc.getContext('2d');
function sizeStars(){ sc.width = hlc.width = innerWidth*dpr; sc.height = hlc.height = innerHeight*dpr;
  sx.setTransform(dpr,0,0,dpr,0,0); hx.setTransform(dpr,0,0,dpr,0,0); }
sizeStars();
function drawStars(now){
  const w = innerWidth, h = innerHeight, cm = globe.camera(), q = cm.quaternion, f = h/2/Math.tan(cm.fov*Math.PI/360);
  const cb = Math.cos(beta), sb = Math.sin(beta);
  sx.clearRect(0,0,w,h);
  for (const s of stars) {
    const x0 = s.x*cb + s.z*sb, y0 = s.y, z0 = -s.x*sb + s.z*cb;   // Eigendrehung des Sternenhimmels (nur bei Fokus)
    const qx = -q.x, qy = -q.y, qz = -q.z;
    const tx = 2*(qy*z0 - qz*y0), ty = 2*(qz*x0 - qx*z0), tz = 2*(qx*y0 - qy*x0);
    const vx = x0 + q.w*tx + (qy*tz - qz*ty), vy = y0 + q.w*ty + (qz*tx - qx*tz), vz = z0 + q.w*tz + (qx*ty - qy*tx);
    if (vz > -0.05) continue;
    const px = w/2 + vx/-vz*f, py = h/2 - vy/-vz*f;
    if (px < 0 || px > w || py < 0 || py > h) continue;
    sx.fillStyle = `rgba(220,232,255,${0.55 + 0.25*Math.sin(now/1400 + s.p)})`;
    sx.fillRect(px, py, s.s, s.s);
  }
}
// Firmen auf der Rückseite der Erde ausblenden
function updateMarkerVisibility(){
  const c = globe.camera().position, len = Math.hypot(c.x, c.y, c.z);
  markers.forEach(({wrap, k}) => { const sp = Math.sin(k._p);
    const dot = (sp*Math.cos(k._t)*c.x + Math.cos(k._p)*c.y + sp*Math.sin(k._t)*c.z) / len;
    wrap.style.visibility = dot > 100/len + 0.03 ? 'visible' : 'hidden'; });
}
// Füllflächen minimal nach hinten schieben, damit Grenzlinien sicher darüber liegen
function fixDepth(){
  globe.scene().traverse(o => { if (o.__globeObjType === 'polygon') o.traverse(m => {
    if (m.isMesh && m.material) [].concat(m.material).forEach(mt => { mt.polygonOffset = true; mt.polygonOffsetFactor = 1; mt.polygonOffsetUnits = 1; }); }); });
}

// Weißer Umriss des gewählten Landes: wird immer komplett obenauf gezeichnet, damit höhere Nachbarländer ihn nicht verdecken
// Die Globus-Bibliothek schreitet ihre Kamera-Animation erst NACH dem Zeichnen eines Frames weiter. Während der Zentrier-Animation
// liest dieser Code deshalb eine um einen Schritt zu neue Kamera und der Umriss rutscht gegen die Karte. Mit SYNC_FIX wird der
// Kamera-Zustand des vorigen Frames verwendet (= der, mit dem die Karte gezeichnet wurde). Bei Problemen auf false setzen.
const SYNC_FIX = true;
function drawHighlight(dt){
  const w = innerWidth, h = innerHeight; hx.clearRect(0,0,w,h);
  const cur = globe.camera().position, lagged = prevPos;
  prevPos = {x:cur.x, y:cur.y, z:cur.z};
  if (!hlRings.length || !sel || sel.type !== 'country') return;
  const iso = isoOf(sel.f), c = byIso[iso];
  const target = (c ? heightOf(iso) : flatAlt(iso)) + raise(c && iso), tn = performance.now();
  if (Math.abs(target - hlTarget) > 1e-6) { hlFrom = hlAlt; hlTarget = target; hlT0 = tn; }
  const u = clamp((tn - hlT0)/700, 0, 1), ez = u < .5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2)/2;   // wie die Höhenanimation der Länder
  hlAlt = hlFrom + (hlTarget - hlFrom)*ez;
  const cm = globe.camera(), cp = (SYNC_FIX && lagged && performance.now() - centerT0 < 1250) ? lagged : cur;
  const len = Math.hypot(cp.x, cp.y, cp.z), f = h/2/Math.tan(cm.fov*Math.PI/360), R = 100*(1 + hlAlt);
  // Blickrichtung (Kamera schaut immer auf den Erdmittelpunkt), rechts- und oben-Vektor
  const fx = -cp.x/len, fy = -cp.y/len, fz = -cp.z/len;
  let rx = -fz, rz = fx; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
  const ux = -rz*fy, uy = rz*fx - rx*fz, uz = rx*fy;
  hx.strokeStyle = '#ffffff'; hx.lineWidth = 2; hx.lineJoin = 'round'; hx.beginPath();
  for (const ring of hlRings) { let pen = false;
    for (const n of ring) {
      if ((n[0]*cp.x + n[1]*cp.y + n[2]*cp.z)/len <= 100/len + 0.02) { pen = false; continue; }   // Rückseite
      const ax = n[0]*R - cp.x, ay = n[1]*R - cp.y, az = n[2]*R - cp.z, dz = ax*fx + ay*fy + az*fz;
      if (dz < 1) { pen = false; continue; }
      const px = w/2 + (ax*rx + az*rz)/dz*f, py = h/2 - (ax*ux + ay*uy + az*uz)/dz*f;
      if (pen) hx.lineTo(px, py); else hx.moveTo(px, py);
      pen = true;
    } }
  hx.stroke();
}

// ---- Animationsschleife ----
// Ohne Fokus: Kamera umkreist die Erde, sobald 2 s keine Eingabe kam.
// Mit Fokus: Kamera bleibt auf dem Ziel (Erde steht still), der Sternenhimmel dreht im gleichen Drehsinn weiter.
const SPEED = 0.9, OMEGA = 2*Math.PI/60*SPEED; // Umlaufzeit 120 s
let beta = 0, lastAz = 0, dbgT = 0, last = performance.now();
function loop(now){
  const dt = Math.min(.05, (now-last)/2500); last = now;
  const idle = now - lastInput > 200, ctl = globe.controls();
  const overMarker = !!document.querySelector('.co b:hover');
  ctl.autoRotateSpeed = SPEED;
  ctl.autoRotate = !sel && S.spin;              // Leerlauf: Globus dreht sich
  const cp = globe.camera().position, az = Math.atan2(cp.x, cp.z);
  const dAz = ((az - lastAz + 3*Math.PI) % (2*Math.PI)) - Math.PI; lastAz = az;
  if (ctl.autoRotate) beta += dAz;                                     // Sterne drehen mit der Kamera mit und stehen auf dem Bildschirm still
  if (sel) beta += -(OMEGA*dt);                                 // Fokus: Sterne drehen weiter
  if (now - dbgT > 400) { dbgT = now; $('dbg').textContent = 'Rotation: ' + (ctl.autoRotate ? 'läuft' : !S.spin ? 'aus (Schalter)' :
    sel ? 'pausiert (Fokus)' : overMarker ? 'pausiert (Marker)' : `wartet auf Ruhe (${Math.max(1, Math.ceil(2 - (now-lastInput)/1000))} s)`); }
  updateMarkerVisibility();
  drawStars(now);
  drawHighlight(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---- Legende & Einstellungen ----
function legend(){
  $('legendBar').style.background = `linear-gradient(90deg, ${S.down}, ${S.mid}, ${S.up})`;
  $('lgMin').textContent = `-${S.range} %`; $('lgMax').textContent = `+${S.range} %`;
  $('rangeOut').textContent = S.range;
}
const bind = (id, fn) => $(id).addEventListener('input', e => { fn(e.target); legend(); render(); panel(); });
bind('optHeight', t => S.height = t.checked);
bind('optHot',    t => { S.hot = t.checked; setMarkers(); });
bind('optRotate', t => S.spin = t.checked);
bind('optLegend', t => $('legend').style.display = t.checked ? '' : 'none');
bind('optRange',  t => S.range = +t.value);
bind('colDown',   t => S.down = t.value);
bind('colMid',    t => S.mid = t.value);
bind('colUp',     t => S.up = t.value);

// ---- Alle Länder der Weltkarte ----
const SUBREGION_DE = {'Northern Africa':'Nordafrika','Western Africa':'Westafrika','Middle Africa':'Zentralafrika','Eastern Africa':'Ostafrika',
  'Southern Africa':'Südliches Afrika','Northern America':'Nordamerika','Central America':'Mittelamerika','Caribbean':'Karibik','South America':'Südamerika',
  'Central Asia':'Zentralasien','Western Asia':'Westasien','Southern Asia':'Südasien','South-Eastern Asia':'Südostasien','Eastern Asia':'Ostasien',
  'Eastern Europe':'Osteuropa','Northern Europe':'Nordeuropa','Southern Europe':'Südeuropa','Western Europe':'Westeuropa',
  'Australia and New Zealand':'Australien/Neuseeland','Melanesia':'Melanesien','Micronesia':'Mikronesien','Polynesia':'Polynesien'};
const regionNames = (() => { try { return new Intl.DisplayNames(['de'], {type:'region'}); } catch (e) { return null; } })();
function germanName(p){
  for (const code of [p.ISO_A2, p.ISO_A2_EH]) if (regionNames && /^[A-Z]{2}$/.test(code || '')) {
    try { const n = regionNames.of(code); if (n && n !== code) return n; } catch (e) {} }
  return p.NAME_LONG || p.NAME;
}
// Länder, die nicht in data.js stehen, werden aus der Weltkarte angelegt: deutscher Name, Region, Gewicht grob aus dem BIP geschätzt.
function registerFeatures(features){
  features.forEach(f => {
    const iso = isoOf(f), p = f.properties;
    if (byIso[iso]) { byIso[iso].region = p.SUBREGION; return; }
    const gdp = p.GDP_MD_EST ?? p.GDP_MD ?? 0;
    const c = {iso, name:germanName(p), region:p.SUBREGION, cap:+Math.max(0.01, gdp/1e6*0.4).toFixed(2),
               index:`Demo-Wert (Region ${SUBREGION_DE[p.SUBREGION] || p.SUBREGION || '?'})`};
    byIso[iso] = c; COUNTRIES.push(c); liveC[iso] = rnd(-2,2); histC[iso] = Array(30).fill(liveC[iso]);
  });
  recalcCaps();
}

// ---- Start ----
const GEO = ['https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson',
             'https://cdn.jsdelivr.net/gh/vasturiano/globe.gl@master/example/datasets/ne_110m_admin_0_countries.geojson'];
(async () => {
  for (const u of GEO) {
    try { const r = await fetch(u); if (r.ok) {
      const feats = (await r.json()).features.filter(f => f.properties.ISO_A3 !== 'ATA'); registerFeatures(feats); globe.polygonsData(feats);
      legend(); setMarkers(); render(); fixDepth(); setInterval(fixDepth, 1000); tick(); setInterval(tick, 2000); return; } } catch (e) {}
  }
  $('status').textContent = 'Weltkarte konnte nicht geladen werden. Internetverbindung prüfen.';
})();
