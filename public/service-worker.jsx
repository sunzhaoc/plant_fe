const CACHE_NAME = 'plant-images-cache-v1';
const CACHE_EXPIRE = 7 * 24 * 60 * 60 * 1000; // 7天有效期

// 安装Service Worker
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] 安装完成');
    self.skipWaiting();
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] 激活完成');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[ServiceWorker] 删除旧缓存: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
    // 只缓存图片请求
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    // 检查缓存是否存在且未过期
                    return response ? response.json().then((data) => {
                        if (Date.now() < data.expire) {
                            console.log(`[ServiceWorker] 缓存命中: ${event.request.url}`);
                            return new Response(data.blob, {
                                headers: {'Content-Type': data.type}
                            });
                        } else {
                            console.log(`[ServiceWorker] 缓存过期: ${event.request.url}`);
                            cache.delete(event.request);
                            return fetchAndCache(event.request, cache);
                        }
                    }) : fetchAndCache(event.request, cache);
                });
            })
        );
    }
});

// 发起请求并缓存结果
async function fetchAndCache(request, cache) {
    try {
        console.log(`[ServiceWorker] 发起请求: ${request.url}`);
        const response = await fetch(request);

        if (!response.ok) {
            console.error(`[ServiceWorker] 请求失败: ${request.url}, 状态码: ${response.status}`);
            return response;
        }

        // 克隆响应以缓存
        const responseClone = response.clone();
        const blob = await responseClone.blob();

        // 存储缓存数据（包含过期时间）
        await cache.put(request, new Response(JSON.stringify({
            blob: await blobToBase64(blob),
            type: blob.type,
            expire: Date.now() + CACHE_EXPIRE,
            url: request.url
        })));

        console.log(`[ServiceWorker] 缓存成功: ${request.url}`);
        return response;
    } catch (error) {
        console.error(`[ServiceWorker] 请求错误: ${request.url}`, error);
        throw error;
    }
}

// Blob转Base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}