import { motion } from 'framer-motion';

export function CTAButton({ href = '#checkout', children, className = '', size = 'md' }) {
  const sizeClasses = {
    sm: 'px-6 py-3 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  };

  return (
    <motion.a
      href={href}
      className={`
        inline-flex items-center justify-center font-sans font-bold tracking-wider uppercase rounded-full
        bg-[#E67E22] text-white shadow-lg cursor-pointer
        ${sizeClasses[size]} ${className}
      `}
      style={{ textDecoration: 'none' }}
      whileHover={{ scale: 1.05, backgroundColor: '#D35400', boxShadow: '0 12px 40px rgba(230,126,34,0.5)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.a>
  );
}
