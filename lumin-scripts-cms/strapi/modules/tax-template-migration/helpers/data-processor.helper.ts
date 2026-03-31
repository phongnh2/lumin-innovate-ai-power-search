import type { ICsvRow } from "../interfaces/csv-row.interface.ts";
import type { ITimeSensitiveGrouping, IFormVersion } from "../interfaces/grouping.interface.ts";
import type { IMigrationResult } from "../interfaces/migration-result.interface.ts";

export function validateFormMatchesGrouping(groupingName: string, formTitle: string): boolean {
  const normalizedGrouping = groupingName.toLowerCase().trim();
  const normalizedTitle = formTitle.toLowerCase().trim();

  if (normalizedTitle.startsWith(normalizedGrouping)) {
    const afterGrouping = normalizedTitle.substring(normalizedGrouping.length);
    if (afterGrouping === "" || afterGrouping.startsWith(" ") || afterGrouping.startsWith("-")) {
      return true;
    }
  }

  return false;
}

export function processData(rows: ICsvRow[]): IMigrationResult {
  const groupings = new Map<string, ITimeSensitiveGrouping>();
  const formsWithMissingDates: ICsvRow[] = [];
  const groupingsWithMultiplePrimary: string[] = [];
  const groupingsWithNoPrimary: string[] = [];
  const formsWithMismatchedGrouping: Array<ICsvRow & { reason: string }> = [];

  for (const row of rows) {
    if (!row.time_sensitive_grouping) continue;

    if (!validateFormMatchesGrouping(row.time_sensitive_grouping, row.title)) {
      formsWithMismatchedGrouping.push({
        ...row,
        reason: `Title "${row.title}" does not match grouping "${row.time_sensitive_grouping}"`,
      });
      continue;
    }

    if (!row.published_date || row.published_date === "") {
      formsWithMissingDates.push(row);
    }

    const formVersion: IFormVersion = {
      template_release_id: row.template_release_id,
      title: row.title,
      published_date: row.published_date,
      outdated: row.outdated,
      isPrimary: row.outdated !== "Y",
    };

    if (!groupings.has(row.time_sensitive_grouping)) {
      groupings.set(row.time_sensitive_grouping, {
        name: row.time_sensitive_grouping,
        forms: [],
        primaryForm: null,
      });
    }

    const grouping = groupings.get(row.time_sensitive_grouping)!;
    grouping.forms.push(formVersion);
  }

  for (const [name, grouping] of groupings) {
    const nonOutdatedForms = grouping.forms.filter((f) => f.outdated !== "Y");

    if (nonOutdatedForms.length === 0) {
      groupingsWithNoPrimary.push(name);
      const sortedByDate = [...grouping.forms].sort((a, b) => {
        const dateA = a.published_date ? new Date(a.published_date).getTime() : 0;
        const dateB = b.published_date ? new Date(b.published_date).getTime() : 0;
        return dateB - dateA;
      });
      if (sortedByDate.length > 0) {
        grouping.primaryForm = sortedByDate[0];
      }
    } else if (nonOutdatedForms.length === 1) {
      grouping.primaryForm = nonOutdatedForms[0];
    } else {
      groupingsWithMultiplePrimary.push(name);
      const sortedByDate = [...nonOutdatedForms].sort((a, b) => {
        const dateA = a.published_date ? new Date(a.published_date).getTime() : 0;
        const dateB = b.published_date ? new Date(b.published_date).getTime() : 0;
        return dateB - dateA;
      });
      grouping.primaryForm = sortedByDate[0];
    }
  }

  let totalValidForms = 0;
  for (const grouping of groupings.values()) {
    totalValidForms += grouping.forms.length;
  }

  return {
    timeSensitiveGroupings: groupings,
    totalValidForms,
    formsWithMissingDates,
    groupingsWithMultiplePrimary,
    groupingsWithNoPrimary,
    formsWithMismatchedGrouping,
  };
}

export function generateReport(result: IMigrationResult): string {
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push("TAX TEMPLATE TIME-SENSITIVE FORM MIGRATION REPORT");
  lines.push("=".repeat(80));
  lines.push("");

  lines.push("SUMMARY");
  lines.push("-".repeat(40));
  lines.push(`Total groupings: ${result.timeSensitiveGroupings.size}`);
  lines.push(`Total valid forms: ${result.totalValidForms}`);
  lines.push(`Forms with missing dates: ${result.formsWithMissingDates.length}`);
  lines.push(`Groupings with multiple primary: ${result.groupingsWithMultiplePrimary.length}`);
  lines.push(`Groupings with no primary: ${result.groupingsWithNoPrimary.length}`);
  lines.push(`Forms with mismatched grouping: ${result.formsWithMismatchedGrouping.length}`);
  lines.push("");

  if (result.formsWithMismatchedGrouping.length > 0) {
    lines.push("MISMATCHED FORMS (skipped)");
    lines.push("-".repeat(40));
    for (const form of result.formsWithMismatchedGrouping) {
      lines.push(`  ${form.template_release_id}: ${form.reason}`);
    }
    lines.push("");
  }

  if (result.groupingsWithMultiplePrimary.length > 0) {
    lines.push("GROUPINGS WITH MULTIPLE PRIMARY FORMS");
    lines.push("-".repeat(40));
    for (const name of result.groupingsWithMultiplePrimary) {
      lines.push(`  - ${name}`);
    }
    lines.push("");
  }

  lines.push("GROUPINGS DETAIL");
  lines.push("-".repeat(40));
  for (const [name, grouping] of result.timeSensitiveGroupings) {
    lines.push(`\n${name} (${grouping.forms.length} forms)`);
    lines.push(`  Primary: ${grouping.primaryForm?.title || "None"}`);
    for (const form of grouping.forms) {
      const marker = form.isPrimary ? "★" : " ";
      const outdated = form.outdated === "Y" ? "[OUTDATED]" : "";
      lines.push(`  ${marker} ${form.template_release_id}: ${form.title} ${outdated}`);
    }
  }

  return lines.join("\n");
}
