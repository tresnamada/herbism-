"use client"

import { motion, Variants } from "framer-motion"
import { useTheme } from "../context/ThemeContext"

export default function Footer() {
  const { getThemeColors } = useTheme()
  const themeColors = getThemeColors()

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const quickLinks = [
    { name: "Scan Tanaman", href: "#" },
    { name: "Diagnosa", href: "#" },
    { name: "Konsultasi AI", href: "#" },
    { name: "Bantuan", href: "#" }
  ]

  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 mb-8"
        >
          

          <motion.div
            variants={itemVariants}
            className="md:col-span-6 lg:col-span-5 bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
          >
            <h3 className="text-3xl font-bold mb-4" style={{ color: themeColors.primary }}>HERBISM</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Platform AI terdepan untuk perawatan tanaman herbal. Bergabunglah dengan komunitas yang peduli kesehatan alami.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="md:col-span-3 lg:col-span-4 bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
          >
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-300 hover:translate-x-1 inline-block transition-all duration-300"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = themeColors.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#cbd5e1"
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

         <motion.div
            variants={itemVariants}
            className="md:col-span-3 lg:col-span-3 rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden group"
            style={{ 
              background: `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.secondary}15)` 
            }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
            
            <div className="relative z-10">
              <h4 className="text-lg font-semibold mb-3">Stay Updated</h4>
              <p className="text-xs text-slate-300 mb-4">Dapatkan tips & update terbaru</p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = themeColors.primary
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#334155'
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ 
                    background: themeColors.primary,
                    color: 'white'
                  }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>


        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-slate-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>&copy; 2025 Herbism. All rights reserved.</p>
            <div className="flex gap-6">
              <a 
                href="#" 
                className="transition-colors hover:text-white"
                onMouseEnter={(e) => e.currentTarget.style.color = themeColors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="transition-colors hover:text-white"
                onMouseEnter={(e) => e.currentTarget.style.color = themeColors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
              >
                Terms
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}