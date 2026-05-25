import type { NextConfig } from "next";

const enableStrictHttpsHeaders = process.env.ENABLE_STRICT_HTTPS_HEADERS !== '0'
const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'maps.google.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: 'w.ladicdn.com' },
      { protocol: 'https', hostname: 'static.ladipage.net' },
    ],
  },
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'" + (isDev ? " 'unsafe-eval'" : '') + " https://www.googletagmanager.com https://connect.facebook.net https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://prod.spline.design https://*.spline.design",
      "frame-src https://www.googletagmanager.com",
      "worker-src 'self' blob:",
      "form-action 'self'",
      ...(enableStrictHttpsHeaders ? ["upgrade-insecure-requests"] : []),
    ].join('; ')

    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: contentSecurityPolicy,
      },
      ...(enableStrictHttpsHeaders
        ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
          ]
        : []),
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ]

    const longCdnCache = [
      { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
      { key: 'CDN-Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
      // Strip Next's rsc Vary so Cloudflare will edge-cache the HTML response.
      // RSC requests (header rsc: 1) are excluded by the Cloudflare Cache Rule,
      // so they always bypass cache and hit origin — RSC navigation stays correct.
      { key: 'Vary', value: 'Accept-Encoding' },
    ]

    const noCdnCache = [
      { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      { key: 'CDN-Cache-Control', value: 'no-store' },
    ]

    const longCacheRoutes = [
      '/bao-gia-dien-mat-troi',
      '/cau-hoi-thuong-gap',
      '/dien-mat-troi-doanh-nghiep',
      '/doi-tac-thi-cong',
      '/he-thong-hybrid-luu-tru',
      '/lap-dat-dien-mat-troi-gia-dinh',
      '/lien-he',
      '/thue-he-thong-dien-mat-troi',
      '/vat-tu-dien-mat-troi',
      '/ve-soliq',
    ]

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      ...longCacheRoutes.map((source) => ({ source, headers: longCdnCache })),
      { source: '/', headers: noCdnCache },
      { source: '/du-an', headers: noCdnCache },
      { source: '/du-an/:slug*', headers: noCdnCache },
      { source: '/tin-tuc', headers: noCdnCache },
      { source: '/tin-tuc/:slug*', headers: noCdnCache },
      { source: '/sitemap.xml', headers: noCdnCache },
      { source: '/robots.txt', headers: noCdnCache },
      { source: '/quote/:path*', headers: noCdnCache },
      { source: '/admin/:path*', headers: noCdnCache },
    ]
  },
};

export default nextConfig;
