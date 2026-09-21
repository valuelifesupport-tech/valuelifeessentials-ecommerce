/**
 * Shared file upload utilities with server upload + base64 fallback.
 */

/** Convert a File object to a base64 data URL. */
export function convertFileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload multiple files to /api/upload with base64 fallback.
 * Returns array of uploaded URLs.
 */
export async function uploadFilesWithFallback(filesList, adminFetch, { imageOnly = false } = {}) {
  const files = Array.from(filesList || []);
  if (files.length === 0) return [];

  const uploadedUrls = [];
  for (const file of files) {
    if (imageOnly && (!file.type || !file.type.startsWith('image/'))) continue;

    let fileUrl = null;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await adminFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        fileUrl = data.imageUrl || data.fullUrl || data.url;
      }
    } catch (netErr) {
      console.warn('Network upload failed, falling back to base64:', netErr.message);
    }

    if (!fileUrl) {
      fileUrl = await convertFileToBase64(file);
    }

    if (fileUrl) {
      uploadedUrls.push(fileUrl);
    }
  }
  return uploadedUrls;
}
