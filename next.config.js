const nextConfig = {
  allowedDevOrigins: [
    '*.preview.emergentagent.com',
    '*.emergent.host',
    '*.emergentcf.cloud',
    'occasion-hub-39.preview.emergentagent.com',
    'occasion-hub-39.cluster-7.preview.emergentcf.cloud',
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
    ],
  },
  // Renamed from experimental.serverComponentsExternalPackages in Next 15
  serverExternalPackages: ['mongodb'],
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  webpack(config, { dev }) {
    if (dev) {
      // Reduce CPU/memory from file watching
      config.watchOptions = {
        poll: 2000, // check every 2 seconds
        aggregateTimeout: 300, // wait before rebuilding
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  async headers() {
    // NOTE: CORS is handled per-request inside /api/[[...path]]/route.js using an
    // allowlist derived from CORS_ORIGINS. We intentionally do NOT set static
    // Access-Control-Allow-Origin headers here; setting a comma-separated list
    // is invalid per CORS spec.
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *;" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
