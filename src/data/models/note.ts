export interface Note {
  id: string;
  title: string;
  content: string;
  drawingDataUrl?: string; // Base64 data URL string for sketch image
  createdAt: string;
  updatedAt: string;
}
