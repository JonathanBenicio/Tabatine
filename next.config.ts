import type { NextConfig } from 'next';

/**
 * Security headers para mitigar ataques de Clickjacking, XSS e downgrade de protocolo.
 * Ref: OWASP A05 - Security Misconfiguration | Issue #74
 */
const securityHeaders = [
  {
    // Força HTTPS por 2 anos, inclui subdomínios e permite preload em browsers
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Previne Clickjacking: só permite iframe do mesmo domínio
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // Previne MIME-type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Controla informações de referrer enviadas a outros domínios
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Restringe acesso a APIs do browser (câmera, microfone, GPS)
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    // Content Security Policy: restringe origens de conteúdo
    // TODO: Remover 'unsafe-inline' de script-src após auditoria de scripts inline
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://app.omie.com.br",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
