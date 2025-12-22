import Utils from './index';

// Fonction pour fetch avec authentification
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = await Utils.getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

export default fetchWithAuth;
