import { getCollection, getItem, createItem, updateItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';
import { logAction, ACTIONS } from './auditService.js';

export function getUsers() {
  return getCollection('users');
}

export function getUser(id) {
  return getItem('users', id);
}

export function createUser(data, currentUserId) {
  const id = generateId('user');
  const user = { ...data, id, active: true, createdAt: new Date().toISOString() };
  createItem('users', user);
  logAction({ action: ACTIONS.USER_CREATED, entity: 'User', entityId: id, description: `User created`, userId: currentUserId });
  return user;
}

export function updateUser(id, data, currentUserId) {
  const updated = updateItem('users', id, data);
  logAction({ action: ACTIONS.USER_UPDATED, entity: 'User', entityId: id, description: `User updated`, userId: currentUserId });
  if (data.role) logAction({ action: ACTIONS.ROLE_CHANGED, entity: 'User', entityId: id, description: `Role changed`, userId: currentUserId });
  return updated;
}

export function deactivateUser(id, currentUserId) {
  const updated = updateItem('users', id, { active: false });
  logAction({ action: ACTIONS.USER_DEACTIVATED, entity: 'User', entityId: id, description: `User deactivated`, userId: currentUserId });
  return updated;
}

export function canDelete(id) {
  return { canDelete: false, reason: 'Users cannot be deleted due to audit requirements. Please deactivate instead.' };
}
