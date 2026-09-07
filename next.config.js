/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export", // puts the site in /out
  images: { unoptimized: true }, // required for static hosting
};

module.exports = nextConfig;
