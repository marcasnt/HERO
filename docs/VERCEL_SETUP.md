# Configuración de Vercel

## 1. GitHub

Sube el contenido de esta carpeta como repositorio y selecciónalo en **Vercel → Add New → Project**.

## 2. Neon PostgreSQL

Desde el proyecto de Vercel abre **Storage/Marketplace**, instala Neon y conecta la base al proyecto. Comprueba que Vercel haya creado `DATABASE_URL` para Development, Preview y Production.

## 3. Vercel Blob

Crea un Blob store, selecciona acceso privado y conéctalo al proyecto. Vercel debe inyectar `BLOB_READ_WRITE_TOKEN`. No copies el token al repositorio.

## 4. Secretos

Agrega `AUTH_SECRET` y `CRON_SECRET` con valores aleatorios diferentes. Agrega `NEXT_PUBLIC_APP_URL` con la URL canónica de producción.

## 5. Entornos

Usa recursos separados para Preview y Production cuando empieces a probar con clientes reales. Una rama de prueba no debe escribir en la base ni en el Blob de producción.

## 6. Migración

Con las variables descargadas localmente:

```bash
npx vercel env pull .env.local --yes
npx dotenv -e .env.local -- drizzle-kit migrate
```

## 7. Verificación

- La compilación termina sin errores.
- `DATABASE_URL` y `BLOB_READ_WRITE_TOKEN` aparecen por nombre en los tres entornos.
- Las imágenes se guardan con acceso privado.
- Abrir directamente la URL interna del blob no hace pública la fotografía.
- Un cliente no puede solicitar el ID de una fotografía perteneciente a otro cliente.
- El coach solo puede ver fotografías de clientes relacionados mediante `coach_clients`.
