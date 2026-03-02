'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getAllProperties } from '@/lib/properties'
import { PropertyGrid } from '@/components/PropertyGrid'
import { Property, PropertyStatus } from '@/types/property'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'
import { Filter, X, MapPin } from 'lucide-react'

const propertyTypes: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'piso', label: 'Piso' },
  { value: 'casa', label: 'Casa' },
  { value: 'ático', label: 'Ático' },
  { value: 'garaje', label: 'Garaje' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'local', label: 'Local' },
  { value: 'oficina', label: 'Oficina' },
]

const statusOptions: { value: PropertyStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'venta', label: 'En Venta' },
  { value: 'alquiler', label: 'Alquiler' },
]

const zonas = [
  { value: 'todas', label: 'Todas las zonas' },
  { value: 'ponferrada', label: 'Ponferrada' },
  { value: 'bembibre', label: 'Bembibre' },
  { value: 'camponaraya', label: 'Camponaraya' },
  { value: 'carracedelo', label: 'Carracedelo' },
  { value: 'cacabelos', label: 'Cacabelos' },
  { value: 'villafranca', label: 'Villafranca del Bierzo' },
  { value: 'toral', label: 'Toral de los Vados' },
  { value: 'molinaseca', label: 'Molinaseca' },
]

function PropertiesContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus | 'all'>('all')
  const [selectedZona, setSelectedZona] = useState<string>('todas')
  const [precioMax, setPrecioMax] = useState<string>('sin-limite')
  const [showFilters, setShowFilters] = useState(false)

  const formatPrecioDisplay = (precio: string) => {
    if (!precio || precio === 'sin-limite') return ''
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(parseInt(precio))
  }

  useEffect(() => {
    const tipo = searchParams.get('tipo')
    const zona = searchParams.get('zona')
    const precioMaxParam = searchParams.get('precioMax')
    const operacion = searchParams.get('operacion')

    if (tipo && tipo !== 'todos') {
      setSelectedType(tipo)
    } else {
      setSelectedType('all')
    }

    if (zona && zona !== 'todas') {
      setSelectedZona(zona)
    } else {
      setSelectedZona('todas')
    }

    if (precioMaxParam && precioMaxParam !== 'sin-limite') {
      setPrecioMax(precioMaxParam)
    } else {
      setPrecioMax('sin-limite')
    }

    if (operacion && operacion !== 'todos') {
      if (operacion === 'comprar') {
        setSelectedStatus('venta')
      } else if (operacion === 'alquilar') {
        setSelectedStatus('alquiler')
      }
    } else {
      setSelectedStatus('all')
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true)
        const data = await getAllProperties()
        setProperties(data)
        setFilteredProperties(data)
      } catch {
        // Error silenciado — el estado vacío ya indica fallo al usuario
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  useEffect(() => {
    let filtered = [...properties]

    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter((prop) => prop.categoria === selectedType)
    }

    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter((prop) => prop.tipo === selectedStatus)
    }

    if (selectedZona && selectedZona !== 'todas') {
      filtered = filtered.filter((prop) =>
        prop.ubicacion?.toLowerCase().includes(selectedZona.toLowerCase()) ||
        prop.ciudad?.toLowerCase().includes(selectedZona.toLowerCase())
      )
    }

    if (precioMax && precioMax !== 'sin-limite') {
      if (precioMax === '300000') {
        filtered = filtered.filter((prop) => prop.precio >= 300000)
      } else {
        const precioMaxNum = parseInt(precioMax)
        filtered = filtered.filter((prop) => prop.precio <= precioMaxNum)
      }
    }

    setFilteredProperties(filtered)
  }, [selectedType, selectedStatus, selectedZona, precioMax, properties])

  const clearFilters = () => {
    setSelectedType('all')
    setSelectedStatus('all')
    setSelectedZona('todas')
    setPrecioMax('sin-limite')
  }

  const activeFiltersCount =
    (selectedType !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0) +
    (selectedZona !== 'todas' ? 1 : 0) +
    (precioMax && precioMax !== 'sin-limite' ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
        <Image
          src="/clubnautico.jpg"
          alt="Fondo propiedades"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/85 to-emerald-800/75" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
              Todas las Propiedades
            </h1>
            <p className="text-white/80 text-xs sm:text-sm md:text-base">
              Explora nuestra selección de propiedades disponibles
            </p>
          </div>

          <div className="hidden md:block">
            <div className="relative w-24 h-24 bg-white rounded-xl p-2 shadow-lg">
              <Image
                src="/logo.jpg"
                alt="MR Soluciones Inmobiliarias"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 md:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          <div
            className={`${
              showFilters ? 'block' : 'hidden'
            } md:block bg-card rounded-lg border p-4 sm:p-6 mb-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </h2>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Propiedad</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Operación</label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as PropertyStatus | 'all')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar operación" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Zonas
                </label>
                <Select value={selectedZona} onValueChange={setSelectedZona}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar zona" />
                  </SelectTrigger>
                  <SelectContent>
                    {zonas.map((zona) => (
                      <SelectItem key={zona.value} value={zona.value}>
                        {zona.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              {filteredProperties.length === 1
                ? '1 propiedad encontrada'
                : `${filteredProperties.length} propiedades encontradas`}
            </p>
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedType !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Tipo: {propertyTypes.find((t) => t.value === selectedType)?.label}
                    <button
                      onClick={() => setSelectedType('all')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedStatus !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Operación: {statusOptions.find((s) => s.value === selectedStatus)?.label}
                    <button
                      onClick={() => setSelectedStatus('all')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedZona !== 'todas' && (
                  <Badge variant="secondary" className="gap-1">
                    Zona:{' '}
                    {zonas.find((z) => z.value === selectedZona)?.label ||
                      selectedZona.charAt(0).toUpperCase() + selectedZona.slice(1)}
                    <button
                      onClick={() => setSelectedZona('todas')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {precioMax && precioMax !== 'sin-limite' && (
                  <Badge variant="secondary" className="gap-1">
                    Precio máx: {formatPrecioDisplay(precioMax)}
                    <button
                      onClick={() => setPrecioMax('sin-limite')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        <PropertyGrid
          properties={filteredProperties}
          loading={loading}
          emptyMessage="No se encontraron propiedades con los filtros seleccionados"
          searchCriteria={{
            operacion: searchParams.get('operacion') || undefined,
            tipo: selectedType !== 'all' ? selectedType : undefined,
            zona: selectedZona !== 'todas' ? selectedZona : undefined,
            precioMax: precioMax !== 'sin-limite' ? precioMax : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
          }}
        />
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Cargando...
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  )
}
