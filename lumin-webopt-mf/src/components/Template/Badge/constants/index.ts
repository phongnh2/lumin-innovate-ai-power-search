import AccessibilityImage from "@/assets/images/svg/accessible_icon.svg";
import ESignImage from "@/assets/images/svg/eSign_compatible_2.svg";
import LegalWriterImage from "@/assets/images/svg/legal-writer-icon-badge.svg";

export const enum LUMIN_BADGES_TYPES {
  LUMIN_SIGN = "LUMIN_SIGN",
  LEGAL_WRITER = "LEGAL_WRITER",
  ACCESSIBLE = "ACCESSIBLE",
}

export const LUMIN_BADGES = {
  [LUMIN_BADGES_TYPES.LUMIN_SIGN]: {
    badge: ESignImage,
    tooltip: "Ready for secure eSigning with Lumin Sign",
  },
  [LUMIN_BADGES_TYPES.LEGAL_WRITER]: {
    badge: LegalWriterImage,
    tooltip: "Lawyer-reviewed for legal accuracy and compliance",
  },
  [LUMIN_BADGES_TYPES.ACCESSIBLE]: {
    badge: AccessibilityImage,
    tooltip: "",
  },
};
