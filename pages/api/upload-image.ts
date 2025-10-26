import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import formidable, { File } from 'formidable'
import fs from 'fs'

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to parse form data
const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false })
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      resolve({ fields, files })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse the form data
    const { files } = await parseForm(req)

    // Get the uploaded file
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image

    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(imageFile.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (imageFile.size > maxSize) {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' })
    }

    // Read the file
    const fileBuffer = fs.readFileSync(imageFile.filepath)

    // Generate unique filename
    const fileExt = imageFile.originalFilename?.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `equipment/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('equipment-images')
      .upload(filePath, fileBuffer, {
        contentType: imageFile.mimetype || 'image/jpeg',
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return res.status(500).json({ error: 'Failed to upload image', details: error.message })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('equipment-images')
      .getPublicUrl(filePath)

    // Clean up temp file
    fs.unlinkSync(imageFile.filepath)

    return res.status(200).json({
      success: true,
      imageUrl: urlData.publicUrl,
      filePath: filePath,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
