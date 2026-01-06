import Utils from './index';
import API_CONFIG from '../config/api.config';
import API_ENDPOINTS from '../helpers/api';

// Fonction pour fetch avec authentification (alignée sur React web)
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = Utils.getAccessToken();

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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Token refresh on 401
  if (response.status === 401) {
    const refreshToken = Utils.getRefreshToken();
    
    if (!refreshToken) {
      // Pas de refresh token - retourner 401
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
        const { setAccessToken } = require('../store/authentification/slice');
        
        // Sauvegarder le nouveau token dans Redux
        store.dispatch(setAccessToken(data.data.token));

        // Créer de nouveaux headers avec le nouveau token
        const newHeaders: Record<string, string> = {
          ...(options.headers as Record<string, string> || {}),
          'Authorization': `Bearer ${data.data.token.AccessToken}`,
        };

        // Set Content-Type pour la retry
        if (
          options.body &&
          !newHeaders['Content-Type'] &&
          !(options.body instanceof FormData)
        ) {
          newHeaders['Content-Type'] = 'application/json';
        }

        return fetch(url, {
          ...options,
          headers: newHeaders,
        });
      }
    }

    // Si le refresh échoue, déconnecter l'utilisateur
    const { store } = require('../store');
    const { logoutAction } = require('../store/authentification/actions');
    store.dispatch(logoutAction());
  }

  return response;
};

export default fetchWithAuth;
