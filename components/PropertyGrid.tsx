'use client'

import { useState } from 'react'
import { Property } from '@/types/property'
import { PropertyCard } from './PropertyCard'
import { PropertyAlertModal } from './PropertyAlertModal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bell } from 'lucide-react'

interface SearchCriteria {
  operacion?: string
  tipo?: string
  zona?: string
  precioMax?: string
  status?: string
}

interface PropertyGridProps {
  properties: Property[]
  className?: string
  loading?: boolean
  emptyMessage?: string
  searchCriteria?: SearchCriteria
}

export function PropertyGrid({
  properties,
  className,
  loading = false,
  emptyMessage = 'No se encontraron propiedades',
  searchCriteria = {},
}: PropertyGridProps) {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6', className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[500px] animate-pulse bg-muted rounded-xl"
            aria-label="Cargando propiedad"
          />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">{emptyMessage}</p>
            <p className="text-sm text-muted-foreground">
              ¿Quieres que te avisemos cuando encontremos propiedades que coincidan con tu búsqueda?
            </p>
          </div>
          <Button
            onClick={() => setIsAlertModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg px-6 py-6 h-auto"
          >
            <Bell className="w-5 h-5 mr-2" />
            Avísame
          </Button>
        </div>
        <PropertyAlertModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          searchCriteria={searchCriteria}
        />
      </>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6',
        className
      )}
      role="list"
      aria-label="Lista de propiedades"
    >
      {properties.map((property) => (
        <div key={property.id} role="listitem">
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  )
}

