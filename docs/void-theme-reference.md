# Referencia del tema void

Documentación personal sobre los layouts, partials y shortcodes disponibles en el tema `void`.

---

## Estructura general de archivos

```
themes/void/layouts/
├── _default/
│   ├── baseof.html       ← plantilla base de toda la web
│   ├── single.html       ← layout para posts individuales
│   ├── list.html         ← layout para listados (secciones, taxonomías)
│   └── rss.xml           ← feed RSS
├── about/
│   └── single.html       ← layout específico para la página About
├── posts/
│   └── list.html         ← listado de posts (hereda de list.html)
├── search/
│   └── single.html       ← página de búsqueda con Pagefind
├── tags/
│   └── taxonomy.html     ← /tags/ (ls -al) y /tags/<term>/ (cards)
├── partials/
│   ├── head.html         ← <head>: meta, fonts, CSS
│   ├── header.html       ← barra de navegación
│   ├── footer.html       ← pie de página
│   ├── post-card.html    ← tarjeta de post (home, tags)
│   └── post-item.html    ← ítem de post en listas
├── shortcodes/
│   ├── htb.html          ← tarjeta de máquina HackTheBox
│   ├── note.html         ← callout informativo
│   ├── tip.html          ← callout de consejo
│   ├── warning.html      ← callout de advertencia
│   └── danger.html       ← callout de peligro
├── index.html            ← homepage (hero terminal + pinned posts)
└── 404.html              ← página de error
```

---

## Shortcodes

### `htb` — Tarjeta de máquina HackTheBox

Genera una tarjeta visual con la información de la máquina. Pensada para writeups.

**Uso:**

```
{{< htb
  name="Lame"
  os="Linux"
  difficulty="Easy"
  ip="10.10.10.3"
  points="20"
  status="owned"
  release="2017-03-14"
>}}
```

**Parámetros:**

| Parámetro    | Tipo   | Obligatorio | Valores válidos / Notas                            |
|--------------|--------|-------------|---------------------------------------------------|
| `name`       | string | sí          | Nombre de la máquina                              |
| `os`         | string | no          | `Linux` 🐧 · `Windows` 🪟 · otro 💻 (def: Linux) |
| `difficulty` | string | no          | `Easy` · `Medium` · `Hard` · `Insane` (def: Medium) — afecta al color |
| `ip`         | string | no          | IP de la máquina (def: `10.10.x.x`)               |
| `points`     | string | no          | Puntos de la máquina (opcional, no aparece si se omite) |
| `status`     | string | no          | `owned` ✓ · `todo` ○ · cualquier otro = `in progress` ◎ (def: in-progress) |
| `release`    | string | no          | Fecha de lanzamiento (opcional, no aparece si se omite) |

---

### `note` — Callout informativo

```
{{< note title="Título opcional" >}}
Contenido en **Markdown** soportado.
{{< /note >}}
```

- Icono: círculo con i
- `title` es opcional; si se omite, muestra `note`
- El cuerpo acepta Markdown completo

---

### `tip` — Callout de consejo

```
{{< tip title="Pro tip" >}}
Texto del consejo.
{{< /tip >}}
```

- Icono: check (✓)
- Mismo comportamiento que `note`

---

### `warning` — Callout de advertencia

```
{{< warning title="Aviso" >}}
Esto puede tener consecuencias.
{{< /warning >}}
```

- Icono: triángulo de advertencia
- Mismo comportamiento que `note`

---

### `danger` — Callout de peligro

```
{{< danger title="Destructivo" >}}
No ejecutes esto en producción.
{{< /danger >}}
```

- Icono: octógono de error
- Mismo comportamiento que `note`

---

## Layouts

### `baseof.html` — Plantilla base

Estructura HTML completa de todas las páginas. Incluye:
- `{{ partial "head.html" . }}` — dentro de `<head>`
- `{{ partial "header.html" . }}` — barra de nav
- `{{ block "main" . }}` — contenido variable según layout hijo
- `{{ partial "footer.html" . }}`
- Modal de búsqueda con Pagefind (`#search-modal`)
- `js/main.js`

No hace falta modificarlo para añadir posts. Se hereda automáticamente.

---

### `single.html` — Post individual

Se activa para cualquier página de tipo `posts`. Renderiza:

- Cabecera: título, fecha, tiempo de lectura, autor (si existe), tags
- Cuerpo: `{{ .Content }}` con atributo `data-pagefind-body` (para indexación)
- Sidebar de TOC (se activa automáticamente si el post tiene encabezados `##` o más profundos)
- Footer con enlace a todos los posts y tags

**Front matter relevante para este layout:**

| Clave       | Efecto                                              |
|-------------|-----------------------------------------------------|
| `author`    | Aparece en la meta línea del post                   |
| `tags`      | Genera links a `/tags/<tag>/`                       |
| `date`      | Fecha mostrada y usada para ordenar                 |
| `draft`     | Si `true`, solo visible con `hugo server -D`        |

---

### `list.html` — Listado genérico

Usado en `/posts/` y en listas de taxonomías que no tengan layout propio. Muestra:

- Cabecera con título y número de posts
- Descripción (si `_index.md` tiene `description`)
- Listado usando el partial `post-item.html`
- Paginación nativa de Hugo

**Cómo personalizar una sección:** edita el `_index.md` de esa sección con `title` y `description` en el front matter.

---

### `index.html` — Homepage

La homepage tiene dos zonas:

1. **Hero terminal** — ventana de terminal animada con JS que simula `whoami` y `cat about.txt`. Sin JS muestra el fallback noscript.
2. **Posts**: separa automáticamente los posts con `pinned: true` (sección `// pinned`) del resto (sección `// recent`). Usa `post-card.html`.

Para fijar un post en la home:

```yaml
---
pinned: true
---
```

---

### `tags/taxonomy.html` — Taxonomía de tags

- `/tags/` → simulación visual de `ls -al` con todos los tags y su número de posts
- `/tags/<nombre>/` → grid de tarjetas (`post-card.html`) filtradas por ese tag

---

### `about/single.html` — Página About

Layout minimalista: solo título + contenido. El About está en `content/about/_index.md`. Soporta Markdown completo, incluyendo bloques de código (para el ASCII art del logo).

---

### `search/single.html` — Búsqueda

Integración con Pagefind. Requiere que el índice esté generado:

```bash
just build     # construye el sitio + genera el índice
# o solo el índice:
just search
```

Con `just dev` la búsqueda no funciona porque el índice no existe en modo desarrollo.

---

## Partials

### `head.html`

Genera el `<head>` completo:
- `charset`, `viewport`, `color-scheme: dark`
- `<title>`: en home muestra solo `{{ .Site.Title }}`; en el resto `{{ .Title }} · {{ .Site.Title }}`
- Meta descripción: la del post o, si no, los primeros 160 caracteres del summary
- Open Graph básico (`og:type`, `og:title`, `og:description`, `article:published_time`)
- Favicon SVG inline (cuadrado negro ⬛)
- JetBrains Mono desde Google Fonts
- `css/main.css` y `css/syntax.css`
- Link al RSS

---

### `header.html`

Barra de navegación superior con:
- Logo: `▮ {{ .Site.Title }}` enlazando a la raíz
- Menú principal leído de `[menus.main]` en `hugo.toml`
- El ítem de búsqueda muestra un `<kbd>/</kbd>` como hint del atajo de teclado

Para añadir un ítem al menú, editar `hugo.toml`:

```toml
[[menus.main]]
  name   = "nombre"
  url    = "/ruta/"
  weight = 5   # orden, menor = más a la izquierda
```

---

### `footer.html`

Pie de página con:
- Copyright con año dinámico: `© {{ now.Year }} {{ .Site.Title }}`
- Links: GitHub (si `github` en `[params]`), Twitter (si `twitter` en `[params]`), RSS

Para configurar los links del footer, editar `hugo.toml`:

```toml
[params]
  github  = "tuusuario"
  twitter = "tuusuario"
```

---

### `post-card.html`

Tarjeta de post usada en la **homepage** y en `/tags/<term>/`. Muestra:
- Nombre del fichero `.md` como pseudo-título de archivo
- Fecha + tiempo de lectura + badge `★ pinned` si aplica
- Título con enlace + extracto (160 caracteres)
- Tags como pills

El tiempo de lectura se colorea según duración:
- `rt-short` — ≤ 3 min
- `rt-medium` — 4–7 min
- `rt-long` — > 7 min

---

### `post-item.html`

Ítem de post usado en la lista de `/posts/`. Más compacto que la card. Muestra:
- Título con enlace (y `★` si `pinned: true`)
- Extracto (140 caracteres)
- Tags + fecha + tiempo de lectura

---

## Parámetros de front matter disponibles

Resumen de todos los campos que el tema interpreta en los posts:

```yaml
---
title: "Título del post"
date: 2026-02-18
draft: false          # true = solo visible en modo dev
description: ""       # para meta OG y buscadores (sino usa summary)
author: ""            # aparece en la meta del single layout
tags:
  - etiqueta1
  - etiqueta2
pinned: true          # muestra el post en la sección // pinned de la home
---
```

---

## Configuración global relevante (`hugo.toml`)

```toml
[params]
  description = "descripción del blog"
  github      = "usuario"
  twitter     = "usuario"        # opcional

[markup.tableOfContents]
  startLevel = 2   # ## activa el TOC
  endLevel   = 4   # hasta ####

[markup.highlight]
  style = "catppuccin-mocha"     # tema de syntax highlighting
  noClasses = false              # usa clases CSS (no inline)
```

El TOC aparece automáticamente en `single.html` si el post tiene al menos un `##`. No hay que hacer nada en el front matter.
