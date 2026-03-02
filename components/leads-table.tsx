"use client"

import type { Lead } from "@/lib/lead-utils"
import { getScoreGradient, getScoreLabelFull } from "@/lib/lead-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Eye,
  Trash2,
  Mail,
  Phone,
  TrendingUp,
  AlertCircle,
  Sparkles
} from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

interface LeadsTableProps {
  leads: Lead[]
  onViewDetail: (lead: Lead) => void
  onDelete: (leadId: string) => void
}

export function LeadsTable({ leads, onViewDetail, onDelete }: LeadsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Comprador":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Vendedor":
        return "bg-green-100 text-green-800 border-green-200"
      case "Alquiler":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Comprador":
        return "🛒"
      case "Vendedor":
        return "💰"
      case "Alquiler":
        return "🔑"
      default:
        return "📋"
    }
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case "Nuevo":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "Contactado":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Calificado":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "Visitando":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Negociando":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "Cerrado":
        return "bg-green-100 text-green-800 border-green-300"
      case "Perdido":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getUrgencyIcon = (lead: Lead) => {
    const urgency = lead.urgencia || lead.urgenciaVenta
    if (!urgency) return { icon: "", text: "-", color: "text-gray-400" }
    if (urgency.includes("1 mes") || urgency.includes("Urgente"))
      return { icon: "⚡", text: "Alta", color: "text-red-600 font-semibold" }
    if (urgency.includes("1-3"))
      return { icon: "⏱️", text: "Media", color: "text-yellow-600 font-medium" }
    return { icon: "📅", text: "Baja", color: "text-green-600" }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  if (leads.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-lg"
      >
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-600 text-lg font-medium mb-2">No se encontraron leads</p>
        <p className="text-gray-400 text-sm">Intenta ajustar los filtros o crear un nuevo lead</p>
      </motion.div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                Presupuesto
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                Urgencia
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {leads.map((lead) => {
              const urgency = getUrgencyIcon(lead)
              const scoreInfo = getScoreLabelFull(lead.score)
              
              return (
                <motion.tr
                  key={lead.id}
                  variants={rowVariants}
                  onHoverStart={() => setHoveredRow(lead.id)}
                  onHoverEnd={() => setHoveredRow(null)}
                  className={`border-b border-gray-100 transition-all duration-200 ${
                    hoveredRow === lead.id ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  {/* Nombre */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                        {lead.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{lead.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-6 py-4">
                    <Badge className={`${getTypeColor(lead.tipo)} border font-medium`}>
                      {getTypeIcon(lead.tipo)} {lead.tipo}
                    </Badge>
                  </td>

                  {/* Contacto */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <a
                        href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors group"
                      >
                        <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm">{lead.whatsapp}</span>
                      </a>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Mail className="w-4 h-4" />
                        <span className="truncate max-w-[150px]" title={lead.email}>
                          {lead.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 20}`}
                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - lead.score / 100)}`}
                            className={`bg-gradient-to-r ${getScoreGradient(lead.score)} text-green-500`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">{lead.score}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {scoreInfo.icon} {scoreInfo.label}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Ubicación */}
                  <td className="px-6 py-4">
                    <p className="text-gray-700 font-medium">
                      {lead.zona || lead.zonaPropiedad || "-"}
                    </p>
                  </td>

                  {/* Presupuesto */}
                  <td className="px-6 py-4">
                    <p className="text-gray-700 font-medium">
                      {lead.presupuesto || lead.precioEsperado || "-"}
                    </p>
                  </td>

                  {/* Urgencia */}
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 ${urgency.color}`}>
                      <span>{urgency.icon}</span>
                      <span className="text-sm">{urgency.text}</span>
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    <Badge className={`${getStateColor(lead.estado)} border font-medium`}>
                      {lead.estado}
                    </Badge>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          onClick={() => onViewDetail(lead)}
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          onClick={() => onDelete(lead.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </motion.tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Mostrando <strong>{leads.length}</strong> leads</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span>Calientes: <strong>{leads.filter(l => l.score >= 70).length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}