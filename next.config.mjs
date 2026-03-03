import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: "http://localhost:8000/v1/:path*",
      },
    ]
  },
  // 确保 Next.js 以本项目为根目录，避免多 lockfile 警告
  turbopack: {
    root: __dirname,
  },
  // 通过 ngrok 访问时允许跨域资源
  allowedDevOrigins: ["https://ediportal.ngrok.app"],
}

export default nextConfig
