# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Deps : installation des dépendances
# ─────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS deps

# Installer les certificats et libc-compat (requis pour certains packages natifs)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copier uniquement les manifestes pour profiter du cache Docker
COPY package.json package-lock.json* ./

# Installation des dépendances de production + dev (nécessaire pour le build)
RUN npm ci


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Builder : build de l'application Next.js
# ─────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Récupérer les node_modules depuis le stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copier l'intégralité du code source
COPY . .

# Activer le mode standalone de Next.js (produit un serveur autonome minimaliste)
# Cette option doit aussi être présente dans next.config.js (voir ci-dessous)
ENV NEXT_TELEMETRY_DISABLED=1

# Créer le dossier public s'il n'existe pas (requis par le COPY dans le runner)
RUN mkdir -p public

RUN npm run build


# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — Runner : image finale ultra-légère
# ─────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copier uniquement les assets statiques publics
COPY --from=builder /app/public ./public

# Préparer le répertoire avec les bonnes permissions pour le cache Next.js
RUN mkdir .next && chown nextjs:nodejs .next

# Copier le serveur standalone (inclut uniquement les dépendances nécessaires)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copier les fichiers statiques générés (CSS, JS, images optimisées)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Le serveur standalone de Next.js s'auto-démarre via server.js
CMD ["node", "server.js"]
