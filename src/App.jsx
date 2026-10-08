import { useState } from 'react';
import { motion } from 'framer-motion';
import { CTAButton } from './components/CTAButton';
import { FeatureCard } from './components/FeatureCard';
import {
  Clock, ShieldAlert, CheckCircle2, RefreshCw, BookOpen, ChevronDown, Leaf,
  ExternalLink, CreditCard, Mail, ClipboardList, Salad, CalendarDays,
  MessageSquarePlus, Search, Printer, UtensilsCrossed, FileText, Check,
} from 'lucide-react';

// PENDENTE: trocar pelo link da oferta de R$ 120 na Cakto. Este ainda e o da oferta de R$ 160.
const CHECKOUT_URL = 'https://pay.cakto.com.br/377hgi2_655270';

// ─── Animation Helpers ───────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

const stagger = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

// ─── Floating Decorative Element Helper ─────────────────────────────────────
function FloatingDecor({ children, className = '', floatY = 12, floatDuration = 5, rotateRange = 0, delay = 0 }) {
  return (
    <motion.div
      className={`absolute pointer-events-none select-none floating-decor-mobile-hide ${className}`}
      animate={{
        y: [0, -floatY, 0],
        rotate: rotateRange ? [-rotateRange, rotateRange, -rotateRange] : 0,
      }}
      transition={{
        duration: floatDuration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// As ilustracoes da identidade do livro, tingidas nas tres cores da marca
const TONS = {
  verde: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)',
  laranja: 'brightness(0) saturate(100%) invert(51%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(95%)',
  azul: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)',
};

function Ilustra({ n, w, h = w, tom = 'verde' }) {
  return (
    <img
      src={`/id-visual-livro-vivo-0${n}.svg`}
      alt=""
      style={{ width: w, height: h, filter: TONS[tom] }}
    />
  );
}

// ─── Ticker Banner ────────────────────────────────────────────────────────────
function TickerBanner() {
  const items = Array(12).fill('✦ Novo · E-book em PDF + Gerador de cardápio · De R$ 160 por R$ 120 · em até 12x no cartão ');
  return (
    <div className="bg-[#ED8627] overflow-hidden py-2.5 border-b border-[#D67822]">
      <div className="flex whitespace-nowrap animate-ticker">
        {items.map((item, i) => (
          <span key={i} className="text-white font-sans font-semibold text-sm tracking-wide mr-0 px-4">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#EEF0D2]/90 backdrop-blur-md border-b border-[#E2E5BE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-[#448D76] shrink-0" strokeWidth={2.2} aria-hidden="true" />
          <span className="font-serif font-bold text-[#448D76] text-sm sm:text-lg tracking-tight">
            Cardápios: Um Livro Vivo
          </span>
        </div>
        <CTAButton href="#checkout" size="sm" className="!px-4 !py-2 !text-xs sm:!px-6 sm:!py-3 sm:!text-sm">
          Quero Acesso
        </CTAButton>
      </div>
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

// A credencial da autora, curta, logo abaixo do botao principal
function CredencialAutora({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/lucia-borges.jpeg"
        alt=""
        className="w-11 h-11 rounded-full object-cover object-top border-2 border-white shadow-md shrink-0"
      />
      <p className="text-xs sm:text-sm text-[#5A5A5A] leading-snug">
        Escrito por nutricionista com <strong className="text-[#448D76]">21 anos de prática</strong> em
        vários tipos de UAN e <strong className="text-[#448D76]">mais de 17 anos</strong> entre sala de
        aula e direção acadêmica.
      </p>
    </div>
  );
}

const SELOS_HERO = [
  { icon: '⚡', text: 'Acesso imediato' },
  { icon: '♾️', text: 'Gerador vitalício' },
  { icon: '📖', text: 'Novas edições incluídas' },
];

// Cartao com tres dias de uma semana real montada pelo gerador
function MiniGerador({ className = '' }) {
  const linhas = [
    ['Seg', 'Costela ao molho de mostarda'],
    ['Ter', 'Filé de frango ao molho de laranja'],
    ['Qua', 'Bacalhau com rúcula e tomate seco'],
  ];
  return (
    <div className={`bg-white rounded-2xl shadow-2xl border border-[#E2E5BE] p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-[#ED8627] text-white flex items-center justify-center shrink-0">
          <UtensilsCrossed size={15} aria-hidden="true" />
        </span>
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#ED8627]">Gerador de cardápio</span>
      </div>
      <ul className="space-y-1.5">
        {linhas.map(([dia, prato]) => (
          <li key={dia} className="flex gap-2 text-xs text-[#2D2D2D] leading-snug">
            <span className="font-bold text-[#0C718B] w-7 shrink-0">{dia}</span>
            <span>{prato}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-2.5 border-t border-[#E2E5BE] flex items-center gap-1.5 text-[11px] text-[#448D76] font-semibold">
        <Check size={13} aria-hidden="true" /> Montado pelo método do livro
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col pt-16 bg-[#EEF0D2] overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#0C718B]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-[#ED8627]/8 blur-3xl pointer-events-none" />

      <FloatingDecor className="top-[5%] -right-[5%] opacity-5 md:opacity-10" floatY={20} floatDuration={6} rotateRange={7} delay={0}>
        <Ilustra n={1} w={450} />
      </FloatingDecor>
      <FloatingDecor className="top-[20%] -left-[10%] opacity-[0.07] md:opacity-[0.12]" floatY={15} floatDuration={8} rotateRange={-9} delay={0.5}>
        <Ilustra n={8} w={400} h={380} tom="laranja" />
      </FloatingDecor>
      <FloatingDecor className="bottom-[10%] -left-[5%] opacity-5 md:opacity-10" floatY={18} floatDuration={7} rotateRange={-6} delay={1}>
        <Ilustra n={6} w={480} tom="azul" />
      </FloatingDecor>
      <FloatingDecor className="bottom-[25%] -right-[15%] opacity-5 md:opacity-[0.07]" floatY={25} floatDuration={6.5} rotateRange={8} delay={1.5}>
        <Ilustra n={9} w={450} h={400} />
      </FloatingDecor>
      <FloatingDecor className="top-[45%] -left-[20%] opacity-5 md:opacity-10 hidden md:block" floatY={14} floatDuration={9} rotateRange={5} delay={2}>
        <Ilustra n={2} w={350} />
      </FloatingDecor>
      <FloatingDecor className="top-[40%] right-[10%] opacity-[0.025] md:opacity-5 hidden lg:block" floatY={16} floatDuration={7.5} rotateRange={-5} delay={0.8}>
        <Ilustra n={4} w={300} h={350} tom="azul" />
      </FloatingDecor>
      <FloatingDecor className="bottom-[5%] left-[25%] opacity-[0.025] md:opacity-[0.07] hidden xl:block" floatY={12} floatDuration={8.5} rotateRange={12} delay={2.2}>
        <Ilustra n={5} w={380} h={280} tom="laranja" />
      </FloatingDecor>
      <FloatingDecor className="top-[60%] right-[-10%] opacity-5 md:opacity-10 hidden md:block" floatY={22} floatDuration={10} rotateRange={10} delay={1.2}>
        <Ilustra n={7} w={420} h={400} tom="azul" />
      </FloatingDecor>

      <div className="max-w-6xl mx-auto px-4 sm:px-5 flex-1 flex flex-col justify-center pt-2 pb-10 sm:py-16 md:py-24">

        {/* ── MOBILE LAYOUT: mockup on top, text below ─────────────────────── */}
        <div className="flex lg:hidden flex-col gap-10">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex justify-center relative"
          >
            <div className="relative mx-auto mt-2 mb-6" style={{ width: '100%', maxWidth: '320px' }}>
              <img
                src="/livro-vivo.png"
                alt="Mockup do Cardápios: Um Livro Vivo"
                className="w-full h-auto drop-shadow-[0_16px_40px_rgba(27,77,75,0.4)] object-contain scale-[1.35]"
              />

              {/* Selo do formato, no canto superior direito sobre o livro */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-4 sm:right-2 top-[12%] bg-white rounded-[14px] p-2 shadow-2xl border border-[#E2E5BE] z-30"
              >
                <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#448D76]">
                  <span className="text-white text-[9px] font-bold tracking-wide">PDF</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="absolute left-2 sm:-left-3 top-[55%] bg-white text-[#ED8627] rounded-xl px-3 py-2 shadow-xl border border-[#E2E5BE] z-20"
              >
                <div className="text-xs font-bold whitespace-nowrap">2.298 Preparações</div>
              </motion.div>

              {/* O gerador, a segunda metade da oferta */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute right-3 sm:-right-2 bottom-[2%] bg-white rounded-xl px-3 py-2 shadow-xl border border-[#E2E5BE] z-20 flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-md bg-[#ED8627] text-white flex items-center justify-center shrink-0">
                  <UtensilsCrossed size={13} aria-hidden="true" />
                </span>
                <div>
                  <div className="text-xs font-bold whitespace-nowrap text-[#0C718B]">+ Gerador de cardápio</div>
                  <div className="text-[10px] text-gray-500">Acesso vitalício</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div {...stagger(0)} className="space-y-5">
            <motion.div {...stagger(0.1)}>
              <span className="badge">E-book em PDF + Gerador de cardápio</span>
            </motion.div>

            <motion.h1
              {...stagger(0.2)}
              className="font-serif text-2xl sm:text-3xl font-bold text-[#448D76] leading-tight tracking-tight"
            >
              Planejar cardápios é tomar decisões todos os dias.
            </motion.h1>

            <motion.p
              {...stagger(0.3)}
              className="font-sans text-sm sm:text-base text-[#5A5A5A] leading-relaxed"
            >
              O <strong className="text-[#448D76]">Cardápios: Um Livro Vivo</strong> traz o livro completo
              em PDF, com 2.298 preparações e o método técnico por trás delas, e um gerador que monta a sua
              semana seguindo as regras do próprio livro.
            </motion.p>

            <motion.div {...stagger(0.4)} className="space-y-2">
              <CTAButton href="#checkout" size="lg" className="w-full text-center !py-3.5 !text-sm sm:!py-4 sm:!text-base">
                Quero o livro e o gerador
              </CTAButton>
              <p className="text-center text-xs text-[#5A5A5A]">
                De <s>R$ 160</s> por <strong className="text-[#448D76]">R$ 120</strong> · ou 12x de R$ 10
              </p>
            </motion.div>

            <motion.div {...stagger(0.45)}>
              <CredencialAutora />
            </motion.div>

            <motion.div {...stagger(0.5)} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {SELOS_HERO.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-[#5A5A5A]">
                  <span>{icon}</span>
                  <span className="font-medium whitespace-nowrap">{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* ── DESKTOP LAYOUT: text left, mockup right (lg+) ─────────────────── */}
        <div className="hidden lg:grid grid-cols-2 gap-16 items-center">

          <motion.div {...stagger(0)} className="space-y-7">
            <motion.div {...stagger(0.1)}>
              <span className="badge">E-book em PDF + Gerador de cardápio</span>
            </motion.div>

            <motion.h1
              {...stagger(0.2)}
              className="font-serif text-5xl xl:text-6xl font-bold text-[#448D76] leading-[1.1] tracking-tight"
            >
              Planejar cardápios é tomar decisões todos os dias.
            </motion.h1>

            <motion.p
              {...stagger(0.3)}
              className="font-sans text-xl text-[#5A5A5A] leading-relaxed max-w-lg"
            >
              O <strong className="text-[#448D76]">Cardápios: Um Livro Vivo</strong> traz o livro completo
              em PDF, com 2.298 preparações e o método técnico por trás delas, e um gerador que monta a sua
              semana seguindo as regras do próprio livro.
            </motion.p>

            <motion.div {...stagger(0.4)} className="flex flex-col items-start gap-3">
              <CTAButton href="#checkout" size="lg">
                Quero o livro e o gerador
              </CTAButton>
              <p className="text-sm text-[#5A5A5A] pl-2">
                De <s>R$ 160</s> por <strong className="text-[#448D76] text-base">R$ 120</strong> · ou 12x de R$ 10
              </p>
            </motion.div>

            <motion.div {...stagger(0.45)}>
              <CredencialAutora className="max-w-lg" />
            </motion.div>

            <motion.div {...stagger(0.5)} className="flex items-center gap-6">
              {SELOS_HERO.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-[#5A5A5A]">
                  <span>{icon}</span>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center w-full z-10"
          >
            <div className="relative w-full max-w-[600px] flex items-center justify-center">
              <img
                src="/livro-vivo.png"
                alt="Mockup do Cardápios: Um Livro Vivo"
                className="w-full h-auto drop-shadow-[0_20px_50px_rgba(27,77,75,0.4)] object-contain relative z-10 scale-125 lg:scale-[1.35] transform origin-center"
              />

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-4 lg:right-[15%] top-[20%] bg-white rounded-[18px] p-3 shadow-2xl border border-[#E2E5BE] flex items-center justify-center z-30"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#448D76]">
                  <span className="text-white text-xs font-bold tracking-wide">PDF</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute left-0 xl:-left-4 bottom-[2%] z-30"
              >
                <MiniGerador className="w-[240px] xl:w-[260px]" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="hidden sm:flex justify-center mt-8"
        >
          <a href="#dores" className="flex flex-col items-center gap-1 text-[#ED8627] hover:text-[#D67822] transition-colors">
            <span className="text-xs font-medium uppercase tracking-widest">Continuar</span>
            <ChevronDown size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pain Points Section ──────────────────────────────────────────────────────
function PainPointsSection() {
  // Cada dor aponta para a parte da oferta que a resolve
  const pains = [
    {
      icon: <Clock size={26} />,
      title: 'Horas montando a semana',
      description:
        'Fechar um cardápio do zero consome horas de planilha que deveriam ir para a cozinha, a equipe e o atendimento.',
      tag: 'O gerador resolve',
    },
    {
      icon: <RefreshCw size={26} />,
      title: 'Cardápio que se repete',
      description:
        'A mesma rotação volta toda semana, sem olhar a safra do mês nem variar o método de cocção. Quem come percebe antes de você.',
      tag: 'O gerador resolve',
    },
    {
      icon: <ShieldAlert size={26} />,
      title: 'Insegurança técnica',
      description:
        'Per capita, fator de correção, ficha técnica: quando a dúvida aparece no meio do expediente, falta uma referência confiável à mão.',
      tag: 'O livro resolve',
    },
  ];

  return (
    <section id="dores" className="py-16 md:py-24 bg-[#EEF0D2] relative overflow-hidden">
      <FloatingDecor className="-top-10 -right-16 opacity-5 md:opacity-10 hidden md:block" floatY={15} floatDuration={7} rotateRange={10} delay={0.5}>
        <Ilustra n={3} w={350} />
      </FloatingDecor>
      <FloatingDecor className="top-[20%] left-[-5%] opacity-[0.07] md:opacity-[0.12]" floatY={12} floatDuration={6} rotateRange={6} delay={0.8}>
        <Ilustra n={7} w={300} h={280} tom="laranja" />
      </FloatingDecor>
      <FloatingDecor className="bottom-[5%] -left-10 opacity-5 md:opacity-[0.07]" floatY={20} floatDuration={8} rotateRange={-5} delay={1.5}>
        <Ilustra n={4} w={280} h={320} tom="azul" />
      </FloatingDecor>
      <FloatingDecor className="bottom-[15%] -right-20 opacity-5 md:opacity-[0.07]" floatY={25} floatDuration={7.5} rotateRange={12} delay={2}>
        <Ilustra n={5} w={400} h={350} />
      </FloatingDecor>
      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        <motion.div {...fadeUp} className="text-center mb-10 md:mb-14">
          <span className="badge mb-4 inline-block">Reconhece alguma dessas situações?</span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#448D76] leading-tight">
            A realidade de quem trabalha com alimentação coletiva
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pains.map((pain, i) => (
            <FeatureCard key={pain.title} {...pain} delay={i * 0.15} />
          ))}
        </div>

        <motion.p
          {...stagger(0.4)}
          className="text-center mt-10 md:mt-12 text-base md:text-lg text-[#5A5A5A] max-w-2xl mx-auto"
        >
          A solução não é trabalhar mais.{' '}
          <strong className="text-[#448D76]">É ter um método, e uma ferramenta que aplica esse método por você.</strong>
        </motion.p>
      </div>
    </section>
  );
}

// ─── O Que Você Recebe ────────────────────────────────────────────────────────
function OfferSection() {
  const partes = [
    {
      icon: <FileText size={24} />,
      selo: 'E-book em PDF',
      titulo: 'O livro completo',
      cor: '#448D76',
      itens: [
        'Banco de 2.298 preparações em 23 categorias, cada uma com o modo de preparo',
        'Onze capítulos de técnica de cozinha, planejamento, ficha técnica, custo e qualidade',
        'Glossário, calendário de sazonalidade e 4 cardápios completos',
        'Abre no celular, no tablet e no computador, e funciona sem internet',
      ],
    },
    {
      icon: <UtensilsCrossed size={24} />,
      selo: 'Acesso vitalício',
      titulo: 'O gerador de cardápio',
      cor: '#ED8627',
      itens: [
        'Você responde sete perguntas sobre o seu serviço',
        'Ele monta a semana usando apenas preparações do livro',
        'Respeita a safra do mês e varia ingredientes e métodos de cocção, como manda o capítulo VI',
        'Você abre o preparo de cada prato, troca o que quiser, salva e imprime',
      ],
    },
  ];

  return (
    <section id="oferta" className="py-16 md:py-24 bg-white relative overflow-hidden">
      <FloatingDecor className="top-[5%] -left-10 opacity-5 md:opacity-[0.07]" floatY={18} floatDuration={8} rotateRange={-8} delay={2}>
        <Ilustra n={7} w={400} h={380} tom="laranja" />
      </FloatingDecor>
      <FloatingDecor className="bottom-[-5%] -right-10 opacity-5 md:opacity-[0.07]" floatY={20} floatDuration={6} rotateRange={12} delay={0}>
        <Ilustra n={5} w={450} h={350} />
      </FloatingDecor>

      <div className="max-w-6xl mx-auto px-4 sm:px-5 relative z-10">
        <motion.div {...fadeUp} className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
          <span className="badge">O que você recebe</span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#448D76] leading-tight mt-4">
            Um livro para entender.<br />
            <span className="text-[#0C718B]">Um gerador para aplicar.</span>
          </h2>
          <p className="text-[#5A5A5A] text-base md:text-lg leading-relaxed mt-4">
            O método da Lúcia em duas formas: o livro que ensina a decidir, e a ferramenta que aplica
            essas decisões na sua semana.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {partes.map((parte, i) => (
            <motion.div
              key={parte.titulo}
              {...stagger(i * 0.12)}
              className="bg-[#EEF0D2]/50 border border-[#E2E5BE] rounded-2xl md:rounded-3xl p-6 md:p-9 flex flex-col"
            >
              <div className="flex items-center justify-between gap-3 mb-5">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl text-white flex items-center justify-center shadow-sm"
                  style={{ background: parte.cor }}
                >
                  {parte.icon}
                </div>
                <span
                  className="text-[11px] font-bold tracking-wider uppercase rounded-full px-3 py-1 bg-white border"
                  style={{ color: parte.cor, borderColor: parte.cor }}
                >
                  {parte.selo}
                </span>
              </div>
              <h3 className="font-serif text-[#0C718B] font-bold text-xl md:text-2xl mb-4">{parte.titulo}</h3>
              <ul className="space-y-3">
                {parte.itens.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: parte.cor }} />
                    <span className="text-[#5A5A5A] text-sm md:text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeUp}
          className="mt-6 md:mt-8 rounded-2xl md:rounded-3xl border border-dashed border-[#448D76]/40 p-5 md:p-7 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
        >
          <p className="text-[#5A5A5A] text-sm md:text-base leading-relaxed flex-1">
            <strong className="text-[#448D76]">Os dois conversam.</strong> O gerador não inventa pratos nem
            usa inteligência artificial: escolhe entre as 2.298 preparações do livro e mostra, prato a prato,
            qual regra da autora o colocou ali.
          </p>
          <CTAButton href="#checkout" size="md" className="w-full md:w-auto shrink-0 !py-3.5 !text-sm sm:!text-base">
            Quero os dois
          </CTAButton>
        </motion.div>
      </div>
    </section>
  );
}

// ─── O Gerador Em Ação ────────────────────────────────────────────────────────

// Semana real, montada pelo gerador em 06/10/2026: coletiva institucional, padrão
// médio, 200 refeições por dia, outubro, cozinha com forno, fritadeira e chapa.
const SEMANA_EXEMPLO = [
  {
    dia: 'Seg', nome: 'Segunda',
    pratos: [
      ['Entrada', 'Cenoura'],
      ['Prato principal', 'Costela ao molho de mostarda', 'braseado'],
      ['Acompanhamento', 'Acelga e repolho', 'frito'],
      ['Arroz', 'De maçã', 'refogado'],
      ['Feijão', 'Lentilha com batata', 'cozido'],
      ['Sobremesa', 'Banana'],
    ],
  },
  {
    dia: 'Ter', nome: 'Terça',
    pratos: [
      ['Entrada', 'Acelga chiffonade, abacaxi em cubos'],
      ['Prato principal', 'Filé de frango ao molho de laranja', 'grelhado'],
      ['Acompanhamento', 'Batata salsa ao vapor com ervas frescas', 'cozido'],
      ['Arroz', 'Com espinafre', 'refogado'],
      ['Feijão', 'Proteína de soja à Paris', 'gratinado'],
      ['Sobremesa', 'Mamão picado'],
    ],
  },
  {
    dia: 'Qua', nome: 'Quarta',
    pratos: [
      ['Entrada', 'Alface e escarola rasgadas'],
      ['Prato principal', 'Bacalhau com rúcula e tomate seco'],
      ['Acompanhamento', 'Abobrinha recheada', 'gratinado'],
      ['Arroz', 'Multicor', 'cozido'],
      ['Feijão', 'Revirado de feijão', 'grelhado'],
      ['Sobremesa', 'Maçã verde'],
    ],
  },
  {
    dia: 'Qui', nome: 'Quinta',
    pratos: [
      ['Entrada', 'Aipo e pepino em julienne, chicória chiffonade, agrião, ovo picado'],
      ['Prato principal', 'Lombo assado com maçã', 'assado'],
      ['Acompanhamento', 'Quiche de espinafre', 'refogado'],
      ['Arroz', 'Com cenoura e ervilha', 'cozido'],
      ['Feijão', 'Tutu de feijão', 'cozido'],
      ['Sobremesa', 'Suspiro com morango e chantili'],
    ],
  },
  {
    dia: 'Sex', nome: 'Sexta',
    pratos: [
      ['Entrada', 'Abobrinha e tomate em rodelas'],
      ['Prato principal', 'Língua ensopada com rodelas de cenoura e cebola', 'ensopado'],
      ['Acompanhamento', 'Creme de beterraba', 'cozido'],
      ['Arroz', 'À francesa', 'refogado'],
      ['Feijão', 'Feijão preto, carioca, fradinho e outros', 'cozido'],
      ['Sobremesa', 'Laranja'],
    ],
  },
];

const REGRAS_EXEMPLO = [
  ['3.7', 'Variedade de ingredientes', '5 pratos principais distintos'],
  ['3.2', 'Variedade de cocção', '1 fritura na semana'],
  ['3.1', 'Estação do ano', '26 pratos com ingrediente da safra'],
];

function GeradorDemo() {
  const [ativo, setAtivo] = useState(1);
  const dia = SEMANA_EXEMPLO[ativo];

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-[#E2E5BE] overflow-hidden">
      {/* Barra da janela */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E2E5BE] bg-[#F7F8EA]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#E2E5BE]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#E2E5BE]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#E2E5BE]" />
        <span className="ml-2 text-[11px] font-bold tracking-wider uppercase text-[#ED8627] truncate">
          Gerador de cardápio · Outubro
        </span>
      </div>

      <div className="p-4 sm:p-6">
        <p className="text-xs text-[#5A5A5A] mb-4">
          Coletiva institucional · Padrão médio · 200 refeições/dia
        </p>

        <div role="tablist" aria-label="Dias da semana" className="grid grid-cols-5 gap-1.5 mb-4">
          {SEMANA_EXEMPLO.map((d, i) => (
            <button
              key={d.dia}
              type="button"
              role="tab"
              aria-selected={i === ativo}
              aria-controls="demo-dia"
              onClick={() => setAtivo(i)}
              className={`rounded-lg py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                i === ativo
                  ? 'bg-[#448D76]/12 text-[#448D76] ring-1 ring-[#448D76]'
                  : 'bg-[#EEF0D2]/60 text-[#5A5A5A] hover:bg-[#EEF0D2]'
              }`}
            >
              {d.dia}
            </button>
          ))}
        </div>

        <ul id="demo-dia" role="tabpanel" aria-label={dia.nome} className="divide-y divide-[#E2E5BE]">
          {dia.pratos.map(([espaco, prato, coccao]) => (
            <li key={espaco} className="py-2.5 grid grid-cols-1 sm:grid-cols-[136px_1fr] gap-0.5 sm:gap-3 items-baseline">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#0C718B]">{espaco}</span>
              <span className="text-sm text-[#2D2D2D] leading-snug">
                {prato}
                {coccao && <span className="ml-2 text-[11px] text-[#ED8627] font-medium">{coccao}</span>}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-4 border-t border-[#E2E5BE] grid grid-cols-1 sm:grid-cols-3 gap-2">
          {REGRAS_EXEMPLO.map(([num, regra, resultado]) => (
            <div key={num} className="bg-[#EEF0D2]/50 rounded-lg px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#448D76]">
                {num} {regra}
              </div>
              <div className="text-xs text-[#5A5A5A] mt-0.5">{resultado}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GeneratorSection() {
  const passos = [
    {
      icon: <ClipboardList size={20} />,
      titulo: 'Conte como é o seu serviço',
      desc: 'Tipo de serviço, padrão, número de refeições, equipamentos, composição, restrições e o mês.',
    },
    {
      icon: <CalendarDays size={20} />,
      titulo: 'Receba a semana montada',
      desc: 'Entrada, prato principal, acompanhamento, arroz, feijão e sobremesa, escolhidos entre as preparações do livro.',
    },
    {
      icon: <Printer size={20} />,
      titulo: 'Ajuste e use',
      desc: 'Abra o preparo de qualquer prato, veja por que ele entrou ali, troque por outro do livro, salve ou imprima.',
    },
  ];

  return (
    <section id="gerador" className="py-16 md:py-24 bg-[#EEF0D2]/40 border-y border-[#E2E5BE] relative overflow-hidden">
      <FloatingDecor className="top-[10%] -right-16 opacity-5 md:opacity-[0.07] hidden md:block" floatY={15} floatDuration={7} rotateRange={-6} delay={0.5}>
        <Ilustra n={1} w={380} tom="azul" />
      </FloatingDecor>

      <div className="max-w-6xl mx-auto px-4 sm:px-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div {...fadeUp} className="space-y-6">
            <span className="badge">O gerador em ação</span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#448D76] leading-tight">
              Sete perguntas.<br />
              <span className="text-[#0C718B]">Uma semana inteira.</span>
            </h2>
            <p className="text-[#5A5A5A] text-base md:text-lg leading-relaxed">
              As perguntas são os fatores de planejamento do capítulo VI. A partir das suas respostas, o
              gerador distribui os pratos seguindo as regras de composição da autora.
            </p>

            <ol className="space-y-4">
              {passos.map((passo, i) => (
                <li key={passo.titulo} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#ED8627] shrink-0">
                    {passo.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-[#0C718B] font-bold text-lg leading-tight">
                      <span className="text-[#ED8627] mr-1.5">{String(i + 1).padStart(2, '0')}</span>
                      {passo.titulo}
                    </h3>
                    <p className="text-[#5A5A5A] text-sm leading-relaxed mt-1">{passo.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div {...stagger(0.2)}>
            <GeradorDemo />
            <p className="text-xs text-[#5A5A5A] mt-3 text-center leading-relaxed">
              Semana real montada pelo gerador. Toque nos dias para ver cada um.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Dentro do Livro ──────────────────────────────────────────────────────────
function ContentsSection() {
  const partes = [
    {
      icon: <Salad size={22} />,
      capitulos: 'Capítulos I a IV',
      titulo: 'Fundamentos e técnica de cozinha',
      resumo: 'Como o alimento se comporta antes de virar preparação.',
      topicos: [
        'Dimensões da qualidade',
        'Tipologia de UANs',
        'Processo produtivo',
        'Pré-preparo de vegetais e frutas',
        'Cortes clássicos',
        'Empanar e marinar',
        'Ervas e especiarias',
        'Fundos e agentes de ligação',
        'Molhos',
        'Métodos de cocção',
      ],
    },
    {
      icon: <ClipboardList size={22} />,
      capitulos: 'Capítulos V a IX',
      titulo: 'Planejamento, custo e qualidade',
      resumo: 'O método que transforma preparações soltas em cardápio. É dele que o gerador tira as regras.',
      topicos: [
        'Fatores de planejamento',
        'Planejamento horizontal',
        'Planejamento cíclico',
        'Composição do cardápio',
        'Tipos de cardápio para UAN',
        'Monitoramento da qualidade',
        'Consultoria e assessoria',
        'Receituário padrão',
        'Ficha técnica (FTP)',
        'Indicadores culinários',
      ],
    },
    {
      icon: <BookOpen size={22} />,
      capitulos: 'Capítulo X',
      titulo: 'Banco de 2.298 preparações',
      resumo: 'Cada uma com a descrição do modo de preparo, em 23 categorias. É o acervo de onde o gerador escolhe.',
      topicos: [
        'Carne bovina',
        'Aves',
        'Suína',
        'Peixes e frutos do mar',
        'Embutidos',
        'Ovos',
        'Leguminosas',
        'Arroz',
        'Massas',
        'Molhos quentes e frios',
        'Sopas',
        'Saladas',
        'Sobremesas',
        'Preparações regionais',
      ],
    },
    {
      icon: <CalendarDays size={22} />,
      capitulos: 'Capítulo XI e anexos',
      titulo: 'Consulta rápida no expediente',
      resumo: 'O que você consulta no meio da correria, para tirar uma dúvida.',
      topicos: [
        'Glossário de técnica dietética',
        'Termos da culinária internacional',
        'Classificação de vegetais',
        'Calendário de sazonalidade',
        'Datas comemorativas',
        '4 cardápios completos',
        'Referências',
      ],
    },
  ];

  return (
    <section id="conteudo" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        <motion.div {...fadeUp} className="text-center mb-10 md:mb-14">
          <span className="badge">Dentro do livro</span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#448D76] leading-tight mt-4">
            Da técnica de cozinha ao cardápio fechado.
          </h2>
          <p className="text-[#5A5A5A] text-sm md:text-base leading-relaxed mt-4 max-w-2xl mx-auto">
            Onze capítulos e três anexos, organizados na ordem em que a decisão acontece:
            entender o alimento, dominar a técnica, planejar o cardápio e controlar o resultado.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {partes.map((parte, i) => (
            <motion.div
              key={parte.titulo}
              {...stagger(i * 0.1)}
              className="bg-[#EEF0D2]/40 border border-[#E2E5BE] rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col"
            >
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#448D76] shrink-0">
                  {parte.icon}
                </div>
                <div>
                  <div className="text-[#ED8627] text-[11px] font-bold tracking-wider uppercase mb-0.5">
                    {parte.capitulos}
                  </div>
                  <h3 className="font-serif text-[#0C718B] font-bold text-lg md:text-xl leading-tight">
                    {parte.titulo}
                  </h3>
                </div>
              </div>

              <p className="text-[#5A5A5A] text-sm leading-relaxed mb-5">{parte.resumo}</p>

              <ul className="flex flex-wrap gap-2">
                {parte.topicos.map(topico => (
                  <li
                    key={topico}
                    className="bg-white border border-[#E2E5BE] text-[#448D76] text-xs font-medium rounded-full px-3 py-1.5"
                  >
                    {topico}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p {...fadeUp} className="text-center text-[#5A5A5A] text-sm md:text-base mt-10 max-w-2xl mx-auto leading-relaxed">
          Todo o conteúdo é ancorado no <strong className="text-[#448D76]">Guia Alimentar para a
          População Brasileira</strong>: comida de verdade, ingredientes in natura e minimamente
          processados, e preparações culturalmente reconhecíveis por quem come.
        </motion.p>
      </div>
    </section>
  );
}

// ─── About Author Section ─────────────────────────────────────────────────────
function AboutAuthorSection() {
  const numeros = [
    ['21 anos', 'de prática em vários tipos de UAN'],
    ['17+ anos', 'entre sala de aula e direção acadêmica'],
  ];

  return (
    <section id="autora" className="py-16 md:py-24 bg-[#EEF0D2] relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-[#0C718B]/4 pointer-events-none" />

      <FloatingDecor className="top-[5%] -left-[5%] opacity-5 md:opacity-10 hidden md:block" floatY={15} floatDuration={7} rotateRange={8} delay={0}>
        <Ilustra n={4} w={300} h={350} tom="laranja" />
      </FloatingDecor>
      <FloatingDecor className="bottom-[10%] -right-10 opacity-5 md:opacity-10" floatY={20} floatDuration={9} rotateRange={-10} delay={1}>
        <Ilustra n={2} w={450} tom="azul" />
      </FloatingDecor>
      <FloatingDecor className="top-[30%] -right-20 opacity-[0.07] md:opacity-[0.12]" floatY={18} floatDuration={6.5} rotateRange={5} delay={0.5}>
        <Ilustra n={8} w={380} h={320} />
      </FloatingDecor>
      <FloatingDecor className="bottom-[5%] -left-[10%] opacity-5 md:opacity-[0.07]" floatY={22} floatDuration={8} rotateRange={-8} delay={1.8}>
        <Ilustra n={1} w={350} tom="azul" />
      </FloatingDecor>

      <div className="max-w-5xl mx-auto px-4 sm:px-5">
        <motion.div {...fadeUp} className="text-center mb-10 md:mb-12">
          <span className="badge mb-3 inline-block">Sobre a Autora</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl max-w-xs sm:max-w-sm md:max-w-md mx-auto">
              <img
                src="/lucia-borges.jpeg"
                alt="Lúcia Chaise Borjes - Autora do Cardápios: Um Livro Vivo"
                className="w-full object-cover"
                style={{ aspectRatio: '4/5' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.style.background = 'linear-gradient(135deg, #448D76 0%, #2d7a78 100%)';
                  e.target.parentNode.style.minHeight = '400px';
                  e.target.parentNode.style.display = 'flex';
                  e.target.parentNode.style.alignItems = 'center';
                  e.target.parentNode.style.justifyContent = 'center';
                  const div = document.createElement('div');
                  div.innerHTML = '<div style="text-align:center;color:white"><div style="font-size:80px">👩‍🍳</div><div style="font-family:serif;font-size:1.5rem;font-weight:bold;margin-top:16px">Lúcia Chaise Borjes</div><div style="opacity:0.7;margin-top:8px">Nutricionista</div></div>';
                  e.target.parentNode.appendChild(div);
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#448D76]/80 to-transparent p-4 md:p-6">
                <div className="text-white font-serif text-lg md:text-xl font-bold">Lúcia Chaise Borjes</div>
                <div className="text-white/80 text-xs md:text-sm mt-1">Nutricionista · Alimentação coletiva e docência</div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-2 md:-right-4 top-10 md:top-12 bg-[#D4A373] text-white rounded-xl md:rounded-2xl p-2.5 md:p-3 shadow-xl"
            >
              <div className="text-xs md:text-sm font-bold">21 anos</div>
              <div className="text-[10px] md:text-xs opacity-90">de prática</div>
            </motion.div>
          </motion.div>

          <motion.div {...stagger(0.2)} className="relative mt-4 md:mt-0">
            <div className="absolute -top-8 -left-3 text-[80px] md:text-[120px] font-serif leading-none text-[#0C718B]/10 pointer-events-none select-none z-0">
              “
            </div>

            <div className="relative z-10 space-y-3 border-l-[3px] border-[#ED8627] pl-4 md:pl-5 py-1">
              <p className="text-[#448D76] text-sm sm:text-base md:text-lg leading-relaxed italic">
                “Me chamo Lúcia Chaise Borjes, sou nutricionista e tenho 21 anos de prática, vividos em
                vários tipos de Unidade de Alimentação e Nutrição: hospitais, empresas e restaurantes.
              </p>
              <p className="text-[#448D76] text-sm sm:text-base md:text-lg leading-relaxed italic">
                Por mais de 17 anos, também estive na sala de aula, na pesquisa e na direção acadêmica.
              </p>
              <p className="text-[#448D76] text-sm sm:text-base md:text-lg leading-relaxed italic">
                Foi desse encontro entre a cozinha e a academia que nasceu 'Cardápios: um livro vivo'.
              </p>
              <p className="text-[#448D76] text-sm sm:text-base md:text-lg leading-relaxed italic font-medium">
                Um livro pensado para profissionais que querem enxergar o alimento com novos olhos.”
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-3 mt-6">
              {numeros.map(([valor, rotulo]) => (
                <div key={valor} className="bg-white/70 border border-[#E2E5BE] rounded-xl px-4 py-3">
                  <div className="font-serif font-bold text-[#0C718B] text-2xl leading-none">{valor}</div>
                  <div className="text-[#5A5A5A] text-xs mt-1.5 leading-snug">{rotulo}</div>
                </div>
              ))}
            </div>

            <div className="pt-6 relative z-10">
              <p className="text-[#5A5A5A] font-medium text-sm md:text-base mb-4">
                Vem comigo transformar a forma de fazer seu planejamento?
              </p>
              <CTAButton href="#checkout" size="md" className="w-full sm:w-fit shadow-lg shadow-[#ED8627]/20 !py-3.5 !text-sm sm:!py-4 sm:!text-base">
                Quero conhecer o Livro Vivo
              </CTAButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Um Livro Que Cresce ──────────────────────────────────────────────────────
function GrowingBookSection() {
  const passos = [
    {
      icon: <MessageSquarePlus size={22} />,
      titulo: 'Você pede',
      desc: 'Na sua área de acesso há um espaço para sugerir uma pesquisa: uma categoria de preparação, um tipo de serviço, uma técnica.',
    },
    {
      icon: <Search size={22} />,
      titulo: 'A autora pesquisa',
      desc: 'A Lúcia avalia cada pedido com o mesmo rigor técnico do resto do livro e decide o que entra.',
    },
    {
      icon: <RefreshCw size={22} />,
      titulo: 'O livro ganha uma edição',
      desc: 'Quando um tema novo entra, a nova edição chega para você sem pagar de novo.',
    },
  ];

  return (
    <section id="livro-vivo" className="py-16 md:py-24 bg-white relative overflow-hidden">
      <FloatingDecor className="bottom-[5%] -left-16 opacity-5 md:opacity-[0.07] hidden md:block" floatY={18} floatDuration={8} rotateRange={6} delay={0.4}>
        <Ilustra n={6} w={380} tom="laranja" />
      </FloatingDecor>

      <div className="max-w-6xl mx-auto px-4 sm:px-5 relative z-10">
        <motion.div {...fadeUp} className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
          <span className="badge">Por que "livro vivo"</span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#448D76] leading-tight mt-4">
            Sentiu falta de um tema?<br />
            <span className="text-[#0C718B]">Peça para a autora.</span>
          </h2>
          <p className="text-[#5A5A5A] text-base md:text-lg leading-relaxed mt-4">
            O livro cresce com as necessidades de quem usa. Você pode pedir pesquisas específicas, e a
            autora pode incluí-las nas próximas edições.
          </p>
        </motion.div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {passos.map((passo, i) => (
            <motion.li
              key={passo.titulo}
              {...stagger(i * 0.12)}
              className="bg-[#EEF0D2]/50 border border-[#E2E5BE] rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#ED8627] shrink-0">
                  {passo.icon}
                </div>
                <span className="font-serif font-bold text-[#ED8627] text-2xl leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="font-serif text-[#0C718B] font-bold text-lg md:text-xl">{passo.titulo}</h3>
              <p className="text-[#5A5A5A] text-sm leading-relaxed">{passo.desc}</p>
            </motion.li>
          ))}
        </ol>

        <motion.p {...fadeUp} className="text-center text-xs md:text-sm text-[#5A5A5A] mt-8 max-w-2xl mx-auto leading-relaxed">
          Cada pedido é avaliado pela autora. Nem todo tema entra no livro, e cada pesquisa leva o tempo
          que o rigor técnico pede.
        </motion.p>
      </div>
    </section>
  );
}

// ─── Como Você Recebe ─────────────────────────────────────────────────────────
function DeliverySection() {
  const passos = [
    {
      icon: <CreditCard size={24} />,
      titulo: 'Você compra',
      desc: 'Pagamento único e seguro pela Cakto: R$ 120 à vista ou em até 12x de R$ 10 no cartão.',
    },
    {
      icon: <Mail size={24} />,
      titulo: 'Recebe o seu acesso',
      desc: 'Assim que o pagamento é confirmado, as instruções para entrar na sua área chegam no e-mail da compra.',
    },
    {
      icon: <UtensilsCrossed size={24} />,
      titulo: 'Baixa o livro e monta a semana',
      desc: 'Na mesma área você baixa o PDF completo e usa o gerador quando quiser. As novas edições aparecem ali.',
    },
  ];

  return (
    <section id="entrega" className="py-16 md:py-24 bg-[#EEF0D2]/40 border-y border-[#E2E5BE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        <motion.div {...fadeUp} className="text-center mb-10 md:mb-14">
          <span className="badge">Como funciona a entrega</span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#448D76] leading-tight mt-4">
            Uma compra, um acesso,<br className="hidden sm:block" /> o livro e o gerador.
          </h2>
        </motion.div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {passos.map((passo, i) => (
            <motion.li
              key={passo.titulo}
              {...stagger(i * 0.12)}
              className="bg-white border border-[#E2E5BE] rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#EEF0D2] flex items-center justify-center text-[#448D76] shrink-0">
                  {passo.icon}
                </div>
                <span className="font-serif font-bold text-[#ED8627] text-2xl leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="font-serif text-[#0C718B] font-bold text-lg md:text-xl">{passo.titulo}</h3>
              <p className="text-[#5A5A5A] text-sm leading-relaxed">{passo.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── Checkout / CTA Section ───────────────────────────────────────────────────
const INCLUIDO = [
  {
    grupo: 'Livro em PDF',
    itens: [
      'Banco com 2.298 preparações em 23 categorias',
      'Onze capítulos de técnica, planejamento e controle de qualidade',
      'Ficha técnica de preparação e indicadores culinários',
      'Glossário, calendário de sazonalidade e 4 cardápios completos',
      'Novas edições incluídas',
    ],
  },
  {
    grupo: 'Gerador de cardápio',
    itens: [
      'Acesso vitalício',
      'Semana montada com as regras de composição do livro',
      'Troca de pratos, preparo de cada um, salvar e imprimir',
      'Espaço para pedir pesquisas à autora',
    ],
  },
];

function CheckoutSection() {
  return (
    <section id="checkout" className="py-16 md:py-24 bg-[#E2E5BE] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 0L1440 0L1440 30Q720 80 0 30Z" fill="#EEF0D2"/>
        </svg>
        <svg className="absolute bottom-0 left-0 w-full rotate-180" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 0L1440 0L1440 30Q720 80 0 30Z" fill="#EEF0D2"/>
        </svg>

        <FloatingDecor className="top-[10%] -left-[5%] opacity-5 md:opacity-[0.07]" floatY={20} floatDuration={7} rotateRange={10} delay={0.5}>
          <Ilustra n={9} w={400} h={350} />
        </FloatingDecor>
        <FloatingDecor className="bottom-[10%] -right-[5%] opacity-5 md:opacity-[0.07]" floatY={18} floatDuration={8} rotateRange={-8} delay={1.2}>
          <Ilustra n={1} w={420} tom="azul" />
        </FloatingDecor>
        <FloatingDecor className="bottom-[30%] -left-[10%] opacity-5 md:opacity-[0.07] hidden md:block" floatY={22} floatDuration={6.5} rotateRange={6} delay={0.8}>
          <Ilustra n={7} w={350} h={300} tom="laranja" />
        </FloatingDecor>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-5 relative z-10">
        <motion.div
          {...fadeUp}
          className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-10 md:p-14 text-center border border-[#E2E5BE]"
        >
          <div className="inline-flex items-center gap-2 bg-[#ED8627] text-white rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold mb-5 md:mb-7">
            <span>✦</span>
            <span>Oferta de Lançamento</span>
            <span>✦</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#448D76] leading-tight mb-3 md:mb-4">
            O livro completo e o gerador de cardápio
          </h2>

          <p className="text-[#5A5A5A] mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
            O e-book completo em PDF, com <strong className="text-[#448D76]">2.298 preparações</strong> e onze
            capítulos de método, mais o gerador de cardápio, que monta a semana do seu serviço
            com as regras do livro.
          </p>

          <div className="bg-[#EEF0D2] rounded-xl md:rounded-2xl p-6 md:p-8 mb-6 md:mb-8 border border-[#E2E5BE]">
            <div className="text-[#5A5A5A] text-sm md:text-base">
              de <s>R$ 160,00</s> por
            </div>
            <div className="flex items-end justify-center gap-1.5 md:gap-2 mt-1">
              <span className="text-[#5A5A5A] text-base md:text-lg font-semibold mb-1.5 md:mb-2">R$</span>
              <span className="font-serif text-5xl sm:text-6xl font-bold text-[#448D76] leading-none">120</span>
              <span className="text-[#5A5A5A] text-base md:text-lg mb-1.5 md:mb-2">,00</span>
            </div>
            <div className="text-gray-500 text-sm mt-3">
              ou em até 12x de R$ 10 no cartão
            </div>
            <div className="inline-block bg-white text-[#0C718B] text-xs font-semibold rounded-full px-3 py-1 mt-3 border border-[#E2E5BE]">
              Pagamento único, não é assinatura
            </div>
          </div>

          <div className="text-left mb-6 md:mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {INCLUIDO.map(({ grupo, itens }) => (
              <div key={grupo}>
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#ED8627] mb-3">{grupo}</div>
                <ul className="space-y-2.5">
                  {itens.map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 size={17} className="text-[#0C718B] mt-0.5 flex-shrink-0" />
                      <span className="text-[#5A5A5A] text-sm leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <CTAButton
            href={CHECKOUT_URL}
            size="lg"
            className="w-full flex items-center justify-center gap-2 !py-3.5 !text-sm sm:!py-4 sm:!text-base md:!text-lg !tracking-wide"
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              Garantir Meu Acesso Agora <ExternalLink size={18} className="inline-block flex-shrink-0" />
            </span>
          </CTAButton>

          <p className="text-xs text-gray-400 mt-5 text-center leading-relaxed">
            🔒 Compra 100% segura · Processado pela Cakto · 7 dias de garantia
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Perguntas Frequentes ─────────────────────────────────────────────────────
const PERGUNTAS = [
  [
    'É uma assinatura?',
    'Não. Você paga uma vez, R$ 120 à vista ou em até 12x de R$ 10 no cartão, e não existe cobrança mensal depois disso.',
  ],
  [
    'Por quanto tempo posso usar o gerador?',
    'O acesso ao gerador é vitalício. O PDF, depois de baixado, é seu.',
  ],
  [
    'O gerador usa inteligência artificial?',
    'Não. Ele segue as regras de composição do capítulo VI e escolhe apenas entre as 2.298 preparações do livro. Não inventa pratos nem consulta a internet para decidir.',
  ],
  [
    'Serve para o meu tipo de serviço?',
    'O gerador foi pensado para quatro perfis: coletiva institucional (empresa, indústria, hospital), bufê por peso, escola ou creche e casa de repouso. O livro cobre os tipos de cardápio para UAN comercial e coletiva.',
  ],
  [
    'Funciona no celular?',
    'Sim. O PDF abre no celular, no tablet e no computador, e funciona sem internet. O gerador roda no navegador de qualquer um desses aparelhos, com internet.',
  ],
  [
    'Os cardápios que eu montar ficam salvos?',
    'Ficam guardados no navegador do aparelho em que você montou. Você também pode imprimir cada semana.',
  ],
  [
    'Como funciona o pedido de pesquisa?',
    'Na sua área de acesso há um formulário para sugerir temas. A autora avalia cada pedido e pode incluir o assunto numa próxima edição, que chega para você sem custo.',
  ],
  [
    'E se não for o que eu esperava?',
    'Você tem 7 dias de garantia. É só pedir o reembolso pela Cakto dentro desse prazo.',
  ],
];

function FaqSection() {
  return (
    <section id="perguntas" className="py-16 md:py-24 bg-[#EEF0D2]">
      <div className="max-w-3xl mx-auto px-4 sm:px-5">
        <motion.div {...fadeUp} className="text-center mb-10 md:mb-12">
          <span className="badge">Perguntas frequentes</span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#448D76] leading-tight mt-4">
            Antes de você decidir
          </h2>
        </motion.div>

        <div className="space-y-3">
          {PERGUNTAS.map(([pergunta, resposta]) => (
            <details
              key={pergunta}
              className="group bg-white border border-[#E2E5BE] rounded-2xl open:shadow-md transition-shadow"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 md:px-6 py-4 md:py-5 font-serif font-bold text-[#0C718B] text-base md:text-lg [&::-webkit-details-marker]:hidden">
                {pergunta}
                <ChevronDown size={20} className="text-[#ED8627] shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="px-5 md:px-6 pb-5 -mt-1 text-[#5A5A5A] text-sm md:text-base leading-relaxed">
                {resposta}
              </p>
            </details>
          ))}
        </div>

        <motion.div {...fadeUp} className="text-center mt-10">
          <CTAButton href="#checkout" size="md" className="w-full sm:w-fit !py-3.5 !text-sm sm:!py-4 sm:!text-base">
            Quero o livro e o gerador
          </CTAButton>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0C718B] text-white/60 py-10 text-center">
      <div className="max-w-4xl mx-auto px-5">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Leaf size={18} className="text-[#ED8627]" />
          <span className="font-serif font-bold text-white text-lg">Cardápios: Um Livro Vivo</span>
        </div>
        <p className="text-sm mb-2">Desenvolvido por <strong className="text-white/80">Lúcia Chaise Borjes</strong> · Nutricionista</p>
        <p className="text-xs">
          © {new Date().getFullYear()} Cardápios: Um Livro Vivo. Todos os direitos reservados.
        </p>
        <div className="mt-4 text-xs space-x-4">
          <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
          <span>·</span>
          <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <TickerBanner />
      <Navbar />
      <main>
        <HeroSection />
        <PainPointsSection />
        <OfferSection />
        <GeneratorSection />
        <ContentsSection />
        <AboutAuthorSection />
        <GrowingBookSection />
        <DeliverySection />
        <CheckoutSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
