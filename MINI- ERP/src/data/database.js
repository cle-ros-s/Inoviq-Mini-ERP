import { clearDatabase, markDatabaseInitialized, isDatabaseInitialized } from './storage.js';
import { seedDatabase } from './seedData.js';
import { resetCounters } from '../utils/idGenerator.js';

export function initializeDatabase() {
  if (!isDatabaseInitialized()) {
    resetCounters();
    seedDatabase();
    markDatabaseInitialized();
  }
}

export function resetDemoData() {
  clearDatabase();
  resetCounters();
  seedDatabase();
  markDatabaseInitialized();
}

export function clearAllData() {
  clearDatabase();
  resetCounters();
}
