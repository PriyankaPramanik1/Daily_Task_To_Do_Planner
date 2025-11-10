import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/config.cloudinary';

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req: Request, res: Response) => {
        return {
            folder: 'user',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'heif'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
        }
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

export default upload;
