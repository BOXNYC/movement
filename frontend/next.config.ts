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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      'motion/react': 'motion/react',
      '@floating-ui/react-dom': '@floating-ui/react-dom',
    },
  },
  webpack: (config) => {
    // Alias motion/react to ensure it resolves correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      'motion/react': path.resolve(process.cwd(), 'node_modules/motion/react'),
      '@floating-ui/react-dom': path.resolve(process.cwd(), 'node_modules/@floating-ui/react-dom'),
    }
    return config
  },
}

export default nextConfig
