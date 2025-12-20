import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import path from 'path';

// 生产环境专属配置（无需考虑开发环境）
export default defineConfig({
    // 1. 配置CDN基础路径（关键：指向你的CDN加速域名，结尾必须带斜杠）
    base: 'https://antplant.store/',

    // 2. 注册React插件
    plugins: [react()],
    // resolve: {
    //     alias: {
    //         '@': path.resolve(__dirname, './src'),
    //     },
    // },


    // 3. 生产环境打包配置
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        minify: 'terser',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                },
                assetFileNames: 'assets/[name].[hash:8].[ext]',
                chunkFileNames: 'assets/[name].[hash:8].js',
                entryFileNames: 'assets/[name].[hash:8].js',
            },
        },
        reportCompressedSize: true,
    },
});