'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/types/property'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, MapPin, Bed, Bath, Square } from 'lucide-react'
import { formatPrice, getStatusBadgeVariant, getStatusLabel } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const imageUrl = property.imagenes?.[0] ?? '/placeholder-property.jpg'
  const imageAlt = property.titulo

  return (
    <Link href={`/propiedades/${property.slug}`} className="block h-full">
      <Card
        className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        hover="lift"
        interactive
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-110"
            priority={false}
          />
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 sm:gap-2 z-10">
            {property.destacada && (
              <Badge variant="gradient" className="shadow-lg text-xs sm:text-sm py-1 px-2">
                ⭐ Destacado
              </Badge>
            )}
            <Badge variant={getStatusBadgeVariant(property.tipo)} className="text-xs sm:text-sm py-1 px-2">
              {getStatusLabel(property.tipo)}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 min-h-[2.5rem]">
              {property.titulo}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="line-clamp-1 text-sm">
                {property.ubicacion}
                {property.ciudad && `, ${property.ciudad}`}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-primary">
              {formatPrice(property.precio)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
            {property.habitaciones !== undefined && property.habitaciones > 0 && (
              <div className="flex items-center gap-1.5" aria-label={`${property.habitaciones} habitaciones`}>
                <Bed className="h-4 w-4" aria-hidden="true" />
                <span>{property.habitaciones}</span>
              </div>
            )}
            {property.banos !== undefined && property.banos > 0 && (
              <div className="flex items-center gap-1.5" aria-label={`${property.banos} baños`}>
                <Bath className="h-4 w-4" aria-hidden="true" />
                <span>{property.banos}</span>
              </div>
            )}
            {property.metros_cuadrados !== undefined && (
              <div className="flex items-center gap-1.5" aria-label={`${property.metros_cuadrados} metros cuadrados`}>
                <Square className="h-4 w-4" aria-hidden="true" />
                <span>{property.metros_cuadrados} m²</span>
              </div>
            )}
          </div>

          {property.categoria && (
            <div className="flex items-center gap-1.5 text-sm">
              <Home className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Badge variant="outline" size="sm">
                {property.categoria.charAt(0).toUpperCase() + property.categoria.slice(1)}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
