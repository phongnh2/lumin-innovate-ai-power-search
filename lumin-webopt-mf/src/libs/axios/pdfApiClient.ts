import axios from "axios";

export const pdfApiClient = axios.create({
  baseURL: process.env.LUMIN_INNOVATE_URL || "http://localhost:8765",
  headers: {
    "Content-Type": "application/json",
  },
});
