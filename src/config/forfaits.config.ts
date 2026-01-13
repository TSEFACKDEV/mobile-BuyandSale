/**
 * CONFIGURATION CENTRALISÉE DES FORFAITS - MOBILE
 * Single source of truth pour tous les forfaits du système
 */

export type ForfaitType = 'PREMIUM' | 'TOP_ANNONCE' | 'URGENT';

export interface ForfaitConfig {
  type: ForfaitType;
  priority: number;
  label: string;
  icon: string;
  badge: {
    bgColor: string;
    borderColor: string;
    textColor: string;
  };
  card: {
    borderColor: string;
    borderWidth: number;
  };
}

/**
 * Configuration complète de tous les forfaits
 * Les priorités déterminent l'ordre d'affichage: 1 = plus haute priorité
 */
export const FORFAIT_CONFIG: Record<ForfaitType, ForfaitConfig> = {
  PREMIUM: {
    type: 'PREMIUM',
    priority: 1,
    label: 'premium',
    icon: 'star',
    badge: {
      bgColor: '#A78BFA', // purple-400
      borderColor: '#C4B5FD', // purple-300
      textColor: '#FFFFFF',
    },
    card: {
      borderColor: '#A855F7', // purple-500
      borderWidth: 2,
    },
  },
  TOP_ANNONCE: {
    type: 'TOP_ANNONCE',
    priority: 2,
    label: 'top',
    icon: 'trending-up',
    badge: {
      bgColor: '#60A5FA', // blue-400
      borderColor: '#93C5FD', // blue-300
      textColor: '#FFFFFF',
    },
    card: {
      borderColor: '#3B82F6', // blue-500
      borderWidth: 2,
    },
  },
  URGENT: {
    type: 'URGENT',
    priority: 3,
    label: 'urgent',
    icon: 'flame',
    badge: {
      bgColor: '#F87171', // red-400
      borderColor: '#FCA5A5', // red-300
      textColor: '#FFFFFF',
    },
    card: {
      borderColor: '#EF4444', // red-500
      borderWidth: 2,
    },
  },
};

/**
 * Récupère la configuration d'un forfait spécifique
 */
export const getForfaitConfig = (type: ForfaitType): ForfaitConfig | null => {
  return FORFAIT_CONFIG[type] || null;
};

/**
 * Trie les productForfaits par priorité et retourne les actifs
 * Retourne un tableau trié du plus prioritaire au moins prioritaire
 */
export const getProductForfaitsSorted = (
  productForfaits?: Array<{
    isActive: boolean;
    expiresAt: string | Date;
    forfait: { type: string };
  }>
): Array<{ forfait: { type: string }; isActive: boolean; expiresAt: string | Date }> => {
  if (!productForfaits || !Array.isArray(productForfaits)) {
    return [];
  }

  const now = new Date();

  // Filtrer les forfaits actifs et non expirés
  const active = productForfaits.filter((pf) => {
    const expiryDate = new Date(pf.expiresAt);
    return pf.isActive && expiryDate > now && pf.forfait?.type;
  });

  if (active.length === 0) {
    return [];
  }

  // Trier par priorité (1 = plus haute priorité)
  return active.sort((a, b) => {
    const configA = FORFAIT_CONFIG[a.forfait.type as ForfaitType];
    const configB = FORFAIT_CONFIG[b.forfait.type as ForfaitType];

    const priorityA = configA?.priority ?? 999;
    const priorityB = configB?.priority ?? 999;

    return priorityA - priorityB;
  });
};

/**
 * Récupère le forfait avec la plus haute priorité pour un produit
 */
export const getPrimaryForfait = (
  productForfaits?: Array<{
    isActive: boolean;
    expiresAt: string | Date;
    forfait: { type: string };
  }>
): ForfaitConfig | null => {
  const sorted = getProductForfaitsSorted(productForfaits);
  if (sorted.length === 0) {
    return null;
  }

  const type = sorted[0].forfait.type as ForfaitType;
  return getForfaitConfig(type);
};

/**
 * Trie un tableau de produits par priorité de forfait
 * Les produits avec forfaits prioritaires apparaissent en premier
 */
export const sortProductsByForfaitPriority = <T extends { productForfaits?: any[] }>(
  products: T[]
): T[] => {
  return [...products].sort((a, b) => {
    const forfaitA = getPrimaryForfait(a.productForfaits);
    const forfaitB = getPrimaryForfait(b.productForfaits);

    // Produits sans forfait en dernier
    if (!forfaitA && !forfaitB) return 0;
    if (!forfaitA) return 1;
    if (!forfaitB) return -1;

    // Comparer les priorités
    return forfaitA.priority - forfaitB.priority;
  });
};
