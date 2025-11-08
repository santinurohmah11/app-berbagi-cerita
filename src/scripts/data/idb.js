import { openDB } from 'idb';

const DB_NAME = 'berbagi-cerita-db';
const DB_VERSION = 1;
const STORE_NAME = 'reports';

export const IDB = {
  async init() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('title', 'title', { unique: false });
        }
      },
    });
  },

  async addReport(report) {
    const db = await this.init();
    await db.add(STORE_NAME, report);
    console.log('✅ Laporan disimpan ke IndexedDB:', report);
  },

  async getAllReports() {
    const db = await this.init();
    return db.getAll(STORE_NAME);
  },

  async deleteReport(id) {
    const db = await this.init();
    await db.delete(STORE_NAME, id);
    console.log('🗑️ Laporan dihapus dari IndexedDB:', id);
  },
};
