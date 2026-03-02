'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { X, Bell, User, Mail, Phone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface SearchCriteria {
  operacion?: string
  tipo?: string
  zona?: string
  precioMax?: string
  status?: string
}

interface PropertyAlertModalProps {
  isOpen: boolean
  onClose: () => void
  searchCriteria: SearchCriteria
}

export function PropertyAlertModal({ isOpen, onClose, searchCriteria }: PropertyAlertModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Introduce un email válido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: '⚠️ Formulario incompleto',
        description: 'Por favor, completa los campos obligatorios',
      })
      return
    }

    setLoading(true)
    try {
      // Preparar los datos para enviar al webhook
      const dataToSend = {
        // Datos de contacto
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono || null,
        // Criterios de búsqueda
        criteriosBusqueda: {
          operacion: searchCriteria.operacion || null,
          tipo: searchCriteria.tipo || null,
          zona: searchCriteria.zona || null,
          precioMax: searchCriteria.precioMax || null,
          status: searchCriteria.status || null,
        },
        // Metadatos
        tipoSolicitud: 'Aviso de búsqueda sin resultados',
        fecha: new Date().toISOString(),
      }

      const response = await fetch(
        process.env.NEXT_PUBLIC_WEBHOOK_ALERT_URL!,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        }
      )

      if (response.ok) {
        toast({
          title: '✅ ¡Solicitud enviada!',
          description: 'Te avisaremos cuando encontremos propiedades que coincidan con tu búsqueda',
        })
        // Limpiar formulario
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
        })
        setErrors({})
        onClose()
      } else {
        throw new Error('Error en la respuesta del servidor')
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Ocurrió un error al enviar la solicitud. Por favor, intenta de nuevo.',
      })
    } finally {
      setLoading(false)
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.3,
      },
    },
  }

  // Función para formatear los criterios de búsqueda para mostrar
  const formatSearchCriteria = () => {
    const parts: string[] = []
    
    if (searchCriteria.operacion) {
      parts.push(`Operación: ${searchCriteria.operacion === 'comprar' ? 'Comprar' : 'Alquilar'}`)
    }
    if (searchCriteria.tipo && searchCriteria.tipo !== 'all') {
      parts.push(`Tipo: ${searchCriteria.tipo}`)
    }
    if (searchCriteria.zona && searchCriteria.zona !== 'todas') {
      parts.push(`Zona: ${searchCriteria.zona}`)
    }
    if (searchCriteria.precioMax && searchCriteria.precioMax !== 'sin-limite') {
      const precio = parseInt(searchCriteria.precioMax)
      parts.push(`Precio máx: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(precio)}`)
    }

    return parts.length > 0 ? parts.join(', ') : 'Sin filtros específicos'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Avísame cuando haya propiedades</h2>
                    <p className="text-sm text-green-100 mt-1">
                      Te notificaremos cuando encontremos propiedades que coincidan con tu búsqueda
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Criterios de búsqueda */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Criterios de búsqueda
                </p>
                <p className="text-sm text-gray-700">{formatSearchCriteria()}</p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    name="nombre"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`pl-10 h-12 ${
                      errors.nombre
                        ? 'border-red-500 border-2 bg-red-50 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                    }`}
                  />
                  <User
                    className={`absolute left-3 top-3.5 w-5 h-5 ${
                      errors.nombre ? 'text-red-500' : 'text-gray-400'
                    }`}
                  />
                </div>
                {errors.nombre && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 mt-1.5 text-red-600"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{errors.nombre}</span>
                  </motion.div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 h-12 ${
                      errors.email
                        ? 'border-red-500 border-2 bg-red-50 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                    }`}
                  />
                  <Mail
                    className={`absolute left-3 top-3.5 w-5 h-5 ${
                      errors.email ? 'text-red-500' : 'text-gray-400'
                    }`}
                  />
                </div>
                {errors.email && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 mt-1.5 text-red-600"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{errors.email}</span>
                  </motion.div>
                )}
              </div>

              {/* Teléfono (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
                </label>
                <div className="relative">
                  <Input
                    name="telefono"
                    type="tel"
                    placeholder="+34 600 000 000"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Enviar solicitud
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

