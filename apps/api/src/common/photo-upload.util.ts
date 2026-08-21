import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { existsSync, mkdirSync } from "fs";
import { extname, join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Belirtilen alt klasöre (uploads/<subdir>) tekil resim yükleyen multer ayarları. */
export function photoUploadOptions(subdir: string) {
  const dir = join(process.cwd(), "uploads", subdir);
  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req: unknown, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(new BadRequestException("Sadece JPEG, PNG veya WEBP resim dosyaları yüklenebilir"), false);
        return;
      }
      cb(null, true);
    },
  };
}
