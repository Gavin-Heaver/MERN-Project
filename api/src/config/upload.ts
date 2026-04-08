import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = path.join(process.cwd(), 'uploads', 'users')

if (!fs.existsSync(uploadDir))
{
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) =>
    {
        cb(null, uploadDir)
    },
    filename: (_req, file, cb) =>
    {
        const safeOriginalName = file.originalname.replace(/\s+/g, '-')
        const uniqueName = `${Date.now()}-${safeOriginalName}`
        cb(null, uniqueName)
    }
})

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) =>
{
    if (file.mimetype.startsWith('image/'))
    {
        cb(null, true)
    }
    else
    {
        cb(new Error('Only image files are allowed'))
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits:
    {
        fileSize: 5 * 1024 * 1024
    }
})