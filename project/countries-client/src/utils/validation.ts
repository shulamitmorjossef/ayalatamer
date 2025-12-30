import * as yup from "yup";

export const countrySchema = yup.object({
  name: yup.string().trim().min(2, "מינימום 2 תווים").required("שדה חובה"),
  flag: yup.string().trim().url("חייב להיות URL תקין").required("שדה חובה"),
  population: yup
    .number()
    .typeError("חייב להיות מספר")
    .integer("חייב להיות מספר שלם")
    .min(0, "לא יכול להיות שלילי")
    .required("שדה חובה"),
  region: yup.string().trim().required("שדה חובה"),
});
