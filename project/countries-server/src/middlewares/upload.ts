import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = process.env.UPLOADS_DIR ?? "uploads";
const profilesDir = path.join(process.cwd(), uploadsDir, "profiles");

fs.mkdirSync(profilesDir, { recursive: true });

export const uploadProfileImage = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, profilesDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeExt = ext || ".jpg";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
 fileFilter: (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"));
    return;
  }
  cb(null, true);
},

});
