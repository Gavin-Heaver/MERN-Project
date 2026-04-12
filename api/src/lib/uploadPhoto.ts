import cloudinary from "../config/cloudinary";

interface UploadResult {
    url: string
    publicId: string
}

export async function uploadPhoto(
    buffer: Buffer,
    folder: string = 'uknighted/photos'
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error || !result) return reject(error ?? new Error('Upload failed'))
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                })
            }
        )
        stream.end(buffer)
    })
}

export async function deletePhoto(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId)
}