export type LeadType = "Comprador" | "Vendedor" | "Alquiler"

export interface Lead {
  id: string
  nombre: string
  email: string
  whatsapp: string
  tipo: LeadType
  presupuesto?: string
  zona?: string
  tipoPropiedad?: string
  habitaciones?: string
  urgencia?: string
  zonaPropiedad?: string
  tipoVenta?: string
  metrosCuadrados?: number
  habitacionesVenta?: string
  precioEsperado?: string
  documentosRegla?: string
  urgenciaVenta?: string
  mensaje?: string
  score: number
  estado: string
  agenteAsignado?: string
  notas?: string
  createdAt: string
  updatedAt: string
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "bg-green-500"
  if (score >= 40) return "bg-yellow-500"
  return "bg-red-500"
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return "Caliente"
  if (score >= 40) return "Tibio"
  return "Frío"
}

export function getTypeColor(type: LeadType): string {
  switch (type) {
    case "Comprador":
      return "bg-blue-100 text-blue-800"
    case "Vendedor":
      return "bg-green-100 text-green-800"
    case "Alquiler":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getUrgencyIcon(urgency?: string): string {
  if (!urgency) return ""
  if (urgency.includes("1 mes") || urgency.includes("Urgente")) return "⚡"
  if (urgency.includes("1-3 meses")) return "⏱️"
  return "📅"
}

export function getScoreGradient(score: number): string {
  if (score >= 70) return "from-green-500 to-emerald-600"
  if (score >= 40) return "from-yellow-500 to-orange-600"
  return "from-red-500 to-rose-600"
}

export function getScoreTextColor(score: number): string {
  if (score >= 70) return "text-green-600"
  if (score >= 40) return "text-yellow-600"
  return "text-red-600"
}

export function getScoreLabelFull(score: number): { icon: string; label: string } {
  if (score >= 70) return { icon: "🔥", label: "Caliente" }
  if (score >= 40) return { icon: "☀️", label: "Tibio" }
  return { icon: "❄️", label: "Frío" }
}
