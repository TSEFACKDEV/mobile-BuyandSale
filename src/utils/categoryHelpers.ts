/**
 * Utilitaires pour la gestion des catégories
 */

/**
 * Génère une icône emoji appropriée pour une catégorie donnée
 * @param categoryName - Le nom de la catégorie
 * @returns L'emoji correspondant à la catégorie
 */
export const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();

  // Mapping catégorie → icône
  const iconMap: Record<string, string> = {
    // Catégories principales (correspondance exacte)
    électronique: "📱",
    maison: "🏠",
    automobile: "🚗",
    immobilier: "🏢",
    mode: "👕",
    enfants: "🧸",
    sport: "⚽",
    animaux: "🐕",
    loisirs: "🎮",
    services: "🔧",
    rencontres: "💕",
    événements: "🎫",
    divers: "📦",

    // Mots-clés alternatifs pour compatibilité
    phone: "📱",
    smartphone: "📱",
    ordinateur: "📱",
    tv: "📱",

    vêtement: "👕",
    fashion: "👕",
    chaussures: "👕",
    bijoux: "👕",

    voiture: "🚗",
    car: "🚗",
    véhicule: "🚗",

    appartement: "🏢",
    terrain: "🏢",
    locaux: "🏢",

    mobilier: "🏠",
    électroménager: "🏠",
    décoration: "🏠",
    jardin: "🏠",

    jouet: "🧸",
    puériculture: "🧸",
    enfant: "🧸",
    bébé: "🧸",

    fitness: "⚽",
    équipement: "⚽",

    chat: "🐕",
    chien: "🐕",
    nourriture: "🐕",

    livre: "🎮",
    musique: "🎮",
    jeux: "🎮",
    divertissement: "🎮",

    emploi: "🔧",
    cours: "🔧",
    réparation: "🔧",
    domicile: "🔧",

    ami: "💕",
    partenaire: "💕",
    social: "💕",

    billet: "🎫",
    concert: "🎫",
    spectacle: "🎫",
    formation: "🎫",

    collection: "📦",
    antiquité: "📦",
    autre: "📦",
  };

  // Trouver l'icône correspondante
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (name.includes(keyword)) return icon;
  }

  return "🛍️"; // Icône par défaut
};

/**
 * Enrichit un tableau de catégories avec leurs icônes
 * @param categories - Le tableau de catégories
 * @returns Le tableau de catégories enrichi avec icônes
 */
export const enrichCategoriesWithIcons = <T extends { name: string }>(
  categories: T[]
): (T & { icon: string })[] => {
  return categories.map((category) => ({
    ...category,
    icon: getCategoryIcon(category.name),
  }));
};
