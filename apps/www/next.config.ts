import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Os testes E2E acessam o dev server pelo host `www` (rede do Docker), não por localhost.
  allowedDevOrigins: ['www'],
};

export default nextConfig;
