/**
 * Utilitaires pour le formatage de prix et dates
 */

/**
 * Formate un prix en FCFA
 * @param price - Prix à formater
 * @returns Prix formaté (ex: "500 000 FCFA")
 */
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('fr-FR')} FCFA`;
};

/**
 * Formate une date en format court et relatif pour les cartes
 * @param dateString - Date au format ISO string
 * @returns Date formatée courte (ex: "5min", "2h", "3j", "14/01")
 */
export const formatRelativeShort = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 30) return `${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};
