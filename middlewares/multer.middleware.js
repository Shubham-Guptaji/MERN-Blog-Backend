import path from 'path';
import multer from 'multer';

const validExtensions = [".jpg", ".jpeg", ".webp", ".png", ".mp4", ".pdf", ".webm", ".mpeg", ".avi", ".ogv"];

const upload = multer({
    dest: "uploads/",
    limits: {fileSize: 10 * 1024 * 1024}, 
    storage: multer.diskStorage({
        destination: "uploads/",
        filename: (_req, file, cb) => { 
            cb(null, file.originalname);
        }
    }), 
    fileFilter: (_req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase();

        if (!validExtensions.includes(ext)) {
            cb(new Error(`Unsupported file type! ${ext}`), false);
            return;
        }

        cb(null, true);
    }
});

export default upload;
