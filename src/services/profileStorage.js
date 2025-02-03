import { openDB } from 'idb';

const DB_NAME = 'userDB';
const STORE_NAME = 'profile';
const DB_VERSION = 1;

export class ProfileStorage {
    static async initDB() {
        return openDB('userDB', 1, {
          upgrade(db) {
            const store = db.createObjectStore('profile', { keyPath: 'id' });
            store.createIndex('pendingSync', 'pendingSync');
          },
        });
      }

      static async saveProfile(profile) {
        const db = await this.initDB();
        await db.put('profile', {
          ...profile,
          timestamp: new Date().toISOString()
        });
      }

      static async saveOfflineUpdate(profile, updates) {
        const db = await this.initDB();
        await db.put('profile', {
          ...profile,
          ...updates,
          pendingSync: true,
          offlineUpdates: updates,
          timestamp: new Date().toISOString()
        });
      }

      static async getPendingUpdates() {
        const db = await this.initDB();
        const tx = db.transaction('profile');
        const index = tx.store.index('pendingSync');
        return index.getAll(true);
      }

      static async clearPendingSync(id) {
        const db = await this.initDB();
        const profile = await db.get('profile', id);
        if (profile) {
          delete profile.pendingSync;
          delete profile.offlineUpdates;
          await db.put('profile', profile);
        }
      }
}
