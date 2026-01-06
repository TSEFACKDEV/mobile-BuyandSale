/**
 * Utilitaires pour la gestion des numéros de téléphone
 * Format Cameroun: +237 6XX XX XX XX (9 chiffres après l'indicatif)
 * Identique à la version web React (client/src/utils/phoneHelpers.ts)
 */

/**
 * Fonction universelle de traitement des numéros de téléphone camerounais
 * @param phone - Le numéro de téléphone à traiter
 * @param action - Le type de traitement : 'validate' | 'normalize' | 'display'
 * @returns string | boolean selon l'action
 */
export const processPhone = (
  phone: string,
  action: 'validate' | 'normalize' | 'display'
): string | boolean => {
  if (!phone) return action === 'validate' ? false : '';

  // Nettoyer et extraire la partie locale (9 chiffres sans préfixe pays)
  const cleaned = phone.replace(/\D/g, '');
  const localNumber = cleaned.startsWith('237') ? cleaned.slice(3) : cleaned;
  const isValid = /^6\d{8}$/.test(localNumber);

  if (action === 'validate') return isValid;
  if (!isValid) return phone;

  switch (action) {
    case 'normalize':
      return `+237${localNumber}`;

    case 'display':
      return `+237 ${localNumber[0]} ${localNumber.slice(1, 3)} ${localNumber.slice(
        3,
        5
      )} ${localNumber.slice(5, 7)} ${localNumber.slice(7, 9)}`;

    default:
      return phone;
  }
};

/**
 * Valider un numéro de téléphone camerounais
 * Format attendu: 6XXXXXXXX (9 chiffres commençant par 6)
 */
export const validateCameroonPhone = (phone: string): boolean => {
  return processPhone(phone, 'validate') as boolean;
};

/**
 * Normaliser un numéro de téléphone vers le format complet (+237XXXXXXXXX)
 */
export const normalizePhoneNumber = (phone: string): string => {
  return processPhone(phone, 'normalize') as string;
};

/**
 * Normalise un numéro de téléphone pour WhatsApp (format wa.me)
 * @param phone - Numéro de téléphone brut
 * @returns Numéro formaté sans + (ex: 237612345678)
 */
export const normalizePhoneForWhatsApp = (phone: string): string => {
  if (!phone) return '';

  // Nettoyer le numéro (garder seulement les chiffres)
  const cleaned = phone.replace(/\D/g, '');

  // Si déjà au format international avec 237
  if (cleaned.startsWith('237') && cleaned.length === 12) {
    return cleaned; // 237XXXXXXXXX
  }

  // Si numéro local camerounais (commence par 6, 9 chiffres)
  if (cleaned.startsWith('6') && cleaned.length === 9) {
    return `237${cleaned}`; // Ajouter l'indicatif
  }

  // Sinon retourner tel quel (autres pays ou formats)
  return cleaned;
};

/**
 * Formate un numéro pour l'affichage (alias de processPhone 'display')
 * @param phone - Numéro de téléphone brut
 * @returns Numéro formaté pour affichage (ex: +237 6 12 34 56 78)
 */
export const formatPhoneForDisplay = (phone: string): string => {
  return processPhone(phone, 'display') as string;
};

