import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, ClipboardCheck, GraduationCap } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-xl text-foreground">NeuroPlay EDU</span>
          <Link to="/auth"><Button>Entrar</Button></Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-6 py-20 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Identificação precoce de neurodiversidade na sua escola
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Triagem gamificada, Plano de Apoio Pedagógico e capacitação para professores —
            tudo em um lugar.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-base">Começar gratuitamente</Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-6 max-w-xl mx-auto">
            NeuroPlay EDU é uma ferramenta de apoio pedagógico. Os resultados das triagens são
            indicativos educacionais e não substituem avaliação diagnóstica realizada por
            profissional de saúde habilitado.
          </p>
        </section>

        <section className="container mx-auto px-6 py-12 grid md:grid-cols-3 gap-6 max-w-5xl">
          <Card className="p-6">
            <Gamepad2 className="w-10 h-10 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">Triagem em 15 minutos</h3>
            <p className="text-sm text-muted-foreground">
              Identifique sinais de dislexia, TDAH e TEA através de jogos validados pedagogicamente.
            </p>
          </Card>
          <Card className="p-6">
            <ClipboardCheck className="w-10 h-10 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">PEI gerado automaticamente</h3>
            <p className="text-sm text-muted-foreground">
              Plano de Apoio Pedagógico como rascunho editável, alinhado à BNCC e Lei 14.254/21.
            </p>
          </Card>
          <Card className="p-6">
            <GraduationCap className="w-10 h-10 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">Capacitação docente</h3>
            <p className="text-sm text-muted-foreground">
              Módulos com certificado digital para toda a equipe pedagógica.
            </p>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NeuroPlay EDU
      </footer>
    </div>
  );
}
