import { motion } from 'framer-motion';

export function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E5BE] hover:shadow-md transition-shadow duration-300"
    >
      <div className="w-14 h-14 rounded-xl bg-[#0C718B]/10 flex items-center justify-center mb-5">
        <span className="text-[#0C718B] text-2xl">{icon}</span>
      </div>
      <h3 className="font-serif text-xl font-bold text-[#448D76] mb-3">{title}</h3>
      <p className="text-[#5A5A5A] leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}
