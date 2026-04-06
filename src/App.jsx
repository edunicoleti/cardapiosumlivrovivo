import { motion, AnimatePresence } from 'framer-motion';
import { CTAButton } from './components/CTAButton';
import { FeatureCard } from './components/FeatureCard';
import {
  Clock, TrendingDown, ShieldAlert, CheckCircle2, Smartphone,
  RefreshCw, BookOpen, Star, ChevronDown, Leaf, ExternalLink
} from 'lucide-react';

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

// ─── Decorative SVG Illustrations ────────────────────────────────────────────

// Pimenta (Chili)
function SvgChili({ color = '#ED8627', size = 120, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 140" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M70 10 C75 5 85 8 82 15 C80 20 72 18 70 10Z" fill={color} opacity="0.9"/>
      <path d="M70 18 C65 35 50 60 38 85 C28 105 30 125 45 128 C60 131 72 115 78 95 C85 72 82 45 70 18Z" fill={color} opacity="0.85"/>
      <path d="M68 20 C60 38 48 62 40 88 C35 108 38 122 46 127" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" fill="none"/>
      <path d="M72 30 C78 40 80 55 77 70" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" fill="none"/>
    </svg>
  );
}

// Erva / Planta floral
function SvgHerb({ color = '#448D76', size = 130, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M65 120 C65 120 60 90 55 70 C48 45 30 30 20 20 C35 28 52 40 62 65" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M65 120 C65 120 70 90 75 70 C82 45 100 30 110 20 C95 28 78 40 68 65" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M65 100 C65 100 58 78 48 65 C38 52 22 48 12 45 C28 50 45 58 58 72" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M65 100 C65 100 72 78 82 65 C92 52 108 48 118 45 C102 50 85 58 72 72" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="20" cy="20" r="7" fill={color} opacity="0.9"/>
      <circle cx="110" cy="20" r="7" fill={color} opacity="0.9"/>
      <circle cx="12" cy="45" r="5" fill={color} opacity="0.8"/>
      <circle cx="118" cy="45" r="5" fill={color} opacity="0.8"/>
      <circle cx="65" cy="120" r="4" fill={color} opacity="0.7"/>
    </svg>
  );
}

// Folha / Ramo
function SvgLeafBranch({ color = '#0C718B', size = 150, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 90" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M10 75 C40 70 80 55 150 15" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M40 68 C38 55 42 42 52 35 C48 48 44 60 47 70Z" fill={color} opacity="0.85"/>
      <path d="M65 58 C62 44 67 30 78 22 C73 36 68 50 72 60Z" fill={color} opacity="0.85"/>
      <path d="M88 46 C86 32 92 18 103 10 C97 24 92 38 97 48Z" fill={color} opacity="0.85"/>
      <path d="M110 32 C109 19 116 6 127 0 C120 13 115 27 121 36Z" fill={color} opacity="0.8"/>
      <path d="M40 68 C35 58 28 52 20 55 C28 54 38 58 42 68Z" fill={color} opacity="0.7"/>
      <path d="M65 58 C60 48 52 43 44 46 C52 44 62 49 66 59Z" fill={color} opacity="0.7"/>
    </svg>
  );
}

// Talheres (faca, colher, garfo)
function SvgCutlery({ color = '#ED8627', size = 80, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 140" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Knife */}
      <path d="M12 10 L12 90" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M12 10 C12 10 22 20 22 40 C22 55 12 60 12 60" fill={color} opacity="0.85"/>
      {/* Spoon */}
      <path d="M40 45 L40 90" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="40" cy="28" rx="9" ry="18" fill={color} opacity="0.85"/>
      {/* Fork */}
      <path d="M68 45 L68 90" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M61 10 L61 38" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M65 10 L65 38" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M68 10 L68 38" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M72 10 L72 38" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M61 38 C61 44 75 44 75 38" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  );
}

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

// ─── Ticker Banner ────────────────────────────────────────────────────────────
function TickerBanner() {
  const items = Array(12).fill('✦ Lançamento Oficial · Cardápios: Um Livro Vivo · Notion · Nutricionistas ');
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
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-[18px] sm:w-[22px] h-[18px] sm:h-[22px] object-contain" />
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
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col pt-16 bg-[#EEF0D2] overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#0C718B]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-[#ED8627]/8 blur-3xl pointer-events-none" />

      {/* Decorative Illustrations from book identity - MAIORES E MAIS DENSOS */}
      <FloatingDecor className="top-[5%] -right-[5%] opacity-5 md:opacity-10" floatY={20} floatDuration={6} rotateRange={7} delay={0}>
        <img src="/id-visual-livro-vivo-01.svg" alt="" style={{ width: 450, height: 450, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[20%] -left-[10%] opacity-[0.07] md:opacity-[0.12]" floatY={15} floatDuration={8} rotateRange={-9} delay={0.5}>
        <img src="/id-visual-livro-vivo-08.svg" alt="" style={{ width: 400, height: 380, filter: 'brightness(0) saturate(100%) invert(51%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(95%)' }} />
      </FloatingDecor>
      <FloatingDecor className="bottom-[10%] -left-[5%] opacity-5 md:opacity-10" floatY={18} floatDuration={7} rotateRange={-6} delay={1}>
        <img src="/id-visual-livro-vivo-06.svg" alt="" style={{ width: 480, height: 480, filter: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="bottom-[25%] -right-[15%] opacity-5 md:opacity-[0.07]" floatY={25} floatDuration={6.5} rotateRange={8} delay={1.5}>
        <img src="/id-visual-livro-vivo-09.svg" alt="" style={{ width: 450, height: 400, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[45%] -left-[20%] opacity-5 md:opacity-10 hidden md:block" floatY={14} floatDuration={9} rotateRange={5} delay={2}>
        <img src="/id-visual-livro-vivo-02.svg" alt="" style={{ width: 350, height: 350, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[40%] right-[10%] opacity-[0.025] md:opacity-5 hidden lg:block" floatY={16} floatDuration={7.5} rotateRange={-5} delay={0.8}>
        <img src="/id-visual-livro-vivo-04.svg" alt="" style={{ width: 300, height: 350, filter: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="bottom-[5%] left-[25%] opacity-[0.025] md:opacity-[0.07] hidden xl:block" floatY={12} floatDuration={8.5} rotateRange={12} delay={2.2}>
        <img src="/id-visual-livro-vivo-05.svg" alt="" style={{ width: 380, height: 280, filter: 'brightness(0) saturate(100%) invert(51%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(95%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[60%] right-[-10%] opacity-5 md:opacity-10 hidden md:block" floatY={22} floatDuration={10} rotateRange={10} delay={1.2}>
        <img src="/id-visual-livro-vivo-07.svg" alt="" style={{ width: 420, height: 400, filter: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)' }} />
      </FloatingDecor>

      <div className="max-w-6xl mx-auto px-4 sm:px-5 flex-1 flex flex-col justify-center pt-2 pb-10 sm:py-16 md:py-24">

        {/* ── MOBILE LAYOUT: mockup on top, text below ─────────────────────── */}
        <div className="flex lg:hidden flex-col gap-10">

          {/* Mobile Mockup — top */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex justify-center relative"
          >
            {/* Extra horizontal space for floating badges */}
            <div className="relative mx-auto mt-2 mb-6" style={{ width: '100%', maxWidth: '320px' }}>
              <img
                src="/livro-vivo.png"
                alt="Mockup do Cardápios: Um Livro Vivo"
                className="w-full h-auto drop-shadow-[0_16px_40px_rgba(27,77,75,0.4)] object-contain scale-[1.35]"
              />

              {/* Floating Notion icon — top-right edge overlapping book */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-4 sm:right-2 top-[12%] bg-white rounded-[14px] p-2 shadow-2xl border border-[#E2E5BE] z-30"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                  alt="Notion"
                  className="w-7 h-7 object-contain"
                />
              </motion.div>
              
              {/* Floating badge — left side overlapping */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="absolute left-2 sm:-left-3 top-[55%] bg-white text-[#ED8627] rounded-xl px-3 py-2 shadow-xl border border-[#E2E5BE] z-20"
              >
                <div className="text-xs font-bold whitespace-nowrap">+2.000 Receitas</div>
              </motion.div>

              {/* Floating badge — bottom-right */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute right-3 sm:-right-2 bottom-[6%] bg-white text-[#0C718B] rounded-xl px-3 py-2 shadow-xl border border-[#E2E5BE] z-20"
              >
                <div className="text-xs font-bold whitespace-nowrap">♾️ Atualização</div>
                <div className="text-[10px] text-gray-500">Vitalícia</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile Text */}
          <motion.div {...stagger(0)} className="space-y-5">
            <motion.div {...stagger(0.1)}>
              <span className="badge">📚 E-book Digital no Notion</span>
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
              Decisões que impactam custo, equipe, tempo e qualidade. O <strong className="text-[#448D76]">Cardápios: Um Livro Vivo</strong> é uma ferramenta de apoio contínuo para quem leva planejamento alimentar a sério!
            </motion.p>

            <motion.div {...stagger(0.4)}>
              <CTAButton href="#checkout" size="lg" className="w-full text-center !py-3.5 !text-sm sm:!py-4 sm:!text-base">
                🚀 Quero Acesso ao Livro Vivo
              </CTAButton>
            </motion.div>

            <motion.div {...stagger(0.5)} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {[
                { icon: '⚡', text: 'Acesso Imediato' },
                { icon: '♾️', text: 'Atualização Vitalícia' },
                { icon: '🔒', text: 'Compra Segura' },
              ].map(({ icon, text }) => (
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

          {/* Left: Text */}
          <motion.div {...stagger(0)} className="space-y-7">
            <motion.div {...stagger(0.1)}>
              <span className="badge">📚 E-book Digital no Notion</span>
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
              Decisões que impactam custo, equipe, tempo e qualidade. O <strong className="text-[#448D76]">Cardápios: Um Livro Vivo</strong> é uma ferramenta de apoio contínuo para quem leva planejamento alimentar a sério!
            </motion.p>

            <motion.div {...stagger(0.4)} className="flex gap-4 items-start">
              <CTAButton href="#checkout" size="lg">
                🚀 Quero Acesso ao Livro Vivo
              </CTAButton>
            </motion.div>

            <motion.div {...stagger(0.5)} className="flex items-center gap-6 pt-2">
              {[
                { icon: '⚡', text: 'Acesso Imediato' },
                { icon: '♾️', text: 'Atualização Vitalícia' },
                { icon: '🔒', text: 'Compra Segura' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-[#5A5A5A]">
                  <span>{icon}</span>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Mockup */}
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

              {/* Floating Notion Icon */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-4 lg:right-[15%] top-[20%] bg-white rounded-[18px] p-3 shadow-2xl border border-[#E2E5BE] flex items-center justify-center z-30"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                  alt="Notion"
                  className="w-12 h-12 object-contain"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute right-0 bottom-[10%] bg-white text-[#0C718B] rounded-2xl p-4 shadow-xl border border-[#E2E5BE] z-20"
              >
                <div className="text-base font-bold">♾️ Atualização</div>
                <div className="text-sm text-gray-500">Vitalícia</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue - hidden on very small screens */}
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
  const pains = [
    {
      icon: <Clock size={26} />,
      title: 'Falta de Tempo',
      description:
        'Criar cardápios do zero consome horas preciosas. Você passa mais tempo planilhando do que inovando no atendimento e na cozinha.',
    },
    {
      icon: <TrendingDown size={26} />,
      title: 'Desperdício na Produção',
      description:
        'Sem um sistema integrado, o reaproveitamento de ingredientes fica perdido. O desperdício aumenta e a margem diminui a cada ciclo.',
    },
    {
      icon: <ShieldAlert size={26} />,
      title: 'Insegurança Técnica',
      description:
        'Atualizar receitas com base em novas diretrizes técnicas é trabalhoso. Você teme que informações desatualizadas comprometam sua credibilidade.',
    },
  ];

  return (
    <section id="dores" className="py-16 md:py-24 bg-[#EEF0D2] relative overflow-hidden">
      {/* Decorative illustrations - MAIORES E MAIS DENSOS */}
      <FloatingDecor className="-top-10 -right-16 opacity-5 md:opacity-10 hidden md:block" floatY={15} floatDuration={7} rotateRange={10} delay={0.5}>
        <img src="/id-visual-livro-vivo-03.svg" alt="" style={{ width: 350, height: 350, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[20%] left-[-5%] opacity-[0.07] md:opacity-[0.12]" floatY={12} floatDuration={6} rotateRange={6} delay={0.8}>
        <img src="/id-visual-livro-vivo-07.svg" alt="" style={{ width: 300, height: 280, filter: 'brightness(0) saturate(100%) invert(51%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(95%)' }} />
      </FloatingDecor>
      <FloatingDecor className="bottom-[5%] -left-10 opacity-5 md:opacity-[0.07]" floatY={20} floatDuration={8} rotateRange={-5} delay={1.5}>
        <img src="/id-visual-livro-vivo-04.svg" alt="" style={{ width: 280, height: 320, filter: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="bottom-[15%] -right-20 opacity-5 md:opacity-[0.07]" floatY={25} floatDuration={7.5} rotateRange={12} delay={2}>
        <img src="/id-visual-livro-vivo-05.svg" alt="" style={{ width: 400, height: 350, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[60%] left-[20%] opacity-[0.025] md:opacity-5 hidden xl:block" floatY={10} floatDuration={9} rotateRange={-8} delay={1.2}>
        <img src="/id-visual-livro-vivo-02.svg" alt="" style={{ width: 250, height: 250, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[40%] right-[10%] opacity-[0.025] md:opacity-[0.07] hidden lg:block" floatY={18} floatDuration={8.5} rotateRange={5} delay={0.3}>
        <img src="/id-visual-livro-vivo-09.svg" alt="" style={{ width: 320, height: 320, filter: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)' }} />
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
          Se você se identificou com alguma dessas dores, saiba que{' '}
          <strong className="text-[#448D76]">a solução não é trabalhar mais.</strong>
          {' '}É trabalhar com um método melhor.
        </motion.p>
      </div>
    </section>
  );
}

// ─── Solution Section ─────────────────────────────────────────────────────────
function SolutionSection() {
  const features = [
    { icon: <BookOpen size={24}/>, title: '+2.000 receitas', desc: 'Receitas organizadas, categorizadas e prontas para uso imediato.' },
    { icon: <Smartphone size={24}/>, title: 'Qualquer Dispositivo', desc: 'Acesse pelo celular, tablet ou computador — sempre que precisar.' },
    { icon: <RefreshCw size={24}/>, title: 'Atualização Vitalícia', desc: 'Receba novas receitas e conteúdos automaticamente, para sempre.' },
    { icon: <CheckCircle2 size={24}/>, title: 'Guia Alimentar BR', desc: 'Todo conteúdo baseado no Guia Alimentar da População Brasileira.' },
  ];

  return (
    <section id="solucao" className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Decorative clean shapes */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#EEF0D2]/30 rounded-l-[120px] pointer-events-none hidden lg:block" />
      {/* Floating illustrations - MAIORES E MAIS DENSOS */}
      <FloatingDecor className="bottom-[-5%] -right-10 opacity-5 md:opacity-[0.07]" floatY={20} floatDuration={6} rotateRange={12} delay={0}>
        <img src="/id-visual-livro-vivo-05.svg" alt="" style={{ width: 450, height: 350, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[30%] -right-16 opacity-[0.025] md:opacity-5 hidden md:block" floatY={15} floatDuration={7} rotateRange={-6} delay={0.5}>
        <img src="/id-visual-livro-vivo-01.svg" alt="" style={{ width: 380, height: 380, filter: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[5%] -left-10 opacity-5 md:opacity-[0.07]" floatY={18} floatDuration={8} rotateRange={-8} delay={2}>
        <img src="/id-visual-livro-vivo-07.svg" alt="" style={{ width: 400, height: 380, filter: 'brightness(0) saturate(100%) invert(51%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(95%)' }} />
      </FloatingDecor>
      <FloatingDecor className="bottom-[20%] -left-20 opacity-5 md:opacity-[0.07]" floatY={25} floatDuration={8.5} rotateRange={10} delay={1.5}>
        <img src="/id-visual-livro-vivo-06.svg" alt="" style={{ width: 450, height: 450, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[50%] left-[10%] opacity-[0.025] md:opacity-5 hidden xl:block" floatY={12} floatDuration={9} rotateRange={5} delay={1.8}>
        <img src="/id-visual-livro-vivo-03.svg" alt="" style={{ width: 300, height: 300, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[10%] right-[30%] opacity-[0.025] md:opacity-5 hidden lg:block" floatY={16} floatDuration={7.5} rotateRange={-4} delay={0.8}>
        <img src="/id-visual-livro-vivo-08.svg" alt="" style={{ width: 250, height: 200, filter: 'brightness(0) saturate(100%) invert(51%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(95%)' }} />
      </FloatingDecor>

      <div className="max-w-6xl mx-auto px-4 sm:px-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-center">
          {/* Left: Explanation */}
          <motion.div {...fadeUp} className="space-y-5 lg:col-span-2">
            <span className="badge">A Solução</span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl md:text-5xl font-bold text-[#448D76] leading-tight">
              Não é um PDF.<br/>
              <span className="text-[#0C718B]">É um organismo digital.</span>
            </h2>
            <p className="text-[#5A5A5A] text-base md:text-lg leading-relaxed">
              O <strong className="text-[#448D76]">Cardápios: Um Livro Vivo</strong> é um e-book dinâmico
              hospedado no Notion que recebe <strong className="text-[#448D76]">atualizações constantes</strong>.
              Diferente de um PDF estático, ele cresce com você — e nunca fica desatualizado.
            </p>
            <p className="text-[#5A5A5A] text-sm md:text-base leading-relaxed">
              Criado por uma nutricionista com décadas de experiência no chão de cozinha, cada receita
              foi selecionada e testada na prática da alimentação coletiva real.
            </p>
            <CTAButton href="#checkout" size="md" className="w-full sm:w-fit mt-2 shadow-lg shadow-[#ED8627]/20 !py-3.5 !text-sm sm:!py-4 sm:!text-base">
              Quero Meu Livro Vivo Agora
            </CTAButton>
          </motion.div>

          {/* Right: Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 lg:col-span-3">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                {...stagger(i * 0.12)}
                className="bg-[#EEF0D2]/50 border border-[#E2E5BE] rounded-2xl md:rounded-3xl p-6 md:p-8 hover:bg-[#EEF0D2] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#ED8627] mb-4 md:mb-5">
                  {feat.icon}
                </div>
                <h3 className="font-serif text-[#0C718B] font-bold text-lg md:text-xl mb-2">{feat.title}</h3>
                <p className="text-[#5A5A5A] text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── About Author Section ─────────────────────────────────────────────────────
function AboutAuthorSection() {
  return (
    <section id="autora" className="py-16 md:py-24 bg-[#EEF0D2] relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-[#0C718B]/4 pointer-events-none" />

      {/* Decorative illustrations - MAIORES E MAIS DENSOS */}
      <FloatingDecor className="top-[5%] -left-[5%] opacity-5 md:opacity-10 hidden md:block" floatY={15} floatDuration={7} rotateRange={8} delay={0}>
        <img src="/id-visual-livro-vivo-04.svg" alt="" style={{ width: 300, height: 350, filter: 'brightness(0) saturate(100%) invert(51%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(95%)' }} />
      </FloatingDecor>
      <FloatingDecor className="bottom-[10%] -right-10 opacity-5 md:opacity-10" floatY={20} floatDuration={9} rotateRange={-10} delay={1}>
        <img src="/id-visual-livro-vivo-02.svg" alt="" style={{ width: 450, height: 450, filter: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[30%] -right-20 opacity-[0.07] md:opacity-[0.12]" floatY={18} floatDuration={6.5} rotateRange={5} delay={0.5}>
        <img src="/id-visual-livro-vivo-08.svg" alt="" style={{ width: 380, height: 320, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="bottom-[5%] -left-[10%] opacity-5 md:opacity-[0.07]" floatY={22} floatDuration={8} rotateRange={-8} delay={1.8}>
        <img src="/id-visual-livro-vivo-01.svg" alt="" style={{ width: 350, height: 350, filter: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[60%] right-[20%] opacity-[0.025] md:opacity-5 hidden xl:block" floatY={12} floatDuration={7.5} rotateRange={12} delay={2.2}>
        <img src="/id-visual-livro-vivo-05.svg" alt="" style={{ width: 280, height: 280, filter: 'brightness(0) saturate(100%) invert(51%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(95%)' }} />
      </FloatingDecor>
      <FloatingDecor className="top-[10%] left-[30%] opacity-[0.025] md:opacity-5 hidden lg:block" floatY={14} floatDuration={8.5} rotateRange={-6} delay={0.3}>
        <img src="/id-visual-livro-vivo-03.svg" alt="" style={{ width: 250, height: 250, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
      </FloatingDecor>


      <div className="max-w-5xl mx-auto px-4 sm:px-5">
        <motion.div {...fadeUp} className="text-center mb-10 md:mb-12">
          <span className="badge mb-3 inline-block">Sobre a Autora</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Photo */}
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
              {/* Overlay accent */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#448D76]/80 to-transparent p-4 md:p-6">
                <div className="text-white font-serif text-lg md:text-xl font-bold">Lúcia Chaise Borjes</div>
                <div className="text-white/80 text-xs md:text-sm mt-1">Nutricionista · Especialista em Alimentação Coletiva</div>
              </div>
            </div>

            {/* Floating credential - visible on all sizes but adapted */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-2 md:-right-4 top-10 md:top-12 bg-[#D4A373] text-white rounded-xl md:rounded-2xl p-2.5 md:p-3 shadow-xl"
            >
              <div className="text-xs md:text-sm font-bold">+20 anos</div>
              <div className="text-[10px] md:text-xs opacity-90">de experiência</div>
            </motion.div>
          </motion.div>

          {/* Bio */}
          <motion.div {...stagger(0.2)} className="relative mt-4 md:mt-0">
            {/* Giant quote mark decoration */}
            <div className="absolute -top-8 -left-3 text-[80px] md:text-[120px] font-serif leading-none text-[#0C718B]/10 pointer-events-none select-none z-0">
              “
            </div>
            
            <div className="relative z-10 space-y-3 border-l-[3px] border-[#ED8627] pl-4 md:pl-5 py-1">
              <p className="text-[#448D76] text-sm sm:text-base md:text-lg leading-relaxed italic">
                “Me chamo Lúcia Chaise Borjes, sou nutricionista, e ao longo da minha trajetória, atuei como professora, pesquisadora e gestora acadêmica por mais de 17 anos.
              </p>
              <p className="text-[#448D76] text-sm sm:text-base md:text-lg leading-relaxed italic">
                Também vivi, na prática, a realidade dos serviços de alimentação, em hospitais, empresas e restaurantes.
              </p>
              <p className="text-[#448D76] text-sm sm:text-base md:text-lg leading-relaxed italic">
                Foram anos de estudo, pesquisa e vivências que me inspiraram a criar 'Cardápios: um livro vivo'.
              </p>
              <p className="text-[#448D76] text-sm sm:text-base md:text-lg leading-relaxed italic font-medium">
                Um livro pensado para profissionais que querem enxergar o alimento com novos olhos.”
              </p>
            </div>

            <div className="pt-6 md:pt-8 relative z-10">
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

// ─── Checkout / CTA Section ───────────────────────────────────────────────────
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

        {/* Decorative illustrations - MAIORES E MAIS DENSOS */}
        <FloatingDecor className="top-[10%] -left-[5%] opacity-5 md:opacity-[0.07]" floatY={20} floatDuration={7} rotateRange={10} delay={0.5}>
          <img src="/id-visual-livro-vivo-09.svg" alt="" style={{ width: 400, height: 350, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
        </FloatingDecor>
        <FloatingDecor className="bottom-[10%] -right-[5%] opacity-5 md:opacity-[0.07]" floatY={18} floatDuration={8} rotateRange={-8} delay={1.2}>
          <img src="/id-visual-livro-vivo-01.svg" alt="" style={{ width: 420, height: 420, filter: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)' }} />
        </FloatingDecor>
        <FloatingDecor className="bottom-[30%] -left-[10%] opacity-5 md:opacity-[0.07] hidden md:block" floatY={22} floatDuration={6.5} rotateRange={6} delay={0.8}>
          <img src="/id-visual-livro-vivo-07.svg" alt="" style={{ width: 350, height: 300, filter: 'brightness(0) saturate(100%) invert(51%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(95%)' }} />
        </FloatingDecor>
        <FloatingDecor className="top-[20%] -right-16 opacity-[0.025] md:opacity-5 hidden xl:block" floatY={15} floatDuration={9} rotateRange={-12} delay={2}>
          <img src="/id-visual-livro-vivo-06.svg" alt="" style={{ width: 300, height: 300, filter: 'brightness(0) saturate(100%) invert(51%) sepia(52%) saturate(500%) hue-rotate(120deg) brightness(90%)' }} />
        </FloatingDecor>
        <FloatingDecor className="top-[60%] left-[10%] opacity-[0.025] md:opacity-5 hidden lg:block" floatY={12} floatDuration={7.5} rotateRange={8} delay={1.5}>
          <img src="/id-visual-livro-vivo-04.svg" alt="" style={{ width: 250, height: 280, filter: 'brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(160deg) brightness(90%)' }} />
        </FloatingDecor>
        <FloatingDecor className="top-[5%] right-[20%] opacity-[0.025] md:opacity-5 hidden md:block" floatY={16} floatDuration={8.5} rotateRange={-5} delay={0.3}>
          <img src="/id-visual-livro-vivo-05.svg" alt="" style={{ width: 280, height: 220, filter: 'brightness(0) saturate(100%) invert(51%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(95%)' }} />
        </FloatingDecor>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-5 relative z-10">
        <motion.div
          {...fadeUp}
          className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-10 md:p-14 text-center border border-[#E2E5BE]"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#ED8627] text-white rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold mb-5 md:mb-7">
            <span>✦</span>
            <span>Oferta de Lançamento</span>
            <span>✦</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#448D76] leading-tight mb-3 md:mb-4">
            Sua atualização profissional<br/>começa agora.
          </h2>

          <p className="text-[#5A5A5A] mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
            Acesse mais de <strong className="text-[#448D76]">2.000 receitas</strong> organizadas no Notion,
            com atualização vitalícia e suporte técnico baseado no Guia Alimentar da População Brasileira.
          </p>

          {/* Price */}
          <div className="bg-[#EEF0D2] rounded-xl md:rounded-2xl p-6 md:p-8 mb-6 md:mb-8 border border-[#E2E5BE]">
            <div className="flex items-end justify-center gap-1.5 md:gap-2">
              <span className="text-[#5A5A5A] text-base md:text-lg font-semibold">R$</span>
              <span className="font-serif text-5xl sm:text-6xl font-bold text-[#448D76]">160</span>
              <span className="text-[#5A5A5A] text-base md:text-lg">,00</span>
            </div>
            <div className="text-gray-400 text-xs mt-2 md:mt-3">ou 12x no cartão</div>
          </div>

          {/* What's included */}
          <div className="text-left mb-6 md:mb-8 space-y-2.5 md:space-y-3">
            {[
              'Acesso imediato ao Livro Vivo no Notion',
              '+2.000 receitas organizadas e categorizadas',
              'Atualização vitalícia do conteúdo',
              'Embasamento no Guia Alimentar da População Brasileira',
              'Acesso de qualquer dispositivo (celular, tablet, PC)',
              'Suporte via e-mail',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#0C718B] mt-0.5 flex-shrink-0" />
                <span className="text-[#5A5A5A] text-sm">{item}</span>
              </div>
            ))}
          </div>

          <CTAButton
            href="https://pay.cakto.com.br/377hgi2_655270"
            size="lg"
            className="w-full flex items-center justify-center gap-2 !py-3.5 !text-sm sm:!py-4 sm:!text-base md:!text-lg !tracking-wide"
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              Garantir Meu Acesso Agora <ExternalLink size={18} className="inline-block flex-shrink-0" />
            </span>
          </CTAButton>

          <p className="text-xs text-gray-400 mt-5 text-center leading-relaxed">
            🔒 Compra 100% segura · Processado pela Caktos · 7 dias de garantia
          </p>
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
        <SolutionSection />
        <AboutAuthorSection />
        <CheckoutSection />
      </main>
      <Footer />
    </>
  );
}
