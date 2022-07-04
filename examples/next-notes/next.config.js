/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    relay: {
      src: './src',
      language: 'typescript',
      artifactDirectory: './src/__generated__/relay',
    },
  },
  reactStrictMode: true,
}

module.exports = nextConfig
