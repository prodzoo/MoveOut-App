
/**
 * Converts a base64 data URL to a File object
 */
export const base64ToFile = async (base64String: string, filename: string): Promise<File> => {
  const res = await fetch(base64String);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

/**
 * Downloads a single image from base64
 */
export const downloadBase64Image = (base64: string, filename: string) => {
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
