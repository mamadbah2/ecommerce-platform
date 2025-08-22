import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fonction pour uploader une image
export async function uploadImage(file: File, path: string): Promise<string | null> {
  try {

    console.log('Variabeles:', { supabaseUrl, supabaseAnonKey })

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image')
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Le fichier est trop volumineux (max 5MB)')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { data, error } = await supabase.storage
      .from('products-pictures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading image:', error)
      throw new Error(`Erreur d'upload: ${error.message}`)
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('products-pictures')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

// Fonction pour supprimer une image
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // Extraire le path de l'URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.indexOf('products-pictures')
    if (bucketIndex === -1) return false
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage
      .from('products-pictures')
      .remove([filePath])

    if (error) {
      console.error('Error deleting image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

// Fonction pour uploader plusieurs images
export async function uploadMultipleImages(files: File[], sellerId: string): Promise<string[]> {
  const uploadPromises = files.map(file => 
    uploadImage(file, `sellers/${sellerId}`)
  )

  try {
    const results = await Promise.allSettled(uploadPromises)
    const successfulUploads: string[] = []
    const errors: string[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successfulUploads.push(result.value)
      } else {
        errors.push(`Erreur avec ${files[index].name}: ${result.status === 'rejected' ? result.reason : 'Échec de l\'upload'}`)
      }
    })

    if (errors.length > 0) {
      console.warn('Erreurs lors de l\'upload:', errors)
    }

    return successfulUploads
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw new Error('Erreur lors de l\'upload des images')
  }
}

// Fonction pour vérifier si Supabase est configuré
export function checkSupabaseConfig(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Fonction pour tester la connexion au bucket
export async function testBucketConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('Bucket connection error:', error)
      return false
    }

    const productsBucket = data.find(bucket => bucket.name === 'products-pictures')
    return !!productsBucket
  } catch (error) {
    console.error('Connection test error:', error)
    return false
  }
}
