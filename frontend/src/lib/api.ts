const defaultUrl = 'http://localhost:3000';
export const API_URL = import.meta.env.VITE_API_URL || defaultUrl;

if (typeof window !== 'undefined') {
  if (API_URL === defaultUrl && !window.location.hostname.includes('localhost')) {
    console.warn("WARNING: VITE_API_URL is missing. API calls will likely fail in production. Using fallback: http://localhost:3000");
  }
  console.log(`API Base URL: ${API_URL}`);
}

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Ensure no double slashes if API_URL ends with one
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  return `${baseUrl}${cleanPath}`;
};

