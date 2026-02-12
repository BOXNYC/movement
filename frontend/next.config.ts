import type {NextConfig} from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  serverExternalPackages: ['sanity', '@sanity/visual-editing', '@sanity/ui', 'styled-components'],
  reactStrictMode: false,
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
    SC_DISABLE_SPEEDY: 'false',
  },
  images: {
    remotePatterns: [new URL('https://cdn.sanity.io/**')],
  },
  webpack: (config) => {
    // Alias motion/react to ensure it resolves correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      'motion/react': path.resolve(__dirname, 'node_modules/motion/react'),
      '@floating-ui/react-dom': path.resolve(__dirname, 'node_modules/@floating-ui/react-dom'),
    }
    return config
  },
}

export default nextConfig
