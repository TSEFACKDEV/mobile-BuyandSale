import Utils from './index';

/**
 * 🔄 SYSTÈME DE REFRESH AUTOMATIQUE DU TOKEN
 * 
 * Ce module gère automatiquement le rafraîchissement du token JWT lorsqu'il expire.
 * Si une requête échoue avec un code 401 (token expiré), le système :
 * 1. Tente de rafraîchir le token via le refresh token
 * 2. Retire automatiquement la requête initiale avec le nouveau token
 * 3. Déconnecte l'utilisateur si le refresh échoue
 */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Fonction pour fetch avec authentification et auto-refresh
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

  // 🔄 GESTION DU TOKEN EXPIRÉ (401)
  if (response.status === 401 && token) {
    // Vérifier si c'est une erreur de token expiré
    let responseData;
    try {
      responseData = await response.clone().json();
    } catch {
      responseData = {};
    }

    const isTokenExpired = 
      responseData?.data?.code === 'TOKEN_EXPIRED' ||
      responseData?.meta?.message?.toLowerCase().includes('token expiré') ||
      responseData?.meta?.message?.toLowerCase().includes('jwt expired');

    // Si le token est expiré, tenter le refresh
    if (isTokenExpired) {
      const originalRequest = { url, options };
      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => fetchWithAuth(url, options));
      }

      isRefreshing = true;

      try {
        // Import dynamique pour éviter les dépendances circulaires
        const { store } = await import('../store');
        const { refreshTokenAction } = await import(
          '../store/authentification/actions'
        );

        // Tenter de rafraîchir le token
        const resultAction = await store.dispatch(refreshTokenAction());

        if (refreshTokenAction.fulfilled.match(resultAction)) {
          // Refresh réussi
          const newToken = resultAction.payload?.data?.token?.AccessToken;
          
          if (newToken) {
            processQueue(null, newToken);
            isRefreshing = false;

            // Réessayer la requête originale avec le nouveau token
            return fetchWithAuth(originalRequest.url, originalRequest.options);
          }
        }

        // Si le refresh échoue ou pas de token, déconnecter l'utilisateur
        const { logoutAction } = await import(
          '../store/authentification/actions'
        );
        await store.dispatch(logoutAction());
        
        processQueue(new Error('REFRESH_FAILED'), null);
        isRefreshing = false;

        return response; // Retourner la réponse 401 originale
      } catch (error) {
        processQueue(error, null);
        isRefreshing = false;
        throw error;
      }
    }
  }

  return response;
};

export default fetchWithAuth;
