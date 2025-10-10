// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  // Configuraciones generales
  reactStrictMode: true,

  // Variables de entorno expuestas al cliente
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // ❗ GEMINI_API_KEY NO se expondrá en el cliente si no tiene prefijo NEXT_PUBLIC_
    // Si es solo para el servidor, no lo pongas aquí; accede directamente a process.env
  },

  // Ignorar errores de TypeScript en build (útil en desarrollo)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignorar errores de ESLint en build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configuración de imágenes remotas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

