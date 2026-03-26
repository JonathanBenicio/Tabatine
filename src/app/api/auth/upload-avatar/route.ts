import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Erro ao fazer upload da imagem.' }, { status: 500 })
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // Update user metadata to set the avatar url right away
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: data.publicUrl }
    })

    if (updateError) {
      console.error('Update metadata error:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar perfil com a nova imagem.' }, { status: 500 })
    }

    return NextResponse.json({ publicUrl: data.publicUrl })
  } catch (error) {
    console.error('Erro inesperado ao fazer upload do avatar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
