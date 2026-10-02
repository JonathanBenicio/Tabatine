/**
 * Validates a URL to ensure it's a safe relative path for redirection.
 * This prevents Open Redirect vulnerabilities.
 *
 * @param url The URL to validate
 * @param defaultUrl The fallback URL if the provided URL is unsafe
 * @returns A safe relative path
 */
export function getSafeRedirect(url: string | null | undefined, defaultUrl: string = '/dashboard'): string {
  if (!url || typeof url !== 'string') {
    return defaultUrl;
  }

  // Ensure it starts with / but not // or /\ (which could be used for protocol-relative redirects)
  if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
    return url;
  }

  // If it's not a safe relative path, return the default
  return defaultUrl;
}
