import { Brain, Heart, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/20 rounded-full">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold">GameNeuro</h3>
                <p className="text-sm opacity-80">Neuro.Lux Ecosystem</p>
              </div>
            </div>
            <p className="text-lg opacity-90 mb-6 leading-relaxed">
              Revolucionando a terapia através de jogos baseados em evidências científicas. 
              Transformamos desenvolvimento de habilidades em experiências divertidas para pessoas neurodivergentes.
            </p>
            <div className="flex items-center gap-2 text-sm opacity-75">
              <Heart className="h-4 w-4 text-primary" />
              <span>Feito com amor para a comunidade neurodiversa</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Explorar</h4>
            <ul className="space-y-3">
              <li><a href="#categorias" className="opacity-80 hover:opacity-100 transition-opacity">Categorias de Jogos</a></li>
              <li><a href="#principios" className="opacity-80 hover:opacity-100 transition-opacity">Design Inclusivo</a></li>
              <li><a href="#jogos" className="opacity-80 hover:opacity-100 transition-opacity">Jogos Piloto</a></li>
              <li><a href="#ciencia" className="opacity-80 hover:opacity-100 transition-opacity">Validação Científica</a></li>
              <li><a href="#parcerias" className="opacity-80 hover:opacity-100 transition-opacity">Parcerias</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="opacity-80">contato@gameneuro.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="opacity-80">+55 11 9999-9999</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="opacity-80">São Paulo, SP</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3">Newsletter Científica</h5>
              <div className="flex gap-2">
                <Input 
                  placeholder="Seu email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Assinar
                </Button>
              </div>
              <p className="text-xs opacity-60 mt-2">
                Receba estudos e novidades sobre jogos terapêuticos
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm opacity-70">
            © 2024 GameNeuro - Neuro.Lux. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">Privacidade</a>
            <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">Termos de Uso</a>
            <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">Acessibilidade</a>
            <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">LGPD</a>
          </div>
        </div>
      </div>
    </footer>
  );
};