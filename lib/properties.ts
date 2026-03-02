import { supabase } from './supabase'
import { Property } from '@/types/property'

export async function getFeaturedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('propiedades')
    .select('*')
    .eq('destacada', true)
    .eq('activa', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching featured properties:', error.message)
    return []
  }

  return data ?? []
}

export async function getAllProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('propiedades')
    .select('*')
    .eq('activa', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error.message)
    return []
  }

  return data ?? []
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('propiedades')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('propiedades')
    .select('slug')
    .eq('activa', true)

  if (error) return []
  return data?.map((p) => p.slug) ?? []
}
