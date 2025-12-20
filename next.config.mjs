import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    webpack: (config) => {
        // Disable webpack minification completely to avoid the constructor error
        config.optimization = {
            ...config.optimization,
            minimize: false,
        };
        return config;
    }
};

export default withNextIntl(nextConfig);
