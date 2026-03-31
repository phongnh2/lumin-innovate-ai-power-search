import type { Template } from "@/interfaces/api.interface";
import { formatUsageCount, USAGE_OFFSET } from "@/utils/formatUsage";

export const mockLegalTemplates: Template[] = [
  {
    id: "16830",
    title: "Anti-Bullying Policy Template",
    usage: formatUsageCount(1250 + USAGE_OFFSET),
    thumbnail:
      "https://imagedelivery.net/Qd8b2GDHhuvG49jL2LdYLQ/5f6112b5-db8a-4112-2901-4212ff3db100/5x",
    categories: ["Legal", "Compliance"],
    eSignCompatible: false,
    legalReview: true,
    accessible: false,
    fileUrl: "/legal/employment-pack.pdf",
  },
  {
    id: "16829",
    title: "Anti-Discrimination Policy Template",
    usage: formatUsageCount(1089 + USAGE_OFFSET),
    thumbnail:
      "https://imagedelivery.net/Qd8b2GDHhuvG49jL2LdYLQ/5e86708f-6fe8-4953-d94a-bf06629d1200/5x",
    categories: ["Legal", "Compliance"],
    eSignCompatible: false,
    legalReview: true,
    accessible: false,
    fileUrl: "/legal/anti-discrimination-policy.pdf",
  },
  {
    id: "16831",
    title: "Code of Conduct Policy Template",
    usage: formatUsageCount(1055 + USAGE_OFFSET),
    thumbnail:
      "https://imagedelivery.net/Qd8b2GDHhuvG49jL2LdYLQ/2e153eb8-11af-4702-687d-3a6ab3c4ac00/5x",
    categories: ["Legal", "Compliance"],
    eSignCompatible: false,
    legalReview: true,
    accessible: false,
    fileUrl: "/legal/corporate-governance.pdf",
  },
  {
    id: "16828",
    title: "Privacy and Confidentiality Policy Template",
    usage: formatUsageCount(987 + USAGE_OFFSET),
    thumbnail:
      "https://imagedelivery.net/Qd8b2GDHhuvG49jL2LdYLQ/1c06be8e-100a-44bd-e798-d892a6407600/5x",
    categories: ["Legal", "Compliance"],
    eSignCompatible: false,
    legalReview: true,
    accessible: false,
    fileUrl: "/legal/ip-suite.pdf",
  },
  {
    id: "16827",
    title: "Workplace Sexual Harassment and Assault Policy Template",
    usage: formatUsageCount(445 + USAGE_OFFSET),
    thumbnail:
      "https://imagedelivery.net/Qd8b2GDHhuvG49jL2LdYLQ/0b0fd786-2582-4701-8fe1-565438d7ee00/6x",
    categories: ["Legal", "Compliance"],
    eSignCompatible: false,
    legalReview: true,
    accessible: false,
    fileUrl: "/legal/family-law.pdf",
  },
  {
    id: "16832",
    title: "Anti-Bullying Policy Template",
    usage: formatUsageCount(1250 + USAGE_OFFSET),
    thumbnail:
      "https://imagedelivery.net/Qd8b2GDHhuvG49jL2LdYLQ/5f6112b5-db8a-4112-2901-4212ff3db100/5x",
    categories: ["Legal", "Compliance"],
    eSignCompatible: false,
    legalReview: true,
    accessible: false,
    fileUrl: "/legal/employment-pack.pdf",
  },
  {
    id: "16833",
    title: "Anti-Discrimination Policy Template",
    usage: formatUsageCount(1089 + USAGE_OFFSET),
    thumbnail:
      "https://imagedelivery.net/Qd8b2GDHhuvG49jL2LdYLQ/5e86708f-6fe8-4953-d94a-bf06629d1200/5x",
    categories: ["Legal", "Compliance"],
    eSignCompatible: false,
    legalReview: true,
    accessible: false,
    fileUrl: "/legal/anti-discrimination-policy.pdf",
  },
];
