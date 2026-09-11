# Teslo Shop — Guía del proyecto

API en NestJS para una tienda (productos, imágenes, seed de datos y autenticación).

## Stack

- NestJS 11 + TypeORM 1.1 sobre PostgreSQL (`synchronize: true`, `autoLoadEntities: true`)
- Autenticación con Passport + JWT (`@nestjs/jwt`, `passport-jwt`), passwords con `bcrypt`
- Archivos estáticos servidos con `ServeStaticModule` (carpeta `public`)
- Validación con `class-validator` / `class-transformer`

## Estructura de módulos (`src/`)

- `auth/` — registro, login y estrategia JWT (`jwt.strategy.ts`) que valida el usuario contra la BD en cada request
- `products/` — CRUD de productos, con imágenes (`product-image.entity.ts`) y tags
- `files/` — subida de imágenes de producto (Multer + helpers de filtro/nombrado)
- `seed/` — endpoint para poblar la BD con datos de prueba (`seed-data.ts`)
- `common/` — DTOs compartidos (paginación)

## Variables de entorno (`.env`, ver `.env.template`)

`POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_USER`, `HOST_DB`, `PORT_DB`, `JWT_SECRET`

## Scripts

- `npm run start:dev` — desarrollo con watch
- `npm run lint` — ESLint con `--fix`
- `npm test` / `npm run test:e2e` — Jest

## Convenciones y decisiones

- El JWT payload solo lleva `{ id }` (UUID del usuario) — es el patrón estándar (`sub` claim). El JWT no cifra el payload, solo lo firma, así que nunca debe llevar datos sensibles (passwords, secretos).
- Las respuestas de `auth.service.ts` (`create`, `login`) nunca deben incluir el hash de `password`, aunque la entidad `User` tenga `select: false` en esa columna (eso solo aplica a resultados de queries, no a objetos armados en memoria) — hay que excluirlo explícitamente antes de responder.
- Evitar `console.log` de tokens o IDs de usuario en código que llegue a producción.

## Registro de cambios

### 2026-09-08
- **Fix de seguridad en `auth.service.ts`**: `login()` y `create()` ya no devuelven el hash de `password` en la respuesta HTTP. Se eliminaron los `console.log` que exponían el JWT y el id de usuario en logs.
