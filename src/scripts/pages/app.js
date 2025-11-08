import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this._setupDrawer();
  }

  _setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) return;

    this.#drawerButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        this.#navigationDrawer &&
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }
    });

    this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        this.#navigationDrawer.classList.remove('open');
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url] || routes['/'];

    // simple app-shell clear
    this.#content.innerHTML = '';
    const renderedHTML = await page.render();

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.#content.innerHTML = renderedHTML;
      }).finished.then(async () => {
        await page.afterRender();
      });
    } else {
      this.#content.innerHTML = renderedHTML;
      await page.afterRender();
    }
  }
}

// === Push Notification Setup ===
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Izin notifikasi diberikan ✅');
    subscribeUserToPush();
  } else {
    console.log('Notifikasi ditolak ❌');
  }
}

async function subscribeUserToPush() {
  const registration = await navigator.serviceWorker.ready;

  // Ganti dengan PUBLIC VAPID KEY dari API kamu
  const vapidPublicKey = 'YOUR_PUBLIC_VAPID_KEY';
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });

  console.log('Berhasil berlangganan push:', subscription);

  // Kirim `subscription` ke server kamu (endpoint push notification API)
  await fetch('https://pushtodb.dicoding.dev/subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Jalankan izin notifikasi saat halaman dibuka
if ('Notification' in window && 'serviceWorker' in navigator) {
  requestNotificationPermission();
}


if ('Notification' in window && 'serviceWorker' in navigator) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Notifikasi diizinkan!');
      new Notification('Halo!', { body: 'Notifikasi berhasil diaktifkan 🎉' });
    } else {
      console.log('Notifikasi ditolak');
    }
  });
}

export default App;
