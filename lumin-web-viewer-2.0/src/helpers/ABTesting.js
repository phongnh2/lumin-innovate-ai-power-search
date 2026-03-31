/**
 * This HOC only applies for testing either 2 variants
 * or multiple variants with a random number of users for each
 * */

const NUMBER_OF_VARIANTS = 6;

export const getTestingComponentVariant = (variantKeys) => {
  const index = Math.floor(Math.random() * 100) % NUMBER_OF_VARIANTS;
  return Object.values(variantKeys)[index];
};
