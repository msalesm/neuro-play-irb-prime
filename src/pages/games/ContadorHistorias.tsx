import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Sparkles, Trophy, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface StoryChapter {
  id: number;
  text: string;
  options: string[];
  correctOption: number;
  completed: boolean;
  character: string;
}

interface Story {
  title: string;
  chapters: StoryChapter[];
  theme: string;
}

export default function ContadorHistorias() {
  const { toast } = useToast();
  const [currentStory, setCurrentStory] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [completedStories, setCompletedStories] = useState(0);
  const [magicEffect, setMagicEffect] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);

  // Generate stories
  useEffect(() => {
    const storyTemplates: Story[] = [
      {
        title: "A Aventura do Pequeno Dragão",
        theme: "friendship",
        chapters: [
          {
            id: 0,
            text: "Era uma vez um pequeno dragão chamado Fogo que vivia em uma montanha. Ele era diferente dos outros dragões porque...",
            options: ["cuspia flores ao invés de fogo", "tinha medo de voar", "só comia frutas", "falava com os animais"],
            correctOption: 0,
            completed: false,
            character: "🐲"
          },
          {
            id: 1,
            text: "Os outros dragões riram de Fogo, mas um dia uma princesa ficou doente e precisava de...",
            options: ["remédio amargo", "flores mágicas", "água fria", "pedras preciosas"],
            correctOption: 1,
            completed: false,
            character: "👸"
          },
          {
            id: 2,
            text: "Fogo conseguiu salvar a princesa e todos aprenderam que ser diferente é...",
            options: ["ruim", "estranho", "especial", "difícil"],
            correctOption: 2,
            completed: false,
            character: "🌸"
          }
        ]
      },
      {
        title: "O Gato que Virou Detetive",
        theme: "mystery",
        chapters: [
          {
            id: 0,
            text: "Miau era um gato muito curioso que vivia na cidade. Um dia, todos os peixes do mercado desapareceram! Miau decidiu...",
            options: ["dormir na sombra", "investigar o mistério", "pedir comida", "brincar com lã"],
            correctOption: 1,
            completed: false,
            character: "🕵️‍♂️"
          },
          {
            id: 1,
            text: "Seguindo as pistas, Miau descobriu pegadas molhadas que levavam até...",
            options: ["a casa do vizinho", "o parque", "a fonte da praça", "o telhado"],
            correctOption: 2,
            completed: false,
            character: "🐾"
          },
          {
            id: 2,
            text: "Na fonte, Miau encontrou um grupo de patos que tinham 'emprestado' os peixes para...",
            options: ["comê-los", "uma festa surpresa", "vendê-los", "fazer uma pegadinha"],
            correctOption: 1,
            completed: false,
            character: "🦆"
          }
        ]
      },
      {
        title: "A Floresta dos Sonhos",
        theme: "magic",
        chapters: [
          {
            id: 0,
            text: "Luna descobriu uma floresta mágica onde as árvores falavam. A árvore mais velha disse que ela poderia fazer um pedido, mas primeiro precisava...",
            options: ["encontrar uma estrela", "ajudar três animais", "cantar uma música", "dançar em círculos"],
            correctOption: 1,
            completed: false,
            character: "🌳"
          },
          {
            id: 1,
            text: "Luna ajudou um coelho perdido, curou a asa de um pássaro e dividiu sua comida com um esquilo. A árvore ficou impressionada com sua...",
            options: ["coragem", "inteligência", "bondade", "força"],
            correctOption: 2,
            completed: false,
            character: "🌟"
          },
          {
            id: 2,
            text: "Como recompensa, a árvore deu a Luna o poder de...",
            options: ["voar", "falar com animais", "ficar invisível", "crescer flores"],
            correctOption: 1,
            completed: false,
            character: "🦋"
          }
        ]
      }
    ];
    
    setStories(storyTemplates);
  }, []);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleSubmitChoice = () => {
    if (selectedOption === null || !stories[currentStory]) return;

    const chapter = stories[currentStory].chapters[currentChapter];
    
    if (selectedOption === chapter.correctOption) {
      // Correct choice
      setMagicEffect(true);
      setTimeout(() => setMagicEffect(false), 1000);
      
      const newStories = [...stories];
      newStories[currentStory].chapters[currentChapter].completed = true;
      setStories(newStories);
      setScore(score + 10);
      
      toast({
        title: "✨ Escolha Perfeita!",
        description: "A história continua magicamente!",
      });
      
      // Move to next chapter or story
      if (currentChapter < stories[currentStory].chapters.length - 1) {
        setTimeout(() => {
          setCurrentChapter(currentChapter + 1);
          setSelectedOption(null);
        }, 1500);
      } else {
        // Story completed
        setCompletedStories(completedStories + 1);
        toast({
          title: "📚 História Completa!",
          description: `Parabéns! Você completou "${stories[currentStory].title}"!`,
        });
        
        setTimeout(() => {
          if (currentStory < stories.length - 1) {
            setCurrentStory(currentStory + 1);
            setCurrentChapter(0);
            setSelectedOption(null);
          }
        }, 2000);
      }
    } else {
      // Wrong choice - give hint
      toast({
        title: "🤔 Tente Novamente!",
        description: "O narrador sussurra: 'Talvez outra opção funcione melhor...'",
        variant: "destructive"
      });
    }
  };

  const resetGame = () => {
    setCurrentStory(0);
    setCurrentChapter(0);
    setSelectedOption(null);
    setScore(0);
    setCompletedStories(0);
    
    // Reset all chapters
    const resetStories = stories.map(story => ({
      ...story,
      chapters: story.chapters.map(chapter => ({ ...chapter, completed: false }))
    }));
    setStories(resetStories);
  };

  if (!stories[currentStory]) {
    return <div>Carregando histórias...</div>;
  }

  const story = stories[currentStory];
  const chapter = story.chapters[currentChapter];
  const progress = ((completedStories * 3 + currentChapter + (chapter.completed ? 1 : 0)) / (stories.length * 3)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/games">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Jogos
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">⭐ {score}</div>
              <div className="text-sm text-purple-600">Pontos de História</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-700">📚 {completedStories}</div>
              <div className="text-sm text-pink-600">Histórias Completas</div>
            </div>
          </div>
        </div>

        {/* Narrator Character */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`text-6xl transition-transform duration-1000 ${magicEffect ? 'animate-spin' : ''}`}>
                📖
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Contador de Histórias Mágico</h2>
                <p className="text-lg">
                  {completedStories === stories.length 
                    ? "🎉 Incrível! Você completou todas as histórias mágicas!" 
                    : `✨ Escolha as palavras certas para completar as histórias encantadas! História: "${story.title}"`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Story Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Story Book */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                {story.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border-4 border-yellow-200">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{chapter.character}</div>
                  <div className="text-sm text-gray-500 mb-2">Capítulo {currentChapter + 1} de {story.chapters.length}</div>
                </div>
                
                <div className="text-lg leading-relaxed text-gray-800 mb-6 text-center">
                  {chapter.text}
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {chapter.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedOption === index ? "default" : "outline"}
                      className="h-12 text-left text-base px-4 justify-start"
                      onClick={() => handleOptionSelect(index)}
                      disabled={chapter.completed}
                    >
                      <span className="mr-3 text-purple-500 font-bold">{index + 1}.</span>
                      {option}
                    </Button>
                  ))}
                </div>
                
                {!chapter.completed && (
                  <Button 
                    onClick={handleSubmitChoice}
                    disabled={selectedOption === null}
                    className="w-full h-12 text-lg mt-4"
                  >
                    Continuar História ✨
                  </Button>
                )}
                
                {chapter.completed && (
                  <div className="text-center mt-4 p-4 bg-green-100 rounded-lg">
                    <div className="text-2xl mb-2">🎉</div>
                    <p className="text-green-700 font-semibold">Capítulo Completo!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Story Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Progresso das Histórias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stories.map((storyItem, storyIndex) => (
                  <div 
                    key={storyIndex}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      storyIndex === currentStory 
                        ? 'border-purple-300 bg-purple-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-2">{storyItem.title}</div>
                    <div className="flex gap-1">
                      {storyItem.chapters.map((chap, chapIndex) => (
                        <div
                          key={chapIndex}
                          className={`w-4 h-4 rounded-full ${
                            chap.completed 
                              ? 'bg-green-400' 
                              : storyIndex === currentStory && chapIndex === currentChapter
                                ? 'bg-purple-400'
                                : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                
                {completedStories === stories.length && (
                  <Button 
                    onClick={resetGame} 
                    className="w-full mt-4"
                    variant="outline"
                  >
                    Contar Histórias Novamente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{completedStories}</div>
                <div className="text-sm text-purple-500">Histórias Completas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-600">{Math.floor(score / 10)}</div>
                <div className="text-sm text-pink-500">Escolhas Corretas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">{currentStory + 1}</div>
                <div className="text-sm text-indigo-500">História Atual</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}