# Servidor local con drafts
dev:
    hugo server --buildDrafts --disableFastRender

# Build completo + índice de búsqueda Pagefind
build:
    hugo --minify
    npx pagefind --site public --output-path public/pagefind

# Solo regenerar el índice (sin rebuild completo de Hugo)
search:
    npx pagefind --site public --output-path public/pagefind

# Limpia el directorio de salida
clean:
    rm -rf public/
