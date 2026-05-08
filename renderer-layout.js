// ── RENDERER LAYOUT ───────────────────────────────────────────
// Toma el LAYOUT_CONFIG (cargado de layout-config.json) y arma cada
// página del catálogo con position:absolute en lugar de flex/flow.
// Esto permite que el editor (editor.html) controle posiciones exactas.

let LAYOUT_CONFIG = null;

async function cargarLayoutConfig(){
    try {
        const url = 'layout-config.json?t=' + Date.now();
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) return null;
        LAYOUT_CONFIG = await resp.json();
        return LAYOUT_CONFIG;
    } catch(err){
        console.warn('No se pudo cargar layout-config.json:', err);
        return null;
    }
}

// Renderiza el contenido interno de un bloque según su tipo.
// Espejo de la función del editor — el output debe verse igual.
function renderBlockContent(b, s, ctx, vendor){
    const COLORS = {
        'navy':'#1a3a7a', 'navy-dark':'#13295a', 'navy-light':'#2151a8',
        'green':'#0e8a4a', 'green-dark':'#0a6b39',
        'red':'#c8102e', 'muted':'#5a6685', 'text':'#1a2238'
    };
    const FAMILIES = {
        'Montserrat':"'Montserrat',sans-serif",
        'Inter':"'Inter',sans-serif",
        'Playfair':"'Playfair Display',serif",
        'mono':"ui-monospace,Menlo,monospace"
    };

    switch(b.type){
        case 'brand-img':
            return `<div class="rl-brand-img"><img src="img/favicon-192.png" alt="MAXIFER"></div>`;
        case 'text': {
            const align = b.align === 'right' ? 'right' : (b.align === 'center' ? 'center' : 'left');
            const upper = b.upper ? 'uppercase' : 'none';
            const txt = b.text
                      ? b.text
                      : (b.id === 'brand-name') ? 'MAXIFER'
                      : (b.id === 'brand-sub') ? 'Fábrica Importadora'
                      : (b.id === 'vendor-name') ? vendor.nombre
                      : (b.id === 'vendor-wa') ? formatWA(vendor.wa)
                      : (b.id === 'title') ? (s ? s.nombre : 'Título')
                      : b.label;
            const italic = b.italic ? 'italic' : 'normal';
            const ls = (b.letterSpacing||0) + 'em';
            const justify = align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start');
            return `<div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:${justify};text-align:${align};text-transform:${upper};font-family:${FAMILIES[b.family]||FAMILIES.Inter};font-size:${b.fontSize}px;font-weight:${b.weight||500};font-style:${italic};color:${COLORS[b.color]||'inherit'};letter-spacing:${ls};line-height:1.15;overflow:hidden">${txt}</div>`;
        }
        case 'pill':
            return `<div class="rl-pill" style="font-size:${b.fontSize||13}px">${s ? s.codigo : 'COD.'}</div>`;
        case 'photo': {
            if (!s) return '';
            const src = s[b.photoKey] || s.foto_card || '';
            const noBg = b.noBg ? ' rl-no-bg' : '';
            return `<div class="rl-photo${noBg}">
                <span class="rl-ph-label">${b.photoLabel || 'Foto'}</span>
                ${src ? `<img src="${src}" alt="${b.photoLabel}">` : ''}
            </div>`;
        }
        case 'spec': {
            if (!s) return '';
            let val = '—';
            if (b.valueKey === 'piezas') val = formatNum(s.piezas);
            else if (b.valueKey === 'modelos') val = (typeof MODELOS_DIFERENTES !== 'undefined' && MODELOS_DIFERENTES[s.codigo]) || '—';
            else if (b.valueKey === 'stockGav') val = (typeof CANTIDADES_GAVETAS !== 'undefined' && CANTIDADES_GAVETAS[s.codigo]) || '—';
            return `<div class="rl-spec"><div class="rl-lbl">${b.label_text}</div><div class="rl-val">${val}</div></div>`;
        }
        case 'incluye': {
            if (!s) return '';
            const items = (s.incluye || []).map(i => `<li>${i}</li>`).join('');
            return `<div class="rl-incluye"><div class="rl-h">Incluye</div><ul>${items}</ul></div>`;
        }
        case 'precio': {
            if (!s) return '';
            const sinPrecio = ctx.precio === 'sin';
            const descNum = ctx.desc ? parseInt(ctx.desc, 10) : 0;
            const precioLista = s.precio || 0;
            const precioFinal = descNum > 0 ? Math.round(precioLista * (1 - descNum/100)) : precioLista;
            if (sinPrecio){
                return `<div class="rl-precio rl-sin"><div class="rl-lbl">Consultar precio</div><div class="rl-val" style="font-size:13px">Contactar al vendedor</div><div class="rl-hint">Coordiná por WhatsApp</div></div>`;
            } else if (descNum > 0){
                return `<div class="rl-precio"><div class="rl-lbl">Precio con −${descNum}%</div><span class="rl-old">$${formatNum(precioLista)}</span><div class="rl-val">$${formatNum(precioFinal)}</div><div class="rl-hint">+ IVA</div></div>`;
            } else {
                return `<div class="rl-precio"><div class="rl-lbl">Precio Lista</div><div class="rl-val">$${formatNum(precioLista)}</div><div class="rl-hint">+ IVA</div></div>`;
            }
        }
        case 'stock': {
            if (!s) return '';
            if (s.tabla && s.tabla.length){
                let cols = 4;
                if (s.tabla.length > 32) cols = 6;
                else if (s.tabla.length > 24) cols = 5;
                const filas = s.tabla.map(r => `<div class="rl-row"><span class="rl-cant">${r.cant}</span><span class="rl-med">${r.medida}</span></div>`).join('');
                return `<div class="rl-tabla"><div class="rl-h">Composición · ${s.tabla.length} medidas</div><div class="rl-grid" style="grid-template-columns:repeat(${cols},1fr);font-size:${cols >= 6 ? 9 : (cols >= 5 ? 9.5 : 10.5)}px">${filas}</div></div>`;
            } else if (s.cant_uniforme){
                return `<div class="rl-uniforme"><div class="rl-ico">📦</div><div class="rl-utext"><div class="rl-lbl">Cantidades por modelo</div><div class="rl-val">${s.cant_uniforme}</div></div></div>`;
            }
            return '';
        }
        case 'footer':
            return `<div class="rl-footer"><strong>${vendor.nombre}</strong> · <span class="rl-wa">WhatsApp ${formatWA(vendor.wa)}</span> · www.fabricamaxifer.com</div>`;
        case 'line':
            return `<div style="width:100%;height:100%;background:#dde3ee"></div>`;
        case 'cover-logo':
            return `<div class="rl-cover-logo"><img src="img/favicon-192.png" alt="MAXIFER"></div>`;
        case 'cover-stats': {
            const totalSurtidos = (typeof SURTIDOS !== 'undefined') ? SURTIDOS.length : 59;
            const totalPiezas = (typeof SURTIDOS !== 'undefined') ? SURTIDOS.reduce((a,x)=>a+(x.piezas||0),0) : 14957;
            return `<div class="rl-cover-stats">
                <div class="rl-cs-item"><div class="rl-cs-num">${totalSurtidos}</div><div class="rl-cs-lbl">Surtidos</div></div>
                <div class="rl-cs-item"><div class="rl-cs-num">${formatNum(totalPiezas)}</div><div class="rl-cs-lbl">Piezas</div></div>
                <div class="rl-cs-item"><div class="rl-cs-num">100%</div><div class="rl-cs-lbl">Libre reposición</div></div>
            </div>`;
        }
        case 'cover-vendor':
            return `<div class="rl-cover-vendor">
                <div class="rl-cv-lbl">Tu vendedor</div>
                <div class="rl-cv-name">${vendor.nombre}</div>
                <div class="rl-cv-wa">${formatWA(vendor.wa)}</div>
            </div>`;
        case 'idx-content':
            return renderIdxContent(ctx);
        case 'bcover-cta':
            return `<div class="rl-bcover-cta">
                <div class="rl-bcta-lbl">Tu vendedor MAXIFER</div>
                <div class="rl-bcta-name">${vendor.nombre}</div>
                <div class="rl-bcta-wa">${formatWA(vendor.wa)}</div>
            </div>`;
        default:
            return '';
    }
}

// Render del contenido del índice (lista agrupada de surtidos).
// Necesita acceso a ctx.surtidos y ctx.paginaInicio.
function renderIdxContent(ctx){
    if (!ctx || !ctx.surtidos || typeof GRUPOS === 'undefined') return '';
    const grupoMap = new Map();
    for (let i = 0; i < ctx.surtidos.length; i++){
        const s = ctx.surtidos[i];
        const g = (typeof getGrupo === 'function') ? getGrupo(s) : { key:'otros', label:'Otros', icono:'📦' };
        if (!grupoMap.has(g.key)) grupoMap.set(g.key, { grupo:g, items:[] });
        grupoMap.get(g.key).items.push({ s, pagina: ctx.paginaInicio + i });
    }
    const bloques = [];
    for (const g of GRUPOS){
        const data = grupoMap.get(g.key);
        if (!data || !data.items.length) continue;
        const filas = data.items.map(it => `
            <div class="rl-idx-row">
                <span class="rl-idx-cod">${it.s.codigo}</span>
                <span class="rl-idx-name">${it.s.nombre}</span>
                <span class="rl-idx-page">${it.pagina}</span>
            </div>`).join('');
        bloques.push(`<div class="rl-idx-grupo"><div class="rl-idx-grupo-h">${g.icono} ${g.label}</div>${filas}</div>`);
    }
    return `<div class="rl-idx-cols">${bloques.join('')}</div>`;
}

// Frame SVG (igual que antes — no editable, va de fondo)
function rlFrameSVG(pageNum, opts){
    opts = opts || {};
    const showPage = opts.showPage !== false;
    const numEl = showPage ? `
        <circle cx="14" cy="285" r="5.5" fill="#ffffff"/>
        <text x="14" y="287.5" text-anchor="middle" font-family="'Inter',sans-serif" font-weight="800" font-size="6.5" fill="#1a3a7a">${pageNum}</text>` : '';
    const anio = (typeof ANIO !== 'undefined') ? ANIO : '26';
    return `
    <svg class="frame" viewBox="0 0 210 297" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0,0 L 78,0 Q 64,18 50,32 Q 30,50 0,72 Z" fill="#1a3a7a"/>
        <path d="M 0,68 Q 30,46 52,30 Q 70,17 88,8 Q 130,2 168,16 Q 192,24 210,12 L 210,2 Q 192,16 168,8 Q 130,-2 88,2 Q 68,10 50,24 Q 28,40 0,60 Z" fill="#0e8a4a"/>
        <path d="M 196,0 L 210,0 L 210,22 Q 204,11 196,0 Z" fill="#c8102e"/>
        <text x="14" y="30" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-weight="800" font-size="26" fill="#ffffff">${anio}</text>
        <path d="M 0,253 Q 18,258 32,272 Q 44,284 56,297 L 0,297 Z" fill="#1a3a7a"/>
        <path d="M 0,275 Q 28,283 52,283 Q 88,283 130,288 Q 170,292 196,283 Q 204,279 210,288 L 210,297 L 0,297 Z" fill="#0e8a4a"/>
        <path d="M 199,297 L 210,297 L 210,278 Q 205,288 199,297 Z" fill="#c8102e"/>
        ${numEl}
    </svg>`;
}

// Render una página completa usando el LAYOUT_CONFIG.
// pageType: 'surtido-normal' | 'surtido-grande' | 'portada' | 'indice' | 'contratapa'
function renderPageFromLayout(pageType, surtido, ctx, pageNum, vendor){
    if (!LAYOUT_CONFIG || !LAYOUT_CONFIG[pageType]) return '';
    const layout = LAYOUT_CONFIG[pageType];
    const showPage = pageType !== 'portada';

    let html = `<section class="page">${rlFrameSVG(pageNum, {showPage})}<div class="rl-layout">`;
    for (const b of layout.blocks){
        const style = `position:absolute;left:${b.x}mm;top:${b.y}mm;width:${b.w}mm;height:${b.h}mm;`;
        html += `<div class="rl-block" data-id="${b.id}" style="${style}">${renderBlockContent(b, surtido, ctx, vendor)}</div>`;
    }
    html += '</div></section>';
    return html;
}
