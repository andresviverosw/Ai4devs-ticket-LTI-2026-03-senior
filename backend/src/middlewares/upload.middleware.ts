import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { AppError } from '../errors/AppError';

function uploadRoot(): string {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), 'uploads');
}

function cvsDir(): string {
  return path.join(uploadRoot(), 'cvs');
}

export function ensureUploadDirs(): void {
  const dir = cvsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDirs();
    cb(null, cvsDir());
  },
  filename: (req, file, cb) => {
    const id = req.params.id as string;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${id}-${Date.now()}${ext}`);
  },
});

export const uploadCvMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ['.pdf', '.docx'];
    const allowedMime = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedExt.includes(ext) && allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          400,
          'Only PDF and DOCX files are allowed.',
          'INVALID_FILE_TYPE',
        ),
      );
    }
  },
}).single('file');

/** Multer wrapper: forwards AppError to next, other errors to next(err) */
export function uploadCv(
  req: Parameters<typeof uploadCvMiddleware>[0],
  res: Parameters<typeof uploadCvMiddleware>[1],
  next: Parameters<typeof uploadCvMiddleware>[2],
): void {
  uploadCvMiddleware(req, res, (err: unknown) => {
    if (err) {
      return next(err);
    }
    next();
  });
}
