// src/scripts/register-sw.js
const PUBLIC_VAPID_KEY = 'MASUKKAN_PUBLIC_VAPID_KEY_DARI_API_KAMU';

export async function registerSW() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('✅ Service Worker registered:', registration);

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ Izin notifikasi belum diberikan');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      console.log('📬 Subscription berhasil:', JSON.stringify(subscription));

      // Kirim subscription ke API kamu
      await fetch('https://YOUR_API_URL/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

    } catch (error) {
      console.error('❌ Gagal register service worker:', error);
    }
  } else {
    console.warn('Push notification tidak didukung browser ini');
  }
}

// helper convert base64 key ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
