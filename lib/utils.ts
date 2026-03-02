import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function getStatusBadgeVariant(tipo: string) {
  switch (tipo) {
    case 'venta':
      return 'success'
    case 'alquiler':
      return 'default'
    default:
      return 'default'
  }
}

export function getStatusLabel(tipo: string): string {
  switch (tipo) {
    case 'venta':
      return 'En Venta'
    case 'alquiler':
      return 'Alquiler'
    default:
      return tipo
  }
}
