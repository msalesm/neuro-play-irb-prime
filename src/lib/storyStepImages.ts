// Mapeamento de imagens para cada passo das histórias sociais
// As imagens são importadas de src/assets/steps/

import mochila1 from '@/assets/steps/mochila-1-horario.jpg';
import mochila2 from '@/assets/steps/mochila-2-cadernos.jpg';
import mochila3 from '@/assets/steps/mochila-3-estojo.jpg';
import mochila4 from '@/assets/steps/mochila-4-lancheira.jpg';
import mochila5 from '@/assets/steps/mochila-5-fechar.jpg';
import mochila6 from '@/assets/steps/mochila-6-pronta.jpg';

import ajuda1 from '@/assets/steps/ajuda-1-reconhecer.jpg';
import ajuda2 from '@/assets/steps/ajuda-2-encontrar.jpg';
import ajuda3 from '@/assets/steps/ajuda-3-chamar.jpg';
import ajuda4 from '@/assets/steps/ajuda-4-explicar.jpg';
import ajuda5 from '@/assets/steps/ajuda-5-ouvir.jpg';
import ajuda6 from '@/assets/steps/ajuda-6-agradecer.jpg';

import banho1 from '@/assets/steps/banho-1-preparar.jpg';
import banho2 from '@/assets/steps/banho-2-agua.jpg';
import banho3 from '@/assets/steps/banho-3-molhar.jpg';
import banho4 from '@/assets/steps/banho-4-sabonete.jpg';
import banho5 from '@/assets/steps/banho-5-enxaguar.jpg';
import banho6 from '@/assets/steps/banho-6-secar.jpg';

import dentes1 from '@/assets/steps/dentes-1-escova.jpg';
import dentes2 from '@/assets/steps/dentes-2-pasta.jpg';
import dentes3 from '@/assets/steps/dentes-3-frente.jpg';
import dentes4 from '@/assets/steps/dentes-4-tras.jpg';
import dentes5 from '@/assets/steps/dentes-5-enxaguar.jpg';
import dentes6 from '@/assets/steps/dentes-6-guardar.jpg';

import maos1 from '@/assets/steps/maos-1-torneira.jpg';
import maos2 from '@/assets/steps/maos-2-molhar.jpg';
import maos3 from '@/assets/steps/maos-3-sabonete.jpg';
import maos4 from '@/assets/steps/maos-4-esfregar.jpg';
import maos5 from '@/assets/steps/maos-5-enxaguar.jpg';
import maos6 from '@/assets/steps/maos-6-secar.jpg';

// IDs das histórias do banco
const STORY_IDS = {
  MOCHILA: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  PEDIR_AJUDA: 'e5f6a7b8-c9d0-1234-efab-345678901234',
  TOMAR_BANHO: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  ESCOVAR_DENTES: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  LAVAR_MAOS: 'd4e5f6a7-b8c9-0123-defa-234567890123',
};

// Mapeamento: storyId -> array de imagens por ordem
const storyStepImagesMap: Record<string, string[]> = {
  [STORY_IDS.MOCHILA]: [mochila1, mochila2, mochila3, mochila4, mochila5, mochila6],
  [STORY_IDS.PEDIR_AJUDA]: [ajuda1, ajuda2, ajuda3, ajuda4, ajuda5, ajuda6],
  [STORY_IDS.TOMAR_BANHO]: [banho1, banho2, banho3, banho4, banho5, banho6],
  [STORY_IDS.ESCOVAR_DENTES]: [dentes1, dentes2, dentes3, dentes4, dentes5, dentes6],
  [STORY_IDS.LAVAR_MAOS]: [maos1, maos2, maos3, maos4, maos5, maos6],
};

/**
 * Retorna a imagem para um passo específico de uma história
 * @param storyId ID da história
 * @param stepIndex Índice do passo (0-based)
 * @returns URL da imagem ou undefined
 */
export function getStepImage(storyId: string, stepIndex: number): string | undefined {
  const images = storyStepImagesMap[storyId];
  if (images && images[stepIndex]) {
    return images[stepIndex];
  }
  return undefined;
}

/**
 * Verifica se uma história tem imagens de passos
 */
export function hasStepImages(storyId: string): boolean {
  return !!storyStepImagesMap[storyId];
}
