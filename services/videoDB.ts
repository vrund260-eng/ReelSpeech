const DB_NAME = 'ReelTalkDB';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

let db: IDBDatabase;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening DB');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const dbInstance = await getDB();
    const transaction = dbInstance.transaction(STORE_NAME, mode);
    return transaction.objectStore(STORE_NAME);
}

export const videoDB = {
  async get(key: number): Promise<File | undefined> {
    const store = await getStore('readonly');
    const request = store.get(key);
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
  },
  async put(key: number, value: File): Promise<IDBValidKey> {
    const store = await getStore('readwrite');
    const request = store.put(value, key);
     return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
  },
};
