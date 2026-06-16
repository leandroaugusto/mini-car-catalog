import { InferSchemaType, Schema, model } from 'mongoose';

const miniCarSchema = new Schema(
  {
    carBrand: { type: String, required: true, trim: true },
    carModel: { type: String, required: true, trim: true },
    carYear: { type: Number, required: true },
    miniBrand: { type: String, required: true, trim: true },
    collectionName: { type: String, trim: true },
    miniScale: { type: String, required: true, trim: true },
    photoFilename: { type: String },
    photoOriginalName: { type: String },
    photoPath: { type: String },
  },
  { timestamps: true }
);

miniCarSchema.index({ carBrand: 1, carModel: 1 });
miniCarSchema.index({ carYear: 1 });
miniCarSchema.index({ miniBrand: 1 });
miniCarSchema.index({ collectionName: 1 });
miniCarSchema.index({ miniScale: 1 });

export type MiniCarDocument = InferSchemaType<typeof miniCarSchema> & {
  _id: { toString(): string };
};

export const MiniCar = model('MiniCar', miniCarSchema);
