import { getPreferenceValues } from "@raycast/api";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

export interface Preferences {
  vaultPath: string;
}

export interface AppendOptions {
  sectionName: string;
  formatEntry: (text: string) => string;
}

export function getTodayFilePath(vaultPath: string): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const filename = `${year}-${month}-${day}.md`;
  return join(vaultPath, "daily", filename);
}

export function getTimestamp(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createNewFile(sectionName: string, entry: string): string {
  const date = getTodayDate();
  return `---
tags:
  - daily
---

# ${date}

## ${sectionName}

${entry}
`;
}

function appendSection(content: string, sectionName: string, entry: string): string {
  return `${content.trimEnd()}

## ${sectionName}

${entry}
`;
}

function appendToExistingSection(content: string, sectionName: string, entry: string): string {
  const sectionHeader = `## ${sectionName}`;
  const sectionIndex = content.indexOf(sectionHeader);

  if (sectionIndex === -1) {
    return appendSection(content, sectionName, entry);
  }

  // Find the end of the section (next ## heading or EOF)
  const afterSection = content.slice(sectionIndex + sectionHeader.length);
  const nextHeadingMatch = afterSection.match(/\n## /);

  if (nextHeadingMatch && nextHeadingMatch.index !== undefined) {
    // Insert before the next heading
    const insertPosition = sectionIndex + sectionHeader.length + nextHeadingMatch.index;
    const before = content.slice(0, insertPosition).trimEnd();
    const after = content.slice(insertPosition);
    return `${before}
${entry}
${after}`;
  } else {
    // Append at the end
    return `${content.trimEnd()}
${entry}
`;
  }
}

export function appendToSection(entryText: string, options: AppendOptions): string {
  const { vaultPath } = getPreferenceValues<Preferences>();
  const { sectionName, formatEntry } = options;

  const filePath = getTodayFilePath(vaultPath);
  const entry = formatEntry(entryText);

  // Ensure directory exists
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  let newContent: string;

  if (!existsSync(filePath)) {
    // Case 1: File doesn't exist - create it
    newContent = createNewFile(sectionName, entry);
  } else {
    const content = readFileSync(filePath, "utf-8");
    const sectionHeader = `## ${sectionName}`;
    if (content.includes(sectionHeader)) {
      // Case 3: Section exists - append to it
      newContent = appendToExistingSection(content, sectionName, entry);
    } else {
      // Case 2: File exists but section doesn't
      newContent = appendSection(content, sectionName, entry);
    }
  }

  writeFileSync(filePath, newContent, "utf-8");

  return entry;
}
