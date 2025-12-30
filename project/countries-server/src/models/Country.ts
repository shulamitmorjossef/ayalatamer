import { Schema, model, Document } from 'mongoose';

export interface ICountry extends Document {
  name: string;
  flag: string;
  population: number;
  region: string;
}

const countrySchema = new Schema<ICountry>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    flag: {
      type: String,
      required: true,
    },
    population: {
      type: Number,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Country = model<ICountry>('Country', countrySchema);
