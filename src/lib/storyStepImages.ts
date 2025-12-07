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

// Imagens para "Quando as coisas não dão certo"
import frustracao1 from '@/assets/steps/frustracao-1-algo-errado.jpg';
import frustracao2 from '@/assets/steps/frustracao-2-sinto.jpg';
import frustracao3 from '@/assets/steps/frustracao-3-tudo-bem.jpg';
import frustracao4 from '@/assets/steps/frustracao-4-respiro.jpg';
import frustracao5 from '@/assets/steps/frustracao-5-solucoes.jpg';
import frustracao6 from '@/assets/steps/frustracao-6-tentar.jpg';

// Imagens para "Quando alguém está triste"
import triste1 from '@/assets/steps/triste-1-observar-rosto.jpg';
import triste2 from '@/assets/steps/triste-2-observar-corpo.jpg';
import triste3 from '@/assets/steps/triste-3-ouvir-voz.jpg';
import triste4 from '@/assets/steps/triste-4-perguntar.jpg';
import triste5 from '@/assets/steps/triste-5-oferecer-ajuda.jpg';
import triste6 from '@/assets/steps/triste-6-respeitar.jpg';

// Imagens para "Preparar para dormir"
import dormir1 from '@/assets/steps/dormir-1-banho.jpg';
import dormir2 from '@/assets/steps/dormir-2-pijama.jpg';
import dormir3 from '@/assets/steps/dormir-3-dentes.jpg';
import dormir4 from '@/assets/steps/dormir-4-historia.jpg';
import dormir5 from '@/assets/steps/dormir-5-luz.jpg';
import dormir6 from '@/assets/steps/dormir-6-sonhos.jpg';

// Imagens para "Trabalho em grupo"
import grupo1 from '@/assets/steps/grupo-1-trabalho.jpg';
import grupo2 from '@/assets/steps/grupo-2-ouvir.jpg';
import grupo3 from '@/assets/steps/grupo-3-opiniao.jpg';
import grupo4 from '@/assets/steps/grupo-4-dividir.jpg';
import grupo5 from '@/assets/steps/grupo-5-fazer.jpg';
import grupo6 from '@/assets/steps/grupo-6-apresentar.jpg';

// Imagens para "Como lidar com barulho alto"
import barulho1 from '@/assets/steps/barulho-1-perceber.jpg';
import barulho2 from '@/assets/steps/barulho-2-respirar.jpg';
import barulho3 from '@/assets/steps/barulho-3-proteger.jpg';
import barulho4 from '@/assets/steps/barulho-4-afastar.jpg';
import barulho5 from '@/assets/steps/barulho-5-pedir-ajuda.jpg';
import barulho6 from '@/assets/steps/barulho-6-calmo.jpg';

// Imagens para "Entrar na sala de aula"
import sala1 from '@/assets/steps/sala-1-chegar.jpg';
import sala2 from '@/assets/steps/sala-2-respirar.jpg';
import sala3 from '@/assets/steps/sala-3-cumprimentar.jpg';
import sala4 from '@/assets/steps/sala-4-lugar.jpg';
import sala5 from '@/assets/steps/sala-5-material.jpg';
import sala6 from '@/assets/steps/sala-6-pronto.jpg';

// Imagens para "O que fazer quando as coisas mudam de repente"
import mudanca1 from '@/assets/steps/mudanca-1-surpresa.jpg';
import mudanca2 from '@/assets/steps/mudanca-2-parar.jpg';
import mudanca3 from '@/assets/steps/mudanca-3-respirar.jpg';
import mudanca4 from '@/assets/steps/mudanca-4-pensar.jpg';
import mudanca5 from '@/assets/steps/mudanca-5-conversar.jpg';
import mudanca6 from '@/assets/steps/mudanca-6-adaptar.jpg';

// IDs das histórias do banco
const STORY_IDS = {
  MOCHILA: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  PEDIR_AJUDA: 'e5f6a7b8-c9d0-1234-efab-345678901234',
  TOMAR_BANHO: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  ESCOVAR_DENTES: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  LAVAR_MAOS: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  FRUSTRACAO: 'dfb1ff4a-e349-4abc-9610-f59dc9aad5f8',
  ALGUEM_TRISTE: '41c95a59-f149-4036-b258-1424d3d1428f',
  PREPARAR_DORMIR: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  TRABALHO_GRUPO: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
  BARULHO_ALTO: '4e0a5814-d757-4fbf-b9ae-b6af3c131dcf',
  ENTRAR_SALA: 'c41b4f93-5c57-4132-aa24-3d9a0f2d4aae',
  MUDANCAS: '6d97a90d-7071-4cbb-91df-4c742306b47e',
};

// Mapeamento: storyId -> array de imagens por ordem
const storyStepImagesMap: Record<string, string[]> = {
  [STORY_IDS.MOCHILA]: [mochila1, mochila2, mochila3, mochila4, mochila5, mochila6],
  [STORY_IDS.PEDIR_AJUDA]: [ajuda1, ajuda2, ajuda3, ajuda4, ajuda5, ajuda6],
  [STORY_IDS.TOMAR_BANHO]: [banho1, banho2, banho3, banho4, banho5, banho6],
  [STORY_IDS.ESCOVAR_DENTES]: [dentes1, dentes2, dentes3, dentes4, dentes5, dentes6],
  [STORY_IDS.LAVAR_MAOS]: [maos1, maos2, maos3, maos4, maos5, maos6],
  [STORY_IDS.FRUSTRACAO]: [frustracao1, frustracao2, frustracao3, frustracao4, frustracao5, frustracao6],
  [STORY_IDS.ALGUEM_TRISTE]: [triste1, triste2, triste3, triste4, triste5, triste6],
  [STORY_IDS.PREPARAR_DORMIR]: [dormir1, dormir2, dormir3, dormir4, dormir5, dormir6],
  [STORY_IDS.TRABALHO_GRUPO]: [grupo1, grupo2, grupo3, grupo4, grupo5, grupo6],
  [STORY_IDS.BARULHO_ALTO]: [barulho1, barulho2, barulho3, barulho4, barulho5, barulho6],
  [STORY_IDS.ENTRAR_SALA]: [sala1, sala2, sala3, sala4, sala5, sala6],
  [STORY_IDS.MUDANCAS]: [mudanca1, mudanca2, mudanca3, mudanca4, mudanca5, mudanca6],
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
