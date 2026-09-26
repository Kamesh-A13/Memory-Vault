/**
 * Supabase Database Service — Resource Management (FR-03, FR-04)
 * Handles all CRUD operations for academic resources.
 * Uses Supabase Storage for files and PostgreSQL for metadata.
 */

import { supabase } from './supabaseClient';

const STORAGE_BUCKET = 'academic-resources';

// ─── Resource Metadata CRUD ─────────────────────────────────────

/**
 * Fetch ALL resources from all users (shared library view).
 * All authenticated users can read these (RLS: SELECT = true).
 * @returns {Promise<{data: object[], error: object|null}>}
 */
export async function fetchAllResources() {
  return supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });
}

/**
 * Fetch only the current user's uploaded resources.
 * @param {string} userId
 */
export async function fetchResources(userId) {
  return supabase
    .from('resources')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

/**
 * Fetch resources filtered by subject.
 */
export async function fetchResourcesBySubject(userId, subject) {
  return supabase
    .from('resources')
    .select('*')
    .eq('subject', subject)
    .order('created_at', { ascending: false });
}


/**
 * Insert a new resource metadata record.
 * @param {object} resource - { user_id, title, subject, topic, description, file_path, file_type, file_size }
 */
export async function createResource(resource) {
  return supabase.from('resources').insert([resource]).select().single();
}

/**
 * Delete a resource record and its associated file from storage.
 */
export async function deleteResource(resourceId, filePath) {
  // Remove file from storage first
  if (filePath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
  }
  return supabase.from('resources').delete().eq('id', resourceId);
}

/**
 * Upload a file to Supabase Storage.
 * @param {File} file
 * @param {string} userId
 * @returns {Promise<{path: string|null, error: object|null}>}
 */
export async function uploadFile(file, userId) {
  const ext = file.name.split('.').pop();
  const uniqueName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(uniqueName, file, { cacheControl: '3600', upsert: false });

  return { path: data?.path || null, error };
}

/**
 * Get a temporary public URL for a stored file.
 * @param {string} filePath
 * @returns {string}
 */
export function getFileUrl(filePath) {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data?.publicUrl || '';
}

/**
 * Fetch all distinct subjects for a user.
 */
export async function fetchSubjects(userId) {
  return supabase
    .from('resources')
    .select('subject')
    .eq('user_id', userId)
    .not('subject', 'is', null);
}

// ─── Revision Items CRUD (FR-07) ────────────────────────────────

export async function fetchRevisionItems(userId) {
  return supabase
    .from('revision_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function createRevisionItem(item) {
  return supabase.from('revision_items').insert([item]).select().single();
}

export async function updateRevisionItem(id, updates) {
  return supabase.from('revision_items').update(updates).eq('id', id).select().single();
}

export async function deleteRevisionItem(id) {
  return supabase.from('revision_items').delete().eq('id', id);
}

// ─── PYQ CRUD (FR-09) ────────────────────────────────────────────

export async function fetchPYQs(userId) {
  return supabase
    .from('pyqs')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false });
}

export async function createPYQ(pyq) {
  return supabase.from('pyqs').insert([pyq]).select().single();
}

export async function updatePYQ(id, updates) {
  return supabase.from('pyqs').update(updates).eq('id', id).select().single();
}

export async function deletePYQ(id) {
  return supabase.from('pyqs').delete().eq('id', id);
}
