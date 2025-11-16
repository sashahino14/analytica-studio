// IndexedDB management for ComptaEdu

const DB_NAME = "ComptaEduDB";
const DB_VERSION = 1;

export interface Account {
  id?: number;
  code: string;
  label: string;
  type: "Actif" | "Passif" | "Charge" | "Produit";
  analyticsEnabled: boolean;
}

export interface Center {
  id?: number;
  code: string;
  name: string;
}

export interface EntryLine {
  accountCode: string;
  debit: number;
  credit: number;
  centerCode?: string;
}

export interface Entry {
  id?: number;
  date: string;
  reference: string;
  label: string;
  lines: EntryLine[];
}

export interface AllocationRule {
  id?: number;
  fromCenter: string;
  toCenter: string;
  type: "percentage" | "coefficient" | "weight";
  value: number;
}

class Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("accounts")) {
          const accountStore = db.createObjectStore("accounts", {
            keyPath: "id",
            autoIncrement: true,
          });
          accountStore.createIndex("code", "code", { unique: true });
        }

        if (!db.objectStoreNames.contains("centers")) {
          const centerStore = db.createObjectStore("centers", {
            keyPath: "id",
            autoIncrement: true,
          });
          centerStore.createIndex("code", "code", { unique: true });
        }

        if (!db.objectStoreNames.contains("entries")) {
          db.createObjectStore("entries", {
            keyPath: "id",
            autoIncrement: true,
          });
        }

        if (!db.objectStoreNames.contains("allocations")) {
          db.createObjectStore("allocations", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };
    });
  }

  async add<T>(storeName: string, item: T): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error("Database not initialized");
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, item: T): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async exportData(): Promise<string> {
    const data = {
      accounts: await this.getAll("accounts"),
      centers: await this.getAll("centers"),
      entries: await this.getAll("entries"),
      allocations: await this.getAll("allocations"),
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    await this.clear("accounts");
    await this.clear("centers");
    await this.clear("entries");
    await this.clear("allocations");

    for (const account of data.accounts || []) {
      await this.add("accounts", account);
    }
    for (const center of data.centers || []) {
      await this.add("centers", center);
    }
    for (const entry of data.entries || []) {
      await this.add("entries", entry);
    }
    for (const allocation of data.allocations || []) {
      await this.add("allocations", allocation);
    }
  }
}

export const db = new Database();
