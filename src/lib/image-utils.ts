export async function compressImage(file: File, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => resolve(blob!),
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `Image too large (${formatFileSize(file.size)}). Maximum size is 5MB.`
    };
  }

  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload an image file.'
    };
  }

  return { valid: true };
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `Video too large (${formatFileSize(file.size)}). Maximum size is 50MB.`
    };
  }

  if (!file.type.startsWith('video/')) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a video file.'
    };
  }

  return { valid: true };
}
