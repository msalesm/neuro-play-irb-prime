// Expanded library of social stories (20 stories with placeholders)

export interface StoryTemplate {
  id: string;
  title: string;
  description: string;
  category: 'rotinas' | 'sensorial' | 'emocoes' | 'social';
  ageMin: number;
  ageMax: number;
  coverImage?: string;
  steps: {
    title: string;
    description: string;
    imageKey?: string;
  }[];
}

export const expandedStories: StoryTemplate[] = [
  // ============ ROTINAS (5) ============
  {
    id: 'story-brushing-teeth',
    title: 'Escovando os Dentes',
    description: 'Aprenda a escovar os dentes de forma divertida',
    category: 'rotinas',
    ageMin: 3,
    ageMax: 10,
    steps: [
      { title: 'Pegue a escova', description: 'Primeiro, pegue sua escova de dentes.' },
      { title: 'Coloque pasta', description: 'Coloque um pouquinho de pasta na escova.' },
      { title: 'Escove os de cima', description: 'Escove os dentes de cima com movimentos suaves.' },
      { title: 'Escove os de baixo', description: 'Agora escove os dentes de baixo.' },
      { title: 'Enxágue', description: 'Enxágue a boca com água.' },
      { title: 'Pronto!', description: 'Parabéns! Seus dentes estão limpos!' },
    ],
  },
  {
    id: 'story-packing-backpack',
    title: 'Arrumando a Mochila',
    description: 'Preparando a mochila para a escola',
    category: 'rotinas',
    ageMin: 5,
    ageMax: 12,
    steps: [
      { title: 'Olhe o horário', description: 'Veja quais aulas você tem amanhã.' },
      { title: 'Separe os materiais', description: 'Pegue os cadernos e livros dessas aulas.' },
      { title: 'Coloque na mochila', description: 'Coloque tudo dentro da mochila com cuidado.' },
      { title: 'Não esqueça o estojo', description: 'Verifique se o estojo está completo.' },
      { title: 'Lanche', description: 'Peça ajuda para preparar o lanche.' },
      { title: 'Mochila pronta!', description: 'Sua mochila está pronta para amanhã!' },
    ],
  },
  {
    id: 'story-getting-ready-sleep',
    title: 'Preparando para Dormir',
    description: 'Rotina de hora de dormir',
    category: 'rotinas',
    ageMin: 3,
    ageMax: 10,
    steps: [
      { title: 'Hora do banho', description: 'Tome um banho quentinho e relaxante.' },
      { title: 'Vista o pijama', description: 'Coloque seu pijama favorito.' },
      { title: 'Escove os dentes', description: 'Escove os dentes antes de dormir.' },
      { title: 'Leia uma história', description: 'Leia um livro ou peça para alguém ler.' },
      { title: 'Apague a luz', description: 'Está na hora de apagar a luz.' },
      { title: 'Bons sonhos!', description: 'Feche os olhos e tenha bons sonhos!' },
    ],
  },
  {
    id: 'story-entering-classroom',
    title: 'Entrando na Sala de Aula',
    description: 'Como se comportar ao chegar na escola',
    category: 'rotinas',
    ageMin: 5,
    ageMax: 12,
    steps: [
      { title: 'Chegue na escola', description: 'Chegue calmo e preparado para o dia.' },
      { title: 'Cumprimente', description: 'Diga "bom dia" para o professor e colegas.' },
      { title: 'Guarde a mochila', description: 'Coloque sua mochila no lugar certo.' },
      { title: 'Sente-se', description: 'Sente-se no seu lugar com calma.' },
      { title: 'Prepare os materiais', description: 'Tire o que precisa para a aula.' },
      { title: 'Preste atenção', description: 'Ouça o que o professor vai explicar.' },
    ],
  },
  {
    id: 'story-washing-hands',
    title: 'Lavando as Mãos',
    description: 'A forma correta de lavar as mãos',
    category: 'rotinas',
    ageMin: 3,
    ageMax: 8,
    steps: [
      { title: 'Abra a torneira', description: 'Abra a torneira com água.' },
      { title: 'Molhe as mãos', description: 'Coloque as mãos debaixo da água.' },
      { title: 'Use sabonete', description: 'Pegue um pouco de sabonete.' },
      { title: 'Esfregue bem', description: 'Esfregue as mãos, entre os dedos e as unhas.' },
      { title: 'Enxágue', description: 'Enxágue todo o sabonete.' },
      { title: 'Seque', description: 'Seque as mãos com uma toalha limpa.' },
    ],
  },

  // ============ SENSORIAL (5) ============
  {
    id: 'story-loud-noise',
    title: 'Como Lidar com Barulho Alto',
    description: 'O que fazer quando o barulho incomoda',
    category: 'sensorial',
    ageMin: 4,
    ageMax: 14,
    steps: [
      { title: 'Barulho forte', description: 'Às vezes os barulhos são muito fortes e isso pode me incomodar.' },
      { title: 'Está tudo bem', description: 'Está tudo bem sentir desconforto com barulho alto.' },
      { title: 'Posso tapar os ouvidos', description: 'Posso colocar as mãos nos ouvidos ou usar protetor.' },
      { title: 'Respiro fundo', description: 'Respiro fundo e conto até 5.' },
      { title: 'Peço ajuda', description: 'Posso pedir para ir a um lugar mais silencioso.' },
      { title: 'Vou me sentir melhor', description: 'O barulho vai passar e vou me sentir melhor.' },
    ],
  },
  {
    id: 'story-bright-lights',
    title: 'Quando as Luzes Incomodam',
    description: 'Lidando com sensibilidade à luz',
    category: 'sensorial',
    ageMin: 4,
    ageMax: 14,
    steps: [
      { title: 'Luzes fortes', description: 'Algumas luzes podem parecer muito fortes para mim.' },
      { title: 'Isso é normal', description: 'Está tudo bem sentir desconforto com luzes.' },
      { title: 'Posso fechar os olhos', description: 'Posso fechar os olhos por um momento.' },
      { title: 'Usar óculos escuros', description: 'Usar óculos escuros pode ajudar.' },
      { title: 'Ir para sombra', description: 'Posso ir para um lugar com menos luz.' },
      { title: 'Vou me adaptar', description: 'Com o tempo, meus olhos vão se acostumar.' },
    ],
  },
  {
    id: 'story-new-textures',
    title: 'Experimentando Texturas Novas',
    description: 'Como lidar com texturas desconfortáveis',
    category: 'sensorial',
    ageMin: 3,
    ageMax: 10,
    steps: [
      { title: 'Textura nova', description: 'Às vezes toco em algo com textura estranha.' },
      { title: 'Sensação diferente', description: 'A sensação pode parecer diferente ou incômoda.' },
      { title: 'Posso parar', description: 'Posso parar de tocar se não gostar.' },
      { title: 'Lavar as mãos', description: 'Lavar as mãos pode ajudar a tirar a sensação.' },
      { title: 'Tentar aos poucos', description: 'Posso tentar tocar aos pouquinhos.' },
      { title: 'Cada um é diferente', description: 'Tudo bem não gostar de algumas texturas.' },
    ],
  },
  {
    id: 'story-crowded-places',
    title: 'Lugares com Muita Gente',
    description: 'Como se sentir melhor em lugares cheios',
    category: 'sensorial',
    ageMin: 5,
    ageMax: 14,
    steps: [
      { title: 'Muita gente', description: 'Lugares cheios podem me deixar nervoso.' },
      { title: 'É normal', description: 'Muitas pessoas sentem isso também.' },
      { title: 'Encontrar um cantinho', description: 'Posso procurar um lugar mais tranquilo.' },
      { title: 'Ficar perto de alguém', description: 'Fico perto de alguém que confio.' },
      { title: 'Respirar fundo', description: 'Respiro fundo para me acalmar.' },
      { title: 'Posso sair', description: 'Se precisar, posso pedir para sair um pouco.' },
    ],
  },
  {
    id: 'story-new-smells',
    title: 'Cheiros Diferentes',
    description: 'Lidando com cheiros fortes ou estranhos',
    category: 'sensorial',
    ageMin: 3,
    ageMax: 10,
    steps: [
      { title: 'Cheiro forte', description: 'Às vezes sinto um cheiro muito forte.' },
      { title: 'Pode incomodar', description: 'O cheiro pode me incomodar ou dar enjoo.' },
      { title: 'Tapar o nariz', description: 'Posso tapar o nariz com a mão.' },
      { title: 'Respirar pela boca', description: 'Posso respirar pela boca por um momento.' },
      { title: 'Sair do lugar', description: 'Posso pedir para ir a outro lugar.' },
      { title: 'Vai passar', description: 'O cheiro vai passar e vou me sentir melhor.' },
    ],
  },

  // ============ EMOÇÕES (5) ============
  {
    id: 'story-feeling-frustrated',
    title: 'Quando as Coisas Não Dão Certo',
    description: 'O que fazer quando as coisas não saem como esperado',
    category: 'emocoes',
    ageMin: 4,
    ageMax: 12,
    steps: [
      { title: 'Algo deu errado', description: 'Às vezes as coisas não saem como eu queria.' },
      { title: 'Sinto frustração', description: 'Posso sentir raiva ou vontade de chorar.' },
      { title: 'Está tudo bem', description: 'Sentir frustração é normal.' },
      { title: 'Respiro fundo', description: 'Respiro fundo e conto até 10.' },
      { title: 'Penso em soluções', description: 'Penso no que posso fazer diferente.' },
      { title: 'Posso tentar de novo', description: 'Posso tentar de novo ou pedir ajuda.' },
    ],
  },
  {
    id: 'story-feeling-sad',
    title: 'Quando Estou Triste',
    description: 'Entendendo e expressando a tristeza',
    category: 'emocoes',
    ageMin: 4,
    ageMax: 12,
    steps: [
      { title: 'Estou triste', description: 'Às vezes me sinto triste.' },
      { title: 'Está tudo bem chorar', description: 'Chorar ajuda a colocar a tristeza para fora.' },
      { title: 'Posso falar', description: 'Posso contar para alguém como me sinto.' },
      { title: 'Um abraço ajuda', description: 'Um abraço de alguém querido pode ajudar.' },
      { title: 'Fazer algo que gosto', description: 'Posso fazer algo que me deixa feliz.' },
      { title: 'A tristeza vai passar', description: 'A tristeza não dura para sempre.' },
    ],
  },
  {
    id: 'story-feeling-angry',
    title: 'Quando Sinto Raiva',
    description: 'Como lidar com a raiva de forma saudável',
    category: 'emocoes',
    ageMin: 4,
    ageMax: 12,
    steps: [
      { title: 'Sinto raiva', description: 'Às vezes sinto muita raiva por dentro.' },
      { title: 'É uma emoção normal', description: 'Sentir raiva é normal, todos sentem.' },
      { title: 'Não devo machucar', description: 'Mas não posso machucar ninguém ou quebrar coisas.' },
      { title: 'Respiro fundo', description: 'Respiro fundo várias vezes.' },
      { title: 'Posso me afastar', description: 'Posso ir para um lugar calmo.' },
      { title: 'Depois converso', description: 'Quando me acalmar, posso conversar sobre o que aconteceu.' },
    ],
  },
  {
    id: 'story-understanding-others-sad',
    title: 'Quando Alguém Está Triste',
    description: 'Como identificar e ajudar quando outros estão tristes',
    category: 'emocoes',
    ageMin: 5,
    ageMax: 14,
    steps: [
      { title: 'Pessoa triste', description: 'Às vezes as pessoas ao meu redor ficam tristes.' },
      { title: 'Como identificar', description: 'Posso perceber pelo rosto ou comportamento.' },
      { title: 'Perguntar', description: 'Posso perguntar: "Você está bem?"' },
      { title: 'Ouvir', description: 'Posso ouvir o que a pessoa quer contar.' },
      { title: 'Oferecer ajuda', description: 'Posso oferecer um abraço ou companhia.' },
      { title: 'Ser gentil', description: 'Ser gentil ajuda as pessoas a se sentirem melhor.' },
    ],
  },
  {
    id: 'story-feeling-anxious',
    title: 'Quando Sinto Ansiedade',
    description: 'Reconhecendo e lidando com a ansiedade',
    category: 'emocoes',
    ageMin: 6,
    ageMax: 14,
    steps: [
      { title: 'Coração acelerado', description: 'Às vezes meu coração bate muito rápido.' },
      { title: 'Preocupação', description: 'Fico preocupado com coisas que podem acontecer.' },
      { title: 'É ansiedade', description: 'Isso se chama ansiedade.' },
      { title: 'Respiro devagar', description: 'Respiro bem devagar para me acalmar.' },
      { title: 'Penso no agora', description: 'Penso no que está acontecendo agora, não no futuro.' },
      { title: 'Peço ajuda', description: 'Posso falar com alguém de confiança.' },
    ],
  },

  // ============ SOCIAL (5) ============
  {
    id: 'story-making-friends',
    title: 'Fazendo Amizades',
    description: 'Como conhecer e fazer novos amigos',
    category: 'social',
    ageMin: 4,
    ageMax: 12,
    steps: [
      { title: 'Quero um amigo', description: 'Às vezes quero brincar com alguém.' },
      { title: 'Olhar e sorrir', description: 'Posso olhar para a pessoa e sorrir.' },
      { title: 'Dizer oi', description: 'Posso dizer: "Oi, tudo bem?"' },
      { title: 'Perguntar o nome', description: 'Posso perguntar o nome da pessoa.' },
      { title: 'Convidar para brincar', description: 'Posso perguntar: "Quer brincar comigo?"' },
      { title: 'Brincar juntos', description: 'Brincar juntos é muito divertido!' },
    ],
  },
  {
    id: 'story-group-work',
    title: 'Trabalhando em Grupo',
    description: 'Como participar de trabalhos em equipe',
    category: 'social',
    ageMin: 6,
    ageMax: 14,
    steps: [
      { title: 'Trabalho em grupo', description: 'Às vezes preciso fazer trabalho com colegas.' },
      { title: 'Ouvir as ideias', description: 'Primeiro, ouço as ideias de todos.' },
      { title: 'Dar minha opinião', description: 'Depois, dou minha opinião com calma.' },
      { title: 'Dividir as tarefas', description: 'Dividimos as tarefas entre todos.' },
      { title: 'Fazer minha parte', description: 'Faço minha parte com capricho.' },
      { title: 'Juntar tudo', description: 'No final, juntamos tudo e apresentamos!' },
    ],
  },
  {
    id: 'story-asking-help',
    title: 'Pedindo Ajuda',
    description: 'Como e quando pedir ajuda',
    category: 'social',
    ageMin: 4,
    ageMax: 12,
    steps: [
      { title: 'Preciso de ajuda', description: 'Às vezes não consigo fazer algo sozinho.' },
      { title: 'Está tudo bem', description: 'Pedir ajuda não é vergonha.' },
      { title: 'Escolher alguém', description: 'Escolho alguém que pode me ajudar.' },
      { title: 'Falar com calma', description: 'Falo com calma: "Você pode me ajudar?"' },
      { title: 'Explicar o problema', description: 'Explico o que preciso.' },
      { title: 'Agradecer', description: 'Depois de receber ajuda, agradeço!' },
    ],
  },
  {
    id: 'story-when-things-change',
    title: 'Quando as Coisas Mudam',
    description: 'Lidando com mudanças inesperadas',
    category: 'social',
    ageMin: 4,
    ageMax: 14,
    steps: [
      { title: 'Algo mudou', description: 'Às vezes as coisas não acontecem como planejado.' },
      { title: 'Posso ficar confuso', description: 'Mudanças podem me deixar confuso ou chateado.' },
      { title: 'Está tudo bem', description: 'É normal não gostar de mudanças.' },
      { title: 'Respiro fundo', description: 'Respiro fundo para me acalmar.' },
      { title: 'Pergunto o que vai acontecer', description: 'Pergunto para entender o novo plano.' },
      { title: 'Vou me adaptar', description: 'Com o tempo, vou me acostumar com a mudança.' },
    ],
  },
  {
    id: 'story-waiting-turn',
    title: 'Esperando Minha Vez',
    description: 'Aprendendo a esperar em filas e jogos',
    category: 'social',
    ageMin: 3,
    ageMax: 10,
    steps: [
      { title: 'Minha vez vai chegar', description: 'Às vezes preciso esperar minha vez.' },
      { title: 'É difícil esperar', description: 'Esperar pode ser difícil às vezes.' },
      { title: 'Posso contar', description: 'Posso contar os números enquanto espero.' },
      { title: 'Pensar em algo legal', description: 'Posso pensar em algo legal enquanto espero.' },
      { title: 'Minha vez chegou!', description: 'Quando chegar minha vez, vou aproveitar!' },
      { title: 'Agora é do outro', description: 'Depois, deixo o outro ter a vez dele.' },
    ],
  },
];

export const getStoriesByCategory = (category: string) => 
  expandedStories.filter(s => s.category === category);

export const getStoryById = (id: string) => 
  expandedStories.find(s => s.id === id);
