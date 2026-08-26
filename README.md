# Open Gym Coach

Base full-stack preparada para desplegarse desde GitHub hacia Vercel.

## Infraestructura

- Next.js/React en Vercel
- Vercel Functions para la API
- Neon PostgreSQL + Drizzle para datos persistentes
- Vercel Blob **privado** para fotos de perfil y progreso
- Vercel Cron diario para recordatorios (07:00, hora de Nicaragua)

## Seguridad de fotografías

Los blobs se crean con `access: private`. La base de datos guarda la referencia y el endpoint `GET /api/media/:id` verifica que quien solicita la imagen sea su propietario o el coach vinculado. No se entregan URLs públicas del Blob al navegador.

Formatos admitidos: JPEG, PNG, WebP y HEIC. Límite actual: 10 MB por imagen.

## Preparación en Vercel

1. Importa este repositorio desde GitHub en Vercel.
2. Instala Neon desde Storage/Marketplace y vincúlalo al proyecto.
3. Crea un Blob store privado y vincúlalo al proyecto.
4. Genera `AUTH_SECRET` y `CRON_SECRET` como valores aleatorios de al menos 32 bytes.
5. Confirma que existen `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `AUTH_SECRET`, `CRON_SECRET` y `NEXT_PUBLIC_APP_URL`.
6. Ejecuta `npm run db:generate` y `npm run db:migrate` desde un entorno que tenga `DATABASE_URL`.

Nunca subas `.env.local` ni tokens a GitHub.

## Desarrollo local

```bash
npm install
vercel link
vercel env pull .env.local --yes
npm run db:generate
npm run db:migrate
npm run dev
```

El flujo de autenticación WebAuthn y las pantallas completas de coach/cliente son las siguientes etapas; los endpoints de media ya exigen una sesión válida almacenada en PostgreSQL y no incluyen un modo inseguro de demostración.
