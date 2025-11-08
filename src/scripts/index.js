import App from './pages/app';
import '../styles/styles.css';
import { getActiveRoute } from './routes/url-parser';
import { IDB } from './data/idb.js';

// === Helper: debounce untuk smooth event ===
function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

document.addEventListener('DOMContentLoaded', async () => {

  const app = new App({
    navigationDrawer: document.getElementById('navigation-drawer'),
    drawerButton: document.getElementById('drawer-button'),
    content: document.getElementById('main-content'),
  });

  // === NAVIGASI LOGIN / LOGOUT ===
  function updateNav() {
    const navList = document.querySelector('.nav-list');
    if (!navList) return;

    let loginLi = navList.querySelector('.login-li');
    if (!loginLi) {
      loginLi = document.createElement('li');
      loginLi.classList.add('login-li');
      navList.appendChild(loginLi);
    }

    const token = localStorage.getItem('token');
    if (token) {
      loginLi.innerHTML = `<a href="#/logout" id="logout-link">Logout (${localStorage.getItem('name') || ''})</a>`;
      document.getElementById('logout-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        window.dispatchEvent(new CustomEvent('auth:changed', { detail: { loggedIn: false } }));
        window.location.hash = '#/login';
      });
    } else {
      loginLi.innerHTML = `<a href="#/login">Login</a>`;
    }
  }

  // === Render awal ===
  updateNav();
  await app.renderPage();

// 🔹 Tambahkan animasi transisi & reflow map
const main = document.querySelector('main');
if (main) {
  main.classList.remove('show');
  setTimeout(() => {
    main.classList.add('show');
    // 🔸 Jika ada peta, paksa re-render Leaflet (biar gak blank)
    if (window.L && document.querySelector('.leaflet-container')) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
    }
  }, 50);
}


  // === Ganti halaman (hashchange) dengan animasi smooth ===
  window.addEventListener(
    'hashchange',
    debounce(async () => {
      const main = document.getElementById('main-content');
      if (!main) return;
      main.style.transition = 'opacity 0.28s ease';
      main.style.opacity = '0';
      setTimeout(async () => {
        await app.renderPage();
        main.style.opacity = '1';
      }, 300);
    }, 50)
  );

  window.addEventListener('auth:changed', updateNav);

  // === Refresh Home saat story baru ditambah ===
  window.addEventListener('story:added', async () => {
    if (getActiveRoute() === '/') await app.renderPage();
  });

  // === SERVICE WORKER ===
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      if (process.env.NODE_ENV === 'production') {
        try {
          await navigator.serviceWorker.register('/service-worker.js');
          console.log('✅ Service Worker aktif (production)');
        } catch (err) {
          console.error('❌ Gagal daftar SW:', err);
        }
      } else {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
        console.log('🧹 Service Worker (dev) — semua unregister agar dev server stabil');
      }
    });
  }

  // === INSTALL PROMPT (PWA) ===
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installBtn = document.createElement('button');
    installBtn.textContent = '📲 Install Aplikasi';
    installBtn.classList.add('install-button');
    document.body.appendChild(installBtn);

    installBtn.addEventListener('click', async () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('✅ Aplikasi diinstal');
      } else {
        console.log('❌ Instalasi dibatalkan');
      }
    });
  });

  // === NOTIFIKASI ===
  const notifButton = document.querySelector('#notifButton');
  if (notifButton && 'Notification' in window && 'serviceWorker' in navigator) {
    notifButton.addEventListener('click', async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification('🎉 Notifikasi Aktif!', {
          body: 'Kamu sudah mengaktifkan notifikasi!',
          icon: '/images/favicon.png',
          vibrate: [200, 100, 200],
        });
        console.log('🔔 Notifikasi ditampilkan');
      } else {
        alert('❌ Izin notifikasi ditolak.');
      }
    });
  }

  // === INDEXEDDB FORM (CREATE) ===
  // === INDEXEDDB FORM (CREATE) ===
  // === INDEXEDDB FORM (CREATE) ===
const form = document.getElementById('offlineForm');
if (form && !form.dataset.bound) {
  form.dataset.bound = 'true'; // ⛔ cegah double event listener

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('offlineTitle').value.trim();
    const description = document.getElementById('offlineDesc').value.trim();
    if (!title || !description) return alert('Lengkapi judul dan isi cerita.');

    console.log('🟢 Menyimpan laporan ke IndexedDB...');
    await IDB.addReport({
      title,
      description,
      createdAt: new Date(),
    });
    console.log('✅ Laporan disimpan ke IndexedDB');
    form.reset();

    await showOfflineReports();
  });
}

// === Jalankan tampilan offline hanya sekali saat load ===
window.addEventListener('load', showOfflineReports);


// === Tampilkan data offline hanya sekali di awal ===
window.addEventListener('load', showOfflineReports);


  // === Jalankan tampilan offline saat load awal ===
  showOfflineReports();
});

// === INDEXEDDB: READ & DELETE ===
async function showOfflineReports() {
  const list = document.getElementById('reportList');
  if (!list) return;

  const reports = await IDB.getAllReports();
  list.innerHTML = '';

  if (!reports || reports.length === 0) {
    list.innerHTML = '<p>Belum ada cerita offline.</p>';
    return;
  }

  reports.forEach((r) => {
    const item = document.createElement('div');
    item.className = 'report-item';
    item.innerHTML = `
      <h3>${r.title}</h3>
      <p>${r.description}</p>
      <button data-id="${r.id}" class="btn-delete-report">Hapus</button>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll('.btn-delete-report').forEach((btn) =>
    btn.addEventListener('click', async (ev) => {
      const id = Number(ev.target.dataset.id);
      await IDB.deleteReport(id);
      showOfflineReports();
    })
  );
}

// === Saat offline, tampilkan data IndexedDB ===
window.addEventListener('offline', debounce(showOfflineReports, 300));
