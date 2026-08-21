const NAMESPACE = 'sfw';
const KEY = (name) => `${NAMESPACE}:${name}`;

export function getCollection(name) {
  const data = localStorage.getItem(KEY(name));
  return data ? JSON.parse(data) : [];
}

export function setCollection(name, data) {
  localStorage.setItem(KEY(name), JSON.stringify(data));
}

export function getItem(collection, id) {
  const items = getCollection(collection);
  return items.find(item => item.id === id) || null;
}

export function createItem(collection, item) {
  const items = getCollection(collection);
  items.push(item);
  setCollection(collection, items);
  return item;
}

export function updateItem(collection, id, updates) {
  const items = getCollection(collection);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...updates };
  setCollection(collection, items);
  return items[index];
}

export function deleteItem(collection, id) {
  const items = getCollection(collection);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  setCollection(collection, filtered);
  return true;
}

export function clearDatabase() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(`${NAMESPACE}:`)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

export function resetDatabase() {
  clearDatabase();
}

export function exportDatabase() {
  const snapshot = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(`${NAMESPACE}:`)) {
      snapshot[key] = JSON.parse(localStorage.getItem(key));
    }
  }
  return snapshot;
}

export function isDatabaseInitialized() {
  return localStorage.getItem(KEY('initialized')) === 'true';
}

export function markDatabaseInitialized() {
  localStorage.setItem(KEY('initialized'), 'true');
}
