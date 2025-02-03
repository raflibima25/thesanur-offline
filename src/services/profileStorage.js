import { openDB } from 'idb';

const DB_NAME = 'userDB';
const STORE_NAME = 'profile';
const DB_VERSION = 1;

export class ProfileStorage {
  static async initDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
  }

  static async saveProfile(profileData) {
    const db = await this.initDB();
    await db.put(STORE_NAME, profileData, 'currentUser');
  }

  static async getProfile() {
    const db = await this.initDB();
    return db.get(STORE_NAME, 'currentUser');
  }
}
