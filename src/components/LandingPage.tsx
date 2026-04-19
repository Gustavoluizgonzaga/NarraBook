import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Mic, Zap, Clock, Save, Keyboard, ChevronRight, Heart, Copy, CheckCircle2, QrCode, HelpCircle, X, Settings, Smartphone } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onViewLibrary: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onViewLibrary }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleCopyPix = (value: string, id: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header Auth (Removed Firebase) */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-end z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 md:p-3 rounded-2xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors flex items-center gap-2 group"
          >
            <HelpCircle className="w-5 h-5 text-foreground/60 group-hover:text-accent transition-colors" />
            <span className="text-sm font-medium hidden sm:block text-foreground/80 group-hover:text-foreground">Como ter vozes perfeitas?</span>
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-foreground/60">Versão Offline</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 max-w-4xl"
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-display mb-6 tracking-tight">
            Ouça seus livros enquanto <span className="text-accent italic">trabalha, estuda...</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/70 font-sans max-w-2xl mx-auto mb-10 leading-relaxed">
            NarraBook transforma seus ebooks em áudio em tempo real. Uma experiência de leitura feita para quem valoriza o tempo.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="group relative px-8 py-4 bg-accent text-background font-bold rounded-full text-lg transition-all hover:shadow-[0_0_30px_rgba(201,169,110,0.4)] flex items-center gap-2"
            >
              Começar Agora 
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewLibrary}
              className="px-8 py-4 bg-foreground/5 border border-foreground/10 text-foreground font-bold rounded-full text-lg transition-all hover:bg-foreground/10 flex items-center gap-2"
            >
              Minha Biblioteca
            </motion.button>
          </div>
        </motion.div>

        {/* Hero indicator removed to be placed at the top of next section */}
      </section>

      {/* Transition Indicator */}
      <div className="flex flex-col items-center gap-2 -mt-12 mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center gap-2"
        >
          <div 
            className="cursor-pointer"
            dangerouslySetInnerHTML={{ 
              __html: `
                <lord-icon
                  src="https://cdn.lordicon.com/sobzmbzh.json"
                  trigger="hover"
                  stroke="light"
                  colors="primary:#c9a96e,secondary:#ffffff"
                  style="width:60px;height:60px">
                </lord-icon>
              ` 
            }} 
          />
          <motion.span 
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[10px] uppercase tracking-[0.3em] font-medium text-accent"
          >
            Descubra o NarraBook
          </motion.span>
        </motion.div>
      </div>

      {/* How it Works */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-center mb-16">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: <BookOpen />, title: "1. Arraste seu ebook", desc: "Suporte para TXT, EPUB e PDF. Extração instantânea de texto." },
            { icon: <Mic />, title: "2. Escolha sua voz", desc: "Vozes naturais do sistema com ajuste de velocidade." },
            { icon: <Zap />, title: "3. Ouça em qualquer lugar", desc: "Foco total na sua atividade enquanto o NarraBook lê para você." }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-3xl bg-foreground/5 border border-foreground/10 text-center hover:border-accent/30 transition-colors"
            >
              <div className="w-16 h-16 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                {step.icon}
              </div>
              <h3 className="text-2xl mb-4">{step.title}</h3>
              <p className="text-foreground/60">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-foreground/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl text-center mb-16">Recursos Completos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <BookOpen />, title: "Formatos Suportados", desc: "Leitura fluida de arquivos .txt, .epub e .pdf sem complicações." },
              { icon: <Zap />, title: "Velocidade Ajustável", desc: "De 0.5x a 3x. Ouça no seu ritmo, seja para estudo ou lazer." },
              { icon: <Mic />, title: "Word Highlight", desc: "Acompanhe visualmente cada palavra enquanto ela é narrada." },
              { icon: <Clock />, title: "Sleep Timer", desc: "Programe o desligamento automático para dormir ouvindo." },
              { icon: <Save />, title: "Salva Progresso", desc: "Continue exatamente de onde parou, em qualquer sessão." },
              { icon: <Keyboard />, title: "Atalhos de Teclado", desc: "Controle total sem precisar tirar as mãos do teclado." }
            ].map((feature, i) => (
              <div key={i} className="flex gap-6 p-6 rounded-2xl hover:bg-foreground/5 transition-colors">
                <div className="text-accent shrink-0">{feature.icon}</div>
                <div>
                  <h4 className="text-xl mb-2">{feature.title}</h4>
                  <p className="text-foreground/60 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-foreground/10 flex flex-col items-center gap-16">
        {/* Support Section */}
        <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center px-6">
          <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-2">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-display">Apoie o NarraBook</h3>
          <p className="text-foreground/60 text-sm md:text-base leading-relaxed">
            O NarraBook é 100% gratuito e mantido pela comunidade. Se este projeto ajuda você no seu dia a dia, considere fazer uma contribuição voluntária de qualquer valor via PIX.
          </p>
          
          <div className="flex flex-col items-center gap-4 w-full mt-6 bg-foreground/[0.02] p-8 rounded-3xl border border-foreground/5">
            
            {/* Key 1: Email */}
            <div className="w-full flex flex-col gap-2">
              <p className="text-xs text-foreground/60 text-left pl-1">E-mail</p>
              <div className="w-full flex items-center gap-2 bg-foreground/5 p-2 rounded-xl border border-foreground/10">
                <code className="text-sm truncate flex-1 text-center font-mono text-foreground font-bold">glgdcos@gmail.com</code>
                <button 
                  onClick={() => handleCopyPix('glgdcos@gmail.com', 'email')}
                  className="p-3 bg-accent text-background rounded-lg transition-transform hover:scale-105 shrink-0 flex items-center justify-center w-12 h-12"
                  title="Copiar E-mail"
                >
                  {copiedId === 'email' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Key 2: CNPJ */}
            <div className="w-full flex flex-col gap-2 mt-2">
              <p className="text-xs text-foreground/60 text-left pl-1">CNPJ</p>
              <div className="w-full flex items-center gap-2 bg-foreground/5 p-2 rounded-xl border border-foreground/10">
                <code className="text-sm truncate flex-1 text-center font-mono text-foreground font-bold">55.353.853/0001-07</code>
                <button 
                  onClick={() => handleCopyPix('55353853000107', 'cnpj')}
                  className="p-3 bg-accent text-background rounded-lg transition-transform hover:scale-105 shrink-0 flex items-center justify-center w-12 h-12"
                  title="Copiar CNPJ"
                >
                  {copiedId === 'cnpj' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="text-foreground/40 text-sm text-center">
          <p>© 2026 NarraBook. Feito com paixão por leitores.</p>
        </div>
      </footer>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background border border-foreground/10 rounded-[32px] p-8 md:p-12 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowHelpModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display">Vozes Premium Gratuitas</h2>
                  <p className="text-foreground/60 text-sm">Aprenda a habilitar a mais alta qualidade no seu celular.</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Android Steps */}
                <div className="bg-foreground/[0.03] border border-foreground/5 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-green-500">🤖</span> Android <span className="text-sm font-normal text-foreground/50">(Ex. Samsung, Motorola)</span>
                  </h3>
                  <ol className="space-y-3 text-sm md:text-base text-foreground/80 list-decimal list-inside marker:text-accent font-medium">
                    <li>Vá nas <strong>Configurações</strong> do seu celular.</li>
                    <li>Pesquise por <em>"Texto para voz"</em> ou <em>"Conversão de texto em voz"</em> (costuma ficar em Acessibilidade ou Idioma).</li>
                    <li>No <strong>Mecanismo Preferido</strong> (geralmente "Serviços de fala do Google" ou "Samsung TTS"), clique na <strong>engrenagem ⚙️</strong> ao lado.</li>
                    <li>Vá em <strong>"Instalar dados de voz"</strong> {'>'} Selecione <strong>"Português (Brasil)"</strong>.</li>
                    <li>Baixe as vozes de alta qualidade (ou exclua e baixe novamente o pacote para recarregar as versões mais modernas femininas e masculinas).</li>
                  </ol>
                </div>

                {/* iOS Steps */}
                <div className="bg-foreground/[0.03] border border-foreground/5 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-gray-300">🍎</span> iPhone <span className="text-sm font-normal text-foreground/50">(iOS)</span>
                  </h3>
                  <ol className="space-y-3 text-sm md:text-base text-foreground/80 list-decimal list-inside marker:text-accent font-medium">
                    <li>Vá em <strong>Ajustes</strong> {'>'} <strong>Acessibilidade</strong> {'>'} <strong>Conteúdo Falado</strong> {'>'} <strong>Vozes</strong>.</li>
                    <li>Entre em <strong>Português (Brasil)</strong>.</li>
                    <li>Você verá nomes como "Luciana" e "Felipe". Baixe a versão com <strong>"Aprimorada" (Enhanced)</strong> ou <strong>"Premium"</strong> do lado.</li>
                    <p className="text-sm text-foreground/60 mt-3 ml-6">Elas são gratuitas, incrivelmente reais e, quando baixadas (pesam cerca de 200MB), aparecerão no NarraBook para leitura infinita e instantânea!</p>
                  </ol>
                </div>
              </div>

              <button 
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-10 py-4 bg-accent text-background font-bold rounded-2xl hover:bg-accent/90 transition-colors text-lg"
              >
                Entendido!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function for class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
