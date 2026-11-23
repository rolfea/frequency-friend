export type Transposition = {
  semitones: number;
};

export const TRANSPOSITIONS: Record<string, Transposition> = {
  BbTrumpet: { semitones: -2 },
  CTrumpet: { semitones: 0 },
  EbAltoSax: { semitones: -9 },
};
