/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
  },
  outputFileTracingRoot: __dirname,
  // Fix SSL certificate issues in development
  ...(process.env.NODE_ENV === 'development' && {
    serverExternalPackages: [],
  }),
  // Disable static generation in CI to avoid Html import issues
  ...(process.env.CI === 'true' && {
    output: 'standalone',
    trailingSlash: false,
  }),
}

// Fix SSL certificate issues in development
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('🔧 Frontend: SSL certificate validation disabled for development');
}

module.exports = nextConfig
