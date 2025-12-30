import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Country } from '../models/Country';

/* ===== GET all countries ===== */
export const getAllCountries = async (_req: Request, res: Response) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.status(200).json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ message: 'Failed to fetch countries' });
  }
};

/* ===== GET country by ID ===== */
export const getCountryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // בדיקה שמזהה הוא ObjectId תקין
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid country ID' });
    }

    const country = await Country.findById(id);

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    res.status(200).json(country);
  } catch (error) {
    console.error('Error fetching country by id:', error);
    res.status(500).json({ message: 'Failed to fetch country' });
  }
};

export const createCountry = async (req: Request, res: Response) => {
  try {
    const { name, flag, population, region } = req.body;

    // בדיקה אם המדינה כבר קיימת
    const existing = await Country.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Country already exists' });
    }

    const newCountry = new Country({ name, flag, population, region });
    await newCountry.save();

    res.status(201).json(newCountry);
  } catch (error) {
    console.error('Error creating country:', error);
    res.status(500).json({ message: 'Failed to create country' });
  }
};

export const updateCountry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, flag, population, region } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid country ID' });
    }

    const updatedCountry = await Country.findByIdAndUpdate(
      id,
      { name, flag, population, region },
      { new: true }
    );

    if (!updatedCountry) {
      return res.status(404).json({ message: 'Country not found' });
    }

    res.status(200).json(updatedCountry);
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({ message: 'Failed to update country' });
  }
};

export const deleteCountry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid country ID' });
    }

    const deletedCountry = await Country.findByIdAndDelete(id);

    if (!deletedCountry) {
      return res.status(404).json({ message: 'Country not found' });
    }

    res.status(200).json({ message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({ message: 'Failed to delete country' });
  }
};

import axios from 'axios';

export const fetchExternalCountries = async (_req: Request, res: Response) => {
  try {
    const existing = await Country.find({});
    if (existing.length > 0) {
      return res.status(200).json(existing);
    }

    const response = await axios.get('https://restcountries.com/v3.1/all');
    const countries = response.data.map((c: any) => ({
      name: c.name.common,
      flag: c.flags[0],
      population: c.population,
      region: c.region,
    }));

    const savedCountries = await Country.insertMany(countries);
    res.status(201).json(savedCountries);
  } catch (error) {
    console.error('Error fetching external countries:', error);
    res.status(500).json({ message: 'Failed to fetch external countries' });
  }
};




