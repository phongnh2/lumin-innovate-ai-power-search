import { NUMBER_UNITS } from "@/constants/units";

export const getUsedTimeUnit = (totalUsed: string): "time" | "times" => {
  const isMultiple = Number(totalUsed) > 1;
  const hasUnitSuffix = NUMBER_UNITS.some((unit) => totalUsed.includes(unit));
  return isMultiple || hasUnitSuffix ? "times" : "time";
};
