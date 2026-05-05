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
