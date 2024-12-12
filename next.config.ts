

const nextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config: Record<string, unknown>) => {
    if (Array.isArray(config.externals)) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zvmjjjqrxilxhqquddbz.supabase.co", // Supabase storage host
        pathname: "/storage/v1/object/public/**", // Allow paths under the 'public' storage
      },
    ],
  },
};

export default nextConfig