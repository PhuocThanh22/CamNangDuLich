/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon-pho.png',
      },
      {
        source: '/api/:path*',
        destination: 'https://foodmap-api-osdq.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
