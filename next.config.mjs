/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3210",
        pathname: "/api/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3210",
        pathname: "/api/storage/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
