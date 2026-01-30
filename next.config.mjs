/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["@sparticuz/chromium-min"],
    },
};

export default nextConfig;
