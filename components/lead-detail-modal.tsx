"use client"

import type React from "react"
import { useState } from "react"
import type { Lead } from "@/lib/lead-utils"
import { getScoreGradient, getScoreTextColor, getScoreLabelFull } from "@/lib/lead-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  X, 
  MessageCircle, 
  Mail, 
  Phone, 
  User, 
  Calendar,
  Edit3,
  Save,
  TrendingUp,
  MapPin,
  Home,
  DollarSign,
  Clock,
  FileText
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface LeadDetailModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onSave: (lead: Lead) => Promise<void>
}

export function LeadDetailModal({ lead, isOpen, onClose, onSave }: LeadDetailModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Lead | null>(lead)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen || !lead) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSave = async () => {
    if (!formData) return
    setIsSaving(true)
    try {
      await onSave(formData)
      setIsEditing(false)
      toast({ title: "Éxito", description: "Lead actualizado correctamente" })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el lead" })
    } finally {
      setIsSaving(false)
    }
  }

  const scoreColor = getScoreGradient(formData!.score)
  const scoreTextColor = getScoreTextColor(formData!.score)
  const { icon: scoreLabelIcon, label: scoreLabelText } = getScoreLabelFull(formData!.score)
  const scoreLabel = `${scoreLabelIcon} ${scoreLabelText}`

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: {
        duration: 0.3
      }
    }
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
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{formData?.nombre}</h2>
                    <div className="flex flex-wrap gap-3 text-sm text-blue-100">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {formData?.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {formData?.whatsapp}
                      </div>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Type Badge */}
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {formData?.tipo === "Comprador" && "🛒"}
                  {formData?.tipo === "Vendedor" && "💰"}
                  {formData?.tipo === "Alquiler" && "🔑"}
                  {formData?.tipo}
                </span>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Score Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30" />
                
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                      <p className="text-sm font-medium text-gray-600">Score de Calificación</p>
                    </div>
                    <p className={`text-5xl font-bold ${scoreTextColor} mb-2`}>
                      {formData?.score}
                      <span className="text-2xl text-gray-400">/100</span>
                    </p>
                    <p className="text-lg font-semibold">{scoreLabel}</p>
                  </div>
                  
                  {/* Circular Progress */}
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - formData!.score / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" className={scoreTextColor} />
                          <stop offset="100%" className={scoreTextColor} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900">{formData?.score}</p>
                        <p className="text-xs text-gray-500">pts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detalles de Interés */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    Detalles de Interés
                  </h3>
                  <div className="space-y-3">
                    {formData?.tipo === "Comprador" ? (
                      <>
                        <InfoItem icon={DollarSign} label="Presupuesto" value={formData?.presupuesto} />
                        <InfoItem icon={MapPin} label="Zona" value={formData?.zona} />
                        <InfoItem icon={Home} label="Tipo de Propiedad" value={formData?.tipoPropiedad} />
                        <InfoItem icon={Clock} label="Urgencia" value={formData?.urgencia} />
                      </>
                    ) : (
                      <>
                        <InfoItem icon={MapPin} label="Zona Propiedad" value={formData?.zonaPropiedad} />
                        <InfoItem icon={Home} label="Tipo Venta" value={formData?.tipoVenta} />
                        <InfoItem icon={FileText} label="M² / Habitaciones" value={`${formData?.metrosCuadrados || "-"} m² / ${formData?.habitacionesVenta || "-"}`} />
                        <InfoItem icon={DollarSign} label="Precio Esperado" value={formData?.precioEsperado} />
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Estado y Asignación */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  {/* Estado */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <label className="text-sm font-medium text-gray-600 mb-3 block flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Estado
                    </label>
                    {isEditing ? (
                      <select
                        name="estado"
                        value={formData?.estado || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="Nuevo">🆕 Nuevo</option>
                        <option value="Contactado">📞 Contactado</option>
                        <option value="Calificado">✅ Calificado</option>
                        <option value="Visitando">🏠 Visitando</option>
                        <option value="Negociando">💼 Negociando</option>
                        <option value="Cerrado">🎉 Cerrado</option>
                        <option value="Perdido">❌ Perdido</option>
                      </select>
                    ) : (
                      <p className="text-lg font-semibold text-gray-900">{formData?.estado}</p>
                    )}
                  </div>

                  {/* Agente Asignado */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <label className="text-sm font-medium text-gray-600 mb-3 block flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Agente Asignado
                    </label>
                    {isEditing ? (
                      <Input
                        name="agenteAsignado"
                        value={formData?.agenteAsignado || ""}
                        onChange={handleChange}
                        placeholder="Nombre del agente"
                        className="h-12"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900">{formData?.agenteAsignado || "Sin asignar"}</p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Notas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <label className="text-sm font-medium text-gray-600 mb-3 block flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notas Internas
                </label>
                {isEditing ? (
                  <textarea
                    name="notas"
                    value={formData?.notas || ""}
                    onChange={handleChange}
                    placeholder="Agrega notas sobre este lead..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{formData?.notas || "Sin notas"}</p>
                )}
              </motion.div>

              {/* Información de Auditoría */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Creado: {new Date(formData?.createdAt!).toLocaleString("es-ES")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Actualizado: {new Date(formData?.updatedAt!).toLocaleString("es-ES")}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-between items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`https://wa.me/${formData?.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg font-semibold"
              >
                <MessageCircle className="w-5 h-5" />
                Contactar por WhatsApp
              </motion.a>

              <div className="flex gap-3">
                {!isEditing ? (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={() => setIsEditing(true)} 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-6 rounded-xl shadow-lg"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={onClose} variant="outline" className="px-6 py-6 rounded-xl">
                        Cerrar
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-6 rounded-xl shadow-lg"
                      >
                        {isSaving ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                            />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar
                          </>
                        )}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => setIsEditing(false)} variant="outline" className="px-6 py-6 rounded-xl">
                        Cancelar
                      </Button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Helper Component
function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="font-medium text-gray-900 truncate">{value || "-"}</p>
      </div>
    </div>
  )
}