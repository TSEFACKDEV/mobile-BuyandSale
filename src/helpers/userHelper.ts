/**
 * Utilitaires pour l'affichage et la gestion des noms d'utilisateurs
 * Centralise la logique de renommage (prénom + nom -> nom seul)
 */

/**
 * Obtient le nom à afficher pour un utilisateur
 * - Si prénom existe: retourne "Prénom Nom"
 * - Sinon: retourne uniquement le "Nom/Nom de commerce"
 * 
 * @param firstName - Prénom (optionnel)
 * @param lastName - Nom ou nom de commerce (obligatoire)
 * @returns Nom complet à afficher
 */
export const getDisplayName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string => {
  if (!lastName) return "Utilisateur";
  
  // ✅ Si prénom existe et n'est pas vide, afficher "Prénom Nom"
  if (firstName && firstName.trim()) {
    return `${firstName.trim()} ${lastName.trim()}`;
  }
  
  // ✅ Sinon, afficher uniquement le nom/nom de commerce
  return lastName.trim();
};
