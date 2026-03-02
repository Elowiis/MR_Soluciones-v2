"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Property } from "@/types/property"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice, getStatusLabel } from "@/lib/utils"
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  ImageIcon,
  Loader2,
  Wand2,
} from "lucide-react"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // elimina acentos
    .replace(/[^a-z0-9\s-]/g, "")     // solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, "-")             // espacios → guiones
    .replace(/-+/g, "-")              // múltiples guiones → uno
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface PropertyForm {
  titulo: string
  descripcion: string
  precio: string
  tipo: "venta" | "alquiler"
  categoria: string
  ubicacion: string
  ciudad: string
  metros_cuadrados: string
  habitaciones: string
  banos: string
  destacada: boolean
  activa: boolean
  slug: string
}

const emptyForm: PropertyForm = {
  titulo: "",
  descripcion: "",
  precio: "",
  tipo: "venta",
  categoria: "",
  ubicacion: "",
  ciudad: "",
  metros_cuadrados: "",
  habitaciones: "",
  banos: "",
  destacada: false,
  activa: true,
  slug: "",
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PropiedadesAdminPage() {
  return (
    <ProtectedRoute>
      <PropiedadesContent />
    </ProtectedRoute>
  )
}

// ─── Contenido ───────────────────────────────────────────────────────────────

function PropiedadesContent() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PropertyForm>(emptyForm)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    setLoading(true)
    const { data } = await supabase
      .from("propiedades")
      .select("*")
      .order("created_at", { ascending: false })
    setProperties(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setUploadedImages([])
    setUploadError(null)
    setShowModal(true)
  }

  function openEdit(property: Property) {
    setEditingId(property.id)
    setForm({
      titulo: property.titulo,
      descripcion: property.descripcion ?? "",
      precio: String(property.precio),
      tipo: property.tipo,
      categoria: property.categoria ?? "",
      ubicacion: property.ubicacion ?? "",
      ciudad: property.ciudad ?? "",
      metros_cuadrados: property.metros_cuadrados !== undefined ? String(property.metros_cuadrados) : "",
      habitaciones: property.habitaciones !== undefined ? String(property.habitaciones) : "",
      banos: property.banos !== undefined ? String(property.banos) : "",
      destacada: property.destacada ?? false,
      activa: property.activa ?? true,
      slug: property.slug,
    })
    setUploadedImages(property.imagenes ?? [])
    setUploadError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
    setUploadedImages([])
    setUploadError(null)
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    const isCheckbox = (e.target as HTMLInputElement).type === "checkbox"
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined

    setForm((prev) => {
      const updated = { ...prev, [name]: isCheckbox ? checked : value }
      // Auto-rellenar slug desde el título solo cuando el slug está vacío
      if (name === "titulo" && !prev.slug) {
        updated.slug = generateSlug(value)
      }
      return updated
    })
  }

  function handleGenerateSlug() {
    if (!form.titulo) return
    setForm((prev) => ({ ...prev, slug: generateSlug(prev.titulo) }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadError(null)
    const newUrls: string[] = []
    const errors: string[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        errors.push(`${file.name}: ${data.error ?? "Error desconocido"}`)
      } else {
        newUrls.push(data.url)
      }
    }

    setUploadedImages((prev) => [...prev, ...newUrls])
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""

    if (errors.length > 0) {
      setUploadError(
        errors.length === 1
          ? `Error al subir imagen: ${errors[0]}`
          : `Errores al subir:\n${errors.join("\n")}`
      )
    }
  }

  function removeImage(url: string) {
    setUploadedImages((prev) => prev.filter((u) => u !== url))
  }

  async function handleSave() {
    if (!form.titulo || !form.precio || !form.slug) {
      alert("Título, precio y slug son obligatorios")
      return
    }

    setSaving(true)

    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion || null,
      precio: parseFloat(form.precio),
      tipo: form.tipo,
      categoria: form.categoria || null,
      ubicacion: form.ubicacion || null,
      ciudad: form.ciudad || null,
      metros_cuadrados: form.metros_cuadrados ? parseFloat(form.metros_cuadrados) : null,
      habitaciones: form.habitaciones ? parseInt(form.habitaciones) : null,
      banos: form.banos ? parseInt(form.banos) : null,
      imagenes: uploadedImages.length > 0 ? uploadedImages : null,
      destacada: form.destacada,
      activa: form.activa,
      slug: form.slug,
    }

    let error
    if (editingId) {
      ;({ error } = await supabase.from("propiedades").update(payload).eq("id", editingId))
    } else {
      ;({ error } = await supabase.from("propiedades").insert(payload))
    }

    setSaving(false)

    if (error) {
      alert(`Error al guardar: ${error.message}`)
      return
    }

    closeModal()
    fetchProperties()
  }

  async function handleDelete(id: string) {
    await supabase.from("propiedades").delete().eq("id", id)
    setDeleteConfirm(null)
    fetchProperties()
  }

  async function toggleActiva(property: Property) {
    await supabase
      .from("propiedades")
      .update({ activa: !property.activa })
      .eq("id", property.id)
    fetchProperties()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Propiedades</h1>
              <p className="text-muted-foreground mt-1">Gestiona el inventario inmobiliario</p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Propiedad
            </Button>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : properties.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              No hay propiedades. Crea la primera.
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Título</th>
                      <th className="text-left p-4 font-semibold">Tipo</th>
                      <th className="text-left p-4 font-semibold">Precio</th>
                      <th className="text-left p-4 font-semibold">Ciudad</th>
                      <th className="text-left p-4 font-semibold">Estado</th>
                      <th className="text-left p-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => (
                      <tr key={prop.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{prop.titulo}</div>
                          <div className="text-xs text-muted-foreground">{prop.slug}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{getStatusLabel(prop.tipo)}</Badge>
                        </td>
                        <td className="p-4 font-semibold text-primary">
                          {formatPrice(prop.precio)}
                        </td>
                        <td className="p-4 text-muted-foreground">{prop.ciudad ?? prop.ubicacion ?? "—"}</td>
                        <td className="p-4">
                          <button onClick={() => toggleActiva(prop)} title="Click para cambiar">
                            <Badge variant={prop.activa ? "default" : "secondary"}>
                              {prop.activa ? "Activa" : "Inactiva"}
                            </Badge>
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(prop)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirm(prop.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Modal de confirmación de borrado */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-lg mb-2">¿Eliminar propiedad?</h3>
            <p className="text-muted-foreground text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Eliminar
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
          <Card className="w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? "Editar Propiedad" : "Nueva Propiedad"}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Título <span className="text-destructive">*</span>
                </label>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  placeholder="Ej: Piso luminoso en el centro"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Slug (URL) <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="piso-luminoso-centro-ponferrada"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSlug}
                    disabled={!form.titulo}
                    title="Generar slug desde el título"
                    className="shrink-0 gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Generar
                  </Button>
                </div>
                {form.slug && (
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: /propiedades/<span className="font-mono text-foreground">{form.slug}</span>
                  </p>
                )}
              </div>

              {/* Precio + Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Precio (€) <span className="text-destructive">*</span>
                  </label>
                  <input
                    name="precio"
                    type="number"
                    value={form.precio}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="150000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Operación</label>
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  >
                    <option value="venta">Venta</option>
                    <option value="alquiler">Alquiler</option>
                  </select>
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">Seleccionar...</option>
                  <option value="piso">Piso</option>
                  <option value="casa">Casa</option>
                  <option value="chalet">Chalet</option>
                  <option value="ático">Ático</option>
                  <option value="garaje">Garaje</option>
                  <option value="estudio">Estudio</option>
                  <option value="local">Local</option>
                  <option value="oficina">Oficina</option>
                  <option value="terreno">Terreno</option>
                </select>
              </div>

              {/* Ubicación + Ciudad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección / Zona</label>
                  <input
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="Calle Mayor, 12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad</label>
                  <input
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="Ponferrada"
                  />
                </div>
              </div>

              {/* m², habitaciones, baños */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">m²</label>
                  <input
                    name="metros_cuadrados"
                    type="number"
                    value={form.metros_cuadrados}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Habitaciones</label>
                  <input
                    name="habitaciones"
                    type="number"
                    value={form.habitaciones}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Baños</label>
                  <input
                    name="banos"
                    type="number"
                    value={form.banos}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="2"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium mb-1">Descripción (Markdown)</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none"
                  placeholder="Describe la propiedad. Puedes usar **negrita**, *cursiva*, ## Títulos, etc."
                />
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="destacada"
                    checked={form.destacada}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Destacada</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="activa"
                    checked={form.activa}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Activa (visible en web)</span>
                </label>
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium mb-2">Imágenes</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {uploading ? "Subiendo..." : "Haz clic para subir imágenes"}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Error de subida */}
                {uploadError && (
                  <div className="mt-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                    <p className="text-sm text-destructive whitespace-pre-line">{uploadError}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Asegúrate de que el bucket &quot;propiedades&quot; existe y es público en Supabase Storage.
                    </p>
                  </div>
                )}

                {/* Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {uploadedImages.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-md overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(url)}
                          className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                    <label
                      htmlFor="image-upload"
                      className="aspect-square rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? "Guardar cambios" : "Crear propiedad"}
              </Button>
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}