// ── GRUPOS ───────────────────────────────────────────────────
const GRUPOS = [
  { key: 'clips',      label: "Clips Plásticos",         icono: "🔩", color: "#3b82f6",
    codigos: ["PL CH.", "PL Nac. 160 M.", "CL. IMP COM"] },
  { key: 'resortes',   label: "Resortes",                icono: "🌀", color: "#10b981",
    codigos: ["RES. LF","RES. LC","RES. LB","RES. LA","RES. LP","RES. COMP."] },
  { key: 'oring',      label: "Anillos O'Ring",          icono: "⭕", color: "#f59e0b",
    codigos: ["OR. CH.","OR. GR.","OR. COMP."] },
  { key: 'chavetas',   label: "Chavetas",                icono: "📌", color: "#ef4444",
    codigos: ["CHA. PART.","CHA. CH.","GA+CH COMP."] },
  { key: 'aluminio',   label: "Conexiones de Agua — Aluminio y Plásticas", icono: "🔧", color: "#06b6d4",
    codigos: ["CONEX. ALUM. 1","CONEX. ALUM. 2","Conex. Alum. L. Temp.","Conex. Alum. Mayor Rot.","CONC. PL"] },
  { key: 'neumaticas', label: "Conexiones de Aire Plásticas y de Acero", icono: "💨", color: "#f97316",
    codigos: ["CON. NEU.","CON. NEU. COMPL.","CON. NEU. NUEV.","BRONCE","RAC. CH.","RAC. GR."] },
  { key: 'arandelas',  label: "Arandelas de Goma",       icono: "🔘", color: "#8b5cf6",
    codigos: ["ARAND. CH.","ARAND. LP.","ARAN. CO-FI-AL","ARAND. INYEC."] },
  { key: 'terminales', label: "Terminales",              icono: "⚡", color: "#84cc16",
    codigos: ["TERM. CH.","TERM. NU.","TEM. COMP."] },
  { key: 'carbones',   label: "Carbones",                icono: "🔋", color: "#374151",
    codigos: ["CARB. 1","CARB. COMPL."] },
  { key: 'perillas',   label: "Perillas de Cocina",      icono: "🎛️", color: "#ec4899",
    codigos: ["PER. 1","PER. 2","PER. COMP."] },
  { key: 'otros',      label: "Otros",                   icono: "📦", color: "#9ca3af",
    codigos: [] },
];
// Fuente: Precio_Surtidos.xlsx (hoja RESUMEN). Cantidad de modelos
// distintos que trae cada surtido. Se inyecta automáticamente en
// la lista "Incluye" del detalle.
const MODELOS_DIFERENTES = {
  "PL CH.": 90,
  "PL Nac. 160 M.": 160,
  "CL. IMP COM": 322,
  "RES. LF": 87,
  "RES. LC": 109,
  "RES. LB": 36,
  "RES. LA": 50,
  "RES. LP": 38,
  "RES. COMP.": 275,
  "CHA. PART.": 30,
  "CHA. CH.": 30,
  "GA+CH COMP.": 42,
  "OR. CH.": 92,
  "OR. GR.": 54,
  "OR. COMP.": 146,
  "CONEX. ALUM. 1": 76,
  "CONEX. ALUM. 2": 55,
  "Conex. Alum. L. Temp.": 27,
  "Conex. Alum. Mayor Rot.": 27,
  "CONC. PL": 76,
  "CONC. COMB. Red": 31,
  "CON. NEU.": 69,
  "CON. NEU. COMPL.": 116,
  "CON. NEU. NUEV.": 47,
  "BRONCE": 33,
  "RAC. CH.": 35,
  "RAC. GR.": 61,
  "TR Espec. + Torn.": 132,
  "TR L. Compl.": 54,
  "TR IMP.": 35,
  "TER. REM.": 20,
  "TUER. RAP.": 35,
  "TAP. CAR.": 26,
  "ARAND. CH.": 48,
  "ARAND. LP.": 28,
  "ARAN. CO-FI-AL": 75,
  "TOP. TAP. GOMA": 26,
  "SEEG.": 59,
  "ALEM.": 23,
  "RET. ARAN.": 21,
  "INTERR. PULSA.": 45,
  "TERM. CH.": 40,
  "TERM. NU.": 29,
  "INS.": 24,
  "TEM. COMP.": 81,
  "TAR. ESTR.": 15,
  "ESP. ELAS.": 54,
  "ESPARR.": 47,
  "CARB. 1": 40,
  "CARB. COMPL.": 58,
  "INYEC. GAS ENV.": 54,
  "PER. 1": 30,
  "PER. 2": 30,
  "PER. COMP.": 60,
  "ARAND. INYEC.": 40,
  "UN. ORIENT.": 29,
  "REGAT.": 62,
  "ABRA. GOMA": 36,
};

// ── CANTIDADES POR GAVETA (POR SURTIDO) ───────────────────────
// Fuente: Precio_Surtidos.xlsx (hoja RESUMEN, columna H "Cantidades
// del Surtido"). Muestra cuántas piezas trae cada gaveta del surtido.
// Si vienen varios números separados por " - " significa que cada
// gaveta tiene una cantidad distinta (ver composición del surtido).
const CANTIDADES_GAVETAS = {
  "PL CH.": "5",
  "PL Nac. 160 M.": "3",
  "CL. IMP COM": "3",
  "RES. LF": "3",
  "RES. LC": "3",
  "RES. LB": "2",
  "RES. LA": "2",
  "RES. LP": "2",
  "RES. COMP.": "2",
  "CHA. PART.": "49 - 29 - 19",
  "CHA. CH.": "5 - 3",
  "GA+CH COMP.": "2 - 4 - 1",
  "OR. CH.": "19 - 9",
  "OR. GR.": "9 - 4",
  "OR. COMP.": "24 - 9 - 4 - 19",
  "CONEX. ALUM. 1": "2",
  "CONEX. ALUM. 2": "1",
  "Conex. Alum. L. Temp.": "1 - -1",
  "Conex. Alum. Mayor Rot.": "1",
  "CONC. PL": "4",
  "CONC. COMB. Red": "2",
  "CON. NEU.": "2 - 9 - 4 - 3",
  "CON. NEU. COMPL.": "2 - 9 - 4 - 1",
  "CON. NEU. NUEV.": "2 - 9 - 4",
  "BRONCE": "4 - 2",
  "RAC. CH.": "4 - 1",
  "RAC. GR.": "2 - 1 - -1",
  "TR Espec. + Torn.": "4",
  "TR L. Compl.": "5",
  "TR IMP.": "5",
  "TER. REM.": "19 - 9",
  "TUER. RAP.": "10 - 20",
  "TAP. CAR.": "3",
  "ARAND. CH.": "20 - 10",
  "ARAND. LP.": "9",
  "ARAN. CO-FI-AL": "19 - 9 - 29",
  "TOP. TAP. GOMA": "4",
  "SEEG.": "9 - 4",
  "ALEM.": "5",
  "RET. ARAN.": "49 - 24",
  "INTERR. PULSA.": "2",
  "TERM. CH.": "49 - 5 - 19 - 9",
  "TERM. NU.": "5 - 3 - 2",
  "INS.": "4",
  "TEM. COMP.": "49 - 5 - 19 - 9 - 3 - 2",
  "TAR. ESTR.": "119 - 99",
  "ESP. ELAS.": "19 - 9 - 4 - 2",
  "ESPARR.": "5 - 4",
  "CARB. 1": "1,5 - 1",
  "CARB. COMPL.": "1,5",
  "INYEC. GAS ENV.": "4 - 2 - 3",
  "PER. 1": "2",
  "PER. 2": "2",
  "PER. COMP.": "2",
  "ARAND. INYEC.": "10",
  "UN. ORIENT.": "3 - 2",
  "REGAT.": "9 - 6 - 5",
  "ABRA. GOMA": "6",
};

// Devuelve el texto a insertar en "Incluye" según la cantidad por
// gaveta del código de surtido. Devuelve null si no hay dato.
function textoPiezasEnGavetas(codigo) {
  const v = CANTIDADES_GAVETAS[codigo];
  if (v == null) return null;
  const txt = String(v).trim();
  if (txt.indexOf(' - ') >= 0) {
    return txt + ' Piezas de c/u en Gavetas (Ver composición abajo)';
  }
  return txt + (txt === '1' ? ' Pieza de c/u en Gavetas' : ' Piezas de c/u en Gavetas');
}

// ── VERSIÓN REDUCIDA POR SURTIDO ──────────────────────────────
// Fuente: Precio_Surtidos.xlsx (hoja RESUMEN). Misma cantidad de
// modelos y gavetas que la estándar, pero con menos stock inicial
// (y por lo tanto menor precio). Se muestra sólo si el cliente
// la solicita explícitamente en el modal de detalle.
const VERSION_REDUCIDA = {
  "PL CH.": { piezas: 360, precio: 354134 },
  "PL Nac. 160 M.": { piezas: 320, precio: 452509 },
  "CL. IMP COM": { piezas: 966, precio: 1312890 },
  "RES. LF": { piezas: 174, precio: 385595 },
  "RES. LC": { piezas: 327, precio: 539519 },
  "RES. LB": { piezas: 108, precio: 564025 },
  "RES. LA": { piezas: 100, precio: 332317 },
  "RES. LP": { piezas: 76, precio: 570098 },
  "RES. COMP.": { piezas: 772, precio: 2192035 },
  "CHA. PART.": { piezas: 450, precio: 83510 },
  "CHA. CH.": { piezas: 120, precio: 219293 },
  "GA+CH COMP.": { piezas: 126, precio: 357182 },
  "OR. CH.": { piezas: 552, precio: 268783 },
  "OR. GR.": { piezas: 162, precio: 239008 },
  "OR. COMP.": { piezas: 730, precio: 597833 },
  "CONEX. ALUM. 1": { piezas: 152, precio: 1401320 },
  "CONEX. ALUM. 2": { piezas: 110, precio: 1439068 },
  "Conex. Alum. L. Temp.": { piezas: 54, precio: 935502 },
  "Conex. Alum. Mayor Rot.": { piezas: 54, precio: 424029 },
  "CONC. PL": { piezas: 228, precio: 421436 },
  "CONC. COMB. Red": { piezas: 62, precio: 752074 },
  "CON. NEU.": { piezas: 150, precio: 571028 },
  "CON. NEU. COMPL.": { piezas: 256, precio: 1175810 },
  "CON. NEU. NUEV.": { piezas: 106, precio: 634781 },
  "BRONCE": { piezas: 92, precio: 240812 },
  "RAC. CH.": { piezas: 105, precio: 501440 },
  "RAC. GR.": { piezas: 122, precio: 659933 },
  "TR Espec. + Torn.": { piezas: 396, precio: 500361 },
  "TR L. Compl.": { piezas: 216, precio: 310460 },
  "TR IMP.": { piezas: 140, precio: 231440 },
  "TER. REM.": { piezas: 200, precio: 181538 },
  "TUER. RAP.": { piezas: 210, precio: 174189 },
  "TAP. CAR.": { piezas: 78, precio: 582196 },
  "ARAND. CH.": { piezas: 480, precio: 169736 },
  "ARAND. LP.": { piezas: 168, precio: 178709 },
  "ARAN. CO-FI-AL": { piezas: 375, precio: 475069 },
  "TOP. TAP. GOMA": { piezas: 78, precio: 204765 },
  "SEEG.": { piezas: 295, precio: 238351 },
  "ALEM.": { piezas: 92, precio: 181273 },
  "RET. ARAN.": { piezas: 525, precio: 126664 },
  "INTERR. PULSA.": { piezas: 90, precio: 314937 },
  "TERM. CH.": { piezas: 379, precio: 183395 },
  "TERM. NU.": { piezas: 87, precio: 353856 },
  "INS.": { piezas: 72, precio: 168280 },
  "TEM. COMP.": { piezas: 523, precio: 568940 },
  "TAR. ESTR.": { piezas: 750, precio: 110554 },
  "ESP. ELAS.": { piezas: 262, precio: 258849 },
  "ESPARR.": { piezas: 141, precio: 382817 },
  "CARB. 1": { piezas: 60, precio: 318580 },
  "CARB. COMPL.": { piezas: 87, precio: 480442 },
  "INYEC. GAS ENV.": { piezas: 162, precio: 331422 },
  "PER. 1": { piezas: 60, precio: 399848 },
  "PER. 2": { piezas: 60, precio: 414714 },
  "PER. COMP.": { piezas: 120, precio: 797762 },
  "ARAND. INYEC.": { piezas: 240, precio: 246628 },
  "UN. ORIENT.": { piezas: 58, precio: 347650 },
  "REGAT.": { piezas: 372, precio: 272054 },
  "ABRA. GOMA": { piezas: 144, precio: 312672 },
};
const MAXIFER_EXCEL_URLS = {
  listas: 'https://raw.githubusercontent.com/maxifercotizador/Presupuestador/main/Listas%20Maxifer.xlsx',
  surtidos: 'https://raw.githubusercontent.com/maxifercotizador/Presupuestador/main/Precio%20Surtidos.xlsx'
};
// Funcion utilitaria: leer Excel desde URL y devolver SheetJS workbook
// Agrega ?t=timestamp para evitar caché del navegador (siempre descarga la última versión)
async function maxiferLeerExcel(url) {
  const sep = url.indexOf('?') >= 0 ? '&' : '?';
  const urlConTimestamp = url + sep + 't=' + Date.now();
  const resp = await fetch(urlConTimestamp, { cache: 'no-store' });
  if (!resp.ok) throw new Error('No se pudo descargar ' + url + ' (HTTP ' + resp.status + ')');
  const buf = await resp.arrayBuffer();
  return XLSX.read(buf, { type: 'array' });
}

// Construye dos mapas "Producto|Numero" -> Precio y -> Descripción desde Listas_Maxifer.
// Soporta nombres de columnas viejos y nuevos:
//   Precio de Lista | Precio
//   Descripcion     | Descripción
function maxiferMapListas(workbookListas) {
  const sheet = workbookListas.Sheets['LISTAS Y BD'];
  if (!sheet) throw new Error('Falta la hoja "LISTAS Y BD" en Listas Maxifer.xlsx');
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const precios = {};
  const descripciones = {};
  for (const r of rows) {
    const numero = String(r['Numero'] || '').trim();
    const producto = String(r['Producto'] || '').trim();
    const precio = parseFloat(r['Precio'] !== undefined && r['Precio'] !== '' ? r['Precio'] : r['Precio de Lista']) || 0;
    const desc = String(r['Descripción'] || r['Descripcion'] || '').trim();
    if (!numero && !producto) continue;
    // Clave compuesta: Producto|Numero (Producto = familia, Numero = código del item)
    const key = producto + '|' + numero;
    precios[key] = precio;
    descripciones[key] = desc;
    // Indexar TAMBIÉN en lowercase para matching case-insensitive
    // (resuelve diferencias como "5 X 30" en Surtidos vs "5 x 30" en Listas)
    const keyLower = producto.toLowerCase() + '|' + numero.toLowerCase();
    if (keyLower !== key) {
      precios[keyLower] = precio;
      descripciones[keyLower] = desc;
    }
  }
  return { precios, descripciones };
}

// Construye COMPOSICION_DATA desde Precio_Surtidos.xlsx hoja "BD"
// Cruza con el mapa de precios de Listas para obtener precios actuales
// Mapeo manual de códigos del HTML a códigos del Excel cuando no coinciden
// y la normalización no es suficiente. Solo agregar entradas si el código es
// tan distinto que normalizar no alcanza (ej: BRONCE vs Uni. Poliam.).
const MAXIFER_CODIGO_MAP = {
  'BRONCE': 'Uni. Poliam.',
  'CARB. COMPL.': 'CARB. CPL',
  'CONC. COMB. Red': 'Conec. Comb. Red.',
  'TR IMP.': 'TR IMPO.',
  'UN. ORIENT.': 'Uni. Orient.'
};

// Normaliza códigos para matching tolerante: minúsculas, sin espacios ni puntos.
// Resuelve casos como 'TAP. CAR.' vs 'TAP.CAR.', 'INTERR. PULSA.' vs 'INTERR.PULSA.', etc.
function maxiferNormCodigo(s) {
  if (!s) return '';
  return String(s).toLowerCase().replace(/[\s\.]+/g, '');
}

// Busca la composición de un surtido tolerando diferencias de mayúsculas, puntos y espacios.
// Devuelve null si no encuentra.
function maxiferGetComposicion(composicion, codigoHTML) {
  if (!codigoHTML) return null;
  // 1. Match exacto
  if (composicion[codigoHTML]) return composicion[codigoHTML];
  // 2. Match por mapeo manual
  const mapped = MAXIFER_CODIGO_MAP[codigoHTML];
  if (mapped && composicion[mapped]) return composicion[mapped];
  // 3. Match normalizado (case-insensitive sin puntos/espacios)
  const norm = maxiferNormCodigo(codigoHTML);
  if (composicion._normIndex && composicion._normIndex[norm]) {
    return composicion[composicion._normIndex[norm]];
  }
  return null;
}

function maxiferConstruirComposicion(workbookSurtidos, mapaListas) {
  const sheet = workbookSurtidos.Sheets['BD'];
  if (!sheet) throw new Error('Falta la hoja "BD" en Precio Surtidos.xlsx');
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const mapaPrecios = mapaListas.precios;
  const mapaDesc = mapaListas.descripciones;

  const result = {};
  const normIndex = {};  // codigo normalizado -> codigo original del Excel
  for (const r of rows) {
    const codigoSurtido = String(r['Codigo'] || '').trim();
    if (!codigoSurtido) continue;

    const numero = String(r['N°'] || r['Numero'] || r['N'] || '').trim();
    // El Excel de Surtidos nuevo ya no trae 'Descripción'; se obtiene del lookup de Listas.
    let descripcion = String(r['Descripción'] || r['Descripcion'] || '').trim();
    const productoFam = String(r['Producto'] || '').trim();
    const cantStd = parseFloat(r['Cantidad stándar'] || r['Cantidad standar'] || r['Cantidad estándar'] || 0) || 0;
    const cantRed = parseFloat(r['Cantidad Reducidas'] || r['Cantidad Reducida'] || 0) || 0;
    const precioStdExcel = parseFloat(r['Precio Estándar'] || r['Precio Estandar'] || 0) || 0;
    const precioRedExcel = parseFloat(r['Precio Reducido'] || 0) || 0;

    // Buscar precio actual en Listas_Maxifer (cruce por Producto + Numero)
    // Probar primero con clave exacta, luego case-insensitive (resuelve "5 X 30" vs "5 x 30")
    // Por último probar invirtiendo Producto/Numero (resuelve casos como
    // 'Varios|Varios Ch' en Surtidos vs 'Varios Ch|Varios' en Listas).
    const keyExacta = productoFam + '|' + numero;
    const keyLower = productoFam.toLowerCase() + '|' + numero.toLowerCase();
    const keyInvertida = numero + '|' + productoFam;
    const keyInvertidaLower = numero.toLowerCase() + '|' + productoFam.toLowerCase();

    // Fallback de descripción: si el Excel de Surtidos no la trae, buscarla en Listas.
    if (!descripcion) {
      descripcion = mapaDesc[keyExacta] || mapaDesc[keyLower] || mapaDesc[keyInvertida] || mapaDesc[keyInvertidaLower] || '';
    }

    let precioActual = mapaPrecios[keyExacta];
    if (precioActual === undefined || precioActual === null || precioActual === 0) {
      precioActual = mapaPrecios[keyLower];
    }
    if (precioActual === undefined || precioActual === null || precioActual === 0) {
      precioActual = mapaPrecios[keyInvertida];
    }
    if (precioActual === undefined || precioActual === null || precioActual === 0) {
      precioActual = mapaPrecios[keyInvertidaLower];
    }
    if (precioActual === undefined || precioActual === null) {
      // Si no se encuentra en Listas, dejar precio en 0.
      // NO usar el "Precio Estándar" del Excel de Surtidos como fallback porque
      // tiene cargados subtotales (cant×precio) en vez de precios unitarios,
      // lo que genera precios disparatados (ej: TAR. ESTR. mostrando $11M).
      // El Excel de Listas Maxifer es la fuente única de verdad para precios unitarios.
      precioActual = 0;
      // Log para diagnóstico
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('MAXIFER: ítem sin precio en Listas:', productoFam, '|', numero, '(surtido:', codigoSurtido, ')');
      }
    }

    if (!result[codigoSurtido]) {
      result[codigoSurtido] = [];
      // Indexar también por código normalizado para matching tolerante
      const norm = maxiferNormCodigo(codigoSurtido);
      if (norm) normIndex[norm] = codigoSurtido;
    }
    result[codigoSurtido].push({
      n: numero,
      d: descripcion,
      cant: cantStd,
      p: precioActual,
      cant_r: cantRed,
      p_r: precioActual  // El precio reducido usa el mismo precio actual
    });
  }
  // Adjuntar el índice normalizado al objeto resultado (no enumerable para no contaminar)
  Object.defineProperty(result, '_normIndex', { value: normIndex, enumerable: false });
  return result;
}

// Resuelve el código del HTML al código real del Excel:
// 1) si hay mapeo explícito en MAXIFER_CODIGO_MAP, lo usa
// 2) si existe match exacto en composicion, lo usa
// 3) si existe match normalizado (sin puntos/espacios, case-insensitive), lo usa
// 4) si no, devuelve null
function maxiferResolverCodigo(codigoHTML, composicion) {
  if (!codigoHTML) return null;
  // 1) mapeo explícito
  const mapeado = MAXIFER_CODIGO_MAP[codigoHTML];
  if (mapeado && composicion[mapeado]) return mapeado;
  // 2) match exacto
  if (composicion[codigoHTML]) return codigoHTML;
  // 3) match normalizado
  const norm = maxiferNormCodigo(codigoHTML);
  const normIndex = composicion._normIndex || {};
  if (normIndex[norm]) return normIndex[norm];
  return null;
}

// Crea aliases en composicion para que TODAS las claves usadas por SURTIDOS
// (códigos del HTML) tengan composición disponible, incluso cuando el código
// del Excel está escrito distinto. Esto es importante porque el resto del
// catálogo (búsqueda, comparador, modal) accede a COMPOSICION_DATA[s.codigo]
// directamente, sin pasar por el resolver.
function maxiferCrearAliases(surtidos, composicion) {
  for (const s of surtidos) {
    if (!s.codigo) continue;
    if (composicion[s.codigo]) continue; // ya existe
    const codExcel = maxiferResolverCodigo(s.codigo, composicion);
    if (codExcel) {
      // Alias: misma referencia al array de items
      composicion[s.codigo] = composicion[codExcel];
    }
  }
}

// Recalcula los precios totales de cada surtido sumando (cant × p) de su composición
function maxiferRecalcularPrecios(surtidos, composicion) {
  for (const s of surtidos) {
    const items = composicion[s.codigo];
    if (!items || !items.length) continue;
    let total = 0;
    for (const it of items) {
      total += (it.cant || 0) * (it.p || 0);
    }
    s.precio = Math.round(total);
  }
}
