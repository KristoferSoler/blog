# Hostear Hugo en GitHub Pages con dominio propio

Guía práctica para publicar el blog con Hugo en GitHub Pages y enlazarlo a un dominio personal. Incluye alternativas y comparativa de coste.

---

## GitHub Pages: proceso completo

### 1. Prerequisitos

- Repositorio en GitHub (puede ser privado o público; Pages funciona en ambos con cuenta gratuita)
- Dominio propio registrado (namecheap, Cloudflare, Porkbun, etc.)
- Hugo instalado localmente

---

### 2. Preparar el repositorio

El repositorio puede llamarse como quieras. El nombre solo afecta a la URL por defecto (`usuario.github.io/repo`), que luego se sustituirá con el dominio propio.

**Excepción:** si el repo se llama `<usuario>.github.io` (repo especial de usuario), Pages sirve desde la raíz y la URL por defecto es `https://<usuario>.github.io`.

---

### 3. Configurar `hugo.toml`

Antes de desplegar, actualizar `baseURL` con el dominio real:

```toml
baseURL = "https://tudominio.com/"
```

Si se deja como `/` el sitio funciona pero los permalinks y el RSS generarán URLs relativas incorrectas en producción.

---

### 4. Añadir el workflow de GitHub Actions

Crear el archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy Hugo to GitHub Pages

on:
  push:
    branches:
      - main          # o master, según tu rama principal

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive   # necesario si el tema es un submódulo git

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: "latest"
          extended: true           # necesario si el tema usa SCSS/SASS

      - name: Build
        run: hugo --minify

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> **Nota sobre el tema:** si el tema `void` está en `themes/void/` como carpeta normal (no submódulo git), no hace falta `submodules: recursive`. Si en algún momento lo conviertes en submódulo, sí es necesario.

---

### 5. Activar Pages en GitHub

1. Ir a **Settings → Pages** del repositorio
2. En **Source**, seleccionar **GitHub Actions**
3. El primer push a `main` disparará el workflow y publicará el sitio

---

### 6. Configurar el dominio propio

#### En GitHub

1. Settings → Pages → **Custom domain**
2. Introducir el dominio: `tudominio.com`
3. GitHub crea automáticamente un fichero `CNAME` en el repositorio (o puedes crearlo tú manualmente en `static/CNAME` para que Hugo lo incluya en cada build):

```
# static/CNAME
tudominio.com
```

> Recomiendo crear `static/CNAME` manualmente. Si GitHub lo crea en la raíz del repo, un build de Hugo sin ese archivo lo sobrescribiría y perdería el dominio.

4. Marcar **Enforce HTTPS** (disponible solo después de que el certificado TLS se haya emitido, tarda unos minutos)

#### En el proveedor de DNS

Dos opciones según si usas el apex (`tudominio.com`) o un subdominio (`blog.tudominio.com`):

**Apex domain (`tudominio.com`):**

Crear registros `A` apuntando a las IPs de GitHub Pages:

```
A   @   185.199.108.153
A   @   185.199.109.153
A   @   185.199.110.153
A   @   185.199.111.153
```

También crear un registro `AAAA` para IPv6 (si el proveedor lo soporta):

```
AAAA  @  2606:50c0:8000::153
AAAA  @  2606:50c0:8001::153
AAAA  @  2606:50c0:8002::153
AAAA  @  2606:50c0:8003::153
```

Y un `CNAME` para el subdominio `www` apuntando al repo:

```
CNAME  www  <usuario>.github.io.
```

**Subdominio (`blog.tudominio.com`):**

Solo necesitas un `CNAME`:

```
CNAME  blog  <usuario>.github.io.
```

---

### 7. Cosas a tener en cuenta

- **`baseURL` en hugo.toml** debe coincidir exactamente con el dominio configurado (con o sin `www`), incluida la barra final.
- **El archivo `CNAME`** debe existir en `static/CNAME` para que Hugo lo incluya en cada build. Si no, Pages pierde el dominio personalizado en cada despliegue.
- **Caché de DNS**: los cambios de DNS pueden tardar entre 15 minutos y 48 horas en propagarse.
- **TLS/HTTPS**: GitHub emite el certificado automáticamente vía Let's Encrypt. "Enforce HTTPS" aparece en gris hasta que el certificado está listo.
- **Drafts**: los posts con `draft: true` **no** se publican con `hugo --minify` (sin el flag `-D`). Es el comportamiento correcto para producción.
- **Pagefind / búsqueda**: el índice de búsqueda se genera durante `hugo --minify`. El workflow ya lo incluye, así que la búsqueda funciona en producción. Solo falla en desarrollo local si no se ejecuta `just build`.
- **Rama de publicación**: el workflow sube el artefacto directamente, no necesita una rama `gh-pages` separada.

---

## Alternativas a GitHub Pages

### Cloudflare Pages

**Precio:** gratuito (sin límite de sitios, sin límite de peticiones, sin límite de ancho de banda)

**Ventajas sobre GitHub Pages:**
- CDN global de Cloudflare (mejor latencia en muchas regiones)
- Despliegue por rama automático (vista previa de PRs)
- Analytics básico gratuito incluido
- Integración nativa con Cloudflare DNS → dominio propio en segundos, sin tocar registros A manualmente
- Soporte de redirecciones y cabeceras HTTP personalizadas sin configuración extra
- Comando de build configurable desde la UI (puedes poner `hugo --minify` directamente)

**Desventajas:**
- Está atado al ecosistema de Cloudflare (aunque el código sigue en GitHub/GitLab)
- Si ya tienes el DNS en Cloudflare, es la opción más cómoda; si no, hay que transferir o delegar el dominio

**Veredicto:** si el dominio ya está gestionado en Cloudflare (o estás dispuesto a moverlo), **Cloudflare Pages es la mejor opción gratuita**. Más rápido, más fácil de configurar y con más features.

---

### Netlify

**Precio:** gratuito hasta 100 GB de ancho de banda/mes y 300 minutos de build/mes. El plan Pro cuesta ~\$19/mes.

**Ventajas:**
- Fue pionero en el modelo de deploy continuo para sitios estáticos
- Formularios, funciones serverless y A/B testing integrados (irrelevantes para un blog puro)
- Deploy previews por rama/PR
- CLI muy cómodo para gestión local

**Desventajas:**
- El límite de 100 GB/mes y 300 min de build se puede alcanzar si el tráfico crece
- Más caro que las alternativas si necesitas el plan de pago
- Para un blog personal, las features extra no aportan nada

**Veredicto:** válido, pero no hay razón para elegirlo sobre Cloudflare Pages salvo preferencia personal.

---

### Vercel

**Precio:** gratuito para proyectos personales (con límites parecidos a Netlify).

**Ventajas:**
- Excelente para Next.js y frameworks con renderizado híbrido
- Edge Functions globales

**Desventajas:**
- Optimizado para frameworks JS, no para sitios estáticos puros
- La cuenta gratuita no permite uso comercial
- Overkill para Hugo

**Veredicto:** no es la herramienta adecuada para un blog estático. Mejor ignorarlo.

---

### Codeberg Pages

**Precio:** completamente gratuito (instancia pública de Forgejo).

**Ventajas:**
- Open source y sin ánimo de lucro
- Sin límites de ancho de banda documentados
- Dominio propio soportado

**Desventajas:**
- CI/CD menos maduro que GitHub Actions
- Comunidad pequeña → menos documentación y soporte
- Menor fiabilidad y uptime que las opciones anteriores

**Veredicto:** interesante si valoras el software libre y la independencia de las grandes plataformas. Para uso personal es viable.

---

## Comparativa rápida

| Plataforma        | Precio      | CDN       | Dominio propio | HTTPS auto | Build CI       | Facilidad |
|-------------------|-------------|-----------|----------------|------------|----------------|-----------|
| GitHub Pages      | Gratis      | Básico    | Sí             | Sí         | GitHub Actions | Media     |
| Cloudflare Pages  | Gratis      | Excelente | Sí             | Sí         | Nativo         | Alta      |
| Netlify           | Gratis/\$19 | Bueno     | Sí             | Sí         | Nativo         | Alta      |
| Vercel            | Gratis*     | Excelente | Sí             | Sí         | Nativo         | Alta      |
| Codeberg Pages    | Gratis      | Básico    | Sí             | Sí         | Forgejo CI     | Media     |

\* Solo para proyectos no comerciales.

---

## Recomendación

Para este blog:

1. **Primera opción: Cloudflare Pages** — si el dominio ya está o se va a gestionar en Cloudflare. Sin configuración de DNS manual, CDN superior y totalmente gratuito.

2. **Segunda opción: GitHub Pages** — si el código ya está en GitHub y no se quiere añadir otra plataforma. La configuración del workflow es sencilla y está probada. El único coste extra es el del dominio (desde ~\$8–12/año según el TLD).

En ambos casos, el **coste real es solo el dominio**: ninguna de las dos plataformas de hosting cobra nada para un blog personal con el tráfico habitual.
