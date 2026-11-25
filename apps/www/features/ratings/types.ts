export type Rating = {
  value: number;
  comment: string | null;
  createdAt: string;
};

export const RATING_LABELS = [
  '',
  'Ruim',
  'Regular',
  'Bom',
  'Muito bom',
  'Excelente',
];
