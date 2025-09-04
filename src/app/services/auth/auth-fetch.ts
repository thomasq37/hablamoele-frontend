export async function authFetch(url: RequestInfo, options: RequestInit = {}): Promise<Response> {
  let token: string | null = null;

  // ✅ Vérification sécurisée de localStorage
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      token = localStorage.getItem('auth_token');
    } catch (e) {
      console.warn('Impossible d\'accéder à localStorage:', e);
    }
  }

  // Ajoute ou modifie les headers dans les options de la requête
  options.headers = new Headers(options.headers || {});
  if (token) {
    (options.headers as Headers).set('Authorization', `Bearer ${token}`);
  }
  (options.headers as Headers).set('Content-Type', 'application/json');

  return await fetch(url, options);
}
