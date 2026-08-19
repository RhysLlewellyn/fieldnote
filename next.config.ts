import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  images: {
    // Every image on the site comes from Sanity's asset CDN. The pathname is
    // scoped to /images rather than left open so this cannot be turned into an
    // optimiser for arbitrary files.
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**'},
    ],
  },
}

export default nextConfig
