/**
 * PAYMENT STORE TYPES
 * Types pour la gestion des paiements dans le mobile app
 */

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

/**
 * Détails d'un paiement
 */
export interface Payment {
  id: string;
  userId: string;
  productId: string;
  forfaitId: string;
  amount: number;
  status: PaymentStatus;
  campayReference: string;
  metadata: any;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  forfait?: {
    id: string;
    type: string;
    price: number;
    duration: number;
  };
  product?: {
    id: string;
    name: string;
  };
}

/**
 * Requête - Initier un paiement
 * NOTE: Cette route existe mais est rarement utilisée directement.
 * La plupart des paiements passent par assignForfaitWithPaymentAction du store forfait.
 */
export interface InitiatePaymentRequest {
  productId: string;
  forfaitId: string;
  phoneNumber: string;
}

/**
 * Réponse backend - Paiement initié
 */
export interface InitiatePaymentResponse {
  paymentId: string;
  amount: number;
  status: PaymentStatus;
  campayReference: string;
  ussdCode?: string;
  instructions: string;
}

/**
 * Réponse backend - Statut paiement
 */
export interface CheckPaymentStatusResponse {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  paidAt: Date | null;
  forfaitActivated: boolean;
  forfait: {
    id: string;
    type: string;
    price: number;
    duration: number;
  };
  product: {
    id: string;
    name: string;
  };
  _fallbackMode?: boolean;
  _lastCheck?: Date;
  _errorReason?: string;
}

/**
 * Élément de l'historique des paiements
 */
export interface PaymentHistoryItem {
  id: string;
  amount: number;
  status: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date;
  forfait: {
    type: string;
    duration: number;
  };
  product: {
    id: string;
    name: string;
  };
}

/**
 * Réponse backend - Historique des paiements
 */
export interface GetUserPaymentsResponse {
  payments: PaymentHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalPayments: number;
  };
}

/**
 * État du store payment
 */
export interface PaymentState {
  // Paiement en cours (initiation)
  currentPayment: InitiatePaymentResponse | null;
  initiateLoading: boolean;
  initiateError: string | null;

  // Vérification statut
  paymentStatus: CheckPaymentStatusResponse | null;
  statusLoading: boolean;
  statusError: string | null;

  // Historique des paiements
  history: PaymentHistoryItem[];
  historyPagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalPayments: number;
  } | null;
  historyLoading: boolean;
  historyError: string | null;
}
