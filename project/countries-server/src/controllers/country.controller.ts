import { Request, Response } from "express";
import mongoose from "mongoose";
import axios from "axios";

import { Country } from "../models/Country";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";


export const getAllCountries = asyncHandler(async (_req: Request, res: Response) => {
  const countries = await Country.find().sort({ name: 1 });
  res.status(200).json(countries);
});

export const getCountryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid country ID", 400);
  }

  const country = await Country.findById(id).populate({
    path: "cities",
    options: { sort: { name: 1 } }, 
  });

  if (!country) {
    throw new AppError("Country not found", 404);
  }

  res.status(200).json(country);
});

/* ===== CREATE country ===== */
export const createCountry = asyncHandler(async (req: Request, res: Response) => {
  const { name, flag, population, region } = req.body;

  const existing = await Country.findOne({ name: String(name).trim() });
  if (existing) {
    throw new AppError("Country already exists", 409);
  }

  const newCountry = await Country.create({
    name: String(name).trim(),
    flag,
    population,
    region,
  });

  res.status(201).json(newCountry);
});

/* ===== UPDATE country ===== */
export const updateCountry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid country ID", 400);
  }

  const updatedCountry = await Country.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedCountry) {
    throw new AppError("Country not found", 404);
  }

  res.status(200).json(updatedCountry);
});

/* ===== DELETE country ===== */
export const deleteCountry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid country ID", 400);
  }

  const deletedCountry = await Country.findByIdAndDelete(id);
  if (!deletedCountry) {
    throw new AppError("Country not found", 404);
  }

  res.status(200).json({ message: "Country deleted successfully" });
});

/* ===== FETCH external countries (once) ===== */
export const fetchExternalCountries = asyncHandler(async (_req: Request, res: Response) => {
  const existing = await Country.find();
  if (existing.length > 0) {
    return res.status(200).json(existing);
  }

  const response = await axios.get(
    "https://restcountries.com/v3.1/all?fields=name,flags,population,region"
  );

  const countries = response.data.map((c: any) => ({
    name: c.name.common,
    flag: c.flags.png,
    population: c.population,
    region: c.region,
  }));

  const savedCountries = await Country.insertMany(countries);
  res.status(201).json(savedCountries);
});
