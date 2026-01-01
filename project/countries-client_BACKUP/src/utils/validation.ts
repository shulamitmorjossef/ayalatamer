import * as Yup from "yup";

export const countrySchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("שם מדינה חובה")
    .min(2, "שם קצר מדי")
    .max(60, "שם ארוך מדי")
    // עברית + אנגלית + רווח + מקף/גרש בלבד
    .matches(
      /^[A-Za-z\u0590-\u05FF\s'-]+$/,
      "שם מדינה יכול להכיל רק אותיות, רווחים, מקף או גרש"
    ),

  flag: Yup.string()
    .trim()
    .required("קישור לדגל חובה")
    .url("חייב להיות URL תקין"),

  population: Yup.number()
    .typeError("אוכלוסייה חייבת להיות מספר")
    .required("אוכלוסייה חובה")
    .integer("אוכלוסייה חייבת להיות מספר שלם")
    .min(0, "אוכלוסייה לא יכולה להיות שלילית"),

  region: Yup.string()
    .trim()
    .required("אזור חובה")
    .min(2, "אזור קצר מדי")
    .max(40, "אזור ארוך מדי"),
});
