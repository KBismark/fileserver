
import mongoose from 'mongoose';

type Upload = {
    _id: string;
    downloadCount: number; 
    shareCount: number;
    description: string;
    title: string;
    type: string;
    suffix: string;
    time: Number;
}

const UploadSchema = new mongoose.Schema<Upload>({
  _id: { type: String, required: true }, // File_id
  downloadCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  description: { type: String, required: true },
  title: { type: String, required: true },
  suffix: { type: String, required: true }, // File extension
  time: {type: Number},
  type: {type: String, required: true}
});

export const Uploader = mongoose.model<Upload>('filedata', UploadSchema);
