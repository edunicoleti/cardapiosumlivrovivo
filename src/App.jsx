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

// ─── Ticker Banner ────────────────────────────────────────────────────────────
function TickerBanner() {
  const items = Array(12).fill('✦ Lançamento Oficial · Cardápios: Um Livro Vivo · Notion · Nutricionistas ');
  return (
    <div className="bg-[#E67E22] overflow-hidden py-2.5 border-b border-[#D35400]">
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F9F7F2]/90 backdrop-blur-md border-b border-[#EDE9E0]">
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="text-[#1B4D4B]" size={20} />
          <span className="font-serif font-bold text-[#1B4D4B] text-lg tracking-tight">
            Livro Vivo
          </span>
        </div>
        <CTAButton href="#checkout" size="sm">
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
      className="relative min-h-screen flex flex-col pt-16 bg-[#F9F7F2] overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#1B4D4B]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-[#E67E22]/8 blur-3xl pointer-events-none" />

      {/* Organic leaf SVG decorations */}
      <svg className="absolute top-24 right-8 opacity-[0.07] w-64 h-64 hidden lg:block" viewBox="0 0 200 200" fill="none">
        <path d="M10 180 C10 180 60 20 190 10 C190 10 170 120 10 180Z" fill="#1B4D4B"/>
      </svg>
      <svg className="absolute bottom-16 left-4 opacity-[0.06] w-40 h-40 hidden md:block" viewBox="0 0 200 200" fill="none">
        <path d="M190 20 C190 20 140 180 10 190 C10 190 30 80 190 20Z" fill="#1B4D4B"/>
      </svg>

      <div className="max-w-6xl mx-auto px-5 flex-1 flex flex-col justify-center py-10 md:py-24">

        {/* ── MOBILE LAYOUT: mockup on top, text below ─────────────────────── */}
        <div className="flex lg:hidden flex-col gap-8">

          {/* Mobile Mockup — top */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex justify-center relative"
          >
            {/* Extra horizontal padding so badges don't clip */}
            <div className="relative mx-14" style={{ width: 'min(300px, 72vw)' }}>
              <img
                src="/livro-vivo.png"
                alt="Mockup do Cardápios: Um Livro Vivo"
                className="w-full h-auto drop-shadow-[0_16px_40px_rgba(27,77,75,0.4)] object-contain"
              />

              {/* Floating Notion icon — top-right edge of book */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-12 top-[18%] bg-white rounded-2xl p-2.5 shadow-2xl border border-[#EDE9E0] z-30"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                  alt="Notion"
                  className="w-9 h-9 object-contain"
                />
              </motion.div>

              {/* Floating badge — bottom-right */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-14 bottom-[12%] bg-white text-[#1B4D4B] rounded-2xl px-4 py-3 shadow-xl border border-[#EDE9E0] z-20"
              >
                <div className="text-sm font-bold whitespace-nowrap">♾️ Atualização</div>
                <div className="text-xs text-gray-500">Vitalícia</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile Text */}
          <motion.div {...stagger(0)} className="space-y-6">
            <motion.div {...stagger(0.1)}>
              <span className="badge">📚 E-book Digital no Notion</span>
            </motion.div>

            <motion.h1
              {...stagger(0.2)}
              className="font-serif text-3xl font-bold text-[#1B4D4B] leading-[1.15] tracking-tight"
            >
              Planejar cardápios é tomar decisões todos os dias.
            </motion.h1>

            <motion.p
              {...stagger(0.3)}
              className="font-sans text-base text-[#5A5A5A] leading-relaxed"
            >
              Decisões que impactam custo, equipe, tempo e qualidade. O <strong className="text-[#1B4D4B]">Cardápios: Um Livro Vivo</strong> é uma ferramenta de apoio contínuo para quem leva planejamento alimentar a sério!
            </motion.p>

            <motion.div {...stagger(0.4)}>
              <CTAButton href="#checkout" size="lg" className="w-full text-center">
                🚀 Quero Acesso ao Livro Vivo
              </CTAButton>
            </motion.div>

            <motion.div {...stagger(0.5)} className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
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
              className="font-serif text-5xl xl:text-6xl font-bold text-[#1B4D4B] leading-[1.1] tracking-tight"
            >
              Planejar cardápios é tomar decisões todos os dias.
            </motion.h1>

            <motion.p
              {...stagger(0.3)}
              className="font-sans text-xl text-[#5A5A5A] leading-relaxed max-w-lg"
            >
              Decisões que impactam custo, equipe, tempo e qualidade. O <strong className="text-[#1B4D4B]">Cardápios: Um Livro Vivo</strong> é uma ferramenta de apoio contínuo para quem leva planejamento alimentar a sério!
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
                className="absolute right-4 lg:right-[15%] top-[20%] bg-white rounded-[18px] p-3 shadow-2xl border border-[#EDE9E0] flex items-center justify-center z-30"
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
                className="absolute right-0 bottom-[10%] bg-white text-[#1B4D4B] rounded-2xl p-4 shadow-xl border border-[#EDE9E0] z-20"
              >
                <div className="text-base font-bold">♾️ Atualização</div>
                <div className="text-sm text-gray-500">Vitalícia</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center mt-10"
        >
          <a href="#dores" className="flex flex-col items-center gap-1 text-[#1B4D4B]/50 hover:text-[#1B4D4B] transition-colors">
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
    <section id="dores" className="py-24 bg-[#F9F7F2]">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div {...fadeUp} className="text-center mb-14">
          <span className="badge mb-4 inline-block">Reconhece alguma dessas situações?</span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1B4D4B] leading-tight">
            A realidade de quem trabalha<br /> com alimentação coletiva
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pains.map((pain, i) => (
            <FeatureCard key={pain.title} {...pain} delay={i * 0.15} />
          ))}
        </div>

        <motion.p
          {...stagger(0.4)}
          className="text-center mt-12 text-lg text-[#5A5A5A] max-w-2xl mx-auto"
        >
          Se você se identificou com alguma dessas dores, saiba que{' '}
          <strong className="text-[#1B4D4B]">a solução não é trabalhar mais.</strong>
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
    <section id="solucao" className="py-24 bg-[#1B4D4B] relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <svg className="absolute top-0 right-0 w-64 h-64 opacity-10" viewBox="0 0 200 200" fill="none">
        <path d="M10 180 C10 180 60 20 190 10 C190 10 170 120 10 180Z" fill="white"/>
      </svg>

      <div className="max-w-6xl mx-auto px-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: Explanation */}
          <motion.div {...fadeUp} className="space-y-6">
            <span className="badge bg-white/10 text-white border border-white/20">A Solução</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight">
              Não é um PDF.<br/>
              <span className="text-[#E67E22]">É um organismo digital.</span>
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              O <strong className="text-white">Cardápios: Um Livro Vivo</strong> é um e-book dinâmico
              hospedado no Notion que recebe <strong className="text-white">atualizações constantes</strong>.
              Diferente de um PDF estático, ele cresce com você — e nunca fica desatualizado.
            </p>
            <p className="text-white/70 leading-relaxed">
              Criado por uma nutricionista com décadas de experiência no chão de cozinha, cada receita
              foi selecionada e testada na prática da alimentação coletiva real.
            </p>
            <CTAButton href="#checkout" size="md" className="mt-4">
              Quero Meu Livro Vivo Agora
            </CTAButton>
          </motion.div>

          {/* Right: Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                {...stagger(i * 0.12)}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E67E22]/20 flex items-center justify-center text-[#E67E22] mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{feat.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Strip ───────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    { name: 'Ana Paula, CRN-3', text: '"Finalmente um material que acompanha minhas necessidades. Uso todos os dias na UAN!"', stars: 5 },
    { name: 'Carla R., Nutricionista', text: '"As receitas são práticas e o Notion facilita demais o acesso. Recomendo para todas as colegas."', stars: 5 },
    { name: 'Fernanda L., Chef Nutricionista', text: '"A atualização automática é um diferencial incrível. Nunca mais precisei buscar receitas em outro lugar."', stars: 5 },
    { name: 'Juliana M., Consultora', text: '"Economizo pelo menos 3 horas por semana na montagem dos cardápios. Investimento que valeu muito!"', stars: 5 },
  ];

  return (
    <section className="py-20 bg-[#EDE9E0] overflow-hidden">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div {...fadeUp} className="text-center mb-12">
          <span className="badge mb-3 inline-block">Depoimentos</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B4D4B]">
            Quem já usa, <em>não abre mão</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              {...stagger(i * 0.1)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#EDE9E0] hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex mb-3">
                {Array(t.stars).fill(0).map((_, si) => (
                  <Star key={si} size={14} className="text-[#E67E22] fill-[#E67E22]" />
                ))}
              </div>
              <p className="text-[#5A5A5A] text-sm leading-relaxed italic mb-4">{t.text}</p>
              <div className="text-[#1B4D4B] font-bold text-sm">{t.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About Author Section ─────────────────────────────────────────────────────
function AboutAuthorSection() {
  return (
    <section id="autora" className="py-24 bg-[#F9F7F2] relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-[#1B4D4B]/4 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-5">
        <motion.div {...fadeUp} className="text-center mb-12">
          <span className="badge mb-3 inline-block">Sobre a Autora</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-md mx-auto">
              <img
                src="/lucia-borges.jpeg"
                alt="Lucia Chalse Borjes - Autora do Cardápios: Um Livro Vivo"
                className="w-full object-cover"
                style={{ aspectRatio: '4/5' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.style.background = 'linear-gradient(135deg, #1B4D4B 0%, #2d7a78 100%)';
                  e.target.parentNode.style.minHeight = '400px';
                  e.target.parentNode.style.display = 'flex';
                  e.target.parentNode.style.alignItems = 'center';
                  e.target.parentNode.style.justifyContent = 'center';
                  const div = document.createElement('div');
                  div.innerHTML = '<div style="text-align:center;color:white"><div style="font-size:80px">👩‍🍳</div><div style="font-family:serif;font-size:1.5rem;font-weight:bold;margin-top:16px">Lucia Chalse Borjes</div><div style="opacity:0.7;margin-top:8px">Nutricionista</div></div>';
                  e.target.parentNode.appendChild(div);
                }}
              />
              {/* Overlay accent */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1B4D4B]/80 to-transparent p-6">
                <div className="text-white font-serif text-xl font-bold">Lucia Chalse Borjes</div>
                <div className="text-white/80 text-sm mt-1">Nutricionista · Especialista em Alimentação Coletiva</div>
              </div>
            </div>

            {/* Floating credential */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-4 top-12 bg-[#E67E22] text-white rounded-2xl p-3 shadow-xl hidden md:block"
            >
              <div className="text-sm font-bold">+20 anos</div>
              <div className="text-xs opacity-90">de experiência</div>
            </motion.div>
          </motion.div>

          {/* Bio */}
          <motion.div {...stagger(0.2)} className="space-y-5">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B4D4B] leading-tight">
              Do chão de cozinha para o seu Notion.
            </h2>
            <p className="text-[#5A5A5A] leading-relaxed">
              <strong className="text-[#2D2D2D]">Lucia Chalse Borjes</strong> é nutricionista com mais de duas décadas de
              experiência na gestão de Unidades de Alimentação e Nutrição (UANs). Ela conhece as dores do
              profissional de alimentação coletiva porque viveu cada uma delas.
            </p>
            <p className="text-[#5A5A5A] leading-relaxed">
              Após anos sistematizando cardápios em planilhas e PDFs que rapidamente ficavam desatualizados,
              ela criou o <strong className="text-[#1B4D4B]">Cardápios: Um Livro Vivo</strong> — um método
              que combina a sua vasta experiência prática com a tecnologia do Notion para gerar um
              ecossistema digital verdadeiramente vivo.
            </p>
            <p className="text-[#5A5A5A] leading-relaxed">
              Todo o conteúdo é baseado no <strong>Guia Alimentar da População Brasileira</strong>, garantindo
              embasamento técnico e relevância para a prática profissional.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {['CRN Registrada', 'Guia Alimentar BR', 'UANs', 'Notion Expert', '+2.000 Receitas'].map(tag => (
                <span key={tag} className="badge">{tag}</span>
              ))}
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
    <section id="checkout" className="py-24 bg-[#EDE9E0] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 0L1440 0L1440 30Q720 80 0 30Z" fill="#F9F7F2"/>
        </svg>
        <svg className="absolute bottom-0 left-0 w-full rotate-180" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 0L1440 0L1440 30Q720 80 0 30Z" fill="#F9F7F2"/>
        </svg>
      </div>

      <div className="max-w-2xl mx-auto px-5 relative z-10">
        <motion.div
          {...fadeUp}
          className="bg-white rounded-3xl shadow-2xl p-10 md:p-14 text-center border border-[#EDE9E0]"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1B4D4B] text-white rounded-full px-5 py-2 text-sm font-semibold mb-7">
            <span>✦</span>
            <span>Oferta de Lançamento</span>
            <span>✦</span>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B4D4B] leading-tight mb-4">
            Sua atualização profissional<br/>começa agora.
          </h2>

          <p className="text-[#5A5A5A] mb-8 leading-relaxed">
            Acesse mais de <strong className="text-[#1B4D4B]">2.000 receitas</strong> organizadas no Notion,
            com atualização vitalícia e suporte técnico baseado no Guia Alimentar da População Brasileira.
          </p>

          {/* Price */}
          <div className="bg-[#F9F7F2] rounded-2xl p-8 mb-8 border border-[#EDE9E0]">
            <div className="flex items-end justify-center gap-2">
              <span className="text-[#5A5A5A] text-lg font-semibold">R$</span>
              <span className="font-serif text-6xl font-bold text-[#1B4D4B]">160</span>
              <span className="text-[#5A5A5A] text-lg">,00</span>
            </div>
            <div className="text-gray-400 text-xs mt-3">ou 12x no cartão</div>
          </div>

          {/* What's included */}
          <div className="text-left mb-8 space-y-3">
            {[
              'Acesso imediato ao Livro Vivo no Notion',
              '+2.000 receitas organizadas e categorizadas',
              'Atualização vitalícia do conteúdo',
              'Embasamento no Guia Alimentar da População Brasileira',
              'Acesso de qualquer dispositivo (celular, tablet, PC)',
              'Suporte via e-mail',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#1B4D4B] mt-0.5 flex-shrink-0" />
                <span className="text-[#5A5A5A] text-sm">{item}</span>
              </div>
            ))}
          </div>

          <CTAButton
            href="https://pay.cakto.com.br/377hgi2_655270"
            size="lg"
            className="w-full flex items-center justify-center gap-2 !text-base sm:!text-lg !tracking-wide"
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
    <footer className="bg-[#133836] text-white/60 py-10 text-center">
      <div className="max-w-4xl mx-auto px-5">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Leaf size={18} className="text-[#E67E22]" />
          <span className="font-serif font-bold text-white text-lg">Cardápios: Um Livro Vivo</span>
        </div>
        <p className="text-sm mb-2">Desenvolvido por <strong className="text-white/80">Lucia Chalse Borjes</strong> · Nutricionista</p>
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
        <TestimonialsSection />
        <AboutAuthorSection />
        <CheckoutSection />
      </main>
      <Footer />
    </>
  );
}
