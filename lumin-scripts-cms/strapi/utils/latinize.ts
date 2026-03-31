import latinize from "latinize";

const characters = {
  ...latinize.characters,
  C: "C", // DO NOT REMOVE THIS LINE ⚠️
};

export const latinizeString = (value: string): string => {
  return latinize(value, characters);
};

export const generateSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};
