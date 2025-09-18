export function idToBase62(id: number): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  
  while (id > 0) {
    result = chars[id % 62] + result;
    id = Math.floor(id / 62);
  }
  
  return result || '0';
}

export function generateSalt(): number {
  return Math.floor(Math.random() * 100000000); // 0 to 99,999,999
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function extractShortCode(shortUrl: string): string {
  if (!shortUrl.includes('/')) {
    return shortUrl;
  }

  const parts = shortUrl.split('/');
  return parts[parts.length - 1];
}
