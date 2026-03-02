import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPropertyBySlug, getAllSlugs } from '@/lib/properties'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Home,
  MessageCircle,
} from 'lucide-react'
import { MarkdownRenderer } from '@/lib/markdown-renderer'
import type { Metadata } from 'next'
import { PropertyGallery } from '@/components/PropertyGallery'
import { formatPrice, getStatusBadgeVariant, getStatusLabel } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)

  if (!property) {
    return { title: 'Propiedad no encontrada' }
  }

  const imageUrl = property.imagenes?.[0]
  const description = property.descripcion
    ? property.descripcion.slice(0, 160) + (property.descripcion.length > 160 ? '...' : '')
    : `Propiedad en ${property.ubicacion ?? property.ciudad} - ${property.metros_cuadrados ?? ''}m²`

  return {
    title: `${property.titulo} - ${formatPrice(property.precio)}`,
    description,
    openGraph: {
      title: property.titulo,
      description: `Propiedad en ${property.ubicacion ?? property.ciudad} - ${formatPrice(property.precio)}`,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  }
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)

  if (!property) {
    notFound()
  }

  const mainImageUrl = property.imagenes?.[0] ?? '/placeholder-property.jpg'
  const galleryImages = property.imagenes?.slice(1).map((url) => ({
    url,
    alt: property.titulo,
  })) ?? []

  const whatsappMessage = encodeURIComponent(
    `Hola, estoy interesado en la propiedad: ${property.titulo} - ${property.ubicacion ?? ''}`
  )
  const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header con botón volver */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <Link href="/propiedades">
            <Button variant="ghost" className="gap-2 text-sm sm:text-base min-h-[44px]">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver a propiedades</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-20 md:pb-8">
        {/* Título y badges */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {property.destacada && <Badge variant="gradient">⭐ Destacado</Badge>}
            <Badge variant={getStatusBadgeVariant(property.tipo)}>
              {getStatusLabel(property.tipo)}
            </Badge>
            {property.categoria && (
              <Badge variant="outline" className="gap-1.5">
                <Home className="w-3 h-3" />
                {property.categoria.charAt(0).toUpperCase() + property.categoria.slice(1)}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {property.titulo}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground mb-3 sm:mb-4">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base md:text-lg">
              {property.ubicacion}
              {property.ciudad && `, ${property.ciudad}`}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 sm:mb-6">
            {formatPrice(property.precio)}
          </div>
        </div>

        {/* Galería de imágenes */}
        <PropertyGallery
          mainImage={{ url: mainImageUrl, alt: property.titulo }}
          gallery={galleryImages}
        />

        {/* Información principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Características principales */}
            <div className="bg-card rounded-lg border p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Características</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {property.habitaciones !== undefined && property.habitaciones > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    <Bed className="w-8 h-8 text-primary" />
                    <div className="text-center">
                      <div className="text-2xl font-bold">{property.habitaciones}</div>
                      <div className="text-sm text-muted-foreground">Habitaciones</div>
                    </div>
                  </div>
                )}
                {property.banos !== undefined && property.banos > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    <Bath className="w-8 h-8 text-primary" />
                    <div className="text-center">
                      <div className="text-2xl font-bold">{property.banos}</div>
                      <div className="text-sm text-muted-foreground">Baños</div>
                    </div>
                  </div>
                )}
                {property.metros_cuadrados !== undefined && (
                  <div className="flex flex-col items-center gap-2">
                    <Square className="w-8 h-8 text-primary" />
                    <div className="text-center">
                      <div className="text-2xl font-bold">{property.metros_cuadrados}</div>
                      <div className="text-sm text-muted-foreground">m²</div>
                    </div>
                  </div>
                )}
                {property.categoria && (
                  <div className="flex flex-col items-center gap-2">
                    <Home className="w-8 h-8 text-primary" />
                    <div className="text-center">
                      <div className="text-lg font-bold capitalize">{property.categoria}</div>
                      <div className="text-sm text-muted-foreground">Tipo</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            {property.descripcion && (
              <div className="bg-card rounded-lg border p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Descripción</h2>
                <MarkdownRenderer
                  content={property.descripcion}
                  className="prose prose-slate max-w-none text-sm sm:text-base"
                />
              </div>
            )}
          </div>

          {/* Sidebar con botón de contacto */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-4 sm:p-6 sticky top-20 md:top-24">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                ¿Interesado en esta propiedad?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Contáctanos para más información o agendar una visita
              </p>
              <div className="space-y-3">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 min-h-[44px] text-sm sm:text-base">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Contactar por WhatsApp
                  </Button>
                </a>
                <Link href="/#lead-form">
                  <Button variant="outline" className="w-full min-h-[44px] text-sm sm:text-base">
                    Solicitar información
                  </Button>
                </Link>
              </div>
              <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                <div>
                  <div className="font-semibold mb-1">Ubicación</div>
                  <div className="text-muted-foreground">
                    {property.ubicacion}
                    {property.ciudad && `, ${property.ciudad}`}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Operación</div>
                  <Badge variant={getStatusBadgeVariant(property.tipo)}>
                    {getStatusLabel(property.tipo)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Fijo Móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background border-t border-border p-4 shadow-lg">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 min-h-[44px] text-base font-semibold">
            <MessageCircle className="w-5 h-5" />
            Contactar por WhatsApp
          </Button>
        </a>
      </div>
    </div>
  )
}
