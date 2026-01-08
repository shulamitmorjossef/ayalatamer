import type { Request, Response } from "express";
import { Types } from "mongoose";
import { City } from "../models/City";
import { AppError } from "../utils/AppError";

/* ===== GET cities by country ===== */
export async function getCitiesByCountry(req: Request, res: Response) {
  const { countryId } = req.params;

  if (!Types.ObjectId.isValid(countryId)) {
    throw new AppError("Invalid countryId", 400);
  }

  const cities = await City.find({ countryId }).sort({ name: 1 });
  res.json(cities);
}

/* ===== CREATE city ===== */
export async function createCity(req: Request, res: Response) {
  const { name, countryId } = req.body as { name?: string; countryId?: string };

  if (!name || !countryId) throw new AppError("Missing required fields", 400);
  if (!Types.ObjectId.isValid(countryId)) throw new AppError("Invalid countryId", 400);

  const cleanName = String(name).trim();
  if (cleanName.length < 2) throw new AppError("City name too short", 400);

  const exists = await City.findOne({ countryId, name: cleanName });
  if (exists) throw new AppError("City already exists for this country", 409);

  const city = await City.create({ name: cleanName, countryId });
  res.status(201).json(city);
}


/* ===== UPDATE city ===== */

export async function updateCity(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body as { name?: string };

  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid id", 400);
  }

  const cleanName = String(name ?? "").trim();
  if (!cleanName) throw new AppError("Missing name", 400);
  if (cleanName.length < 2) throw new AppError("City name too short", 400);

  const city = await City.findById(id);
  if (!city) throw new AppError("City not found", 404);

  const exists = await City.findOne({
    _id: { $ne: id },
    countryId: city.countryId,
    name: cleanName,
  });

  if (exists) {
    throw new AppError("City already exists for this country", 409);
  }

  city.name = cleanName;
  await city.save();

  res.json(city);
}


/* ===== DELETE city ===== */
export async function deleteCity(req: Request, res: Response) {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid id", 400);
  }

  const deleted = await City.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError("City not found", 404);
  }

  // 204 = No Content
  res.status(204).send();
}
