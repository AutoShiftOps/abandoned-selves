/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external sources if needed later
  images: {
    remotePatterns: [],
  },
  // Required for Stripe webhook to receive raw body
  async headers() {
    return [
      {
        source: '/api/stripe/webhook',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ]
  },
}

module.exports = nextConfig
