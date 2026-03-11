/** @type {import('next').NextConfig} */
const nextConfig = {
  // Requis pour le Dockerfile multi-stage : génère un serveur Node.js autonome
  // dans .next/standalone (sans avoir besoin de node_modules complet en prod)
  output: 'standalone',
};

module.exports = nextConfig;
