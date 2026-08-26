import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { existsSync, mkdirSync, openSync, readSync, closeSync, renameSync, unlinkSync } from "fs";
import { join } from "path";
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
      // Uzantı burada dosya adından DEĞİL, yükleme sonrası gerçek dosya
      // içeriğinden (magic bytes) belirlenir — bkz. finalizeUploadedImage.
      filename: (_req, _file, cb) => cb(null, randomUUID()),
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

const MAGIC_BYTES: { ext: string; signature: number[]; offset?: number }[] = [
  { ext: ".jpg", signature: [0xff, 0xd8, 0xff] },
  { ext: ".png", signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: ".webp", signature: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // "WEBP" at byte 8, after the RIFF header
];

/**
 * `fileFilter`'daki mimetype kontrolü istemcinin gönderdiği Content-Type'a
 * güvenir ve sahtelenebilir (ör. .svg içeriğini image/jpeg olarak
 * gönderip .svg uzantısıyla kaydettirip XSS tetiklemek). Bu yüzden dosya
 * diske yazıldıktan sonra gerçek baytlarını (magic bytes) doğrulayıp
 * uzantıyı SADECE bu doğrulanmış türe göre belirliyoruz — istemcinin
 * gönderdiği ad/mimetype hiçbir zaman uzantıyı belirlemez.
 */
export function finalizeUploadedImage(file: Express.Multer.File): string {
  const fd = openSync(file.path, "r");
  const header = Buffer.alloc(16);
  readSync(fd, header, 0, 16, 0);
  closeSync(fd);

  const match = MAGIC_BYTES.find((m) => {
    const start = m.offset ?? 0;
    return m.signature.every((byte, i) => header[start + i] === byte);
  });

  if (!match) {
    unlinkSync(file.path);
    throw new BadRequestException("Dosya içeriği geçerli bir JPEG, PNG veya WEBP resmi değil");
  }

  const finalFilename = `${file.filename}${match.ext}`;
  renameSync(file.path, join(file.destination, finalFilename));
  return finalFilename;
}
