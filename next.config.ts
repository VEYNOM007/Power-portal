import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://recaptchaenterprise.googleapis.com",
              "frame-src 'self' https://www.google.com/recaptcha/ https://recaptchaenterprise.googleapis.com",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://firebaseappcheck.googleapis.com https://www.google.com/recaptcha/ https://recaptchaenterprise.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
