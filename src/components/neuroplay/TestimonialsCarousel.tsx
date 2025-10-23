import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Quote, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Mãe de João, 9 anos',
    avatar: 'MS',
    quote: 'Meu filho voltou a gostar de aprender depois dos jogos do Neuro-Play. Ele se sente motivado e eu vejo progresso real.',
    rating: 5,
  },
  {
    name: 'Dr. Carlos Santos',
    role: 'Psicólogo Clínico',
    avatar: 'CS',
    quote: 'Uma ferramenta excepcional para complementar terapias. Os relatórios ajudam muito no acompanhamento dos pacientes.',
    rating: 5,
  },
  {
    name: 'Ana Oliveira',
    role: 'Professora',
    avatar: 'AO',
    quote: 'Uso com meus alunos e vejo resultados incríveis. A plataforma é intuitiva e os dados me ajudam a personalizar o ensino.',
    rating: 5,
  },
  {
    name: 'Pedro Costa',
    role: 'Pai de Laura, 12 anos',
    avatar: 'PC',
    quote: 'A Laura tem dislexia e os jogos ajudaram muito na autoconfiança dela. Recomendo para todas as famílias!',
    rating: 5,
  },
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-secondary/5 to-background">
      <div className="container mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Histórias Reais</h2>
          <p className="text-xl text-muted-foreground">
            Veja como o Neuro-Play tem transformado vidas
          </p>
        </div>

        {/* Main Testimonial Card */}
        <Card className="border-2 shadow-glow">
          <CardContent className="p-8 md:p-12">
            <Quote className="w-12 h-12 text-primary/30 mb-6" />
            
            <p className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
              "{current.quote}"
            </p>

            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16 border-2 border-primary">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {current.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg">{current.name}</p>
                <p className="text-muted-foreground">{current.role}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex gap-1">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-smooth ${
                index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-primary/30'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* All Testimonials Preview (Mobile Hidden) */}
        <div className="hidden md:grid grid-cols-4 gap-4 mt-12">
          {testimonials.map((testimonial, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`p-4 rounded-lg border-2 transition-smooth hover:border-primary ${
                index === currentIndex ? 'border-primary bg-primary/5' : 'border-transparent'
              }`}
            >
              <Avatar className="w-12 h-12 mx-auto mb-2">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {testimonial.avatar}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-center">{testimonial.name}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
