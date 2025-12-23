/**
 * FORFAIT STORE TYPES
 * Types pour la gestion des forfaits dans le mobile app
 */

export type ForfaitType = 'URGENT' | 'TOP_ANNONCE' | 'PREMIUM';

/**
 * Forfait disponible à l'achat
 */
export interface Forfait {
  id: string;
  type: ForfaitType;
  price: number;
  duration: number; // en jours
  description: string | null;
}

/**
 * Forfait actif sur un produit
 */
export interface ProductForfait {
  id: string;
  productId: string;
  forfaitId: string;
  isActive: boolean;
  activatedAt: Date;
  expiresAt: Date;
  forfait: Forfait;
}

/**
 * Réponse backend - Liste des forfaits
 */
export interface GetAllForfaitsResponse {
  id: string;
  type: ForfaitType;
  price: number;
  duration: number;
  description: string | null;
}

/**
 * Réponse backend - Forfaits d'un produit
 */
export interface GetProductForfaitsResponse {
  productId: string;
  forfaits: ProductForfait[];
}

/**
 * Requête - Vérifier l'éligibilité
 */
export interface CheckEligibilityRequest {
  productId: string;
  forfaitType: ForfaitType;
}

/**
 * Réponse backend - Éligibilité forfait
 */
export interface CheckEligibilityResponse {
  canAssign: boolean;
  reason?: string;
  conflictingForfaits?: ProductForfait[];
}

/**
 * Requête - Assigner un forfait avec paiement
 */
export interface AssignForfaitRequest {
  productId: string;
  forfaitType: ForfaitType;
  phoneNumber: string;
}

/**
 * Détails du paiement initié
 */
export interface PaymentDetails {
  id: string;
  amount: number;
  status: string;
  campayReference: string;
  metadata: any;
}

/**
 * Réponse backend - Paiement initié
 */
export interface AssignForfaitResponse {
  payment: PaymentDetails;
  instructions: string;
}

/**
 * État du store forfait
 */
export interface ForfaitState {
  // Liste des forfaits disponibles
  forfaits: Forfait[];
  forfaitsLoading: boolean;
  forfaitsError: string | null;

  // Forfaits actifs sur un produit
  productForfaits: ProductForfait[];
  productForfaitsLoading: boolean;
  productForfaitsError: string | null;

  // Éligibilité
  eligibility: CheckEligibilityResponse | null;
  eligibilityLoading: boolean;
  eligibilityError: string | null;

  // Assignation avec paiement
  paymentDetails: AssignForfaitResponse | null;
  assignLoading: boolean;
  assignError: string | null;
}
