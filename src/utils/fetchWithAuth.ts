import Utils from './index';
import API_CONFIG from '../config/api.config';
import API_ENDPOINTS from '../helpers/api';

// Fonction pour fetch avec authentification (EXACTEMENT comme React)
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = Utils.getAccessToken(); // Synchrone maintenant

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type for JSON requests (except FormData)
  if (
    options.body &&
    !headers['Content-Type'] &&
    !(options.body instanceof FormData)
  ) {
    headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Token refresh on 401 (EXACTEMENT comme React)
  if (response.status === 401) {
    const refreshToken = Utils.getRefreshToken(); // Synchrone maintenant
    
    if (!refreshToken) {
      // Pas de refresh token - retourner 401 (l'appelant gère le logout)
      return response;
    }

    const refreshResponse = await fetch(
      `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_REFRESH_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();

      if (data.data?.token?.AccessToken) {
        // Utiliser l'import dynamique pour éviter le cycle
        const { store } = require('../store');
        const { setAccessToken: setAccessTokenAction } = require('../store/authentification/slice');
        
        // Utiliser Redux pour sauvegarder le nouveau token
        const newToken = {
          AccessToken: data.data.token.AccessToken,
          refreshToken: data.data?.token?.RefreshToken || data.data?.token?.refreshToken || refreshToken,
        };
        
        store.dispatch(setAccessTokenAction(newToken));

        headers['Authorization'] = `Bearer ${data.data.token.AccessToken}`;

        if (
          options.body &&
          !headers['Content-Type'] &&
          !(options.body instanceof FormData)
        ) {
          headers['Content-Type'] = 'application/json';
        }

        return fetch(url, {
          ...options,
          headers,
        });
      }
    }
    
    // Si refresh échoue, retourner la réponse (l'appelant gère le logout)
    return response;
  }

  return response;
};

export default fetchWithAuth;
