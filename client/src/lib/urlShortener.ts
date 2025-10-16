// URL Shortening utility using TinyURL's free API
// No API key required

interface ShortenResponse {
  shortUrl: string;
  success: boolean;
  error?: string;
}

/**
 * Shorten a URL using TinyURL's free API
 * @param longUrl - The URL to shorten
 * @returns Promise<ShortenResponse> - The shortened URL or error
 */
export async function shortenUrl(longUrl: string): Promise<ShortenResponse> {
  try {
    // Validate URL format
    try {
      new URL(longUrl);
    } catch {
      return {
        success: false,
        shortUrl: '',
        error: 'Invalid URL format'
      };
    }

    // TinyURL API endpoint (free, no auth required)
    const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`TinyURL API error: ${response.status}`);
    }
    
    const shortUrl = await response.text();
    
    // Validate response
    if (!shortUrl || !shortUrl.startsWith('http')) {
      throw new Error('Invalid response from TinyURL');
    }
    
    return {
      success: true,
      shortUrl: shortUrl.trim()
    };
  } catch (error) {
    console.error('URL shortening error:', error);
    return {
      success: false,
      shortUrl: '',
      error: error instanceof Error ? error.message : 'Failed to shorten URL'
    };
  }
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise<boolean> - Success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Copy to clipboard error:', error);
    return false;
  }
}
