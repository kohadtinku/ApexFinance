import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Uploads an image buffer to Cloudinary with automatic local disk storage fallback.
 * If Cloudinary returns 403 (e.g. missing permissions), quota exceeded, or network issues,
 * it saves the file locally in backend/uploads/ and returns the local URL.
 */
export const uploadToCloudinary = async (buffer, folder = 'expense-tracker/receipts') => {
  // 1. Try uploading to Cloudinary
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, res) => {
          if (error) return reject(error);
          resolve(res);
        }
      );
      stream.end(buffer);
    });

    if (result && result.secure_url) {
      return result;
    }
  } catch (cloudinaryError) {
    console.warn(
      '⚠️ Cloudinary upload returned error (missing permissions or 403):',
      cloudinaryError.message || cloudinaryError
    );
    console.log('🔄 Seamlessly saving image to local storage fallback...');
  }

  // 2. Fallback to Local Disk Storage
  try {
    const subFolder = folder.includes('profile') ? 'profiles' : 'receipts';
    const uploadDir = path.join(__dirname, '..', 'uploads', subFolder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.jpg`;
    const filePath = path.join(uploadDir, uniqueFilename);

    await fs.promises.writeFile(filePath, buffer);
    const localUrl = `/uploads/${subFolder}/${uniqueFilename}`;

    return {
      secure_url: localUrl,
      url: localUrl,
      public_id: uniqueFilename,
    };
  } catch (diskError) {
    console.error('❌ Failed to save image locally:', diskError);
    throw new Error('Image upload failed');
  }
};