/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
      { protocol: 'https', hostname: 'd-id-talks-prod.s3.us-west-2.amazonaws.com' },
      { protocol: 'https', hostname: '*.d-id.com' },
      { protocol: 'https', hostname: '*.heygen.com' },
    ],
  },
};

module.exports = nextConfig;
