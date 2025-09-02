export interface LoginRequest {
  email?: string | null | undefined;
  mdp?: string | null | undefined; // Remarque: pour des raisons de sécurité, assurez-vous de ne pas exposer de mots de passe en clair dans une application client.
}
export interface InscriptionRequest {
  email?: string | null | undefined;
  mdp?: string | null | undefined; // Remarque: pour des raisons de sécurité, assurez-vous de ne pas exposer de mots de passe en clair dans une application client.
  confirmMdp?: string | null | undefined; // Remarque: pour des raisons de sécurité, assurez-vous de ne pas exposer de mots de passe en clair dans une application client.
}
