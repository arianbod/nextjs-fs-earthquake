/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    webpack: (config) => {
        // Disable webpack minification completely to avoid the constructor error
        config.optimization = {
            ...config.optimization,
            minimize: false,
        };
        return config;
    }
};

export default nextConfig;
