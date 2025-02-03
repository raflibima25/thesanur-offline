import { openDB } from 'idb';

const DB_NAME = 'userDB';
const STORE_NAME = 'profile';
const DB_VERSION = 1;

export class ProfileStorage {
    static async initDB() {
        return openDB(DB_NAME, DB_VERSION, {
          upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { 
                    keyPath: 'user_id'
                });
                store.createIndex('pendingSync', 'pendingSync');
            }
          },
        });
      }

      static async getProfile() {
        try {
            const db = await this.initDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const profiles = await store.getAll();
            return profiles[0]; // Return profile pertama
        } catch (error) {
            console.error('Error getting profile:', error);
            return null;
        }
    }

    static async saveProfile(profile) {
        try {
            const db = await this.initDB();
            await db.put(STORE_NAME, {
                ...profile,
                timestamp: new Date().toISOString(),
                pendingSync: false
            });
            console.log('Profile saved successfully:', profile);
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    }

    static async saveOfflineUpdate(currentProfile, updates) {
        try {
            const db = await this.initDB();
            const updatedProfile = {
                ...currentProfile,
                ...updates,
                pendingSync: true,
                offlineUpdates: updates,
                timestamp: new Date().toISOString()
            };

            await db.put(STORE_NAME, updatedProfile);
            console.log('Offline update saved:', updatedProfile);
            return updatedProfile;
        } catch (error) {
            console.error('Error saving offline update:', error);
            throw error;
        }
    }

    static async getPendingUpdates() {
        try {
            const db = await this.initDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const profiles = await store.getAll();
            return profiles.filter(profile => profile.pendingSync === true);
        } catch (error) {
            console.error('Error getting pending updates:', error);
            return [];
        }
    }

    static async clearPendingSync(userId) {
        try {
            const db = await this.initDB();
            const profile = await db.get(STORE_NAME, userId);
            if (profile) {
                const updatedProfile = {
                    ...profile,
                    pendingSync: false,
                    offlineUpdates: null
                };
                await db.put(STORE_NAME, updatedProfile);
                console.log('Cleared pending sync for:', userId);
            }
        } catch (error) {
            console.error('Error clearing pending sync:', error);
            throw error;
        }
    }
}
