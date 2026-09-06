import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname),
  allowedDevOrigins: ["http://192.168.137.1:3000"],
  transpilePackages: [],
  outputFileTracingExcludes: {
    '*': ['./backend/**/*']
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    // Exclude backend from compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/backend/**', '**/node_modules/**']
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      }
    ]
  }
};

export default nextConfig;
