export type MediaType = 'IMAGE' | 'VIDEO';
export type MediaPosition = 'TOP' | 'CENTER' | 'BOTTOM';

export interface HeroBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  mediaType: MediaType;
  mediaUrl: string;
  position: MediaPosition;
  link: string | null;
  order: number;
  isActive: boolean;
  duration: number;
  createdAt: string;
  updatedAt: string;
}
