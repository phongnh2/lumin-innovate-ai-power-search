import ESignImage from "@/assets/images/svg/eSign_compatible_2.svg?url";
import LegalWriterImage from "@/assets/images/svg/legal-writer-icon-badge.svg?url";

export enum LUMIN_BADGES_TYPES {
  LUMIN_SIGN = "LUMIN_SIGN",
  LEGAL_WRITER = "LEGAL_WRITER",
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
};
