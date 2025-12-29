import Utils from './index';
import API_CONFIG from '../config/api.config';
import API_ENDPOINTS from '../helpers/api';

// Fonction pour fetch avec authentification (EXACTEMENT comme React)
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await Utils.getAccessToken();

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
    const refreshToken = await Utils.getRefreshToken();
    
    if (!refreshToken) {
      // Pas de refresh token - logout
      await Utils.clearTokens();
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
        await Utils.setAccessToken(data.data.token.AccessToken);
        
        // Sauvegarder le nouveau refresh token si fourni (backend peut renvoyer RefreshToken ou refreshToken)
        const newRefreshToken = data.data?.token?.RefreshToken || data.data?.token?.refreshToken;
        if (newRefreshToken) {
          await Utils.setRefreshToken(newRefreshToken);
        }

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
    } else {
      // Logout si refresh échoue (comme React dispatch(logoutAction()))
      await Utils.clearTokens();
    }
  }

  return response;
};

export default fetchWithAuth;
