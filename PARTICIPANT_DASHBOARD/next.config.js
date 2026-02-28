/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure image domains if needed
  images: {
    domains: ["github.com", "avatars.githubusercontent.com"],
  },
};

module.exports = nextConfig;
