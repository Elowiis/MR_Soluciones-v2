import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente con service role — salta RLS, solo en servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await supabaseAdmin.storage
      .from('propiedades')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: publicData } = supabaseAdmin.storage
      .from('propiedades')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicData.publicUrl })
  } catch {
    return NextResponse.json({ error: 'Error interno al subir el archivo' }, { status: 500 })
  }
}