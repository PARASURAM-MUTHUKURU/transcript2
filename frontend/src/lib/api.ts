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

/**
 * Enhanced fetch that automatically adds the Supabase Authorization header if a session exists.
 */
export const fetchWithAuth = async (path: string, options: RequestInit = {}) => {
  const { getSupabase } = await import('./supabase');
  let supabase;
  try {
     supabase = getSupabase();
  } catch (e) {
     // If supabase is not yet initialized, just do a normal fetch or throw
     console.warn("Supabase not initialized, sending request without auth");
  }

  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const token = session?.access_token;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(getApiUrl(path), {
    ...options,
    headers
  });
};

/**
 * Helper to download files with authentication header.
 */
export const downloadFileWithAuth = async (path: string, filename: string) => {
  try {
    const response = await fetchWithAuth(path);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

