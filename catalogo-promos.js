// ── catalogo-promos.js ──────────────────────────────────────────────
// Lee la config de campañas/promos desde Firebase Firestore (doc
// `catalogo/home`), calcula cuáles están vigentes según la fecha de hoy
// y la expone en `window.MaxiPromos` para que la consuma el catálogo.
//
// La edita el community manager desde admin_catalogo.html.
// Si Firebase no responde o no hay nada cargado, cae a un default
// (el carrusel "Los más vendidos") — el catálogo nunca queda vacío.
//
// Expone:
//   window.MaxiPromos.ready          → Promise que resuelve cuando cargó
//   window.MaxiPromos.campanas       → [] campañas vigentes hoy, ordenadas
//   window.MaxiPromos.promoPorCodigo → { codigo: {descuento, etiqueta, nombre} }
//   window.MaxiPromos.badgePorId     → { id: 'top'|'nuevo'|'oferta' }
// y dispara el evento `maxi-promos-ready` en document cuando termina.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc, onSnapshot }
  from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAtfElcZuiip27qeU3tZzQf6CsCMZhrTV0",
  authDomain: "presupuestador-maxifer.firebaseapp.com",
  projectId: "presupuestador-maxifer",
  storageBucket: "presupuestador-maxifer.firebasestorage.app",
  messagingSenderId: "1049921095923",
  appId: "1:1049921095923:web:8956008db3b58b33004f86",
  measurementId: "G-LMXG9MDKGC"
};

const DOC_PATH = ['catalogo', 'home'];

// Campaña por defecto si Firebase está vacío o caído.
const CAMPANA_DEFAULT = {
  id: 'default_mas_vendidos',
  nombre: 'Los más vendidos',
  tipo: 'carrusel',
  titulo: 'Los más vendidos',
  icono: '⭐',
  plantilla: 'mas_vendidos',
  color: '#e8510a',
  desde: '', hasta: '',
  activo: true,
  descuento: 0,
  etiqueta: '⭐ Más vendido',
  surtidos: [1, 61, 2, 3, 49, 26],
  orden: 0
};

// Plantillas: presets de estilo para que el CM no arranque de cero.
export const PLANTILLAS = {
  mas_vendidos:  { label: 'Los más vendidos', icono: '⭐', tipo: 'carrusel', color: '#e8510a', etiqueta: '⭐ Más vendido', descuento: 0 },
  lanzamiento:   { label: 'Lanzamientos',     icono: '✨', tipo: 'carrusel', color: '#2151a8', etiqueta: '✨ Nuevo',       descuento: 0 },
  oferta:        { label: 'Ofertas',          icono: '🔥', tipo: 'fila',     color: '#dc2626', etiqueta: '🔥 Oferta',      descuento: 10 },
  liquidacion:   { label: 'Liquidación',      icono: '💥', tipo: 'fila',     color: '#b91c1c', etiqueta: '💥 Liquidación', descuento: 20 },
  combo:         { label: 'Combos',           icono: '📦', tipo: 'fila',     color: '#7c3aed', etiqueta: '📦 Combo',       descuento: 0 },
  black_friday:  { label: 'Black Friday',     icono: '🖤', tipo: 'carrusel', color: '#0f172a', etiqueta: '🖤 Black Friday', descuento: 25 },
  temporada:     { label: 'Temporada',        icono: '🎯', tipo: 'fila',     color: '#0891b2', etiqueta: '🎯 Destacado',   descuento: 0 }
};

// ── Helpers de fechas ───────────────────────────────────────────────
// Las fechas se guardan como 'YYYY-MM-DD'. Comparamos contra hoy en
// horario local. desde/hasta vacíos = sin límite por ese lado.
function hoyISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}

export function estadoCampana(c, hoy) {
  hoy = hoy || hoyISO();
  if (c.activo === false) return 'pausada';
  if (c.desde && hoy < c.desde) return 'programada';
  if (c.hasta && hoy > c.hasta) return 'vencida';
  return 'activa';
}

export function campanaVigente(c, hoy) {
  return estadoCampana(c, hoy) === 'activa';
}

// ── Estado expuesto ─────────────────────────────────────────────────
const MaxiPromos = {
  ready: null,
  cargado: false,
  conexion: 'pendiente',     // 'firebase' | 'default' | 'error'
  campanasTodas: [],         // todas las campañas (para el admin)
  campanas: [],              // solo las vigentes hoy (para el catálogo)
  promoPorCodigo: {},
  badgePorId: {},
  raw: null,
  // API de escritura — la usa el admin
  guardar: null,
  suscribir: null
};
window.MaxiPromos = MaxiPromos;

// Vendedores que pueden ver TODAS las campañas (incluyendo promos, descuentos,
// lanzamientos, etc.). El resto de los vendedores y los visitantes directos solo
// ven el carrusel "Los más vendidos", sin descuentos aplicados.
// Se identifica al vendedor por `#wa=<key>` en la URL (ver VENDEDORES en
// catalogo-app.js: Maxi, Micky, Victor, Nadia, Eduardo, Federico).
const VENDEDORES_AUTORIZADOS = ['maxi', 'nadia'];

function vendedorAutorizado() {
  try {
    const h = (location.hash || '').replace('#', '');
    const params = {};
    h.split('&').forEach(p => {
      const kv = p.split('=');
      if (kv.length === 2) params[kv[0]] = decodeURIComponent(kv[1]);
    });
    const wa = (params.wa || '').toLowerCase().trim();
    return VENDEDORES_AUTORIZADOS.indexOf(wa) !== -1;
  } catch (e) { return false; }
}

function plantillaBadgeTipo(plantilla) {
  if (plantilla === 'lanzamiento') return 'nuevo';
  if (plantilla === 'oferta' || plantilla === 'liquidacion' || plantilla === 'black_friday') return 'oferta';
  return 'top';
}

// A partir de las campañas vigentes, arma los índices que consume el catálogo.
function recalcular() {
  const hoy = hoyISO();
  let vigentes = (MaxiPromos.campanasTodas || [])
    .filter(c => campanaVigente(c, hoy))
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  // Filtro por vendedor: los no autorizados solo ven "más vendidos" sin descuento.
  MaxiPromos.autorizado = vendedorAutorizado();
  if (!MaxiPromos.autorizado) {
    vigentes = vigentes.filter(c => c.plantilla === 'mas_vendidos' && !(c.descuento > 0));
  }
  MaxiPromos.campanas = vigentes;

  const promoPorCodigo = {};
  const badgePorId = {};
  // SURTIDOS viene de surtidos-data.js (script clásico cargado antes que este módulo).
  const surtidos = (typeof SURTIDOS !== 'undefined') ? SURTIDOS : [];
  const porId = {};
  surtidos.forEach(s => { porId[s.id] = s; });

  vigentes.forEach(c => {
    const tipoBadge = plantillaBadgeTipo(c.plantilla);
    (c.surtidos || []).forEach(id => {
      const s = porId[id];
      if (!badgePorId[id]) badgePorId[id] = tipoBadge;
      if (c.descuento > 0 && s && s.codigo && !promoPorCodigo[s.codigo]) {
        promoPorCodigo[s.codigo] = {
          descuento: c.descuento,
          etiqueta: c.etiqueta || ('🔥 -' + c.descuento + '%'),
          nombre: c.nombre || c.titulo || ''
        };
      }
    });
  });
  MaxiPromos.promoPorCodigo = promoPorCodigo;
  MaxiPromos.badgePorId = badgePorId;
}

function aplicarRaw(data) {
  if (data && Array.isArray(data.campanas) && data.campanas.length > 0) {
    MaxiPromos.campanasTodas = data.campanas;
    MaxiPromos.raw = data;
    MaxiPromos.conexion = 'firebase';
  } else {
    MaxiPromos.campanasTodas = [CAMPANA_DEFAULT];
    MaxiPromos.raw = data || null;
    MaxiPromos.conexion = data ? 'firebase' : 'default';
  }
  recalcular();
}

// ── Init ────────────────────────────────────────────────────────────
let _db = null;
function getDb() {
  if (!_db) {
    const app = initializeApp(firebaseConfig);
    _db = getFirestore(app);
  }
  return _db;
}

MaxiPromos.ready = (async function init() {
  try {
    const db = getDb();
    const snap = await getDoc(doc(db, ...DOC_PATH));
    aplicarRaw(snap.exists() ? snap.data() : null);
  } catch (e) {
    console.warn('[MaxiPromos] Firebase no disponible, uso default:', e);
    MaxiPromos.campanasTodas = [CAMPANA_DEFAULT];
    MaxiPromos.conexion = 'error';
    recalcular();
  }
  MaxiPromos.cargado = true;
  document.dispatchEvent(new CustomEvent('maxi-promos-ready', { detail: MaxiPromos }));
  return MaxiPromos;
})();

// Escritura — usada por admin_catalogo.html.
MaxiPromos.guardar = async function guardar(campanas, quien) {
  const db = getDb();
  const payload = {
    campanas: campanas,
    updatedAt: Date.now(),
    updatedBy: quien || 'CM'
  };
  await setDoc(doc(db, ...DOC_PATH), payload);
  aplicarRaw(payload);
  return payload;
};

// Suscripción en vivo — el admin la usa para refrescar si otro la edita.
MaxiPromos.suscribir = function suscribir(cb) {
  const db = getDb();
  return onSnapshot(doc(db, ...DOC_PATH), snap => {
    aplicarRaw(snap.exists() ? snap.data() : null);
    if (typeof cb === 'function') cb(MaxiPromos);
  });
};
