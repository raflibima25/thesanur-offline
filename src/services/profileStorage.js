import { openDB } from 'idb';

const DB_NAME = 'userDB';
const STORE_NAME = 'profile';
const DB_VERSION = 1;

export class ProfileStorage {
    static async initDB() {
        return openDB(DB_NAME, DB_VERSION, {
          upgrade(db) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('pendingSync', 'pendingSync');
          },
        });
      }

      static async getProfile() {
        const db = await this.initDB();
        const allProfiles = await db.getAll(STORE_NAME);
        return allProfiles[allProfiles.length - 1];
      }

      static async saveProfile(profile) {
        const db = await this.initDB();
        await db.put(STORE_NAME, {
          ...profile,
          timestamp: new Date().toISOString()
        });
      }

      static async saveOfflineUpdate(profile, updates) {
        const db = await this.initDB();
        await db.put(STORE_NAME, {
          ...profile,
          ...updates,
          pendingSync: true,
          offlineUpdates: updates,
          timestamp: new Date().toISOString()
        });

        await db.put(STORE_NAME, updatedProfile);
    
        console.log('Saved offline update:', updatedProfile);
      }

      static async getPendingUpdates() {
        const db = await this.initDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const allProfiles = await store.getAll();
        
        return allProfiles.filter(profile => profile.pendingSync === true);
      }

      static async clearPendingSync(id) {
        const db = await this.initDB();
        const profile = await db.get(STORE_NAME, id);
        if (profile) {
          delete profile.pendingSync;
          delete profile.offlineUpdates;
          await db.put(STORE_NAME, profile);
        }
      }
}
