import { atom } from "recoil";

export const editingCountryNameState = atom<string>({
  key: "editingCountryNameState",
  default: "",
});
