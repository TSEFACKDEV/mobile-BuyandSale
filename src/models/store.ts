// Types pour le store Redux
export enum LoadingType {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface AsyncState<T> {
  entities: T;
  pagination: any | null;
  status: LoadingType;
  error: {
    meta: {
      status: number;
      message: string;
    };
    error: any;
  } | null;
}

// Types pour les thunks
export interface ThunkApi {
  rejectValue: {
    message: string;
  };
}
