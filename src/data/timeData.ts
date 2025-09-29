import { TimeCalculation } from '@/types/sublimation';

export const timeData: TimeCalculation = {
  design: {
    polo: 6,
    poloMangaLarga: 0,
    short: 0,
    faldaShort: 0,
    pantaloneta: 0
  },
  production: {
    polo: {
      impresion: 8.0,
      cortado: 1,
      planchado: 2.5,
      control: 1.0,
      imprevisto: 1.25
    },
    poloMangaLarga: {
      impresion: 10.0,
      cortado: 1,
      planchado: 3.0,
      control: 1.0,
      imprevisto: 1.5
    },
    short: {
      impresion: 6.5,
      cortado: 1,
      planchado: 2.0,
      control: 1.0,
      imprevisto: 1.05
    },
    faldaShort: {
      impresion: 8.0,
      cortado: 1,
      planchado: 2.5,
      control: 1.0,
      imprevisto: 1.25
    },
    pantaloneta: {
      impresion: 7.0,
      cortado: 1,
      planchado: 2.0,
      control: 1.0,
      imprevisto: 1.1
    }
  }
};