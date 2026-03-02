import { getFeaturedProperties } from '@/lib/properties'
import { PropertyGrid } from './PropertyGrid'

export async function FeaturedPropertiesSection() {
  const properties = await getFeaturedProperties()

  if (properties.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            ⭐ Propiedades Destacadas
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Descubre tu próximo hogar
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Selección exclusiva de propiedades con las mejores ubicaciones y características
          </p>
        </div>
        <PropertyGrid
          properties={properties}
          emptyMessage="No hay propiedades destacadas disponibles en este momento"
        />
      </div>
    </section>
  )
}
