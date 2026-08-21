import mongoose, { Schema, models, model } from "mongoose";

export interface ILicense {
  code: string;
  deviceId: string | null; 
  active: boolean;
  midiPurchased: boolean;
  note: string;
  createdAt: Date;
  redeemedAt: Date | null;
  lastCheckInAt: Date | null;
}

const LicenseSchema = new Schema<ILicense>({
  code: { type: String, required: true, unique: true, index: true },
  deviceId: { type: String, default: null, index: true },
  active: { type: Boolean, default: true },
  midiPurchased: { type: Boolean, default: false },
  note: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  redeemedAt: { type: Date, default: null },
  lastCheckInAt: { type: Date, default: null },
});

export default (models.License as mongoose.Model<ILicense>) ||
  model<ILicense>("License", LicenseSchema);
