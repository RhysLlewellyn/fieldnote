import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // The stylesheet is 7KB and still costs ~150ms of render-blocking time on
    // throttled mobile, because the cost is the round trip rather than the
    // bytes. Inlining it into the document removes the request from the
    // critical path entirely.
    inlineCss: true,
  },
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
