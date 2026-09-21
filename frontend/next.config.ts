import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the Python service private to the development machine and let Next.js
  // proxy browser requests.  This avoids cross-origin upload failures.
  async rewrites() {
    return [
      {
        source: '/api/pdf/:path*',
        destination: `${process.env.PDF_API_URL ?? 'http://127.0.0.1:8000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
