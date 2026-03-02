"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  BarChart3,
  Bell,
  Building2,
} from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const menuItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, badge: null },
    { label: "Propiedades", href: "/admin/propiedades", icon: Building2, badge: null },
    { label: "Leads", href: "/admin/leads", icon: Users, badge: "12" },
    { label: "Nuevo Lead", href: "/admin/leads/new", icon: Plus, badge: null },
    { label: "Estadísticas", href: "/admin/stats", icon: BarChart3, badge: null },
    { label: "Notificaciones", href: "/admin/notifications", icon: Bell, badge: "3" },
    { label: "Configuración", href: "/admin/settings", icon: Settings, badge: null },
  ]

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    router.push("/admin/login")
  }

  const isActive = (href: string) => pathname === href

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  }

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 z-40 flex flex-col md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Inmobiliario</h1>
              <p className="text-xs text-gray-400">Panel de Control</p>
            </div>
          </motion.div>
        </div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 mx-4 mt-4 bg-gray-800/50 rounded-xl border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-gray-400">admin@inmobiliario.com</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, i) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <motion.button
                key={item.href}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                onClick={() => {
                  router.push(item.href)
                  setIsOpen(false)
                }}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  hoveredItem === item.href ? "scale-110" : ""
                }`} />
                
                <span className="flex-1 text-left font-medium">{item.label}</span>

                {/* Badge */}
                {item.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full"
                  >
                    {item.badge}
                  </motion.span>
                )}

                {/* Chevron on hover */}
                <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                  hoveredItem === item.href ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                }`} />
              </motion.button>
            )
          })}
        </nav>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-gray-700">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-transparent border-gray-700 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </motion.div>

          {/* Version */}
          <p className="text-center text-xs text-gray-500 mt-3">
            v1.0.0
          </p>
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}