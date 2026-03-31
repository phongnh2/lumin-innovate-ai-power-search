import { HeroBackgroundColor } from "@/constants/colors.enum";

export const heroBackgroundColor = {
  [HeroBackgroundColor.LightRed]:
    "var(--kiwi-colors-custom-brand-lumin-lumin-container-fixed)",
  [HeroBackgroundColor.Blue]: "var(--kiwi-colors-core-primary-container)",
  [HeroBackgroundColor.SignPurple]:
    "var(--kiwi-colors-custom-brand-sign-sign-surface-container-low)",
  [HeroBackgroundColor.Mint]:
    "var(--kiwi-colors-custom-brand-tools-split-fixed)",
  [HeroBackgroundColor.Orange]:
    "var(--kiwi-colors-custom-brand-tools-convert-fixed)",
  [HeroBackgroundColor.Yellow]:
    "var(--kiwi-colors-custom-brand-tools-esign-fixed)",
  [HeroBackgroundColor.Pink]: "var(--kiwi-colors-custom-brand-tools-ocr-fixed)",
};

export const calculateBgColor = (
  name: string,
  backgroundColor?: HeroBackgroundColor,
) => {
  if (backgroundColor) {
    return heroBackgroundColor[backgroundColor];
  }

  const nameLength = name.length;
  const index = nameLength % Object.values(heroBackgroundColor).length;
  return Object.values(heroBackgroundColor)[index];
};
