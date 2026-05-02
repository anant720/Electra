'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" 
      style={{ background: 'radial-gradient(circle at top right, #102A43, #020408)' }}>
      
      {/* Animated decorative background elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0070F3] opacity-20 blur-[120px] rounded-full"
      ></motion.div>
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#102A43] opacity-30 blur-[120px] rounded-full"
      ></motion.div>

      <div className="max-w-md w-full relative z-10 text-center">
        {/* Branded Logo with Pulse Effect */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center justify-center mb-8"
        >
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[#0070F3] blur-xl rounded-full"
            ></motion.div>
            <img 
              src="/logo.png" 
              alt="ELECTRA Logo" 
              className="w-24 h-24 rounded-2xl shadow-2xl border-2 border-white/20 relative z-10"
            />
          </div>
        </motion.div>

        {/* 404 Ghost Text */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2 }}
          className="text-[12rem] font-black mb-2 tracking-tighter absolute top-0 left-1/2 -translate-x-1/2 select-none text-white pointer-events-none"
        >
          404
        </motion.h1>
        
        {/* Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[40px] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* Subtle Glass Highlight */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <h2 className="text-4xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Lost in the <span className="text-[#0070F3]">Registry?</span>
          </h2>
          <p className="text-slate-400 font-medium mb-12 text-lg leading-relaxed">
            Even the most diligent citizens take a wrong turn sometimes. The page you're looking for doesn't exist in our civic records.
          </p>

          <div className="flex flex-col gap-4">
            <Link
              href="/dashboard"
              className="group relative w-full py-5 rounded-2xl bg-[#0070F3] text-white font-bold text-sm shadow-xl shadow-[#0070F3]/30 overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10">Return to Dashboard</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0070F3] via-[#00A3FF] to-[#0070F3] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Link>
            
            <button
              onClick={() => router.back()}
              className="w-full py-5 rounded-2xl bg-white/5 text-white font-bold text-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Go Back
            </button>
          </div>
        </motion.div>

        {/* Footer Meta */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-12 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
        >
          <span className="hover:text-[#0070F3] transition-colors cursor-default">Navigate Every Election</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
          <span className="hover:text-[#0070F3] transition-colors cursor-default">Sovereign Infrastructure</span>
        </motion.div>
      </div>
    </main>
  );
}
