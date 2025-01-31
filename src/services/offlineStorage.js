import { openDB } from "idb";
import { supabase } from "../../supabaseClient";

const DB_NAME = "offlineDB";
const STORE_NAME = "offlineStore";
const DB_VERSION = 1;

export class OfflineStorage {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        }
      },
    });
  }

  async saveOfflineData(table, data, action = "insert") {
    if (!this.db) await this.initDB();

    const offlineData = {
      table,
      data,
      action,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    await this.db.add(STORE_NAME, offlineData);
  }

  async syncOfflineData() {
    if (!this.db) await this.initDB();

    const tx = this.db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const unsynced = await store.getAll();

    for (const item of unsynced) {
      if (!item.synced) {
        try {
          switch (item.action) {
            case "insert":
              await supabase.from(item.table).insert(item.data);
              break;
            case "update":
              await supabase.from(item.table).update(item.data).eq("id", item.data.id);
              break;
            case "delete":
              await supabase.from(item.table).delete().eq("id", item.data.id);
              break;
          }

          item.synced = true;
          await store.put(item);
        } catch (error) {
          console.error("Sync error:", error);
        }
      }
    }
  }
}
