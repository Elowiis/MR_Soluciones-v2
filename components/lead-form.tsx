"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { 
  Home, 
  DollarSign, 
  FileText,
  CheckCircle2,
  Loader2,
  ShoppingCart,
  KeyRound,
  AlertCircle
} from "lucide-react"

type LeadType = "Comprador" | "Vendedor" | "Alquiler"

// Tipos de propiedad que requieren habitaciones y baños
const tiposConHabitaciones = ["piso", "casa", "chalet"]

export function LeadForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [leadType, setLeadType] = useState<LeadType | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    whatsapp: "",
    presupuesto: "",
    zona: "",
    zonaOtra: "",
    tipoPropiedad: "",
    habitaciones: "",
    banos: "",
    urgencia: "",
    zonaPropiedad: "",
    zonaPropiedadOtra: "",
    tipoVenta: "",
    metrosCuadrados: "",
    habitacionesVenta: "",
    banosVenta: "",
    precioEsperado: "",
    documentosRegla: "",
    urgenciaVenta: "",
    // Campos de Alquiler
    tipoAlquiler: "",
    zonaAlquiler: "",
    zonaAlquilerOtra: "",
    tipoPropiedadAlquiler: "",
    presupuestoAlquiler: "",
    urgenciaAlquiler: "",
    mensaje: "",
    aceptaTerminos: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const isCheckbox = (e.target as HTMLInputElement).type === "checkbox"
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      
      // Limpiar campos cuando cambia zona
      if (name === "zona" && value !== "otra") {
        newData.zonaOtra = ""
      }
      if (name === "zonaPropiedad" && value !== "otra") {
        newData.zonaPropiedadOtra = ""
      }
      if (name === "zonaAlquiler" && value !== "otra") {
        newData.zonaAlquilerOtra = ""
      }
      
      // Limpiar habitaciones/baños si cambia a un tipo que no los necesita (Comprador)
      if (name === "tipoPropiedad" && !tiposConHabitaciones.includes(value)) {
        newData.habitaciones = ""
        newData.banos = ""
      }
      
      // Limpiar habitaciones/baños si cambia a un tipo que no los necesita (Vendedor)
      if (name === "tipoVenta" && !tiposConHabitaciones.includes(value)) {
        newData.habitacionesVenta = ""
        newData.banosVenta = ""
      }
      
      return newData
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Introduce un email válido"
      }
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "El teléfono es obligatorio"
    }

    if (!leadType) {
      newErrors.leadType = "Selecciona un tipo de interés"
    }

    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = "Debes aceptar la Política de Privacidad"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Scroll al primer error
      const firstError = document.querySelector('.error-field')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      
      toast({ 
        title: "⚠️ Formulario incompleto", 
        description: "Por favor, revisa los campos marcados en rojo",
      })
      return
    }
  
    setLoading(true)
    try {
      const zonaFinal = formData.zona === "otra" ? formData.zonaOtra : formData.zona
      const zonaPropiedadFinal = formData.zonaPropiedad === "otra" ? formData.zonaPropiedadOtra : formData.zonaPropiedad
      const zonaAlquilerFinal = formData.zonaAlquiler === "otra" ? formData.zonaAlquilerOtra : formData.zonaAlquiler

      const dataToSend = {
        tipo: leadType,
        nombre: formData.nombre,
        email: formData.email,
        whatsapp: formData.whatsapp,
        mensaje: formData.mensaje,
        fecha: new Date().toISOString(),
        ...(leadType === "Comprador" && {
          presupuesto: formData.presupuesto,
          zona: zonaFinal,
          tipoPropiedad: formData.tipoPropiedad,
          // Solo incluir habitaciones y baños si aplica
          ...(tiposConHabitaciones.includes(formData.tipoPropiedad) && {
            habitaciones: formData.habitaciones,
            banos: formData.banos,
          }),
          urgencia: formData.urgencia,
        }),
        ...(leadType === "Vendedor" && {
          zonaPropiedad: zonaPropiedadFinal,
          tipoVenta: formData.tipoVenta,
          metrosCuadrados: formData.metrosCuadrados,
          // Solo incluir habitaciones y baños si aplica
          ...(tiposConHabitaciones.includes(formData.tipoVenta) && {
            habitacionesVenta: formData.habitacionesVenta,
            banosVenta: formData.banosVenta,
          }),
          precioEsperado: formData.precioEsperado,
          documentosRegla: formData.documentosRegla,
          urgenciaVenta: formData.urgenciaVenta,
        }),
        ...(leadType === "Alquiler" && {
          tipoAlquiler: formData.tipoAlquiler,
          zonaAlquiler: zonaAlquilerFinal,
          tipoPropiedadAlquiler: formData.tipoPropiedadAlquiler,
          presupuestoAlquiler: formData.presupuestoAlquiler,
          urgenciaAlquiler: formData.urgenciaAlquiler,
        }),
      }
  
      const response = await fetch(
        process.env.NEXT_PUBLIC_WEBHOOK_LEAD_URL!,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      )
  
      if (response.ok) {
        toast({
          title: "✅ ¡Solicitud enviada!",
          description: "Nos pondremos en contacto contigo pronto",
        })
        setFormData({
          nombre: "",
          email: "",
          whatsapp: "",
          presupuesto: "",
          zona: "",
          zonaOtra: "",
          tipoPropiedad: "",
          habitaciones: "",
          banos: "",
          urgencia: "",
          zonaPropiedad: "",
          zonaPropiedadOtra: "",
          tipoVenta: "",
          metrosCuadrados: "",
          habitacionesVenta: "",
          banosVenta: "",
          precioEsperado: "",
          documentosRegla: "",
          urgenciaVenta: "",
          tipoAlquiler: "",
          zonaAlquiler: "",
          zonaAlquilerOtra: "",
          tipoPropiedadAlquiler: "",
          presupuestoAlquiler: "",
          urgenciaAlquiler: "",
          mensaje: "",
          aceptaTerminos: false,
        })
        setLeadType(null)
        setErrors({})
      } else {
        throw new Error("Error en la respuesta del servidor")
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Ocurrió un error al enviar la solicitud. Por favor, intenta de nuevo.",
      })
    } finally {
      setLoading(false)
    }
  }

  const leadTypes = [
    { 
      type: "Comprador" as LeadType, 
      icon: ShoppingCart, 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-500"
    },
    { 
      type: "Vendedor" as LeadType, 
      icon: DollarSign, 
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
      borderColor: "border-green-500"
    },
    { 
      type: "Alquiler" as LeadType, 
      icon: KeyRound, 
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      borderColor: "border-purple-500"
    },
  ]

  // Verificar si mostrar campos de habitaciones/baños
  const mostrarHabitacionesComprador = tiposConHabitaciones.includes(formData.tipoPropiedad)
  const mostrarHabitacionesVendedor = tiposConHabitaciones.includes(formData.tipoVenta)

  // Componente para mostrar error
  const ErrorMessage = ({ error }: { error?: string }) => (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 text-red-600"
        >
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit} 
      className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-3xl mx-2 sm:mx-auto border border-gray-100"
    >
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="inline-block rounded-xl sm:rounded-2xl mb-2 sm:mb-3 md:mb-4 overflow-hidden shadow-lg"
        >
          <Image
            src="/logo.jpg"
            alt="MR Soluciones Inmobiliarias"
            width={80}
            height={80}
            className="object-contain w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
          />
        </motion.div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Cuéntanos sobre tu interés inmobiliario
        </h2>
        <p className="text-sm sm:text-base text-gray-600">Completa el formulario y te contactaremos pronto</p>
      </div>

      {/* Campos iniciales */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 sm:space-y-4 md:space-y-6 mb-4 sm:mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Nombre */}
          <div className={errors.nombre ? "error-field" : ""}>
            <div className="relative">
              <Input
                name="nombre"
                placeholder="Nombre completo *"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`pl-10 pr-3 h-11 transition-all text-sm placeholder:text-sm ${
                  errors.nombre 
                    ? "border-red-500 border-2 bg-red-50 focus:border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                }`}
              />
              <Home className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.nombre ? "text-red-500" : "text-gray-400"}`} />
            </div>
            <ErrorMessage error={errors.nombre} />
          </div>
          
          {/* Email */}
          <div className={errors.email ? "error-field" : ""}>
            <div className="relative">
              <Input
                name="email"
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleInputChange}
                className={`pl-10 pr-3 h-11 transition-all text-sm placeholder:text-sm ${
                  errors.email 
                    ? "border-red-500 border-2 bg-red-50 focus:border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                }`}
              />
              <FileText className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.email ? "text-red-500" : "text-gray-400"}`} />
            </div>
            <ErrorMessage error={errors.email} />
          </div>
        </div>

        {/* WhatsApp */}
        <div className={errors.whatsapp ? "error-field" : ""}>
          <div className="relative">
            <Input
              name="whatsapp"
              placeholder="+34 600 000 000 *"
              value={formData.whatsapp}
              onChange={handleInputChange}
              className={`pl-10 pr-3 h-11 transition-all text-sm placeholder:text-sm ${
                errors.whatsapp 
                  ? "border-red-500 border-2 bg-red-50 focus:border-red-500 focus:ring-red-500" 
                  : "border-gray-300 focus:border-green-500 focus:ring-green-500"
              }`}
            />
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-base ${errors.whatsapp ? "text-red-500" : "text-gray-400"}`}>📱</span>
          </div>
          <ErrorMessage error={errors.whatsapp} />
        </div>
      </motion.div>

      {/* Tipo de interés */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6 sm:mb-8"
      >
        <label className="block text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
          ¿Qué te interesa? *
        </label>
        
        {/* Error de tipo de interés */}
        <AnimatePresence>
          {errors.leadType && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{errors.leadType}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {leadTypes.map(({ type, icon: Icon, color, bgColor, borderColor }) => (
            <motion.button
              key={type}
              type="button" 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setLeadType(type)
                if (errors.leadType) {
                  setErrors((prev) => ({ ...prev, leadType: "" }))
                }
              }}
                className={`relative p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl border-2 transition-all min-h-[44px] flex flex-col items-center justify-center ${
                leadType === type
                  ? `${borderColor} ${bgColor} shadow-lg`
                  : errors.leadType
                    ? "border-red-300 bg-red-50 hover:border-red-400"
                    : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`inline-flex p-1.5 sm:p-2 md:p-3 rounded-lg bg-gradient-to-br ${color} mb-1.5 sm:mb-2 md:mb-3`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 text-center leading-tight">{type}</div>
              
              {leadType === type && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-500 rounded-full p-0.5 sm:p-1"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Campos condicionales */}
      <AnimatePresence mode="wait">
        {leadType === "Comprador" && (
          <motion.div
            key="comprador"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl border border-blue-200">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                Información del comprador
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <Select onValueChange={(value) => handleSelectChange("presupuesto", value)}>
                <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                  <SelectValue placeholder="💰 Presupuesto" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menos-50.000">Menos de 50.000€</SelectItem>
                    <SelectItem value="50.000-100.000">50.000€ - 100.000€</SelectItem>
                    <SelectItem value="100.000-150.000">100.000€ - 150.000€</SelectItem>
                    <SelectItem value="150.000-200.000">150.000€ - 200.000€</SelectItem>
                    <SelectItem value="mas-200.000">Más de 200.000€</SelectItem>
                    <SelectItem value="no-se">No lo sé</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleSelectChange("zona", value)}>
                  <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                    <SelectValue placeholder="📍 Zona preferida" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ponferrada">Ponferrada</SelectItem>
                    <SelectItem value="Vega de Espinareda">Vega de Espinareda</SelectItem>
                    <SelectItem value="Camponaraya">Camponaraya</SelectItem>
                    <SelectItem value="Fabero">Fabero</SelectItem>
                    <SelectItem value="Bembibre">Bembibre</SelectItem>
                    <SelectItem value="Molinaseca">Molinaseca</SelectItem>
                    <SelectItem value="Carucedo">Carucedo</SelectItem>
                    <SelectItem value="otra">Otra zona</SelectItem>
                  </SelectContent>
                </Select>

                {/* Campo de texto para "Otra zona" - Comprador */}
                <AnimatePresence>
                  {formData.zona === "otra" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-2"
                    >
                      <Input
                        name="zonaOtra"
                        placeholder="📍 Indica la zona que te interesa"
                        value={formData.zonaOtra}
                        onChange={handleInputChange}
                        className="h-10 sm:h-11 md:h-12 bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm px-3"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Select onValueChange={(value) => handleSelectChange("tipoPropiedad", value)}>
                  <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                    <SelectValue placeholder="🏠 Tipo de propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piso">Piso</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Chalet">Chalet</SelectItem>
                    <SelectItem value="Local comercial">Local comercial</SelectItem>
                    <SelectItem value="Terreno">Terreno</SelectItem>
                    <SelectItem value="Garaje">Garaje</SelectItem>
                  </SelectContent>
                </Select>

                {/* Habitaciones - Solo si aplica */}
                <AnimatePresence>
                  {mostrarHabitacionesComprador && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Select onValueChange={(value) => handleSelectChange("habitaciones", value)}>
                        <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                          <SelectValue placeholder="🛏️ Habitaciones" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 habitación</SelectItem>
                          <SelectItem value="2">2 habitaciones</SelectItem>
                          <SelectItem value="3">3 habitaciones</SelectItem>
                          <SelectItem value="4+">4+ habitaciones</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Baños - Solo si aplica */}
                <AnimatePresence>
                  {mostrarHabitacionesComprador && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Select onValueChange={(value) => handleSelectChange("banos", value)}>
                        <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                          <SelectValue placeholder="🚿 Baños" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 baño</SelectItem>
                          <SelectItem value="2">2 baños</SelectItem>
                          <SelectItem value="3+">3+ baños</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={mostrarHabitacionesComprador ? "" : "md:col-span-2"}>
                  <Select onValueChange={(value) => handleSelectChange("urgencia", value)}>
                    <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                      <SelectValue placeholder="⏰ ¿Cuándo necesitas la propiedad?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Urgente (menos 1 mes)</SelectItem>
                      <SelectItem value="Media">1-3 meses</SelectItem>
                      <SelectItem value="Baja">Más de 3 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {leadType === "Vendedor" && (
          <motion.div
            key="vendedor"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl border border-green-200">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-green-900 mb-3 sm:mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                Información de la propiedad a vender
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <Select onValueChange={(value) => handleSelectChange("zonaPropiedad", value)}>
                  <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                    <SelectValue placeholder="📍 Zona de la propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ponferrada">Ponferrada</SelectItem>
                    <SelectItem value="Vega de Espinareda">Vega de Espinareda</SelectItem>
                    <SelectItem value="Camponaraya">Camponaraya</SelectItem>
                    <SelectItem value="Fabero">Fabero</SelectItem>
                    <SelectItem value="Bembibre">Bembibre</SelectItem>
                    <SelectItem value="Molinaseca">Molinaseca</SelectItem>
                    <SelectItem value="Carucedo">Carucedo</SelectItem>
                    <SelectItem value="otra">Otra zona</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleSelectChange("tipoVenta", value)}>
                  <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                    <SelectValue placeholder="🏠 Tipo de propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piso">Piso</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Chalet">Chalet</SelectItem>
                    <SelectItem value="Local comercial">Local comercial</SelectItem>
                    <SelectItem value="Terreno">Terreno</SelectItem>
                    <SelectItem value="Garaje">Garaje</SelectItem>
                  </SelectContent>
                </Select>

                {/* Campo de texto para "Otra zona" - Vendedor */}
                <AnimatePresence>
                  {formData.zonaPropiedad === "otra" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-2"
                    >
                      <Input
                        name="zonaPropiedadOtra"
                        placeholder="📍 Indica la zona de tu propiedad"
                        value={formData.zonaPropiedadOtra}
                        onChange={handleInputChange}
                        className="h-10 sm:h-11 md:h-12 bg-white border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm px-3"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Input
                  name="metrosCuadrados"
                  type="number"
                  placeholder="📐 Metros cuadrados"
                  value={formData.metrosCuadrados}
                  onChange={handleInputChange}
                  className="h-10 sm:h-11 md:h-12 bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm px-3"
                />

                {/* Habitaciones - Solo si aplica */}
                <AnimatePresence>
                  {mostrarHabitacionesVendedor && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Select onValueChange={(value) => handleSelectChange("habitacionesVenta", value)}>
                        <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                          <SelectValue placeholder="🛏️ Habitaciones" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 habitación</SelectItem>
                          <SelectItem value="2">2 habitaciones</SelectItem>
                          <SelectItem value="3">3 habitaciones</SelectItem>
                          <SelectItem value="4">4 habitaciones</SelectItem>
                          <SelectItem value="5+">5+ habitaciones</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Baños - Solo si aplica */}
                <AnimatePresence>
                  {mostrarHabitacionesVendedor && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Select onValueChange={(value) => handleSelectChange("banosVenta", value)}>
                        <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                          <SelectValue placeholder="🚿 Baños" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 baño</SelectItem>
                          <SelectItem value="2">2 baños</SelectItem>
                          <SelectItem value="3+">3+ baños</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Select onValueChange={(value) => handleSelectChange("precioEsperado", value)}>
                  <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                    <SelectValue placeholder="💰 Precio esperado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menos-50.000">Menos de 50.000€</SelectItem>
                    <SelectItem value="50.000-100.000">50.000€ - 100.000€</SelectItem>
                    <SelectItem value="100.000-150.000">100.000€ - 150.000€</SelectItem>
                    <SelectItem value="150.000-200.000">150.000€ - 200.000€</SelectItem>
                    <SelectItem value="mas-200.000">Más de 200.000€</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleSelectChange("documentosRegla", value)}>
                  <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                    <SelectValue placeholder="📄 ¿Documentos al día?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">Sí, todo en regla</SelectItem>
                    <SelectItem value="Necesito ayuda">Necesito ayuda</SelectItem>
                    <SelectItem value="no-seguro">No estoy seguro</SelectItem>
                  </SelectContent>
                </Select>

                <div className="md:col-span-2">
                  <Select onValueChange={(value) => handleSelectChange("urgenciaVenta", value)}>
                    <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                      <SelectValue placeholder="⏰ ¿Cuándo necesitas vender?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Urgente (menos 1 mes)</SelectItem>
                      <SelectItem value="Media">1-3 meses</SelectItem>
                      <SelectItem value="Baja">Más de 3 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {leadType === "Alquiler" && (
          <motion.div
            key="alquiler"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl border border-purple-200">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-purple-900 mb-3 sm:mb-4 flex items-center gap-2">
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                Información de alquiler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <Select onValueChange={(value) => handleSelectChange("tipoAlquiler", value)}>
                  <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                    <SelectValue placeholder="🔄 ¿Qué necesitas?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="busco">Busco alquilar</SelectItem>
                    <SelectItem value="ofrezco">Quiero poner en alquiler</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleSelectChange("zonaAlquiler", value)}>
                  <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                    <SelectValue placeholder="📍 Zona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ponferrada">Ponferrada</SelectItem>
                    <SelectItem value="vega-espinareda">Vega de Espinareda</SelectItem>
                    <SelectItem value="camponaraya">Camponaraya</SelectItem>
                    <SelectItem value="fabero">Fabero</SelectItem>
                    <SelectItem value="bembibre">Bembibre</SelectItem>
                    <SelectItem value="molinaseca">Molinaseca</SelectItem>
                    <SelectItem value="carucedo">Carucedo</SelectItem>
                    <SelectItem value="otra">Otra zona</SelectItem>
                  </SelectContent>
                </Select>

                {/* Campo de texto para "Otra zona" - Alquiler */}
                <AnimatePresence>
                  {formData.zonaAlquiler === "otra" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-2"
                    >
                      <Input
                        name="zonaAlquilerOtra"
                        placeholder="📍 Indica la zona"
                        value={formData.zonaAlquilerOtra}
                        onChange={handleInputChange}
                        className="h-10 sm:h-11 md:h-12 bg-white border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm px-3"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Select onValueChange={(value) => handleSelectChange("tipoPropiedadAlquiler", value)}>
                  <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                    <SelectValue placeholder="🏠 Tipo de propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piso">Piso</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="local">Local comercial</SelectItem>
                    <SelectItem value="garaje">Garaje</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleSelectChange("presupuestoAlquiler", value)}>
                  <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                    <SelectValue placeholder="💰 Presupuesto mensual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menos-300">Menos de 300€/mes</SelectItem>
                    <SelectItem value="300-500">300€ - 500€/mes</SelectItem>
                    <SelectItem value="500-700">500€ - 700€/mes</SelectItem>
                    <SelectItem value="mas-700">Más de 700€/mes</SelectItem>
                  </SelectContent>
                </Select>

                <div className="md:col-span-2">
                  <Select onValueChange={(value) => handleSelectChange("urgenciaAlquiler", value)}>
                    <SelectTrigger className="bg-white h-10 sm:h-11 md:h-12 text-sm min-h-[40px] sm:min-h-[44px]">
                      <SelectValue placeholder="⏰ ¿Cuándo lo necesitas?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Urgente (menos 1 mes)</SelectItem>
                      <SelectItem value="Media">1-3 meses</SelectItem>
                      <SelectItem value="Baja">Más de 3 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-4 sm:mb-6"
      >
        <textarea
          name="mensaje"
          placeholder="💬 Cuéntanos más detalles (opcional)"
          value={formData.mensaje}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 py-3 sm:px-4 sm:py-3 text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
          rows={3}
        />
      </motion.div>

      {/* Términos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-4 sm:mb-6"
      >
        <label 
          className={`flex items-start gap-2 sm:gap-3 cursor-pointer group p-2 sm:p-3 rounded-lg transition-all ${
            errors.aceptaTerminos ? "bg-red-50 border border-red-200" : ""
          }`}
        >
          <input
            type="checkbox"
            name="aceptaTerminos"
            checked={formData.aceptaTerminos}
            onChange={(e) => {
              handleInputChange(e)
              if (errors.aceptaTerminos) {
                setErrors((prev) => ({ ...prev, aceptaTerminos: "" }))
              }
            }}
            className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 rounded cursor-pointer flex-shrink-0 ${
              errors.aceptaTerminos 
                ? "border-red-500 text-red-600 focus:ring-red-500" 
                : "border-gray-300 text-green-600 focus:ring-green-500"
            }`}
          />
          <span className={`text-xs sm:text-sm group-hover:text-gray-900 transition-colors leading-relaxed ${
            errors.aceptaTerminos ? "text-red-700" : "text-gray-600"
          }`}>
            He leído y acepto la{" "}
            <Link href="/legal/aviso-legal" className="text-green-600 hover:text-green-700 font-medium underline">
              Política de Privacidad
            </Link>{" "}
            *
          </span>
        </label>
        <ErrorMessage error={errors.aceptaTerminos} />
      </motion.div>

      {/* Botón de envío */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              Enviando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Enviar Solicitud
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}