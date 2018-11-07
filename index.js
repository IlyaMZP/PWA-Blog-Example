const applicationServerPublicKey = 'BNBgYM0n-NAuwjJoVCWnoxgHXpa-Fw2wZEPHOzYft6bd7RgiR6DuVUDqr1HWxBDcjynDXjympT3zYzEr8XEL7Dc';
const pushButton = document.querySelector('.js-push-btn');
var sub;
let isSubscribed = !1;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

function updateSubscriptionOnServer(subscription) {
    sub = JSON.stringify(subscription)
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: !0,
        applicationServerKey: applicationServerKey
    }).then(function(subscription) {
        console.log('User is subscribed');
        updateSubscriptionOnServer(subscription);
        isSubscribed = !0
    }).catch(function(err) {
        console.log('Failed to subscribe the user: ', err)
    })
}

function notificationCheck(result) {
    if (result === 'denied') {
        return
    }
    if (result === 'default') {
        return
    }
    var websocket = new WebSocket("wss://mzp.dedyn.io/ws");
    websocket.onmessage = function(event) {
        websocket.send(sub);
        websocket.close()
    };
    subscribeUser();
    swRegistration.pushManager.getSubscription().then(function(subscription) {
        isSubscribed = !(subscription === null);
        updateSubscriptionOnServer(subscription);
        if (isSubscribed) {
            console.log('User IS subscribed.')
        } else {
            console.log('User is NOT subscribed.')
        }
    })
}

function initializeUI() {
    const notify = document.querySelector('#notify-buttn');
    notify.addEventListener('click', (e) => {
        Notification.requestPermission().then(result => {
            notificationCheck(result)
        })
    });
    if (Notification.permission === "granted") {
        notificationCheck('granted')
    }
}
let newWorker;
if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        swRegistration = reg;
        initializeUI();
        reg.update()
    });
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', function() {
        if (refreshing) return;
        window.location.reload();
        refreshing = !0
    })
}
let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    addBtn.style.display = 'block';
    addBtn.addEventListener('click', (e) => {
        addBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the prompt')
            } else {
                console.log('User dismissed the prompt')
            }
            deferredPrompt = null
        })
    })
})
