import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: [
      'books.google.com',
      'www.google.com',
      'lh3.googleusercontent.com',  // For Google user profile images
      'i.postimg.cc'
    ],
    unoptimized: true
  }
}

const withPWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

export default withPWAConfig(nextConfig)