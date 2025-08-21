/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://18.234.69.192:4000/api/auth/:path*',
      },
    ];
  },
};
export default nextConfig;
