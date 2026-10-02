/**
 * Validates a URL to ensure it's a safe relative path for redirection.
 * This prevents Open Redirect vulnerabilities.
 *
 * @param url The URL to validate
 * @param defaultUrl The fallback URL if the provided URL is unsafe
 * @returns A safe relative path
 */
export function getSafeRedirect(url: unknown, defaultUrl: string = '/dashboard'): string {
  if (!url || typeof url !== 'string') {
    return defaultUrl;
  }

  // URL parsers normalize backslashes and strip tabs/newlines before resolving the origin.
  const hasUnsafeCharacter = Array.from(url).some((character: string): boolean => {
    const code = character.charCodeAt(0);
    return character === '\\' || code <= 0x20 || code === 0x7f;
  });
  if (url.startsWith('/') && !url.startsWith('//') && !hasUnsafeCharacter) {
    return url;
  }

  // If it's not a safe relative path, return the default
  return defaultUrl;
}
