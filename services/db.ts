
import { SaleItem } from '../types';

const DB_NAME = 'MoveOutDB';
const STORE_NAME = 'items';
const DRAFT_STORE = 'drafts';
const DB_VERSION = 2; // Increment version for new store

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(DRAFT_STORE)) {
        db.createObjectStore(DRAFT_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveItem = async (item: SaleItem): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllItems = async (): Promise<SaleItem[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as SaleItem[]);
    request.onerror = () => reject(request.error);
  });
};

export const deleteItem = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const updateItemStatus = async (id: string, isSold: boolean): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result as SaleItem;
      if (item) {
        item.isSold = isSold;
        store.put(item);
      }
      resolve();
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

// Draft Management
export const saveDraft = async (item: SaleItem): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(DRAFT_STORE, 'readwrite');
  transaction.objectStore(DRAFT_STORE).put(item);
};

export const getLatestDraft = async (): Promise<SaleItem | null> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(DRAFT_STORE, 'readonly');
    const store = transaction.objectStore(DRAFT_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const drafts = request.result as SaleItem[];
      resolve(drafts.length > 0 ? drafts[drafts.length - 1] : null);
    };
  });
};

export const clearDrafts = async (): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(DRAFT_STORE, 'readwrite');
  transaction.objectStore(DRAFT_STORE).clear();
};
