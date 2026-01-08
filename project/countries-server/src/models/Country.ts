import { Schema, model, type InferSchemaType } from "mongoose";

const countrySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    flag: { type: String, required: true },
    population: { type: Number, required: true },
    region: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

countrySchema.virtual("cities", {
  ref: "City",
  localField: "_id",
  foreignField: "countryId",
  justOne: false,
});

export type CountryDoc = InferSchemaType<typeof countrySchema>;
export const Country = model("Country", countrySchema);
