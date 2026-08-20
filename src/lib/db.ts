/**
 * قاعدة بيانات سينيفرس — طبقة IndexedDB
 * محرك قاعدة بيانات حقيقي داخل المتصفح: مخازن مهيكلة، فهارس، معاملات،
 * ومفاتيح مركّبة — وليس تخزين مفاتيح/قيم مثل LocalStorage.
 */

export type StoreName = "users" | "favorites" | "watchlist" | "history" | "kv";

export interface DbEvent {
  store: StoreName;
  op: "put" | "delete" | "clear" | "init" | "migrate" | "import";
  label: string;
  at: number;
}

const DB_NAME = "cineverse-db";
const DB_VERSION = 1;
const DATA_STORES: StoreName[] = ["users", "favorites", "watchlist", "history"];

let dbPromise: Promise<IDBDatabase> | null = null;
const listeners = new Set<(e: DbEvent) => void>();

export function onDbEvent(fn: (e: DbEvent) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit(e: DbEvent) {
  listeners.forEach((fn) => fn(e));
}

export function dbName(): string {
  return DB_NAME;
}

export function dbVersion(): number {
  return DB_VERSION;
}

export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("users")) {
        const s = db.createObjectStore("users", { keyPath: "id" });
        s.createIndex("by-email", "email", { unique: true });
      }
      if (!db.objectStoreNames.contains("favorites")) {
        const s = db.createObjectStore("favorites", { keyPath: ["userId", "id"] });
        s.createIndex("by-user", "userId");
      }
      if (!db.objectStoreNames.contains("watchlist")) {
        const s = db.createObjectStore("watchlist", { keyPath: ["userId", "id"] });
        s.createIndex("by-user", "userId");
      }
      if (!db.objectStoreNames.contains("history")) {
        const s = db.createObjectStore("history", {
          keyPath: "entryId",
          autoIncrement: true,
        });
        s.createIndex("by-user", "userId");
      }
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv", { keyPath: "key" });
      }
    };
    req.onsuccess = () => {
      emit({ store: "kv", op: "init", label: "تم فتح قاعدة البيانات", at: Date.now() });
      resolve(req.result);
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("blocked"));
  });
  return dbPromise;
}

function asPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* ------------------------------ العمليات ------------------------------ */

export async function dbPut<T>(store: StoreName, value: T): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  await asPromise(tx.objectStore(store).put(value as unknown as object));
  emit({ store, op: "put", label: "كتابة سجل", at: Date.now() });
}

export async function dbGet<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDb();
  return asPromise(db.transaction(store, "readonly").objectStore(store).get(key)) as Promise<T | undefined>;
}

export async function dbGetByIndex<T>(
  store: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<T | undefined> {
  const db = await openDb();
  const idx = db.transaction(store, "readonly").objectStore(store).index(indexName);
  return asPromise(idx.get(value)) as Promise<T | undefined>;
}

export async function dbGetAllByIndex<T>(
  store: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await openDb();
  const idx = db.transaction(store, "readonly").objectStore(store).index(indexName);
  return asPromise(idx.getAll(value)) as Promise<T[]>;
}

export async function dbGetAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb();
  return asPromise(db.transaction(store, "readonly").objectStore(store).getAll()) as Promise<T[]>;
}

export async function dbDelete(store: StoreName, key: IDBValidKey): Promise<void> {
  const db = await openDb();
  await asPromise(db.transaction(store, "readwrite").objectStore(store).delete(key));
  emit({ store, op: "delete", label: "حذف سجل", at: Date.now() });
}

export async function dbDeleteByIndex(
  store: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<number> {
  const db = await openDb();
  const idx = db.transaction(store, "readonly").objectStore(store).index(indexName);
  const keys = await asPromise(idx.getAllKeys(value));
  const tx = db.transaction(store, "readwrite");
  const os = tx.objectStore(store);
  for (const k of keys) os.delete(k);
  await new Promise<void>((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  emit({ store, op: "clear", label: `حذف ${keys.length} سجلًا`, at: Date.now() });
  return keys.length;
}

export async function dbClear(store: StoreName): Promise<void> {
  const db = await openDb();
  await asPromise(db.transaction(store, "readwrite").objectStore(store).clear());
  emit({ store, op: "clear", label: "تفريغ المخزن", at: Date.now() });
}

export async function dbCount(store: StoreName): Promise<number> {
  const db = await openDb();
  return asPromise(db.transaction(store, "readonly").objectStore(store).count());
}

export interface DbStats {
  store: StoreName;
  count: number;
}

export async function dbStats(): Promise<DbStats[]> {
  return Promise.all(
    DATA_STORES.map(async (store) => ({ store, count: await dbCount(store) }))
  );
}

export interface StorageEstimate {
  usage: number;
  quota: number;
}

export async function dbEstimate(): Promise<StorageEstimate> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      return { usage, quota };
    }
  } catch {
    /* متصفح لا يدعم التقدير */
  }
  return { usage: 0, quota: 0 };
}

/* --------------------------- مفاتيح/قيم (kv) --------------------------- */

export async function dbKvGet<T>(key: string): Promise<T | undefined> {
  const row = await dbGet<{ key: string; value: T }>("kv", key);
  return row?.value;
}

export async function dbKvSet<T>(key: string, value: T): Promise<void> {
  await dbPut("kv", { key, value });
}

/* --------------------- ترحيل بيانات LocalStorage --------------------- */

export async function migrateLegacy(): Promise<void> {
  const done = await dbKvGet<boolean>("legacy-migrated");
  if (done) return;
  try {
    const authRaw = localStorage.getItem("cineverse-auth");
    if (authRaw) {
      const parsed = JSON.parse(authRaw) as {
        state?: { users?: unknown[]; currentUserId?: string | null };
      };
      const users = parsed?.state?.users ?? [];
      for (const u of users) await dbPut("users", u);
      const sid = parsed?.state?.currentUserId;
      if (sid) await dbKvSet("session", sid);
    }
    const libRaw = localStorage.getItem("cineverse-library");
    if (libRaw) {
      const parsed = JSON.parse(libRaw) as {
        state?: { favorites?: unknown[]; watchlist?: unknown[] };
      };
      const owner = (await dbKvGet<string>("session")) ?? "guest";
      for (const f of parsed?.state?.favorites ?? [])
        await dbPut("favorites", { ...(f as object), userId: owner });
      for (const w of parsed?.state?.watchlist ?? [])
        await dbPut("watchlist", { ...(w as object), userId: owner });
    }
    await dbKvSet("legacy-migrated", true);
    emit({ store: "kv", op: "migrate", label: "تم ترحيل بيانات LocalStorage القديمة", at: Date.now() });
  } catch (e) {
    console.warn("CineVerse: فشل ترحيل البيانات القديمة", e);
  }
}

/* ------------------------------ تصدير ------------------------------ */

export async function dbExportAll(): Promise<Record<string, unknown[]>> {
  const out: Record<string, unknown[]> = {};
  for (const s of DATA_STORES) out[s] = await dbGetAll(s);
  return out;
}
