import { Schema, model, type InferSchemaType, Types } from "mongoose";

const citySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    countryId: { type: Types.ObjectId, ref: "Country", required: true, index: true },
  },
  { timestamps: true }
);

// אותו שם עיר לאותה מדינה => לא יתאפשר
citySchema.index({ countryId: 1, name: 1 }, { unique: true });

export type CityDoc = InferSchemaType<typeof citySchema>;
export const City = model("City", citySchema);
