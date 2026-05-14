
// Datos y funciones maxifer*() vienen de catalogo-data.js (cargado antes)

// Función principal: carga ambos Excels y prepara los datos
async function maxiferCargarDatos() {
  const txtEl = document.getElementById('maxifer-loading-text');
  const errEl = document.getElementById('maxifer-loading-error');
  try {
    if (txtEl) txtEl.textContent = 'Descargando lista de precios...';
    const wbListas = await maxiferLeerExcel(MAXIFER_EXCEL_URLS.listas);

    if (txtEl) txtEl.textContent = 'Descargando composición de surtidos...';
    const wbSurtidos = await maxiferLeerExcel(MAXIFER_EXCEL_URLS.surtidos);

    if (txtEl) txtEl.textContent = 'Procesando datos...';
    const mapaListas = maxiferMapListas(wbListas);
    const composicion = maxiferConstruirComposicion(wbSurtidos, mapaListas);

    COMPOSICION_DATA = composicion;

    if (typeof SURTIDOS !== 'undefined' && Array.isArray(SURTIDOS)) {
      maxiferCrearAliases(SURTIDOS, COMPOSICION_DATA);
      maxiferRecalcularPrecios(SURTIDOS, COMPOSICION_DATA);
    }

    window.MAXIFER_DATOS_CARGADOS = true;

    try {
      if (typeof renderGrid === 'function' && typeof SURTIDOS_ACTIVOS !== 'undefined') {
        renderGrid(SURTIDOS_ACTIVOS);
      }
      if (typeof renderDestacados === 'function' && typeof SURTIDOS_ACTIVOS !== 'undefined') {
        renderDestacados();
      }
      if (typeof refrescarVistaActiva === 'function') {
        refrescarVistaActiva();
      }
      if (typeof renderCarritoBody === 'function') {
        renderCarritoBody();
      }
    } catch(e) {
      console.warn('Error refrescando vistas tras carga de Excels:', e);
    }

    return true;
  } catch (e) {
    console.error('Error cargando datos MAXIFER:', e);
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent = 'Error cargando catálogo: ' + e.message + '. Por favor refrescá la página.';
    }
    if (txtEl) txtEl.textContent = 'Error de carga';
    return false;
  }
}

function maxiferOcultarOverlay() {
  const ov = document.getElementById('maxifer-loading-overlay');
  if (ov) {
    ov.style.transition = 'opacity 0.3s';
    ov.style.opacity = '0';
    setTimeout(function(){ ov.style.display = 'none'; }, 300);
  }
}

let COMPOSICION_DATA = {};
let modoReducido = false;

// SURTIDOS viene de surtidos-data.js
const PRECIOS_DATA = {};
const RELACIONADOS = {"54": [4, 41], "4": [54, 41], "41": [54, 4], "3": [6, 8, 5, 7, 51], "6": [3, 8, 5, 7, 51], "8": [3, 6, 5, 7, 51], "5": [3, 6, 8, 7, 51], "7": [3, 6, 8, 5, 51], "51": [3, 6, 8, 5, 7], "10": [9], "9": [10], "52": [53, 2, 22], "53": [52, 2, 22], "2": [52, 53, 22], "43": [48, 47, 46, 42, 35], "48": [43, 47, 46, 42, 35], "47": [43, 48, 46, 42, 35], "46": [43, 48, 47, 42, 35], "42": [43, 48, 47, 46, 35], "34": [33, 56], "33": [34, 56], "57": [18], "18": [57], "45": [59, 60, 12, 11], "59": [45, 60, 12, 11], "60": [45, 59, 12, 11], "12": [45, 59, 60, 11], "11": [45, 59, 60, 12], "14": [15, 30, 38], "15": [14, 30, 38], "30": [14, 15, 38], "38": [14, 15, 30], "22": [52, 53, 2], "61": [21, 20], "21": [61, 20], "20": [61, 21], "25": [26], "26": [25], "49": [50, 37], "50": [49, 37], "37": [49, 50], "35": [43, 48, 47, 46, 42], "56": [34, 33]};
const PIEZAS_DATA = {"36":{"pzs":255,"pzs_r":147},"29":{"pzs":140,"pzs_r":94},"30":{"pzs":1304,"pzs_r":379},"14":{"pzs":1011,"pzs_r":483},"15":{"pzs":283,"pzs_r":171},"25":{"pzs":102,"pzs_r":62},"9":{"pzs":150,"pzs_r":124},"10":{"pzs":962,"pzs_r":452},"41":{"pzs":1300,"pzs_r":978},"34":{"pzs":234,"pzs_r":154},"33":{"pzs":386,"pzs_r":262},"56":{"pzs":167,"pzs_r":109},"44":{"pzs":384,"pzs_r":232},"43":{"pzs":172,"pzs_r":116},"48":{"pzs":75,"pzs_r":75},"47":{"pzs":57,"pzs_r":29},"46":{"pzs":56,"pzs_r":56},"23":{"pzs":839,"pzs_r":265},"27":{"pzs":285,"pzs_r":144},"55":{"pzs":193,"pzs_r":126},"17":{"pzs":122,"pzs_r":74},"52":{"pzs":1334,"pzs_r":556},"2":{"pzs":1571,"pzs_r":736},"53":{"pzs":313,"pzs_r":165},"49":{"pzs":93,"pzs_r":63},"50":{"pzs":93,"pzs_r":63},"37":{"pzs":185,"pzs_r":125},"54":{"pzs":994,"pzs_r":547},"4":{"pzs":647,"pzs_r":327},"57":{"pzs":165,"pzs_r":107},"18":{"pzs":172,"pzs_r":125},"1":{"pzs":564,"pzs_r":377},"51":{"pzs":828,"pzs_r":790},"5":{"pzs":154,"pzs_r":104},"8":{"pzs":113,"pzs_r":113},"6":{"pzs":441,"pzs_r":332},"3":{"pzs":353,"pzs_r":179},"7":{"pzs":118,"pzs_r":80},"24":{"pzs":902,"pzs_r":527},"22":{"pzs":443,"pzs_r":298},"28":{"pzs":1742,"pzs_r":752},"20":{"pzs":1746,"pzs_r":527},"12":{"pzs":352,"pzs_r":202},"61":{"pzs":1491,"pzs_r":382},"21":{"pzs":137,"pzs_r":90},"16":{"pzs":132,"pzs_r":80},"58":{"pzs":666,"pzs_r":402},"59":{"pzs":327,"pzs_r":219},"11":{"pzs":557,"pzs_r":212}};

let mostrarPrecios = false;

var CART_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

function cargarCarrito() {
  try {
    var raw = localStorage.getItem('maxifer_cart');
    if (!raw) return [];
    var obj = JSON.parse(raw);
    if (!obj || !obj.items || !Array.isArray(obj.items)) return [];
    if (obj.ts && (Date.now() - obj.ts) > CART_EXPIRY_MS) {
      localStorage.removeItem('maxifer_cart');
      return [];
    }
    return obj.items;
  } catch(e) { return []; }
}
function guardarCarrito() {
  try {
    localStorage.setItem('maxifer_cart', JSON.stringify({ items: carrito, ts: Date.now() }));
  } catch(e) {}
}
function cargarDescuento() {
  try {
    var v = parseInt(localStorage.getItem('maxifer_desc') || '0', 10);
    return isNaN(v) ? 0 : v;
  } catch(e) { return 0; }
}
function guardarDescuento() {
  try { localStorage.setItem('maxifer_desc', String(descuentoPct)); } catch(e) {}
}

let carrito = cargarCarrito();
var descuentoPct = cargarDescuento();

var favoritos = JSON.parse(localStorage.getItem('maxifer_favs') || '[]');

function esFavorito(id) { return favoritos.indexOf(id) !== -1; }

function toggleFavorito(id, event) {
  if (event) event.stopPropagation();
  var idx = favoritos.indexOf(id);
  if (idx >= 0) { favoritos.splice(idx, 1); } else { favoritos.push(id); vibrar(); }
  localStorage.setItem('maxifer_favs', JSON.stringify(favoritos));
  actualizarFavBadge();
  document.querySelectorAll('.btn-fav[data-id="' + id + '"]').forEach(function(btn) {
    btn.classList.toggle('fav-on', esFavorito(id));
    btn.textContent = esFavorito(id) ? '❤️' : '🤍';
  });
}

function actualizarFavBadge() {
  var badge = document.getElementById('favBadge');
  if (!badge) return;
  badge.textContent = favoritos.length;
  badge.classList.toggle('visible', favoritos.length > 0);
  var tab = document.querySelector('.fav-tab');
  if (tab) tab.childNodes[0].textContent = (favoritos.length > 0 ? '❤️' : '♡') + ' Guardados';
}

function abrirFavoritos() {
  renderFavBody();
  document.getElementById('favOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function toggleFavCarrito(id) {
  var s = SURTIDOS.find(function(x){ return x.id === id; });
  if (!s) return;
  var idx = carrito.findIndex(function(c){ return c.id === id; });
  if (idx >= 0) { carrito.splice(idx, 1); } else { carrito.push(s); vibrar(); }
  actualizarFab();
  var btn = document.getElementById('favCart' + id);
  if (btn) {
    var enCarrito = carrito.some(function(c){ return c.id === id; });
    btn.className = 'btn-fav-carrito' + (enCarrito ? ' agregado' : '');
    btn.textContent = enCarrito ? '✅' : '🛒';
  }
  var btnModal = document.getElementById('btnAgregar');
  if (btnModal && surtidoActual && surtidoActual.id === id) {
    var enc = carrito.some(function(c){ return c.id === id; });
    btnModal.className = 'btn-pedir ' + (enc ? 'agregado' : '');
    btnModal.textContent = enc ? '✅ En mi pedido' : '🛒 Agregar al pedido';
  }
}

function renderFavBody() {
  var body = document.getElementById('favBody');
  if (!body) return;
  if (favoritos.length === 0) {
    body.innerHTML = '<div class="empty-fav"><div class="empty-icon">🤍</div>Todavía no guardaste ningún surtido.</div>';
    return;
  }
  body.innerHTML = favoritos.map(function(id) {
    var s = SURTIDOS.find(function(x){ return x.id === id; });
    if (!s) return '';
    var foto = s.foto_card || s.foto_exhibidor || '';
    var enCarrito = carrito.some(function(c){ return c.id === id; });
    return '<div class="fav-item" onclick="cerrarFavoritos();abrirModal(' + id + ')">'
      + (foto ? '<img class="fav-item-img" src="' + foto + '">' : '<div class="fav-item-img"></div>')
      + '<div class="fav-item-info">'
      +   '<div class="fav-item-nombre">' + s.nombre + (s.codigo && s.codigo.startsWith('RE-') ? '<span class="reducido-tag">(Reducido)</span>' : '') + '</div>'
      +   '<div class="fav-item-cod">Cód: ' + s.codigo + (s.piezas ? ' · ' + s.piezas + ' piezas' : '') + '</div>'
      + '</div>'
      + '<div class="fav-item-actions">'
      +   '<button class="btn-fav-carrito ' + (enCarrito ? 'agregado' : '') + '" id="favCart' + id + '" aria-label="' + (enCarrito ? 'Quitar del pedido' : 'Agregar al pedido') + '" onclick="event.stopPropagation();toggleFavCarrito(' + id + ')">' + (enCarrito ? '✅' : '🛒') + '</button>'
      +   '<button class="btn-fav-rm" aria-label="Quitar de favoritos" onclick="event.stopPropagation();toggleFavorito(' + id + ',event);renderFavBody()">🗑️</button>'
      + '</div>'
      + '</div>';
  }).join('');
}

function cerrarFavoritos() {
  document.getElementById('favOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function cerrarFavOverlay(e) {
  if (e.target === document.getElementById('favOverlay')) cerrarFavoritos();
}

function vibrar(ms) { if (navigator.vibrate) navigator.vibrate(ms || 40); }

const DESCUENTOS_FIJOS = { 'CONC. COMB. Red': 22 };

function precioConDescuento(precio, codigo) {
  if (!precio) return 0;
  if (codigo && DESCUENTOS_FIJOS[codigo]) {
    var base = precio * (1 - DESCUENTOS_FIJOS[codigo] / 100);
    if (descuentoPct > 0) base = base * (1 - descuentoPct / 100);
    return Math.round(base);
  }
  if (descuentoPct <= 0) return precio;
  return Math.round(precio * (1 - descuentoPct / 100));
}

function aplicarDescuento() {
  var val = parseFloat(document.getElementById('descuentoInput').value) || 0;
  val = Math.max(0, Math.min(99, val));
  descuentoPct = val;
  guardarDescuento();
  var res = document.getElementById('descuentoResultado');
  if (val > 0) { res.innerHTML = ''; } else { res.innerHTML = 'Precio de lista'; }
  renderGrid(SURTIDOS_ACTIVOS);
  refrescarVistaActiva();
  renderCarritoBody();
}
let surtidoActual = null;

// Construye un item con la forma estándar de GA4 ecommerce a partir de un surtido.
// item_list_name e item_list_id salen del grupo/lista en que aparece el surtido,
// de manera que en GA4 la dimensión "Nombre del surtido" deje de venir (not set).
function ga4ItemFromSurtido(s, extra) {
  if (!s) return null;
  var g = (typeof getGrupo === 'function') ? getGrupo(s) : null;
  var listName = (extra && extra.list_name) || (g && g.label) || 'Catálogo MAXIFER';
  var listId   = (extra && extra.list_id)   || (g && g.key)   || 'catalogo';
  var item = {
    item_id: String(s.codigo || s.id),
    item_name: s.nombre,
    item_brand: 'MAXIFER',
    item_category: listName,
    item_list_name: listName,
    item_list_id: listId,
    price: (extra && extra.price != null) ? extra.price : (s.precio || 0),
    quantity: (extra && extra.quantity != null) ? extra.quantity : 1
  };
  if (extra && extra.index != null) item.index = extra.index;
  return item;
}

function formatPrecio(n) {
  return '$ ' + Math.round(n).toLocaleString('es-AR').replace(/,/g, '.');
}

function renderGrid(lista) {
  const grid = document.getElementById('grid');
  const noRes = document.getElementById('noResults');
  if (lista.length === 0) {
    grid.innerHTML = '';
    noRes.style.display = 'block';
    return;
  }
  noRes.style.display = 'none';

  const q = normalizar(document.getElementById('searchInput')?.value?.trim() || '');
  if (q && q.length > 0) {
    grid.innerHTML = `<div class="grupo-grid">${lista.map(cardHTML).join('')}</div>`;
    if (window.gtag && lista.length > 0) {
      const itemsBusqueda = lista.slice(0, 20).map((s, i) => ga4ItemFromSurtido(s, {
        list_name: 'Resultados búsqueda: ' + q,
        list_id: 'search_' + q,
        index: i
      })).filter(Boolean);
      gtag('event', 'view_item_list', {
        item_list_name: 'Resultados búsqueda: ' + q,
        item_list_id: 'search_' + q,
        items: itemsBusqueda
      });
    }
    return;
  }

  const gruposUsados = [];
  const porGrupo = {};
  for (const s of lista) {
    const g = getGrupo(s);
    if (!porGrupo[g.key]) {
      porGrupo[g.key] = { grupo: g, items: [] };
      gruposUsados.push(g.key);
    }
    porGrupo[g.key].items.push(s);
  }

  grid.innerHTML = gruposUsados.map(key => {
    const { grupo: g, items } = porGrupo[key];
    return `<div class="grupo-seccion">
      <div class="grupo-header" style="--gc:${g.color}">
        <span class="grupo-icono">${g.icono}</span>
        <span class="grupo-titulo">${g.label}</span>
        <span class="grupo-cnt">${items.length}</span>
      </div>
      <div class="grupo-grid">${items.map(cardHTML).join('')}</div>
    </div>`;
  }).join('');

  if (window.gtag) {
    gruposUsados.forEach(key => {
      const { grupo: g, items } = porGrupo[key];
      const ga4Items = items.slice(0, 20).map((s, i) => ga4ItemFromSurtido(s, {
        list_name: g.label,
        list_id: g.key,
        index: i
      })).filter(Boolean);
      gtag('event', 'view_item_list', {
        item_list_name: g.label,
        item_list_id: g.key,
        items: ga4Items
      });
    });
  }
}

function getGrupo(s) {
  for (const g of GRUPOS) {
    if (g.codigos.includes(s.codigo)) return g;
  }
  return { key:'otros', label:'Otros', icono:'📦', color:'#9ca3af', codigos:[] };
}

function cardHTML(s) {
  const foto = s.foto_exhibidor || s.foto_card;
  const enCarrito = carrito.some(c => c.id === s.id);
  const esFav = esFavorito(s.id);
  const badge = BADGES[s.id];
  const badgeHtml = badge
    ? `<div class="card-badge badge-${badge}">${badge === 'top' ? '⭐ Más vendido' : '✨ Nuevo'}</div>`
    : '';
  return `<div class="surtido-card">
    <div class="card-titulo" onclick="abrirModal(${s.id})">${s.nombre}${s.codigo && s.codigo.startsWith('RE-') ? '<span class="reducido-tag">(Reducido)</span>' : ''}</div>
    <div class="card-img-wrap" onclick="abrirModal(${s.id})">
      ${foto
        ? `<img src="${foto}" alt="Surtido ${s.nombre} — MAXIFER ${s.codigo}" loading="lazy">`
        : `<div class="card-img-placeholder">📦</div>`}
      ${badgeHtml}
    </div>
    <div class="card-content" onclick="abrirModal(${s.id})">
      <div class="card-codigo">Cód: ${s.codigo}</div>
      ${s.piezas ? `<div class="card-piezas">📌 ${s.piezas} piezas</div>` : ''}
      <div class="card-precio-inline">${formatPrecio(precioConDescuento(s.precio, s.codigo))}</div>
    </div>
    <div class="card-footer">
      <button class="btn-card-agregar ${enCarrito ? 'agregado' : ''}" id="cardBtn${s.id}"
        aria-label="${enCarrito ? 'Quitar del pedido' : 'Agregar al pedido'}"
        onclick="toggleCarritoCard(${s.id}, event)">
        ${enCarrito ? '✅ En pedido' : '🛒 Agregar'}
      </button>
      <button class="btn-fav btn-fav-card ${esFav ? 'fav-on' : ''}" data-id="${s.id}"
        aria-label="${esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
        title="${esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
        onclick="toggleFavorito(${s.id}, event)">${esFav ? '❤️' : '🤍'}</button>
    </div>
  </div>`;
}

function normalizar(s) {
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, '')
    .replace(/[°ºª"""]/g, '')
    .replace(/[\.\,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

var SINONIMOS = {
  'tornillo':['torn','tr'],'tornillos':['torn','tr'],'bulon':['tr'],'bulones':['tr'],
  'tuerca':['tuer','rem','rap'],'tuercas':['tuer','rem','rap'],'clip':['cl','pl'],'clips':['cl','pl'],
  'resorte':['res'],'resortes':['res'],'arandela':['arand','aran'],'arandelas':['arand','aran'],
  'oring':['or'],'orings':['or'],'anillo':['or','seeg'],'anillos':['or','seeg'],
  'terminal':['term','tem'],'terminales':['term','tem'],'carbon':['carb'],'carbones':['carb'],
  'conexion':['conex','conc','con'],'conexiones':['conex','conc','con'],'conector':['conc','con'],'conectores':['conc','con'],
  'chaveta':['cha'],'chavetas':['cha'],'goma':['goma','tap'],'gomas':['goma','tap'],
  'racor':['rac'],'racord':['rac'],'aluminio':['alum'],'plastico':['pl','plast'],'plasticos':['pl','plast'],
  'perilla':['per'],'perillas':['per'],'pico':['inyec'],'picos':['inyec'],'gas':['inyec gas','gas env'],
  'neumatico':['neu'],'neumaticos':['neu'],'abrazadera':['abra'],'abrazaderas':['abra'],
  'regaton':['regat'],'regatones':['regat'],'inserto':['ins'],'insertos':['ins'],
  'seeger':['seeg'],'esparrago':['esparr'],'esparragos':['esparr'],'tarugo':['tar estr'],'tarugos':['tar estr'],
  'alemite':['alem'],'alemites':['alem'],'bronce':['bronce','poliam'],
};

function surtidoScore(s, q) {
  var nombre = normalizar(s.nombre);
  var codigo = normalizar(s.codigo);
  var score = 0;
  if (nombre === q) score = Math.max(score, 1000);
  else if (nombre.startsWith(q)) score = Math.max(score, 500);
  else if ((' ' + nombre).indexOf(' ' + q) !== -1) score = Math.max(score, 300);
  else if (nombre.indexOf(q) !== -1) score = Math.max(score, 100);
  if (codigo === q) score = Math.max(score, 800);
  else if (codigo.startsWith(q)) score = Math.max(score, 400);
  else if (codigo.indexOf(q) !== -1) score = Math.max(score, 80);
  if (score === 0) {
    var comp = COMPOSICION_DATA[s.codigo];
    if (comp && comp.length) {
      for (var i = 0; i < comp.length; i++) {
        if (normalizar(comp[i].d || '').indexOf(q) !== -1) { score = 10; break; }
      }
    }
  }
  return score;
}

function surtidoMatchea(s, q) { return surtidoScore(s, q) > 0; }

function buscarSurtidos(arr, q) {
  if (!q) return arr;
  var conScore = arr.map(function(s){ return { s: s, score: surtidoScore(s, q) }; }).filter(function(x){ return x.score > 0; });
  var sinonimoMatch = SINONIMOS[q];
  if (!sinonimoMatch) {
    for (var key in SINONIMOS) {
      if (key.indexOf(q) === 0 && q.length >= 3) { sinonimoMatch = SINONIMOS[key]; break; }
    }
  }
  if (sinonimoMatch) {
    var yaIncluidos = {};
    conScore.forEach(function(x){ yaIncluidos[x.s.id] = true; });
    arr.forEach(function(s){
      if (yaIncluidos[s.id]) return;
      for (var i = 0; i < sinonimoMatch.length; i++) {
        var altScore = surtidoScore(s, normalizar(sinonimoMatch[i]));
        if (altScore > 0) {
          conScore.push({ s: s, score: Math.round(altScore * 0.6) });
          yaIncluidos[s.id] = true;
          break;
        }
      }
    });
  }
  conScore.sort(function(a, b){ return b.score - a.score; });
  return conScore.map(function(x){ return x.s; });
}

function filtrar() {
  const q = normalizar(document.getElementById('searchInput').value.trim());
  const dest = document.getElementById('destacados');
  if (dest) dest.style.display = (!q && _destacadosCount > 0) ? '' : 'none';
  renderGrid(buscarSurtidos(SURTIDOS, q));
}

function togglePrecios() {
  mostrarPrecios = !mostrarPrecios;
  document.getElementById('appBody').classList.toggle('show-precios', mostrarPrecios);
  document.getElementById('modal').classList.toggle('show-precios', mostrarPrecios);
  document.getElementById('carritoBody').classList.toggle('show-precios', mostrarPrecios);
  if (!mostrarPrecios) {
    descuentoPct = 0;
    document.getElementById('descuentoInput').value = '';
  }
  renderCarritoBody();
  sincronizarBotonesPrecio();
  refrescarVistaActiva();
  if (surtidoActual) abrirModal(surtidoActual.id);
}

function sincronizarBotonesPrecio() {
  ['btnPrecioRev','btnPrecioLibro'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.textContent = mostrarPrecios ? '🙈' : '👁️';
    btn.classList.toggle('on', mostrarPrecios);
  });
  var res = document.getElementById('descuentoResultado');
  if (res && !mostrarPrecios) res.textContent = '';
}

function togglePreciosVista() { togglePrecios(); }

function refrescarVistaActiva() {
  if (vistaActual === 'revista') {
    var q = normalizar(document.getElementById('revBuscar').value.trim());
    var lista = buscarSurtidos(SURTIDOS_ACTIVOS, q);
    document.getElementById('revScroll').removeEventListener('scroll', revOnScroll);
    revConstruir(lista);
  } else if (vistaActual === 'libro') {
    var idxGuardado = libroActual;
    var q = normalizar(document.getElementById('libroBuscar').value.trim());
    var lista = buscarSurtidos(SURTIDOS_ACTIVOS, q);
    libroInit(lista);
    if (idxGuardado < lista.length) {
      libroActual = idxGuardado;
      libroConstruirPagina();
      document.getElementById('libroCounter').textContent = (libroActual + 1) + ' / ' + lista.length;
      document.getElementById('libroAnterior').disabled  = libroActual === 0;
      document.getElementById('libroSiguiente').disabled = libroActual >= lista.length - 1;
    }
  }
}

function abrirModal(id) {
  const s = SURTIDOS.find(x => x.id === id);
  if (!s) return;
  if (!surtidoActual || surtidoActual.id !== id) { modoReducido = false; }
  surtidoActual = s;

  document.getElementById('modalNombre').innerHTML = s.nombre + (s.codigo && s.codigo.startsWith('RE-') ? '<span class="reducido-tag">(Reducido)</span>' : '');
  document.getElementById('modalCod').textContent = 'Código: ' + s.codigo;

  const modal = document.getElementById('modal');
  modal.classList.toggle('show-precios', mostrarPrecios);

  const todasFotos = fotosDelSurtido(s);
  const idxExhibidor = 0;
  const idxGavetas   = todasFotos.findIndex(function(f){ return f.label === 'Gaveteros'; });
  const cantFotosExhibidor = todasFotos.filter(function(f){ return f.label !== 'Gaveteros'; }).length;
  const galeriaLinkHtml = cantFotosExhibidor > 1
    ? `<button type="button" class="galeria-link" onclick="abrirLightbox(fotosDelSurtido(SURTIDOS.find(x=>x.id===${s.id})), 0, '${s.nombre.replace(/'/g,"\\'")}')">📷 Ver ${cantFotosExhibidor} fotos del Exhibidor (Galería)</button>`
    : '';

  const exhClick  = `abrirLightbox(fotosDelSurtido(SURTIDOS.find(x=>x.id===${s.id})), 0, '${s.nombre.replace(/'/g,"\\'")}')`;
  const gavClick  = s.foto_gavetas ? `abrirLightbox(fotosDelSurtido(SURTIDOS.find(x=>x.id===${s.id})), ${idxGavetas >= 0 ? idxGavetas : 0}, '${s.nombre.replace(/'/g,"\\'")}')` : '';

  const fotosHtml = `
    <div class="ficha-stage">
      <div class="ficha-exh-box" onclick="${exhClick}">
        ${s.foto_exhibidor ? `<img src="${s.foto_exhibidor}" alt="Exhibidor del surtido ${s.nombre}">` : `<div class="foto-box-placeholder">🖼️</div>`}
      </div>
      <div class="ficha-gav-wrap">
        <div class="ficha-gav-box" ${gavClick ? `onclick="${gavClick}"` : ''}>
          ${s.foto_gavetas ? `<img src="${s.foto_gavetas}" alt="Gaveteros del surtido ${s.nombre}">` : `<div class="foto-box-placeholder">🗂️</div>`}
        </div>
        <div class="ficha-rol-label">Organizador para Stock</div>
      </div>
    </div>
    ${galeriaLinkHtml}`;

  const pd = PIEZAS_DATA[String(s.id)];
  const precioPzLista = (s.precio && pd && pd.pzs) ? Math.round(s.precio / pd.pzs) : null;
  const precioPzDesc  = (precioPzLista && descuentoPct > 0) ? Math.round(precioConDescuento(s.precio, s.codigo) / pd.pzs) : null;

  const red = VERSION_REDUCIDA[s.codigo] || null;
  const precioBase    = modoReducido && red ? red.precio : s.precio;
  const piezasBase    = modoReducido && red ? red.piezas : s.piezas;
  const precioFinal   = precioConDescuento(precioBase, s.codigo);

  const tieneDescuentoAplicado = (descuentoPct > 0) || !!DESCUENTOS_FIJOS[s.codigo];
  const precioLabelBase = tieneDescuentoAplicado ? 'Precio Neto Final' : 'Precio de Lista';
  const precioHtml = `
    <div class="precio-modal${modoReducido && red ? ' reducido' : ''}">
      <span class="precio-label">${precioLabelBase}${modoReducido && red ? ' (stock red.)' : ''}</span>
      <div><span class="precio-valor">${formatPrecio(precioFinal)}</span><span class="precio-iva">+ IVA</span></div>
    </div>`;

  let toggleReducidoHtml = '';
  let comparativoHtml = '';
  if (red) {
    toggleReducidoHtml = modoReducido
      ? `<button type="button" class="toggle-reducido" onclick="toggleModoReducido(${s.id})">← Volver a versión estándar</button>`
      : `<button type="button" class="toggle-reducido" onclick="toggleModoReducido(${s.id})">Ver opción con stock reducido</button>`;
    if (modoReducido) {
      const precioStdFinal = precioConDescuento(s.precio, s.codigo);
      const precioRedFinal = precioConDescuento(red.precio, s.codigo);
      const ahorro = precioStdFinal - precioRedFinal;
      comparativoHtml = `
        <div class="comparativo-versiones visible">
          <div class="cv-titulo">Comparación</div>
          <div class="cv-fila"><span class="cv-label">Estándar</span><span class="cv-val">${s.piezas} pzs · ${formatPrecio(precioStdFinal)}</span></div>
          <div class="cv-fila"><span class="cv-label">Reducida</span><span class="cv-val">${red.piezas} pzs · ${formatPrecio(precioRedFinal)}</span></div>
          ${ahorro > 0 ? `<div class="cv-fila" style="border-top:1px dashed #d1d5db;margin-top:4px;padding-top:6px"><span class="cv-label">Diferencia</span><span class="cv-val">${formatPrecio(ahorro)} menos</span></div>` : ''}
        </div>`;
    }
  }

  const incluyeBase = Array.isArray(s.incluye) ? s.incluye.slice() : [];
  if (modoReducido && red) {
    for (let i = 0; i < incluyeBase.length; i++) {
      if (/piezas\s+totales/i.test(incluyeBase[i])) {
        const piezasFmt = red.piezas.toLocaleString('es-AR');
        incluyeBase[i] = piezasFmt + ' piezas totales (stock reducido)';
        break;
      }
    }
  }
  const txtGav = textoPiezasEnGavetas(s.codigo);
  if (txtGav) {
    const idxIns = Math.min(2, incluyeBase.length);
    incluyeBase.splice(idxIns, 0, txtGav);
  }
  const cantModelos = MODELOS_DIFERENTES[s.codigo];
  if (cantModelos) {
    incluyeBase.push('Contiene ' + cantModelos + ' modelos diferentes');
  }
  const incluyeHtml = `
    <div class="incluye-list">
      <h4>Incluye</h4>
      ${incluyeBase.map(i => `<div class="incluye-item"><div class="incluye-dot"></div><span>${i}</span></div>`).join('')}
    </div>`;

  let relacionadosHtml = '';
  let btnHtml = '';
  const rels = RELACIONADOS[String(s.id)] || [];
  if (rels.length > 0) {
    const btnStyle = 'margin-top:6px;padding:4px 10px;border-radius:6px;border:1px solid var(--borde);background:var(--fondo);font-size:12px;font-weight:700;cursor:pointer;';
    const cards = rels.map(function(rid) {
      const r = SURTIDOS.find(function(x){ return x.id === rid; });
      if (!r) return '';
      const imgHtml = r.foto_card ? '<img src="' + r.foto_card + '" alt="">' : '🗂️';
      const mismoGrupo = (function() {
        var gS = getGrupo(s), gR = getGrupo(r);
        return gS.key !== 'otros' && gS.key === gR.key;
      })();
      const btnComparar = mismoGrupo
        ? '<button class="rel-comparar" style="' + btnStyle + '" onclick="event.stopPropagation();abrirComparador(' + s.id + ',' + rid + ')">⚖️ Comparar</button>'
        : '';
      return '<div class="rel-card" onclick="cerrarModalBtn();abrirModal(' + rid + ')">'
        + '<div class="rel-img">' + imgHtml + '</div>'
        + '<div class="rel-nombre">' + r.nombre + '</div>'
        + '<div class="rel-cod">' + r.codigo + '</div>'
        + btnComparar
        + '</div>';
    }).join('');
    relacionadosHtml = '<div class="relacionados-wrap"><h4 class="rel-titulo">También te puede interesar</h4><div class="rel-cards">' + cards + '</div></div>';
  }

  const enCarrito = carrito.some(function(c) {
    return c.id === s.id && !!c._reducido === !!(modoReducido && red);
  });
  const btnReducidoClass = (modoReducido && red) ? ' btn-carrito-modal-red' : '';
  btnHtml = '<div style="margin-top:16px">'
    + '<button class="btn-carrito-modal' + (enCarrito ? ' en-carrito' : '') + btnReducidoClass + '" onclick="toggleCarritoVistaConVersion(' + s.id + ', ' + ((modoReducido && red) ? 'true' : 'false') + ', this)">'
    + (enCarrito ? '✓ En el pedido' + ((modoReducido && red) ? ' (reducido)' : '') : '+ Agregar al pedido' + ((modoReducido && red) ? ' (reducido)' : ''))
    + '</button></div>';

  let composicionHtml = '';
  const comp = COMPOSICION_DATA[s.codigo];
  if (comp && comp.length > 0) {
    const tienePrecios = comp.some(item => item.p > 0);
    const filas = comp.map(item => {
      const numTd = `<td class="comp-col-n" style="color:var(--gris-muted);font-size:11px;white-space:nowrap">${item.n || ''}</td>`;
      const precioUnit = modoReducido && item.p_r != null ? item.p_r : (item.p || 0);
      const cantUsar   = modoReducido && item.cant_r != null ? item.cant_r : (item.cant || 0);
      const precioLista = precioUnit ? Math.round(precioUnit) : 0;
      const precioDesc  = (precioLista && (descuentoPct > 0 || DESCUENTOS_FIJOS[s.codigo])) ? Math.round(precioConDescuento(precioUnit, s.codigo)) : precioLista;
      const precioStr   = precioLista ? `<span class="comp-p-desc">$${precioDesc.toLocaleString('es-AR')}</span>` : '';
      return `<tr>${numTd}<td style="font-size:12px">${item.d}</td><td class="comp-col-cant" style="text-align:center;font-size:12px">${cantUsar}</td><td class="comp-col-precio" style="text-align:right;font-size:12px;white-space:nowrap;display:none">${precioStr}</td></tr>`;
    }).join('');
    composicionHtml = `
      <div class="comp-section">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <h4 class="comp-titulo" style="margin:0">COMPOSICIÓN SURTIDO</h4>
          ${tienePrecios ? `<button class="btn-toggle-precios" id="btnToggleComp" onclick="toggleComposicion(this)">$ Ver precios</button>` : ''}
        </div>
        <div id="compWrap" style="display:none">
          <div class="comp-table-wrap">
            <table class="comp-table" id="tablaComp">
              <thead><tr><th class="comp-col-n" style="color:var(--gris-muted)">N°</th><th>Descripción</th><th class="comp-col-cant" style="text-align:center">Cant.</th><th class="comp-col-precio" style="text-align:right;display:none">Precio u.</th></tr></thead>
              <tbody>${filas}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  document.getElementById('modalBody').innerHTML =
    fotosHtml + precioHtml + toggleReducidoHtml + comparativoHtml + incluyeHtml + composicionHtml + relacionadosHtml + btnHtml;

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function toggleFavVista(id, vista) {
  toggleFavorito(id, null);
  var esFav = esFavorito(id);
  var revBtn = document.getElementById('revFav' + id);
  if (revBtn) {
    revBtn.className = 'btn-fav btn-fav-vista' + (esFav ? ' fav-on' : '');
    revBtn.textContent = esFav ? '❤️' : '🤍';
  }
  var libBtn = document.getElementById('libroFav' + id);
  if (libBtn) {
    libBtn.className = 'btn-fav btn-fav-vista' + (esFav ? ' fav-on' : '');
    libBtn.textContent = esFav ? '❤️' : '🤍';
  }
}

function abrirModalConPrecios(id) {
  abrirModal(id);
  setTimeout(function() {
    var btn = document.getElementById('btnToggleComp');
    if (btn) { toggleComposicion(btn); toggleComposicion(btn); }
  }, 50);
}

function toggleComposicion(btn) {
  var wrap  = document.getElementById('compWrap');
  var tabla = document.getElementById('tablaComp');
  if (!wrap) return;
  var state = btn.dataset.state || 'hidden';
  if (state === 'hidden') {
    wrap.style.display = 'block';
    if (tabla) {
      tabla.querySelectorAll('.comp-col-cant').forEach(function(el){ el.style.display = ''; });
      tabla.querySelectorAll('.comp-col-precio').forEach(function(el){ el.style.display = 'none'; });
    }
    btn.classList.add('on');
    btn.textContent = '$ Ver precios';
    btn.dataset.state = 'comp';
  } else if (state === 'comp') {
    if (tabla) {
      tabla.querySelectorAll('.comp-col-cant').forEach(function(el){ el.style.display = 'none'; });
      tabla.querySelectorAll('.comp-col-precio').forEach(function(el){ el.style.display = ''; });
    }
    btn.textContent = '✕ Ocultar';
    btn.dataset.state = 'precios';
  } else {
    wrap.style.display = 'none';
    btn.classList.remove('on');
    btn.textContent = '$ Ver precios';
    btn.dataset.state = 'hidden';
  }
}

function togglePPP(btn, ppp, piezas, pppDesc, desc) {
  const panel = document.getElementById('pppPanel');
  const open = panel.style.display === 'none';
  panel.style.display = open ? 'block' : 'none';
  btn.classList.toggle('open', open);
  btn.textContent = open ? '🔼 Ocultar precio por pieza' : '💲 ¿Cuánto sale cada pieza?';
}

function cerrarModal(e) {
  if (e.target === document.getElementById('modalOverlay')) cerrarModalBtn();
}
function cerrarModalBtn() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  surtidoActual = null;
}

function toggleCarritoCard(id, event) {
  event.stopPropagation();
  const s = SURTIDOS.find(x => x.id === id);
  if (!s) return;
  const idx = carrito.findIndex(c => c.id === id);
  if (idx >= 0) {
    carrito.splice(idx, 1);
    if (window.gtag) {
      gtag('event', 'pedido_remove', { surtido_id: s.id, codigo: s.codigo });
      var itemRm = ga4ItemFromSurtido(s);
      gtag('event', 'remove_from_cart', {
        currency: 'ARS',
        value: itemRm ? itemRm.price : 0,
        item_list_name: itemRm ? itemRm.item_list_name : undefined,
        item_list_id:   itemRm ? itemRm.item_list_id   : undefined,
        items: itemRm ? [itemRm] : []
      });
    }
  } else {
    carrito.push(s); vibrar(); mostrarToast('✅ ' + s.nombre + ' agregado');
    if (window.gtag) {
      gtag('event', 'pedido_add', { surtido_id: s.id, codigo: s.codigo, nombre: s.nombre });
      var itemAdd = ga4ItemFromSurtido(s);
      gtag('event', 'add_to_cart', {
        currency: 'ARS',
        value: itemAdd ? itemAdd.price : 0,
        item_list_name: itemAdd ? itemAdd.item_list_name : undefined,
        item_list_id:   itemAdd ? itemAdd.item_list_id   : undefined,
        items: itemAdd ? [itemAdd] : []
      });
    }
  }
  actualizarFab();
  const enCarrito = carrito.some(c => c.id === id);
  const btn = document.getElementById('cardBtn' + id);
  if (btn) {
    btn.className = 'btn-card-agregar' + (enCarrito ? ' agregado' : '');
    btn.innerHTML = enCarrito ? '✅ En pedido' : '🛒 Agregar';
  }
  const btnModal = document.getElementById('btnAgregar');
  if (btnModal && surtidoActual && surtidoActual.id === id) {
    btnModal.className = 'btn-pedir ' + (enCarrito ? 'agregado' : '');
    btnModal.textContent = enCarrito ? '✅ En mi pedido' : '🛒 Agregar al pedido';
  }
  actualizarBtnPanel(id);
}

function actualizarBtnPanel(id) {
  const btn = document.getElementById('btnPanelAgregar');
  if (!btn || !btn.dataset.surtidoId) return;
  if (parseInt(btn.dataset.surtidoId) !== id) return;
  const enCarrito = carrito.some(c => c.id === id);
  btn.className = 'btn-panel-agregar' + (enCarrito ? ' agregado' : '');
  btn.innerHTML = enCarrito ? '✅ En mi pedido' : '🛒 Agregar al pedido';
}

function toggleCarrito(id) {
  const s = SURTIDOS.find(x => x.id === id);
  if (!s) return;
  const idx = carrito.findIndex(c => c.id === id);
  if (idx >= 0) { carrito.splice(idx, 1); }
  else { carrito.push(s); vibrar(); mostrarToast('✅ ' + s.nombre + ' agregado'); }
  actualizarFab();
  const btn = document.getElementById('btnAgregar');
  if (btn) {
    const enCarrito = carrito.some(c => c.id === id);
    btn.className = 'btn-pedir ' + (enCarrito ? 'agregado' : '');
    btn.textContent = enCarrito ? '✅ En mi pedido' : '🛒 Agregar al pedido';
  }
  const enCarrito2 = carrito.some(c => c.id === id);
  const cardBtn = document.getElementById('cardBtn' + id);
  if (cardBtn) {
    cardBtn.className = 'btn-card-agregar' + (enCarrito2 ? ' agregado' : '');
    cardBtn.innerHTML = enCarrito2 ? '✅ En pedido' : '🛒 Agregar';
  }
  actualizarBtnPanel(id);
}

function actualizarFab() {
  const fab = document.getElementById('carritoFab');
  const badge = document.getElementById('carritoBadge');
  badge.textContent = carrito.length;
  fab.style.display = carrito.length > 0 ? 'flex' : 'none';
  guardarCarrito();
}

function abrirCarrito() {
  renderCarritoBody();
  document.getElementById('carritoOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function cerrarCarrito(e) { if (e.target === document.getElementById('carritoOverlay')) cerrarCarritoBtn(); }
function cerrarCarritoBtn() {
  document.getElementById('carritoOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCarritoBody() {
  const body = document.getElementById('carritoBody');
  if (carrito.length === 0) {
    body.innerHTML = `<div class="empty-carrito"><div class="empty-icon">🛒</div>Tu pedido está vacío.<br>Agregá surtidos desde el catálogo.</div>`;
    return;
  }
  const spClass = mostrarPrecios ? 'show-precios' : '';
  const total = carrito.reduce((s, c) => {
    const precioBase = c._reducido ? c._precioRed : c.precio;
    return s + precioConDescuento(precioBase, c.codigo);
  }, 0);
  const items = carrito.map((c, idx) => {
    const precioBase = c._reducido ? c._precioRed : c.precio;
    const itemClass = c._reducido ? 'carrito-item is-reducido' : 'carrito-item';
    const badge = c._reducido ? '<span class="carrito-item-badge-red">REDUCIDO</span>' : '';
    return `<div class="${itemClass}"><div class="carrito-item-info"><div class="carrito-item-nombre">${c.nombre}${badge}</div><div class="carrito-item-cod">Cód: ${c.codigo}</div><div class="carrito-item-precio">${formatPrecio(precioConDescuento(precioBase, c.codigo))} + IVA</div></div><button class="btn-rm" onclick="quitarItemIdx(${idx})" aria-label="Quitar del pedido">✕</button></div>`;
  }).join('');
  body.innerHTML = `<div class="${spClass}">${items}<div class="carrito-total"><div class="total-label">Total de lista (sin IVA)</div><div class="total-valor">${formatPrecio(total)}</div></div><button class="btn-enviar-wa" onclick="enviarWhatsApp()"><span>📲</span> Enviar pedido por WhatsApp</button><button class="btn-vaciar" onclick="vaciarCarrito()">Vaciar pedido</button></div>`;
}

function quitarItem(id) {
  carrito = carrito.filter(c => c.id !== id);
  actualizarFab();
  renderCarritoBody();
  if (surtidoActual && surtidoActual.id === id) {
    const btn = document.getElementById('btnAgregar');
    if (btn) { btn.className = 'btn-pedir'; btn.textContent = '🛒 Agregar al pedido'; }
  }
}

function quitarItemIdx(idx) {
  if (idx < 0 || idx >= carrito.length) return;
  const removido = carrito[idx];
  carrito.splice(idx, 1);
  actualizarFab();
  renderCarritoBody();
  if (surtidoActual && removido && surtidoActual.id === removido.id) {
    abrirModal(removido.id);
  }
}

function vaciarCarrito() {
  carrito = [];
  actualizarFab();
  renderCarritoBody();
}

var VENDEDORES = {
  'Maxi':     { nombre: 'Maximiliano Gordillo', wa: '5491150408378' },
  'Micky':    { nombre: 'Micky',                wa: '5491164865752' },
  'Victor':   { nombre: 'Victor Gordillo',      wa: '5491149367336' },
  'Nadia':    { nombre: 'Nadia',                wa: '5491128243870' },
  'Eduardo':  { nombre: 'Eduardo',              wa: '5492634688163' },
  'Federico': { nombre: 'Federico',             wa: '5493516017663' },
};

var WA_NUMERO = '5491150408378';

(function() {
  var hash = window.location.hash.replace('#', '');
  var params = {};
  hash.split('&').forEach(function(p) {
    var kv = p.split('=');
    if (kv.length === 2) params[kv[0]] = kv[1];
  });
  var key = params['wa'];
  if (key && VENDEDORES[key]) {
    WA_NUMERO = VENDEDORES[key].wa;
    window.addEventListener('DOMContentLoaded', function() {
      var v = VENDEDORES[key];
      var nameEl = document.getElementById('vendBadgeName');
      var badge  = document.getElementById('vendBadge');
      var fab    = document.getElementById('vendWaFab');
      if (nameEl && badge) { nameEl.textContent = v.nombre || key; badge.classList.add('show'); }
      if (fab) {
        fab.href = 'https://wa.me/' + v.wa + '?text=' + encodeURIComponent('Hola ' + (v.nombre || key) + ', te consulto por el catálogo MAXIFER.');
        fab.classList.add('show');
      }
    });
  }
  if (key && key !== 'Maxi') {
    window.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('[data-only-maxi]').forEach(function(el) { el.style.display = 'none'; });
    });
  }
  var rawDesc = String(params['desc'] || '').toLowerCase().trim();
  var modoDesc = parseInt(rawDesc) || 0;
  var modoPrecio = String(params['precio'] || '').toLowerCase().trim();
  if (!modoPrecio && (rawDesc === 'lista' || rawDesc === 'sin')) { modoPrecio = rawDesc; }
  var vieneConfigurado = (modoDesc > 0 || modoPrecio || params['wa']);
  if (vieneConfigurado) {
    window.addEventListener('DOMContentLoaded', function() {
      var overlay = document.getElementById('modalDescuentoOverlay');
      if (overlay) overlay.classList.remove('open');
      var descWrap = document.getElementById('descuentoWrap');
      if (descWrap) descWrap.style.display = 'none';
      ['btnPrecioRev','btnPrecioLibro'].forEach(function(id) { var b = document.getElementById(id); if (b) b.style.display = 'none'; });
      if (modoDesc > 0) {
        descuentoPct = modoDesc;
        mostrarPrecios = true;
        document.getElementById('appBody').classList.add('show-precios');
        document.getElementById('modal').classList.add('show-precios');
        document.getElementById('carritoBody').classList.add('show-precios');
        var inp = document.getElementById('descuentoInput');
        if (inp) inp.value = modoDesc;
        aplicarDescuento();
        sincronizarBotonesPrecio();
        refrescarVistaActiva();
      } else if (modoPrecio === 'lista') {
        descuentoPct = 0;
        try { guardarDescuento(); } catch(e) {}
        var inp2 = document.getElementById('descuentoInput');
        if (inp2) inp2.value = '';
        mostrarPrecios = true;
        document.getElementById('appBody').classList.add('show-precios');
        document.getElementById('modal').classList.add('show-precios');
        document.getElementById('carritoBody').classList.add('show-precios');
        sincronizarBotonesPrecio();
        refrescarVistaActiva();
      } else if (modoPrecio === 'sin') {
        descuentoPct = 0;
        try { guardarDescuento(); } catch(e) {}
        mostrarPrecios = false;
        document.getElementById('appBody').classList.remove('show-precios');
      } else if (params['wa']) {
        descuentoPct = 0;
        try { guardarDescuento(); } catch(e) {}
        var inp3 = document.getElementById('descuentoInput');
        if (inp3) inp3.value = '';
        mostrarPrecios = true;
        document.getElementById('appBody').classList.add('show-precios');
        document.getElementById('modal').classList.add('show-precios');
        document.getElementById('carritoBody').classList.add('show-precios');
        sincronizarBotonesPrecio();
        refrescarVistaActiva();
      }
    });
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      descuentoPct = 0;
      try { guardarDescuento(); } catch(e) {}
      var inp4 = document.getElementById('descuentoInput');
      if (inp4) inp4.value = '';
      mostrarPrecios = true;
      document.getElementById('appBody').classList.add('show-precios');
      document.getElementById('modal').classList.add('show-precios');
      document.getElementById('carritoBody').classList.add('show-precios');
      sincronizarBotonesPrecio();
      refrescarVistaActiva();
    });
  }
})();

function enviarWhatsApp() {
  if (carrito.length === 0) return;
  function getPrecio(c) { return c._reducido ? c._precioRed : c.precio; }
  function getPiezas(c) { return c._reducido ? c._piezasRed : c.piezas; }
  if (window.gtag) {
    var totalLista = carrito.reduce(function(s, c){ return s + (getPrecio(c) || 0); }, 0);
    gtag('event', 'pedido_whatsapp', { items: carrito.length, total_lista: totalLista, descuento_pct: descuentoPct });
    var ga4Items = carrito.map(function(c, i) {
      var item = ga4ItemFromSurtido(c, { price: getPrecio(c), index: i });
      if (c._reducido && item) item.item_variant = 'reducido';
      return item;
    }).filter(Boolean);
    gtag('event', 'begin_checkout', {
      currency: 'ARS',
      value: totalLista,
      coupon: descuentoPct > 0 ? ('descuento_' + descuentoPct) : undefined,
      items: ga4Items
    });
  }
  var ahora = new Date();
  var fecha = ahora.toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' });
  var hora  = ahora.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' });
  var msg = '';
  msg += '🏭 *MAXIFER — Pedido de Surtidos*\n';
  msg += '📅 ' + fecha + '  🕐 ' + hora + '\n';
  if (descuentoPct > 0) msg += '🏷️ Descuento aplicado: *' + descuentoPct + '%*\n';
  msg += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
  carrito.forEach(function(c, i) {
    var marcaRed = c._reducido ? ' — *REDUCIDO*' : '';
    msg += '*' + (i + 1) + '. ' + c.nombre + marcaRed + '*\n';
    msg += '   📦 Cód: `' + c.codigo + '`' + (c._reducido ? ' _(stock reducido)_' : '') + '\n';
    var pz = getPiezas(c);
    if (pz) msg += '   📌 ' + pz + ' piezas\n';
    var precioBase = getPrecio(c);
    if (mostrarPrecios && precioBase) {
      var pDesc = precioConDescuento(precioBase, c.codigo);
      if (descuentoPct > 0) {
        msg += '   💲 Lista: $ ' + formatPrecio(precioBase) + '  →  *$ ' + formatPrecio(pDesc) + '* + IVA\n';
      } else {
        msg += '   💲 $ ' + formatPrecio(pDesc) + ' + IVA\n';
      }
    }
    msg += '\n';
  });
  msg += '━━━━━━━━━━━━━━━━━━━━━━\n';
  msg += '🛒 *' + carrito.length + ' surtido' + (carrito.length > 1 ? 's' : '') + ' seleccionado' + (carrito.length > 1 ? 's' : '') + '*\n';
  if (mostrarPrecios) {
    var totalDesc = carrito.reduce(function(s, c){ return s + precioConDescuento(getPrecio(c), c.codigo); }, 0);
    if (descuentoPct > 0) {
      var totalLista = carrito.reduce(function(s, c){ return s + getPrecio(c); }, 0);
      msg += '💰 Lista: $ ' + formatPrecio(totalLista) + ' + IVA\n';
      msg += '✅ *Con ' + descuentoPct + '% dto: $ ' + formatPrecio(totalDesc) + '* + IVA\n';
    } else {
      msg += '💰 *Total lista:* $ ' + formatPrecio(totalDesc) + ' + IVA\n';
    }
  }
  msg += '\n_Enviado desde el Catálogo Digital MAXIFER_\n_fabricamaxifer.com_';
  var waUrl = 'https://wa.me/' + WA_NUMERO + '?text=' + encodeURIComponent(msg);
  window.open(waUrl, '_blank');
}

var lbFotos  = [];
var lbIdx    = 0;
var lbDots   = [];
var lbTouchX = null;

function abrirLightbox(fotos, idxInicial, titulo) {
  lbFotos = fotos;
  lbIdx   = idxInicial || 0;
  document.getElementById('lightboxTitulo').textContent = titulo || '';
  var scroll = document.getElementById('lightboxScroll');
  scroll.innerHTML = '';
  lbDots = [];
  fotos.forEach(function(f) {
    var slide = document.createElement('div');
    slide.className = 'lightbox-slide';
    slide.innerHTML = '<img src="' + f.src + '" alt="' + (f.label || '') + '">';
    scroll.appendChild(slide);
  });
  var dotsEl = document.getElementById('lightboxDots');
  dotsEl.innerHTML = '';
  if (fotos.length > 1) {
    fotos.forEach(function(_, i) {
      var d = document.createElement('div');
      d.className = 'lightbox-dot' + (i === lbIdx ? ' on' : '');
      dotsEl.appendChild(d);
      lbDots.push(d);
    });
  }
  lbActualizarUI();
  setTimeout(function() { scroll.scrollLeft = lbIdx * scroll.offsetWidth; }, 30);
  scroll.onscroll = function() {
    var idx = Math.round(scroll.scrollLeft / (scroll.offsetWidth || 1));
    if (idx !== lbIdx) { lbIdx = idx; lbActualizarUI(); }
  };
  scroll.ontouchstart = function(e) { lbTouchX = e.touches[0].clientX; };
  scroll.ontouchend = null;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function lbActualizarUI() {
  var f = lbFotos[lbIdx];
  document.getElementById('lightboxLabel').textContent   = f ? (f.label || '') : '';
  document.getElementById('lightboxCounter').textContent = lbFotos.length > 1 ? (lbIdx + 1) + ' / ' + lbFotos.length : '';
  lbDots.forEach(function(d, i){ d.classList.toggle('on', i === lbIdx); });
  document.getElementById('lightboxPrev').style.display = (lbIdx > 0 && lbFotos.length > 1) ? 'flex' : 'none';
  document.getElementById('lightboxNext').style.display = (lbIdx < lbFotos.length - 1) ? 'flex' : 'none';
}

function lightboxNav(dir) {
  var nuevo = lbIdx + dir;
  if (nuevo < 0 || nuevo >= lbFotos.length) return;
  lbIdx = nuevo;
  var scroll = document.getElementById('lightboxScroll');
  scroll.scrollTo({ left: lbIdx * scroll.offsetWidth, behavior: 'smooth' });
  lbActualizarUI();
}

function cerrarLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function fotosDelSurtido(s) {
  var fotos = [];
  if (s.foto_exhibidor)   fotos.push({ src: s.foto_exhibidor,   label: 'Exhibidor' });
  if (s.foto_exhibidor_2) fotos.push({ src: s.foto_exhibidor_2, label: 'Vista 2' });
  if (s.foto_exhibidor_3) fotos.push({ src: s.foto_exhibidor_3, label: 'Vista 3' });
  if (s.foto_gavetas)     fotos.push({ src: s.foto_gavetas,     label: 'Gaveteros' });
  if (s.foto_card && s.foto_card !== s.foto_exhibidor) fotos.push({ src: s.foto_card, label: 'Detalle' });
  return fotos;
}

var CODIGOS_FERRETERO = ["PL CH.","RES. LF","RES. LC","RES. LB","RES. LP","RES. COMP.","CHA. PART.","CHA. CH.","GA+CH COMP.","OR. CH.","OR. GR.","ARAND. CH.","ARAND. LP.","ARAND. COMP.","ARAN. CO-FI-AL","TAR. ESTR.","CARB. 1","CARB. COMPL.","REGAT.","TOP. TAP. GOMA","INYEC. GAS ENV.","PER. 1","PER. 2","PER. COMP.","TERM. CH.","TEM. COMP.","INTERR. PULSA.","RE-CB1-01","RE-CB2-02","RE-PGS-01"];
var CODIGOS_AUTOMOTOR = ["PL Nac. 160 M.","CL. IMP COM","RES. LA","OR. CH.","OR. GR.","OR. COMP.","CONEX. ALUM. 1","CONEX. ALUM. 2","Conex. Alum. L. Temp.","Conex. Alum. Mayor Rot.","CONC. PL","CONC. COMB. Red","CON. NEU.","CON. NEU. COMPL.","CON. NEU. NUEV.","RE-CNE-01","CON. NEU. + RAC.","BRONCE","RAC. CH.","RAC. GR.","SEEG.","INS.","RET. ARAN.","ALEM.","TERM. CH.","TERM. NU.","TEM. COMP.","ARAND. INYEC.","UN. ORIENT.","ABRA. GOMA","ESP. ELAS.","ESPARR.","TUER. RAP.","TER. REM.","TR L. Compl.","TR IMP.","TR Espec. + Torn.","Torn. Esp.","T. REM.+T. RAP.","TAP. CAR.","RE-RC1-01","RE-RC2-02","RE-BPF-01","RE-IP1-01","RE-IP2-02","RE-EEL-01","RE-ESA-01","RE-SEG-01","RE-UNO-01"];

var urlParams = new URLSearchParams(window.location.search);
var tipoParam = (urlParams.get('tipo') || 'completo').toLowerCase();

var SURTIDOS_ACTIVOS;
if (tipoParam === 'ferretero') {
  SURTIDOS_ACTIVOS = SURTIDOS.filter(function(s){ return CODIGOS_FERRETERO.indexOf(s.codigo) !== -1; });
  document.querySelector('.header').style.background = '#1a5e2a';
  document.querySelector('.header-title h1').textContent = 'Catálogo Ferretero';
} else if (tipoParam === 'automotor') {
  SURTIDOS_ACTIVOS = SURTIDOS.filter(function(s){ return CODIGOS_AUTOMOTOR.indexOf(s.codigo) !== -1; });
  document.querySelector('.header').style.background = '#7c2d12';
  document.querySelector('.header-title h1').textContent = 'Catálogo Repuestero';
} else {
  SURTIDOS_ACTIVOS = SURTIDOS.slice();
}

function noFoto(s) { return s.foto_card || s.foto_exhibidor || ''; }

var vistaActual = 'grilla';
var topbarTimer = null;

function mostrarTopbar(idTopbar) {
  var tb = document.getElementById(idTopbar);
  if (!tb) return;
  tb.classList.remove('oculta');
  clearTimeout(topbarTimer);
  topbarTimer = setTimeout(function(){ tb.classList.add('oculta'); }, 3000);
}

function activarAutoOcultar(idTopbar, contenedor) {
  var el = document.getElementById(contenedor);
  if (!el) return;
  el.addEventListener('click', function(){ mostrarTopbar(idTopbar); });
  el.addEventListener('touchstart', function(){ mostrarTopbar(idTopbar); }, { passive: true });
  var tb = document.getElementById(idTopbar);
  if (tb) {
    tb.addEventListener('click', function(e){ e.stopPropagation(); clearTimeout(topbarTimer); });
    tb.addEventListener('touchstart', function(e){ e.stopPropagation(); clearTimeout(topbarTimer); }, { passive: true });
  }
}

function cambiarVista(vista) {
  vistaActual = vista;
  var tabs = ['grilla','revista','libro'];
  tabs.forEach(function(t) {
    var btn = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (btn) btn.classList.toggle('active', t === vista);
  });
  var header = document.querySelector('.header');
  if (header) header.style.display = (vista === 'grilla') ? '' : 'none';
  document.getElementById('appBody').style.display = (vista === 'grilla') ? '' : 'none';
  var ids = ['vistaRevista','vistaLibro'];
  ids.forEach(function(id){ document.getElementById(id).classList.remove('activa'); });
  clearTimeout(topbarTimer);
  if (vista === 'revista') {
    document.getElementById('vistaRevista').classList.add('activa');
    revConstruir(SURTIDOS_ACTIVOS);
    setTimeout(function(){ mostrarTopbar('revTopbar'); }, 80);
    activarAutoOcultar('revTopbar', 'vistaRevista');
  } else if (vista === 'libro') {
    document.getElementById('vistaLibro').classList.add('activa');
    libroInit(SURTIDOS_ACTIVOS);
    setTimeout(function(){ mostrarTopbar('libroTopbar'); }, 80);
    activarAutoOcultar('libroTopbar', 'vistaLibro');
  }
}

(function propagarContextoEnBotonInicio(){
  function propagar() {
    var btn = document.getElementById('btnVolverHome');
    if (!btn) return;
    var suffix = (window.location.search || '') + (window.location.hash || '');
    btn.setAttribute('href', 'index.html' + suffix);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', propagar);
  } else {
    propagar();
  }
  window.addEventListener('hashchange', propagar);
})();

var revLista = [];
var revIdx   = 0;

function revConstruir(lista) {
  revLista = lista;
  revIdx   = 0;
  var scroll = document.getElementById('revScroll');
  var dots   = document.getElementById('revDots');
  scroll.innerHTML = '';
  dots.innerHTML   = '';
  lista.forEach(function(s, i) {
    var foto = s.foto_exhibidor || s.foto_card || '';
    var incluyeHTML = (s.incluye || []).slice(0,3).map(function(it){ return '<div>• ' + it + '</div>'; }).join('');
    var precioHTML  = (mostrarPrecios && s.precio) ? '<div class="rev-precio">$ ' + formatPrecio(precioConDescuento(s.precio, s.codigo)) + '</div>' : '';
    var piezasHTML  = s.piezas ? '<div class="rev-piezas">' + s.piezas + ' piezas</div>' : '';
    var enCarrito   = carrito.some(function(c){ return c.id === s.id; });
    var fotosExtra  = [s.foto_exhibidor_2, s.foto_exhibidor_3, s.foto_gavetas].filter(Boolean);
    var btnFotosHTML = fotosExtra.length ? '<button class="btn-rev-fotos" onclick="abrirFotosPanel(' + s.id + ')">📷 Más fotos (' + fotosExtra.length + ')</button>' : '';
    var hasMedidas = !!PRECIOS_DATA[s.codigo];
    var esFav = esFavorito(s.id);
    var btnMedidasHTML = hasMedidas ? '<button class="btn-rev-fotos" onclick="abrirModalConPrecios(' + s.id + ')">💲 Ver medidas y precios</button>' : '';
    var page = document.createElement('div');
    page.className = 'rev-page';
    page.id = 'revPage' + s.id;
    var fotoClick = 'abrirLightbox(fotosDelSurtido(SURTIDOS.find(function(x){return x.id===' + s.id + ';})),0,\'' + s.nombre.replace(/'/g,"\\'") + '\')';
    page.innerHTML = (foto ? '<img src="' + foto + '" loading="lazy" style="cursor:zoom-in" onclick="' + fotoClick + '">' : '<div style="width:100%;height:100%;background:#111"></div>')
      + '<div class="rev-overlay"></div><div class="rev-info"><div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2px"><div><div class="rev-nombre">' + s.nombre + (s.codigo && s.codigo.startsWith('RE-') ? '<span class="reducido-tag">(Reducido)</span>' : '') + '</div><div class="rev-cod">' + s.codigo + '</div></div><button class="btn-fav btn-fav-vista ' + (esFav ? 'fav-on' : '') + '" id="revFav' + s.id + '" onclick="toggleFavVista(' + s.id + ', \'rev\')" style="flex-shrink:0;margin-left:8px;position:relative;top:auto;right:auto;left:auto;bottom:auto">' + (esFav ? '❤️' : '🤍') + '</button></div><div class="rev-incluye">' + incluyeHTML + '</div>' + precioHTML + piezasHTML + '<div class="rev-actions"><button class="btn-rev-agregar' + (enCarrito ? ' agregado' : '') + '" id="revBtn' + s.id + '" onclick="toggleCarritoVista(' + s.id + ')">' + (enCarrito ? '✅ En mi pedido' : '🛒 Agregar al pedido') + '</button>' + btnFotosHTML + btnMedidasHTML + '</div></div>';
    scroll.appendChild(page);
    var dot = document.createElement('div');
    dot.className = 'rev-dot' + (i === 0 ? ' on' : '');
    dots.appendChild(dot);
  });
  document.getElementById('revCounter').textContent = lista.length ? '1 / ' + lista.length : '0 / 0';
  scroll.addEventListener('scroll', revOnScroll, { passive: true });
  actualizarFlechasRev();
}

function revOnScroll() {
  var scroll = document.getElementById('revScroll');
  var idx = Math.round(scroll.scrollLeft / scroll.offsetWidth);
  if (idx !== revIdx) {
    revIdx = idx;
    document.getElementById('revCounter').textContent = (idx + 1) + ' / ' + revLista.length;
    var dots = document.querySelectorAll('.rev-dot');
    dots.forEach(function(d, i){ d.classList.toggle('on', i === idx); });
    actualizarFlechasRev();
  }
}

function revNav(dir) {
  if (!revLista || revLista.length === 0) return;
  var nuevoIdx = revIdx + dir;
  if (nuevoIdx < 0 || nuevoIdx >= revLista.length) return;
  var scroll = document.getElementById('revScroll');
  scroll.scrollTo({ left: nuevoIdx * scroll.offsetWidth, behavior: 'smooth' });
}

function actualizarFlechasRev() {
  var prev = document.getElementById('revAnterior');
  var next = document.getElementById('revSiguiente');
  if (!prev || !next || !revLista) return;
  prev.disabled = revIdx <= 0;
  next.disabled = revIdx >= revLista.length - 1;
}

function revFiltrar() {
  var q = normalizar(document.getElementById('revBuscar').value.trim());
  var lista = buscarSurtidos(SURTIDOS_ACTIVOS, q);
  document.getElementById('revScroll').removeEventListener('scroll', revOnScroll);
  revConstruir(lista);
}

var libroLista  = [];
var libroActual = 0;
var libroAnimando = false;
var libroTouchX = null;

function libroInit(lista) {
  libroLista  = lista;
  libroActual = 0;
  libroAnimando = false;
  libroConstruirPagina();
  document.getElementById('libroCounter').textContent = lista.length ? '1 / ' + lista.length : '0 / 0';
  document.getElementById('libroAnterior').disabled  = true;
  document.getElementById('libroSiguiente').disabled = lista.length <= 1;
  var stage = document.getElementById('libroStage');
  stage.ontouchstart = function(e){ libroTouchX = e.touches[0].clientX; };
  stage.ontouchend   = function(e){
    if (libroTouchX === null) return;
    var dx = e.changedTouches[0].clientX - libroTouchX;
    libroTouchX = null;
    if (Math.abs(dx) > 40) libroNav(dx < 0 ? 1 : -1);
  };
}

function libroConstruirPagina() {
  var stage = document.getElementById('libroStage');
  stage.innerHTML = '';
  if (!libroLista.length) return;
  stage.appendChild(libroHacerCard(libroActual, 'current'));
  if (libroActual + 1 < libroLista.length) {
    stage.appendChild(libroHacerCard(libroActual + 1, 'next-page'));
  }
}

function libroHacerCard(idx, cls) {
  var s    = libroLista[idx];
  var foto = noFoto(s);
  var colIdx = idx % 10;
  var incluyeHTML = (s.incluye || []).slice(0,3).map(function(it){ return '<div>• ' + it + '</div>'; }).join('');
  var precioHTML  = (mostrarPrecios && s.precio) ? '<span class="libro-price">$' + formatPrecio(precioConDescuento(s.precio, s.codigo)) + '</span>' : '<span></span>';
  var enCarrito   = carrito.some(function(c){ return c.id === s.id; });
  var fotosExtra  = [s.foto_exhibidor_2, s.foto_exhibidor_3, s.foto_gavetas].filter(Boolean);
  var btnFotosHTML = fotosExtra.length ? '<button class="btn-libro-fotos" onclick="abrirFotosPanel(' + s.id + ')">📷 +' + fotosExtra.length + '</button>' : '';
  var div = document.createElement('div');
  div.className = 'libro-page ' + cls;
  var fotoClickLibro = 'abrirLightbox(fotosDelSurtido(SURTIDOS.find(function(x){return x.id===' + s.id + ';})),0,\'' + s.nombre.replace(/'/g,"\\'") + '\')';
  var esFavLibro = esFavorito(s.id);
  div.innerHTML = '<div class="libro-top" style="cursor:zoom-in" onclick="' + fotoClickLibro + '">' + (foto ? '<img src="' + foto + '" loading="lazy">' : '<div style="width:100%;height:100%;background:#111"></div>') + '<button class="btn-fav btn-fav-vista ' + (esFavLibro ? 'fav-on' : '') + '" id="libroFav' + s.id + '" onclick="event.stopPropagation();toggleFavVista(' + s.id + ',\'libro\')">' + (esFavLibro ? '❤️' : '🤍') + '</button></div><div class="libro-bottom lb-c' + colIdx + '"><div><div class="libro-num">Página ' + (idx + 1) + '</div><div class="libro-page-nombre">' + s.nombre + (s.codigo && s.codigo.startsWith('RE-') ? '<span class="reducido-tag">(Reducido)</span>' : '') + '</div><div class="libro-page-cod">' + s.codigo + '</div></div><div class="libro-divider"></div><div class="libro-incluye">' + incluyeHTML + '</div><div class="libro-footer-info">' + precioHTML + '<span class="libro-piezas">' + (s.piezas ? s.piezas + ' pzas' : '') + '</span></div><div class="libro-actions"><button class="btn-libro-agregar' + (enCarrito ? ' agregado' : '') + '" id="libroBtn' + s.id + '" onclick="toggleCarritoVista(' + s.id + ')">' + (enCarrito ? '✅ En pedido' : '🛒 Agregar') + '</button>' + btnFotosHTML + (PRECIOS_DATA[s.codigo] ? '<button class="btn-libro-fotos" onclick="abrirModalConPrecios(' + s.id + ')">💲 Medidas y precios</button>' : '') + '</div></div>';
  return div;
}

function libroNav(dir) {
  if (libroAnimando) return;
  var nuevo = libroActual + dir;
  if (nuevo < 0 || nuevo >= libroLista.length) return;
  libroAnimando = true;
  var stage = document.getElementById('libroStage');
  if (dir === 1) {
    var curr = stage.querySelector('.current');
    if (curr) { curr.classList.remove('current'); curr.classList.add('turning'); }
    libroActual = nuevo;
    var nextEl = stage.querySelector('.next-page');
    if (nextEl) { nextEl.classList.remove('next-page'); nextEl.classList.add('current'); }
    if (libroActual + 1 < libroLista.length) {
      stage.appendChild(libroHacerCard(libroActual + 1, 'next-page'));
    }
    setTimeout(function(){
      var turned = stage.querySelector('.turning');
      if (turned) { turned.classList.remove('turning'); turned.classList.add('turned'); }
      var turneds = stage.querySelectorAll('.turned');
      if (turneds.length > 1) { turneds[0].parentNode.removeChild(turneds[0]); }
      libroAnimando = false;
    }, 720);
  } else {
    libroActual = nuevo;
    libroConstruirPagina();
    libroAnimando = false;
  }
  document.getElementById('libroCounter').textContent = (libroActual + 1) + ' / ' + libroLista.length;
  document.getElementById('libroAnterior').disabled  = libroActual === 0;
  document.getElementById('libroSiguiente').disabled = libroActual >= libroLista.length - 1;
}

function libroFiltrar() {
  var q = normalizar(document.getElementById('libroBuscar').value.trim());
  var lista = buscarSurtidos(SURTIDOS_ACTIVOS, q);
  libroInit(lista);
}

function extraerGavetas(s) {
  if (!s.incluye) return null;
  for (var i = 0; i < s.incluye.length; i++) {
    var m = s.incluye[i].match(/(\d+)\s+gaveta/i);
    if (m) return parseInt(m[1]);
  }
  return null;
}
function extraerExhibidores(s) {
  if (!s.incluye) return null;
  for (var i = 0; i < s.incluye.length; i++) {
    var m = s.incluye[i].match(/(\d+)\s+exhibidor/i);
    if (m) return parseInt(m[1]);
  }
  return null;
}

function abrirComparador(idA, idB) {
  var a = SURTIDOS.find(function(x){ return x.id === idA; });
  var b = SURTIDOS.find(function(x){ return x.id === idB; });
  if (!a || !b) return;
  var precioA = precioConDescuento(a.precio, a.codigo) || 0;
  var precioB = precioConDescuento(b.precio, b.codigo) || 0;
  var pzA = a.piezas || 0;
  var pzB = b.piezas || 0;
  var gavA = extraerGavetas(a);
  var gavB = extraerGavetas(b);
  var compA = COMPOSICION_DATA[a.codigo] || null;
  var compB = COMPOSICION_DATA[b.codigo] || null;
  var modA = compA ? compA.length : (a.tabla && a.tabla.length) ? a.tabla.length : (PRECIOS_DATA[a.codigo] && PRECIOS_DATA[a.codigo].length) ? PRECIOS_DATA[a.codigo].length : null;
  var modB = compB ? compB.length : (b.tabla && b.tabla.length) ? b.tabla.length : (PRECIOS_DATA[b.codigo] && PRECIOS_DATA[b.codigo].length) ? PRECIOS_DATA[b.codigo].length : null;
  var nsA = compA ? compA.map(function(i){ return i.n; }) : null;
  var nsB = compB ? compB.map(function(i){ return i.n; }) : null;
  var aSubsetB = nsA && nsB && nsA.every(function(n){ return nsB.indexOf(n) !== -1; });
  var bSubsetA = nsA && nsB && nsB.every(function(n){ return nsA.indexOf(n) !== -1; });
  function diff(valA, valB, fmt, invert) {
    if (!valA || !valB) return '';
    var d = valA - valB;
    if (d === 0) return '';
    var label = (d > 0 ? '+' : '') + fmt(d);
    var cls = invert ? (d > 0 ? 'menos' : 'mas') : (d > 0 ? 'mas' : 'menos');
    return '<span class="comp-diff ' + cls + '">' + label + '</span>';
  }
  function celda(valA, valB, formatVal, formatDiff, invert, sub) {
    var winA = valA && valB && (invert ? valA < valB : valA > valB);
    var winB = valA && valB && (invert ? valB < valA : valB > valA);
    var dA = valB ? diff(valA, valB, formatDiff, invert) : '';
    var dB = valA ? diff(valB, valA, formatDiff, invert) : '';
    var vA = valA ? formatVal(valA) : '—';
    var vB = valB ? formatVal(valB) : '—';
    return [
      '<span class="comp-val' + (winA ? ' comp-winner' : '') + '">' + vA + '</span>' + (sub ? '<span class="comp-sub">' + sub + '</span>' : '') + dA,
      '<span class="comp-val' + (winB ? ' comp-winner' : '') + '">' + vB + '</span>' + (sub ? '<span class="comp-sub">' + sub + '</span>' : '') + dB
    ];
  }
  var showPrecios = mostrarPrecios && (precioA > 0 || precioB > 0);
  var rows = [];
  if (showPrecios) {
    var cP = celda(precioA, precioB,
      function(v){ return '$ ' + Math.round(v).toLocaleString('es-AR'); },
      function(d){ return (d > 0 ? '+' : '-') + '$ ' + Math.round(Math.abs(d)).toLocaleString('es-AR'); },
      true, '+ IVA');
    rows.push(['💰 Inversión total', cP[0], cP[1]]);
  }
  if (pzA || pzB) {
    var cPz = celda(pzA, pzB,
      function(v){ return v.toLocaleString('es-AR'); },
      function(d){ return (d > 0 ? '+' : '-') + Math.abs(d); },
      false, 'piezas totales');
    rows.push(['📦 Piezas', cPz[0], cPz[1]]);
  }
  var modCeldaA, modCeldaB;
  if (modA && modB) {
    var subA = aSubsetB ? '<span class="comp-sub">(todos incluidos)</span>' : '<span class="comp-sub">modelos</span>';
    var subB = bSubsetA ? '<span class="comp-sub">(todos incluidos)</span>' : '<span class="comp-sub">modelos</span>';
    var tagA = aSubsetB ? '' : (bSubsetA ? '<span class="comp-diff mas">+' + (modA - modB) + ' adicionales</span>' : '');
    var tagB = bSubsetA ? '' : (aSubsetB ? '<span class="comp-diff mas">+' + (modB - modA) + ' adicionales</span>' : '');
    var winA = !aSubsetB && modA > modB;
    var winB = !bSubsetA && modB > modA;
    modCeldaA = '<span class="comp-val' + (winA ? ' comp-winner' : '') + '">' + modA + '</span>' + subA + tagA;
    modCeldaB = '<span class="comp-val' + (winB ? ' comp-winner' : '') + '">' + modB + '</span>' + subB + tagB;
  } else {
    modCeldaA = modA ? '<span class="comp-val">' + modA + '</span><span class="comp-sub">modelos</span>' : '<span class="comp-val">—</span>';
    modCeldaB = modB ? '<span class="comp-val">' + modB + '</span><span class="comp-sub">modelos</span>' : '<span class="comp-val">—</span>';
  }
  rows.push(['📐 Modelos', modCeldaA, modCeldaB]);
  if (gavA || gavB) {
    var cG = celda(gavA, gavB,
      function(v){ return v; },
      function(d){ return (d > 0 ? '+' : '-') + Math.abs(d); },
      false, 'gavetas');
    rows.push(['🗂️ Gavetas', cG[0], cG[1]]);
  }
  var enCarritoA = carrito.includes(idA);
  var enCarritoB = carrito.includes(idB);
  var tableRows = rows.map(function(r){
    return '<tr><td class="comp-label">' + r[0] + '</td><td class="comp-celda">' + r[1] + '</td><td class="comp-celda">' + r[2] + '</td></tr>';
  }).join('');
  var html = '<table class="comp-tbl"><thead><tr><th></th><th><div class="comp-head-nombre">' + a.nombre + '</div><div class="comp-head-cod">' + a.codigo + '</div></th><th><div class="comp-head-nombre">' + b.nombre + '</div><div class="comp-head-cod">' + b.codigo + '</div></th></tr></thead><tbody>' + tableRows + '</tbody></table><div class="comp-btns"><button class="comp-btn-carrito' + (enCarritoA ? ' en-carrito' : '') + '" onclick="toggleCarritoComp(' + idA + ',this)">' + (enCarritoA ? '✓ ' : '+ ') + a.nombre + '</button><button class="comp-btn-carrito' + (enCarritoB ? ' en-carrito' : '') + '" onclick="toggleCarritoComp(' + idB + ',this)">' + (enCarritoB ? '✓ ' : '+ ') + b.nombre + '</button></div>';
  document.getElementById('compBody').innerHTML = html;
  document.getElementById('compOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function toggleCarritoComp(id) {
  var s = SURTIDOS.find(function(x){ return x.id === id; });
  if (!s) return;
  var idx = carrito.findIndex(function(c){ return c.id === id; });
  if (idx >= 0) { carrito.splice(idx, 1); } else { carrito.push(s); vibrar(); mostrarToast('✅ ' + s.nombre + ' agregado'); }
  actualizarFab();
  var enCarrito = carrito.some(function(c){ return c.id === id; });
  ['compBtnA','compBtnB'].forEach(function(bid) {
    var btn = document.getElementById(bid);
    if (!btn) return;
    var btnId2 = parseInt((btn.getAttribute('onclick')||'').match(/\d+/)[0]);
    if (btnId2 === id) {
      var ec = carrito.some(function(c){ return c.id === id; });
      btn.className = 'comp-btn-agregar' + (ec ? ' agregado' : '');
      btn.textContent = ec ? '✅ En pedido' : '🛒 ' + s.nombre.split(' ').slice(0,3).join(' ');
    }
  });
  var cardBtn = document.getElementById('cardBtn' + id);
  if (cardBtn) {
    cardBtn.className = 'btn-card-agregar' + (enCarrito ? ' agregado' : '');
    cardBtn.innerHTML = enCarrito ? '✅ En pedido' : '🛒 Agregar';
  }
}

function cerrarComp(e) { if (e.target === document.getElementById('compOverlay')) cerrarCompBtn(); }
function cerrarCompBtn() {
  document.getElementById('compOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

var BADGES = {
  1:  'top', 61: 'top', 2:  'top', 3:  'top', 49: 'top',
};

// ── CARRUSEL "MÁS VENDIDOS" ──
var _destacadosIdx = 0;
var _destacadosCount = 0;
var _destacadosTimer = null;
var _destacadosScrollTimer = null;

function renderDestacados() {
  var cont = document.getElementById('destacados');
  var track = document.getElementById('destacadosTrack');
  var dots = document.getElementById('destacadosDots');
  if (!cont || !track) return;
  var lista = SURTIDOS_ACTIVOS.filter(function(s){ return BADGES[s.id] === 'top'; });
  _destacadosCount = lista.length;
  if (lista.length === 0) { cont.style.display = 'none'; return; }
  cont.style.display = '';
  track.innerHTML = lista.map(function(s) {
    var foto = s.foto_exhibidor || s.foto_card;
    return '<div class="destacados-slide" onclick="abrirModal(' + s.id + ')">' +
      '<div class="destacados-slide-badge">⭐ Más vendido</div>' +
      (foto ? '<img src="' + foto + '" alt="Surtido ' + s.nombre + ' — MAXIFER" loading="lazy">' : '') +
      '<div class="destacados-slide-info">' +
        '<div class="destacados-slide-nombre">' + s.nombre + '</div>' +
        '<div class="destacados-slide-cod">Cód: ' + s.codigo + '</div>' +
      '</div></div>';
  }).join('');
  dots.innerHTML = lista.map(function(_, i) {
    return '<div class="destacados-dot' + (i === 0 ? ' active' : '') + '"></div>';
  }).join('');
  _destacadosIdx = 0;
  track.removeEventListener('scroll', _destacadosOnScroll);
  track.addEventListener('scroll', _destacadosOnScroll, { passive: true });
  _destacadosAutoplay();
}

function _destacadosOnScroll() {
  clearTimeout(_destacadosScrollTimer);
  _destacadosScrollTimer = setTimeout(function() {
    var track = document.getElementById('destacadosTrack');
    if (!track) return;
    var i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== _destacadosIdx) { _destacadosIdx = i; _destacadosSyncDots(); }
  }, 80);
}

function _destacadosSyncDots() {
  var dots = document.querySelectorAll('#destacadosDots .destacados-dot');
  dots.forEach(function(d, i) { d.classList.toggle('active', i === _destacadosIdx); });
}

function destacadosNav(dir) {
  var track = document.getElementById('destacadosTrack');
  if (!track) return;
  var total = track.children.length;
  if (!total) return;
  _destacadosIdx = (_destacadosIdx + dir + total) % total;
  track.scrollTo({ left: _destacadosIdx * track.clientWidth, behavior: 'smooth' });
  _destacadosSyncDots();
  _destacadosAutoplay();
}

function _destacadosAutoplay() {
  clearInterval(_destacadosTimer);
  _destacadosTimer = setInterval(function() {
    var cont = document.getElementById('destacados');
    if (!cont || cont.style.display === 'none' || !cont.offsetParent) return;
    destacadosNav(1);
  }, 4500);
}

var _toastTimer = null;
function mostrarToast(txt) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = txt;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { el.classList.remove('visible'); }, 1600);
}

renderGrid(SURTIDOS_ACTIVOS);
renderDestacados();
actualizarFavBadge();
actualizarFab();

function toggleCarritoVista(id) {
  var s = SURTIDOS.find(function(x){ return x.id === id; });
  if (!s) return;
  var idx = carrito.findIndex(function(c){ return c.id === id; });
  var fueAgregado;
  if (idx >= 0) { carrito.splice(idx, 1); fueAgregado = false; }
  else { carrito.push(s); vibrar(); mostrarToast('✅ ' + s.nombre + ' agregado'); fueAgregado = true; }
  if (window.gtag) {
    var itemTV = ga4ItemFromSurtido(s);
    gtag('event', fueAgregado ? 'add_to_cart' : 'remove_from_cart', {
      currency: 'ARS',
      value: itemTV ? itemTV.price : 0,
      item_list_name: itemTV ? itemTV.item_list_name : undefined,
      item_list_id:   itemTV ? itemTV.item_list_id   : undefined,
      items: itemTV ? [itemTV] : []
    });
  }
  actualizarFab();
  var enCarrito = carrito.some(function(c){ return c.id === id; });
  var btnRev = document.getElementById('revBtn' + id);
  if (btnRev) {
    btnRev.className = 'btn-rev-agregar' + (enCarrito ? ' agregado' : '');
    btnRev.innerHTML = enCarrito ? '✅ En mi pedido' : '🛒 Agregar al pedido';
  }
  var btnLibro = document.getElementById('libroBtn' + id);
  if (btnLibro) {
    btnLibro.className = 'btn-libro-agregar' + (enCarrito ? ' agregado' : '');
    btnLibro.innerHTML = enCarrito ? '✅ En pedido' : '🛒 Agregar';
  }
  var cardBtn = document.getElementById('cardBtn' + id);
  if (cardBtn) {
    cardBtn.className = 'btn-card-agregar' + (enCarrito ? ' agregado' : '');
    cardBtn.innerHTML = enCarrito ? '✅ En pedido' : '🛒 Agregar';
  }
  actualizarBtnPanel(id);
}

function toggleModoReducido(id) {
  modoReducido = !modoReducido;
  abrirModal(id);
}

function toggleCarritoVistaConVersion(id, reducido, btn) {
  var s = SURTIDOS.find(function(x){ return x.id === id; });
  if (!s) return;
  var idx = carrito.findIndex(function(c){ return c.id === id && !!c._reducido === !!reducido; });
  var fueAgregadoV;
  if (idx >= 0) {
    carrito.splice(idx, 1);
    fueAgregadoV = false;
  } else {
    if (reducido) {
      var red = VERSION_REDUCIDA[s.codigo];
      if (!red) { return; }
      var clon = Object.assign({}, s, { _reducido: true, _precioRed: red.precio, _piezasRed: red.piezas });
      carrito.push(clon);
    } else {
      carrito.push(s);
    }
    vibrar();
    mostrarToast('✅ ' + s.nombre + (reducido ? ' (reducido) ' : ' ') + 'agregado');
    fueAgregadoV = true;
  }
  if (window.gtag) {
    var precioVer = reducido && VERSION_REDUCIDA[s.codigo] ? VERSION_REDUCIDA[s.codigo].precio : s.precio;
    var itemTVV = ga4ItemFromSurtido(s, { price: precioVer });
    if (itemTVV && reducido) itemTVV.item_variant = 'reducido';
    gtag('event', fueAgregadoV ? 'add_to_cart' : 'remove_from_cart', {
      currency: 'ARS',
      value: itemTVV ? itemTVV.price : 0,
      item_list_name: itemTVV ? itemTVV.item_list_name : undefined,
      item_list_id:   itemTVV ? itemTVV.item_list_id   : undefined,
      items: itemTVV ? [itemTVV] : []
    });
  }
  actualizarFab();
  var enCarritoAhora = carrito.some(function(c){ return c.id === id && !!c._reducido === !!reducido; });
  if (btn) {
    btn.className = 'btn-carrito-modal' + (enCarritoAhora ? ' en-carrito' : '') + (reducido ? ' btn-carrito-modal-red' : '');
    btn.innerHTML = enCarritoAhora ? '✓ En el pedido' + (reducido ? ' (reducido)' : '') : '+ Agregar al pedido' + (reducido ? ' (reducido)' : '');
  }
  var enCarritoAlguna = carrito.some(function(c){ return c.id === id; });
  var btnRev2 = document.getElementById('revBtn' + id);
  if (btnRev2) {
    btnRev2.className = 'btn-rev-agregar' + (enCarritoAlguna ? ' agregado' : '');
    btnRev2.innerHTML = enCarritoAlguna ? '✅ En mi pedido' : '🛒 Agregar al pedido';
  }
  var btnLibro2 = document.getElementById('libroBtn' + id);
  if (btnLibro2) {
    btnLibro2.className = 'btn-libro-agregar' + (enCarritoAlguna ? ' agregado' : '');
    btnLibro2.innerHTML = enCarritoAlguna ? '✅ En pedido' : '🛒 Agregar';
  }
  var cardBtn2 = document.getElementById('cardBtn' + id);
  if (cardBtn2) {
    cardBtn2.className = 'btn-card-agregar' + (enCarritoAlguna ? ' agregado' : '');
    cardBtn2.innerHTML = enCarritoAlguna ? '✅ En pedido' : '🛒 Agregar';
  }
  actualizarBtnPanel(id);
}

var fotosPanelSurtidoId = null;
var fotosDotsEl = [];

function abrirFotosPanel(id) {
  var s = SURTIDOS.find(function(x){ return x.id === id; });
  if (!s) return;
  fotosPanelSurtidoId = id;
  var fotos = [];
  if (s.foto_exhibidor)   fotos.push({ src: s.foto_exhibidor,   label: 'Exhibidor' });
  if (s.foto_exhibidor_2) fotos.push({ src: s.foto_exhibidor_2, label: 'Vista 2' });
  if (s.foto_exhibidor_3) fotos.push({ src: s.foto_exhibidor_3, label: 'Vista 3' });
  if (s.foto_gavetas)     fotos.push({ src: s.foto_gavetas,     label: 'Gaveteros' });
  if (s.foto_card && s.foto_card !== s.foto_exhibidor) fotos.push({ src: s.foto_card, label: 'Detalle' });
  if (!fotos.length) return;
  document.getElementById('fotosPanelTitulo').textContent = s.nombre;
  document.getElementById('fotosPanelSub').textContent = fotos.length + ' foto' + (fotos.length > 1 ? 's' : '');
  var scroll = document.getElementById('fotosPanelScroll');
  scroll.innerHTML = '';
  fotos.forEach(function(f, i) {
    var slide = document.createElement('div');
    slide.className = 'fotos-panel-slide';
    slide.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center"><img src="' + f.src + '" alt="' + f.label + '" style="cursor:zoom-in" onclick="abrirLightbox(' + JSON.stringify(fotos) + ',' + i + ',\'' + (s.nombre.replace(/'/g,"\\'")) + '\')"><div class="fotos-panel-etiqueta">' + f.label + '</div></div>';
    scroll.appendChild(slide);
  });
  var footer = document.getElementById('fotosPanelFooter');
  footer.innerHTML = '';
  fotosDotsEl = [];
  if (fotos.length > 1) {
    fotos.forEach(function(_, i) {
      var dot = document.createElement('div');
      dot.className = 'fotos-dot' + (i === 0 ? ' on' : '');
      footer.appendChild(dot);
      fotosDotsEl.push(dot);
    });
  }
  var enCarrito = carrito.some(function(c){ return c.id === id; });
  var btnPanel = document.getElementById('btnPanelAgregar');
  btnPanel.dataset.surtidoId = id;
  btnPanel.className = 'btn-panel-agregar' + (enCarrito ? ' agregado' : '');
  btnPanel.innerHTML = enCarrito ? '✅ En mi pedido' : '🛒 Agregar al pedido';
  btnPanel.onclick = function() { toggleCarritoVista(id); };
  scroll.onscroll = function() {
    var idx = Math.round(scroll.scrollLeft / scroll.offsetWidth);
    fotosDotsEl.forEach(function(d, i){ d.classList.toggle('on', i === idx); });
  };
  document.getElementById('fotosPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarFotosPanel(e) { if (e.target === document.getElementById('fotosPanel')) cerrarFotosPanelBtn(); }
function cerrarFotosPanelBtn() {
  document.getElementById('fotosPanel').classList.remove('open');
  document.body.style.overflow = '';
  fotosPanelSurtidoId = null;
}

function confirmarDescuento() {
  var val = parseFloat(document.getElementById('modalDescuentoInput').value);
  if (isNaN(val)) val = 0;
  document.getElementById('modalDescuentoOverlay').classList.remove('open');
  mostrarPrecios = true;
  document.getElementById('appBody').classList.add('show-precios');
  document.getElementById('modal').classList.add('show-precios');
  document.getElementById('carritoBody').classList.add('show-precios');
  if (val > 0) {
    descuentoPct = val;
    document.getElementById('descuentoInput').value = val;
    aplicarDescuento();
  } else {
    guardarDescuento();
  }
  sincronizarBotonesPrecio();
  refrescarVistaActiva();
}

function saltarDescuento() {
  document.getElementById('modalDescuentoOverlay').classList.remove('open');
}

window.addEventListener('load', function() {
  maxiferCargarDatos().then(function(ok) {
    if (!ok) return;
    maxiferIniciarCatalogo();
    maxiferOcultarOverlay();
  });
});

function maxiferIniciarCatalogo() {
  (function setupBackButton() {
    function hPush(tag) { history.pushState({ mxf: tag }, ''); }
    var _origAbrirModal = abrirModal;
    abrirModal = function(id) {
      _origAbrirModal(id);
      hPush('modal');
      if (window.gtag) {
        var s = SURTIDOS.find(function(x){ return x.id === id; });
        if (s) {
          gtag('event', 'surtido_view', { surtido_id: s.id, codigo: s.codigo, nombre: s.nombre });
          var itemView = ga4ItemFromSurtido(s);
          gtag('event', 'view_item', {
            currency: 'ARS',
            value: itemView ? itemView.price : 0,
            item_list_name: itemView ? itemView.item_list_name : undefined,
            item_list_id:   itemView ? itemView.item_list_id   : undefined,
            items: itemView ? [itemView] : []
          });
        }
      }
    };
    var _origAbrirCarrito = abrirCarrito;
    abrirCarrito = function() { _origAbrirCarrito(); hPush('carrito'); };
    var _origAbrirComparador = abrirComparador;
    abrirComparador = function(idA, idB) { _origAbrirComparador(idA, idB); hPush('comparador'); };
    var _origAbrirFavoritos = abrirFavoritos;
    abrirFavoritos = function() { _origAbrirFavoritos(); hPush('favoritos'); };
    var _origAbrirLightbox = abrirLightbox;
    abrirLightbox = function(fotos, idx, titulo) { _origAbrirLightbox(fotos, idx, titulo); hPush('lightbox'); };
    var _origCambiarVista = cambiarVista;
    cambiarVista = function(vista) {
      _origCambiarVista(vista);
      if (vista === 'revista' || vista === 'libro') { hPush('vista_' + vista); }
    };
    window.addEventListener('popstate', function(e) {
      if (document.getElementById('lightbox').classList.contains('open')) { cerrarLightbox(); return; }
      if (document.getElementById('modalOverlay').classList.contains('open')) { cerrarModalBtn(); return; }
      if (document.getElementById('compOverlay').classList.contains('open')) { cerrarCompBtn(); return; }
      if (document.getElementById('carritoOverlay').classList.contains('open')) { cerrarCarritoBtn(); return; }
      if (document.getElementById('favOverlay').classList.contains('open')) { cerrarFavoritos(); return; }
      if (vistaActual === 'revista' || vistaActual === 'libro') { _origCambiarVista('grilla'); return; }
    });
  })();
  if (descuentoPct > 0) {
    var inp = document.getElementById('modalDescuentoInput');
    if (inp) inp.value = descuentoPct;
    confirmarDescuento();
    return;
  }
  setTimeout(function() {
    var inp = document.getElementById('modalDescuentoInput');
    if (inp) inp.focus();
  }, 400);
}
