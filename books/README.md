# AMROIS Books Configuration

Este directorio está diseñado para contener los libros físicos que AMROIS procesará.

## Estructura Recomendada

```
books/
├── emprendimiento/
├── finanzas/
├── marketing/
├── liderazgo/
├── desarrollo-personal/
├── tecnologia/
└── otros/
```

## Configuración en Docker

### Opción 1: Usar ruta absoluta del host

Edita `docker-compose.yml`:

```yaml
volumes:
  - /Users/tu-usuario/path/to/your/books:/app/books:ro
```

### Opción 2: Usar ruta relativa (recomendado)

```yaml
volumes:
  - ./books:/app/books:ro
```

### Opción 3: Montaje dinámico (para diferentes rutas)

```yaml
volumes:
  - ${BOOKS_HOST_PATH:-./books}:/app/books:ro
```

Luego ejecuta:
```bash
export BOOKS_HOST_PATH=/ruta/a/tus/libros
docker-compose up -d
```

## Permisos Importantes

Asegúrate de que la ruta de libros tenga los permisos correctos:

```bash
chmod 755 /ruta/a/tus/libros
find /ruta/a/tus/libros -type f -exec chmod 644 {} \;
```

## Formatos Soportados

- PDF (.pdf)
- EPUB (.epub)
- MOBI (.mobi)
- TXT (.txt)
- DOCX (.docx)

## Sincronización Automática

AMROIS escaneará este directorio cada 3600 segundos (1 hora) por defecto. 
Puedes ajustar este intervalo en las variables de entorno:

```bash
BOOKS_SCAN_INTERVAL=1800  # 30 minutos
```

## Nota Importante

El volumen está montado como solo lectura (`:ro`) para proteger tus archivos 
originales. AMROIS solo leerá los archivos pero no los modificará.