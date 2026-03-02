export interface Property {
  id: string
  titulo: string
  descripcion?: string        // Markdown
  precio: number
  tipo: 'venta' | 'alquiler'
  categoria?: string
  ubicacion?: string
  ciudad?: string
  metros_cuadrados?: number
  habitaciones?: number
  banos?: number
  imagenes?: string[]         // URLs directas Supabase Storage
  destacada?: boolean
  activa?: boolean
  slug: string
  created_at: string
}

export type PropertyType = Property['categoria']
export type PropertyStatus = Property['tipo']
