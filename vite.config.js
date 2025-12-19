import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';
// const isProd = 'production' === 'production';
// const isProd = 'local' === 'production';

const CDN_DOMAIN = 'https://static.antplant.store/';
// const CDN_DOMAIN = '/';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // 生产环境下，所有静态资源的基础路径指向CDN
    base: isProd ? `${CDN_DOMAIN}/` : '/',
    build: {
        // 打包输出目录（默认dist，可保持）
        outDir: 'dist',
        // 静态资源哈希（避免缓存问题）
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name].[hash].[ext]',
                chunkFileNames: 'assets/[name].[hash].js',
                entryFileNames: 'assets/[name].[hash].js',
            },
        },
        // 压缩配置（可选）
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: isProd, // 生产环境移除console
            },
        },
    },
});