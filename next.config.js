/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://18.234.69.192:4000/api/auth/:path*',
      },
      {
        source: '/api/data/:path*',
        destination: 'http://18.234.69.192:4000/api/data/:path*',
      },
       { source: '/socket.io/:path*', destination: 'http://18.234.69.192:4000/socket.io/:path*' },
    ];
  },
};
export default nextConfig;
