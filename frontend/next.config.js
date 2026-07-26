/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://foodmap-api-osdq.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
