'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from './firebase/client';

export type GoogleDriveBackupFile = {
  id: string;
  name: string;
  createdTime: string;
  size?: string; // in bytes
};

/**
 * Triggers a Google Sign-In popup with the Google Drive scope.
 * Uses login_hint to make sure Google defaults to the current active email.
 */
export async function authorizeGoogleDrive(emailHint?: string): Promise<string | null> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  
  // Minimal access: only read/write files created by this specific application
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  
  if (emailHint) {
    provider.setCustomParameters({ login_hint: emailHint });
  }

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  
  return credential?.accessToken || null;
}

/**
 * Finds or creates the "GM Builder Backups" folder.
 * Returns the folder ID.
 */
export async function findOrCreateBackupFolder(accessToken: string): Promise<string> {
  const folderName = 'GM Builder Backups';
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;
  
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const errorBody = await searchRes.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to search Google Drive folders (${searchRes.status})`);
  }

  const searchData = await searchRes.json();
  const existingFolder = searchData.files?.[0];

  if (existingFolder?.id) {
    return existingFolder.id;
  }

  // Create the folder
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const errorBody = await createRes.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to create backup folder on Google Drive (${createRes.status})`);
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Uploads a new JSON backup file into the backups folder.
 */
export async function uploadBackupFile(
  accessToken: string,
  folderId: string,
  backupPayload: any
): Promise<GoogleDriveBackupFile> {
  const dateStr = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const filename = `gm-builder-backup-${dateStr}.json`;

  // Step 1: Create file metadata
  const metadataUrl = 'https://www.googleapis.com/drive/v3/files';
  const metadataRes = await fetch(metadataUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: filename,
      parents: [folderId],
      mimeType: 'application/json',
    }),
  });

  if (!metadataRes.ok) {
    const errorBody = await metadataRes.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to create backup metadata (${metadataRes.status})`);
  }

  const fileMetadata = await metadataRes.json();
  const fileId = fileMetadata.id;

  // Step 2: Upload content using media patch
  const mediaUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
  const mediaRes = await fetch(mediaUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backupPayload, null, 2),
  });

  if (!mediaRes.ok) {
    const errorBody = await mediaRes.json().catch(() => ({}));
    // Attempt cleanup of metadata-only file if content upload failed
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {});

    throw new Error(errorBody?.error?.message || `Failed to upload backup content (${mediaRes.status})`);
  }

  const uploadedFile = await mediaRes.json();
  return {
    id: fileId,
    name: filename,
    createdTime: new Date().toISOString(),
    size: String(JSON.stringify(backupPayload).length),
  };
}

/**
 * Lists all backup JSON files inside our folder.
 */
export async function listBackupFiles(accessToken: string, folderId: string): Promise<GoogleDriveBackupFile[]> {
  const query = `'${folderId}' in parents and mimeType = 'application/json' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,size)&orderBy=createdTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to list backup files (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Downloads a backup file's raw JSON content.
 */
export async function downloadBackupFile(accessToken: string, fileId: string): Promise<any> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to download backup file (${res.status})`);
  }

  return res.json();
}

/**
 * Deletes a backup file from Google Drive.
 */
export async function deleteBackupFile(accessToken: string, fileId: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to delete backup file (${res.status})`);
  }
}
