# Setup Fase 1 - Database & Core

Instrucciones para completar la Fase 1: Setup de Base de Datos y Core del Sistema.

---

## 📋 Checklist de Ejecución

### 1. Instalar Dependencias Prisma
\`\`\`bash
npm install @prisma/client
npm install -D prisma
\`\`\`

### 2. Crear archivo .env.local
\`\`\`bash
cp .env.example .env.local
\`\`\`

Asegúrate de actualizar si es necesario:
- DATABASE_URL - Ya configurada en .env.example
- DIRECT_URL - Ya configurada en .env.example
- ANTHROPIC_API_KEY - Tu API key

### 3. Ejecutar Migraciones en Neon
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

Esto:
- Crea todas las tablas en Neon
- Genera el cliente Prisma
- Aplicará el schema definido en prisma/schema.prisma

### 4. Seed de 60 Libros
\`\`\`bash
npx prisma db seed
\`\`\`

Esto:
- Carga 60 libros diversos en la BD
- 10 géneros: ficción, historia, desarrollo, filosofía, ciencia
- Mezcla de dificultades: beginner, intermediate, advanced

### 5. Verificar Migración
\`\`\`bash
psql 'postgresql://neondb_owner:...@ep-....neon.tech/neondb' -c "\\dt"
\`\`\`

---

## 🚀 Quick Start

\`\`\`bash
npm install && \
cp .env.example .env.local && \
npx prisma migrate dev --name init && \
npx prisma db seed && \
echo "✅ Setup completado!"
\`\`\`

---

Referencia completa: docs/database-schema.md
