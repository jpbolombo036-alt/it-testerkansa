import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import logo from '../assets/images/WhatsApp Image 2026-07-07 at 16.40.43.jpeg'
import './SplashScreen.css'

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onFinish, 800)
    }, 2200)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <MotionConfig transition={{ type: 'spring', stiffness: 140, damping: 18 }}>
      <motion.div
        initial={false}
        animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.95 }}
        className="splash-root"
      >
        <div className="splash-card">
          <motion.img
            initial={{ rotate: -120, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 1.1, ease: 'easeOut' }}
            src={logo}
            alt="Logo"
            className="splash-logo"
          />
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="splash-title"
          >
            IT Access Manager
          </motion.h1>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="splash-footer"
        >
          Chargement...
        </motion.p>
      </motion.div>
    </MotionConfig>
  )
}
