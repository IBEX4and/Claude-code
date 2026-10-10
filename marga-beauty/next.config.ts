import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Endereço antigo (versão em português) da política de privacidade.
  async redirects() {
    return [{ source: "/privacidade", destination: "/privacy", permanent: true }];
  },
};

export default nextConfig;
