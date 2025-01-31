import { openDB } from "idb";

const DB_NAME = "qrScansDB";
const STORE_NAME = "scans";
const DB_VERSION = 1;

export const useScanStorage = () => {
  const initDB = async () => {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });
  };

  const saveScan = async (scanData) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    await store.add({
      result: scanData,
      timestamp: new Date().toISOString(),
      synced: false,
    });
  };

  const getSavedScans = async () => {
    const db = await initDB();
    return db.getAll(STORE_NAME);
  };

  const markAsSynced = async (id) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const scan = await store.get(id);
    scan.synced = true;
    await store.put(scan);
  };

  return { saveScan, getSavedScans, markAsSynced };
};
