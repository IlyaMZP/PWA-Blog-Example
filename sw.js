var cacheName = 'cache-2.27';
self.addEventListener('install', event => {
    event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(['/', '/index.html', '/index.js', '/blogindex.html', '/contact.html', '/menu.js', '/style.css', '/images/', '/images/coolerhq.jpg', '/images/cooler.jpg', '/images/hqwtf.png', '/images/wtf.jpg', '/blog/about-me.html', '/blog/battlebots.html', '/blog/changed.html', '/blog/dhcp-issues.html', '/blog/dpms-in-xorg.html', '/blog/hello.html', '/blog/linux-on-smartphone.html', '/blog/linux-on-smartphone-progress.html', '/blog/liquid-metal.html', '/blog/mobile-version.html', '/blog/my-new-blog.html', '/blog/port-forwarding.html', '/blog/redmi-note-4-boot-splash.html', '/blog/roadmap.html', '/blog/secrets.html', '/blog/wtf.html'])).then(skip => {
        return self.skipWaiting()
    }))
});
self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
    const title = "New post";
    var options = {
        body: `${event.data.text()}`,
        icon: "images/icons/android-chrome-192x192.png",
        badge: "images/badge.png"
    };
    event.waitUntil(self.registration.showNotification(title, options))
});
self.addEventListener('activate', e => {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(caches.keys().then(keyList => {
        return Promise.all(keyList.map(key => {
            if (key !== cacheName) {
                console.log('[ServiceWorker] Removing old cache', key);
                return caches.delete(key)
            }
        }))
    }))
    return self.clients.claim();
});
self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting()
    }
});

function update(request) {
  return caches.open(cacheName).then(function (cache) {
    return fetch(request, {cache: "no-cache", credentials: "same-origin"}).then(function (response) {
      return cache.put(request, response);
    });
  });
}
function fromServer(request){
  return fetch(request, {cache: "no-cache", credentials: "same-origin"}).then(function(response){ return response});
}
function fromCache(request) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}
self.addEventListener('fetch', function(evt) {
  console.log('[PWA Builder] The service worker is serving the asset.'+ evt.request.url);
  evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
  evt.waitUntil(update(evt.request));
});
