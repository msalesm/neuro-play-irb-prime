import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Avatar {
  id: string;
  name: string;
  emoji: string;
  category: 'animals' | 'robots' | 'heroes';
}

interface AvatarSelectionProps {
  onSelect: (avatar: Avatar) => void;
  selectedAvatar?: Avatar;
}

export const AvatarSelection = ({ onSelect, selectedAvatar }: AvatarSelectionProps) => {
  const avatars: Avatar[] = [
    // Animals
    { id: 'cat', name: 'Gatinho', emoji: '🐱', category: 'animals' },
    { id: 'dog', name: 'Cachorrinho', emoji: '🐶', category: 'animals' },
    { id: 'bear', name: 'Ursinho', emoji: '🐻', category: 'animals' },
    { id: 'fox', name: 'Raposa', emoji: '🦊', category: 'animals' },
    { id: 'panda', name: 'Panda', emoji: '🐼', category: 'animals' },
    { id: 'lion', name: 'Leão', emoji: '🦁', category: 'animals' },
    
    // Robots
    { id: 'robot1', name: 'Robo Azul', emoji: '🤖', category: 'robots' },
    { id: 'robot2', name: 'Robo Amigo', emoji: '🤖', category: 'robots' },
    { id: 'alien', name: 'Alienígena', emoji: '👽', category: 'robots' },
    { id: 'spaceship', name: 'Nave Espacial', emoji: '🛸', category: 'robots' },
    { id: 'computer', name: 'Computador', emoji: '💻', category: 'robots' },
    { id: 'gear', name: 'Engrenagem', emoji: '⚙️', category: 'robots' },
    
    // Heroes
    { id: 'superhero', name: 'Super-Herói', emoji: '🦸', category: 'heroes' },
    { id: 'wizard', name: 'Mago', emoji: '🧙', category: 'heroes' },
    { id: 'knight', name: 'Cavaleiro', emoji: '🛡️', category: 'heroes' },
    { id: 'ninja', name: 'Ninja', emoji: '🥷', category: 'heroes' },
    { id: 'princess', name: 'Princesa', emoji: '👸', category: 'heroes' },
    { id: 'star', name: 'Estrela', emoji: '⭐', category: 'heroes' },
  ];

  const [selectedCategory, setSelectedCategory] = useState<'animals' | 'robots' | 'heroes'>('animals');

  const categories = [
    { id: 'animals', name: 'Animais', emoji: '🐱' },
    { id: 'robots', name: 'Robôs', emoji: '🤖' },
    { id: 'heroes', name: 'Heróis', emoji: '🦸' },
  ];

  const filteredAvatars = avatars.filter(avatar => avatar.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold font-heading text-foreground mb-2">
          Escolha seu Avatar
        </h3>
        <p className="text-muted-foreground">
          Selecione um personagem que represente você no Neuro IRB Prime
        </p>
      </div>

      {/* Category Selection */}
      <div className="flex justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id as 'animals' | 'robots' | 'heroes')}
            className="flex items-center gap-2"
          >
            <span>{category.emoji}</span>
            <span className="hidden sm:inline">{category.name}</span>
          </Button>
        ))}
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {filteredAvatars.map((avatar) => (
          <Card
            key={avatar.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedAvatar?.id === avatar.id
                ? 'ring-2 ring-primary shadow-glow'
                : 'hover:shadow-card'
            }`}
            onClick={() => onSelect(avatar)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-3xl sm:text-4xl mb-2">{avatar.emoji}</div>
              <div className="text-xs sm:text-sm font-medium text-card-foreground">
                {avatar.name}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAvatar && (
        <div className="text-center p-4 bg-primary/10 rounded-2xl">
          <div className="text-4xl mb-2">{selectedAvatar.emoji}</div>
          <div className="font-semibold text-foreground">{selectedAvatar.name} selecionado!</div>
        </div>
      )}
    </div>
  );
};