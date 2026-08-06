import mongoose, { Schema, models, model } from "mongoose";

// Written automatically by the app on first launch — "name aur number mere
// paas aaye" (name + phone number reach the developer).
export interface ISignup {
  deviceId: string;
  name: string;
  phone: string;
  installedAt: Date;
}

const SignupSchema = new Schema<ISignup>({
  deviceId: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: "" },
  phone: { type: String, default: "" },
  installedAt: { type: Date, default: Date.now },
});

export default (models.Signup as mongoose.Model<ISignup>) ||
  model<ISignup>("Signup", SignupSchema);
