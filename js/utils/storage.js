import { openDB } from 'idb';

const DB_NAME = 'NumberGameDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameData';

let dbPromise;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function get(key) {
  try {
    const db = await getDB();
    return await db.get(STORE_NAME, key);
  } catch (error) {
    console.error('Error getting value from idb:', error);
    return undefined;
  }
}

export async function set(key, value) {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, value, key);
    return true;
  } catch (error) {
    console.error('Error setting value in idb:', error);
    return false;
  }
}

export async function del(key) {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, key);
    return true;
  } catch (error) {
    console.error('Error deleting value from idb:', error);
    return false;
  }
}

export async function clear() {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
    return true;
  } catch (error) {
    console.error('Error clearing idb:', error);
    return false;
  }
}

export async function keys() {
  try {
    const db = await getDB();
    return await db.getAllKeys(STORE_NAME);
  } catch (error) {
    console.error('Error getting keys from idb:', error);
    return [];
  }
}

export async function getAll() {
  try {
    const db = await getDB();
    const allKeys = await db.getAllKeys(STORE_NAME);
    const result = {};
    for (const key of allKeys) {
      result[key] = await db.get(STORE_NAME, key);
    }
    return result;
  } catch (error) {
    console.error('Error getting all values from idb:', error);
    return {};
  }
}