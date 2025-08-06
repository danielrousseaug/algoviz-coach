import Cookies from 'js-cookie';

const API_KEY_COOKIE = 'openai_api_key';
const API_KEY_VALID_COOKIE = 'openai_api_key_valid';

export function setApiKey(apiKey: string): void {
  // Store encrypted/encoded for basic security (not truly secure, but better than plain text)
  const encoded = btoa(apiKey);
  Cookies.set(API_KEY_COOKIE, encoded, { 
    expires: 30, // 30 days
    secure: true, 
    sameSite: 'strict' 
  });
}

export function getApiKey(): string | null {
  const encoded = Cookies.get(API_KEY_COOKIE);
  if (!encoded) return null;
  
  try {
    return atob(encoded);
  } catch {
    // If decoding fails, remove invalid cookie
    removeApiKey();
    return null;
  }
}

export function removeApiKey(): void {
  Cookies.remove(API_KEY_COOKIE);
  Cookies.remove(API_KEY_VALID_COOKIE);
}

export function setApiKeyValid(valid: boolean): void {
  if (valid) {
    Cookies.set(API_KEY_VALID_COOKIE, 'true', { 
      expires: 1, // 1 day for validation cache
      secure: true, 
      sameSite: 'strict' 
    });
  } else {
    Cookies.remove(API_KEY_VALID_COOKIE);
  }
}

export function getApiKeyValid(): boolean {
  return Cookies.get(API_KEY_VALID_COOKIE) === 'true';
}

export function hasApiKey(): boolean {
  return getApiKey() !== null;
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '••••••••';
  return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`;
}

export function validateApiKeyFormat(apiKey: string): boolean {
  // OpenAI API keys start with 'sk-' and can be various lengths:
  // - Legacy keys: sk-[48 chars] (51 total)
  // - Project keys: sk-proj-[variable length] (much longer)
  // - Other formats may exist, so we're flexible with length
  const openaiRegex = /^sk-[a-zA-Z0-9_-]{20,}$/;
  return openaiRegex.test(apiKey);
}