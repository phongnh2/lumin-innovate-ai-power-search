import moment from "moment";

export function formatPublishDate(publishDate?: string): string | null {
  if (!publishDate) {
    return null;
  }

  if (publishDate.includes("/")) {
    const formats = ["MM/DD/YYYY", "M/DD/YYYY", "MM/D/YYYY", "M/D/YYYY"];
    for (const format of formats) {
      const dateMoment = moment(publishDate, format, true);
      if (dateMoment.isValid()) {
        return dateMoment.format("YYYY-MM-DD");
      }
    }
  }

  const parts = publishDate.split("-");

  if (parts.length === 1) {
    return moment(`${parts[0]}-01-01`, "YYYY-MM-DD", true).format("YYYY-MM-DD");
  }

  if (parts.length === 2) {
    const [year, month] = parts;
    const paddedMonth = month.padStart(2, "0");
    return moment(`${year}-${paddedMonth}-01`, "YYYY-MM-DD", true).format("YYYY-MM-DD");
  }

  return moment(publishDate, "YYYY-MM-DD", true).format("YYYY-MM-DD");
}

export function formatPublishDateForDisplay(publishedDate: string): string {
  const [year, month] = publishedDate.split("-");
  const monthNumber = Number(month);

  if (monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return `${date.toLocaleString("en-US", { month: "short" })} ${year}`;
  }

  return year;
}
