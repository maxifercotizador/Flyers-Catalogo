# Instrucciones para Claude Code

## Workflow de Git
- Trabajá SIEMPRE directamente sobre la branch main. No crees branches nuevas.
- Si el harness te asigna una feature branch igual mergeala (fast-forward) a `main` y empujá `main` antes de terminar — GitHub Pages sirve desde `main` y Maxi prueba sobre el sitio en vivo.
- Después de cada modificación: hacé commit con un mensaje descriptivo en español y pusheá a main.
- No abras Pull Requests. Push directo a main.

## Contexto del proyecto
Este repo es una app HTML de MAXIFER desplegada en GitHub Pages.
El dueño es Max (Maximiliano Gordillo).
Idioma: español (Argentina).

## Estilo
- Mensajes de commit cortos y en español. Ejemplo: "fix: corrige cálculo de descuento"
- Respondeme en español, breve y directo.

## StatiCrypt
Hoy este repo no tiene HTMLs cifrados con StatiCrypt, pero si en algún momento se agregan: el password es `maxifer847` y el flujo es el mismo que en `Temporales` y `Presupuestador` (descifrar con `--salt` embebido en el archivo, editar el descifrado, re-cifrar, post-procesar las keys de localStorage a `_maxi`, reinsertar `<meta robots>` y `<link>`/`<script>` de `maxifer-branding`, y SIEMPRE re-cifrar antes de cerrar la tarea — nunca commitear el descifrado).


## Contexto del ecosistema MAXIFER (igual en los 4 CLAUDE.md)

> **Importante**: este bloque va idéntico en `Presupuestador/CLAUDE.md`, `Proyecto-Privado/CLAUDE.md`, `Temporales/CLAUDE.md` y `Flyers-Catalogo/CLAUDE.md`. Si lo cambiás en uno, sincronizá los otros tres.

### Los 4 repos

| Repo | Rol | Auth | Dueño efectivo |
|------|-----|------|----------------|
| **Presupuestador** | Cotización, listas, compras (apps de empleados) | StatiCrypt `159159` (suffix `_emp`) | Empleados |
| **Proyecto-Privado** | Backoffice admin (análisis financiero, costos, pedidos a fábrica). **Hostea el dashboard `architecture-map/`**. | StatiCrypt `maxifer847` (suffix `_maxi`) | Maxi |
| **Temporales** | Apps de Maxi (CRM Prospectos, VIAJE_SUR, postventa Monday, notas, análisis financiero). **Nombre engañoso — son apps de producción, NO temporales.** | StatiCrypt `maxifer847` (suffix `_maxi`) | Maxi |
| **Flyers-Catalogo** | Catálogo público sin auth. **Hostea `maxifer-branding.{css,js}` como fuente de verdad.** | Sin auth (público) | Público |

### Workflows automáticos del ecosistema

| Repo | Workflow | Disparador | Qué hace |
|------|----------|------------|----------|
| Presupuestador | `generar-jsons.yml` | push de `Listas Maxifer.xlsx` o `Precio Surtidos.xlsx` | Regenera `productos.json` y `surtidos.json` con `build_data.py` |
| Presupuestador | `check-catalog-consistency.yml` | push de `Precio Surtidos.xlsx` | Compara contra `Flyers-Catalogo/surtidos-data.js`. Si hay drift, abre/actualiza un Issue con label `catalog-drift` en Flyers-Catalogo. Si no hay drift, lo cierra solo. |
| Presupuestador | `generar-miniaturas.yml` | manual | Genera miniaturas de imágenes |
| Flyers-Catalogo | `sync-branding.yml` | push de `maxifer-branding.{css,js}` | Copia los archivos a Presupuestador/Proyecto-Privado/Temporales |
| Proyecto-Privado | `regenerate-architecture-map.yml` | dispatch / cron / push | Re-escanea los 4 repos y regenera `architecture-map/dependency-graph.json` |
| Los 4 repos | `notify-architecture-map.yml` | push a `main` | Triggerea regenerate del dashboard via repository_dispatch |

### Secrets requeridos

- `ARCHITECTURE_MAP_PAT` (en los 4 repos): fine-grained PAT con Contents R/W + Metadata R + Secrets R/W. Permite a los workflows operar cross-repo (commitear, abrir issues, leer/clonar).
- `STATICRYPT_PASSWORDS` (solo en Proyecto-Privado, valor = `159159,maxifer847`): permite al scan descifrar HTMLs cifrados en CI durante la regeneración del dashboard.

### Archivos auto-generados — NO editar a mano

- `Presupuestador/productos.json`, `Presupuestador/surtidos.json` — generados por `build_data.py` desde los Excels.
- `Presupuestador/thumbs/` — generados por `generar_miniaturas.py`.
- `*/maxifer-branding.{css,js}` (excepto en Flyers-Catalogo, que es la fuente) — sincronizados desde Flyers-Catalogo automáticamente.
- `Proyecto-Privado/architecture-map/dependency-graph.json` — regenerado por `architecture-map/scripts/scan_repos.py`. Si necesitás overrides manuales (nodos que el scan no detecta, edges no inferibles, renames de label), editá `Proyecto-Privado/architecture-map/_manual_nodes.json` — el scan los mergea en cada corrida.

### Apps con dependencias externas importantes

- **⚡ Power Automate (Microsoft 365)** — flujo automático que sincroniza Excels desde SharePoint a GitHub. **Hace 2 cosas**:
  1. Sube los Excels editados a GitHub (commits "auto: actualiza X desde SharePoint" autoreados como `maxifercotizador <info@fabricamaxifer.com>`).
  2. **Genera los JSONs derivados financieros** (`financiero_facturacion.json`, `financiero_gastos.json`, `financiero_resumen.json`, `ventas_monday.json`, `sur_data.json`, `pendientes_data.json` — todos en `Proyecto-Privado/`) y los commitea en el mismo push.
  
  **Excels que sincroniza**: `Listas Maxifer.xlsx` y `Precio Surtidos.xlsx` (Presupuestador); `01 COMPRAS - COSTOS - FABRICAS.xlsm`, `03 Pedidos Fabricas.xlsm`, `Control de ingresos y gastos.xlsm`, `Gastos Fijos.xlsx` (Proyecto-Privado).

- **☁️ SharePoint (Microsoft 365)** — donde Maxi edita los Excels maestros. Es la fuente de verdad upstream.

- **🤖 mcp-asistente** (`Proyecto-Privado/mcp-asistente/api/mcp.py`) — servidor MCP en Vercel que **lee** los JSONs financieros vía GitHub raw y los expone como tools a Claude.ai. Permite preguntar en chats "¿cuánto facturé este mes?", "¿qué le entregué a Casa Blanco?", etc. **Es lector, no escritor** — los JSONs los genera Power Automate.

- **Monday.com**: `Temporales/Prospectos.html` (board `18410539555`), `Temporales/postventa_monday.html` (board `7212937829`), `Temporales/VIAJE_SUR.html` (board `8921412317`), `Proyecto-Privado/surtidos.html`. Token Monday guardado en `localStorage` del navegador (nunca commiteado).

- **Vercel functions**: `Presupuestador/api/sheets.js`, `Presupuestador/api/transcribir.js`, y el `mcp-asistente` mencionado arriba (los 3 deployados en Vercel).

- **WhatsApp**: links `wa.me/<numero>?text=...` desde `Temporales/Prospectos.html` y otras apps. NO automatizado — el usuario tiene que tocar enviar.


### Convenciones de commits y branches

- Mensajes de commit en español Argentina, breves.
- **Push directo a `main` está bloqueado** por el harness git server (rechaza con `send-pack: unexpected disconnect`). Usar branches `claude/<tema>` + Pull Request + merge vía MCP GitHub (`mcp__github__merge_pull_request`).
- NO usar `--no-verify`, `--amend`, ni operaciones destructivas (`reset --hard`, `push --force`) salvo pedido explícito de Maxi.
- Los CLAUDE.md de cada repo dicen "push directo a main" como ideal, pero en la práctica del harness eso no funciona → usar PRs.

### Dashboard de arquitectura

- URL pública: `https://maxifercotizador.github.io/Proyecto-Privado/architecture-map/`
- Servido desde `Proyecto-Privado/architecture-map/`, NO está cifrado con StatiCrypt (es accesible para Maxi sin password adicional).
- Linkeado desde `Temporales/Index_general.html` en el módulo "Proyecto Privado" como "🗺️ Mapa de Arquitectura".
- Si una conexión está mal o falta en el grafo → editar `Proyecto-Privado/architecture-map/_manual_nodes.json` y push a main. El scan auto-mergea esos overrides.

### Tests / validaciones existentes

- `Proyecto-Privado/architecture-map/scripts/validate_graph.py` — valida estructura del JSON del dashboard.
- `Presupuestador/scripts/check_catalog_consistency.py` — chequea drift Excel ↔ catálogo Flyers.
- No hay otros tests automatizados. Si querés agregar, integrarlos a los workflows existentes.
