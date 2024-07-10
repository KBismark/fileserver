
import mongoose from 'mongoose';

type Upload = {
    _id: string;
    downloadCount: number; 
    shareCount: number;
}

const UploadSchema = new mongoose.Schema<Upload>({
  _id: { type: String, required: true }, // File_id
  downloadCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 }
});

export const Uploader = mongoose.model<Upload>('filedata', UploadSchema);
