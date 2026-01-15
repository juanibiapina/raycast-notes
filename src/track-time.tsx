import { List, ActionPanel, Action, showToast, Toast, getPreferenceValues, closeMainWindow } from "@raycast/api";
import { useState } from "react";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

interface Preferences {
  vaultPath: string;
}

function getTodayFilePath(vaultPath: string): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const filename = `${year}-${month}-${day}.md`;
  return join(vaultPath, "daily", filename);
}

function getTimestamp(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createNewFile(entry: string): string {
  const date = getTodayDate();
  return `---
tags:
  - daily
---

# ${date}

## Tracking

${entry}
`;
}

function appendTrackingSection(content: string, entry: string): string {
  return `${content.trimEnd()}

## Tracking

${entry}
`;
}

function appendToTrackingSection(content: string, entry: string): string {
  const trackingIndex = content.indexOf("## Tracking");
  if (trackingIndex === -1) {
    return appendTrackingSection(content, entry);
  }

  // Find the end of the Tracking section (next ## heading or EOF)
  const afterTracking = content.slice(trackingIndex + "## Tracking".length);
  const nextHeadingMatch = afterTracking.match(/\n## /);

  if (nextHeadingMatch && nextHeadingMatch.index !== undefined) {
    // Insert before the next heading
    const insertPosition = trackingIndex + "## Tracking".length + nextHeadingMatch.index;
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

async function logEntry(entryText: string) {
  const { vaultPath } = getPreferenceValues<Preferences>();

  const filePath = getTodayFilePath(vaultPath);
  const timestamp = getTimestamp();
  const entry = `- ${timestamp}: ${entryText}`;

  // Ensure directory exists
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  let newContent: string;

  if (!existsSync(filePath)) {
    // Case 1: File doesn't exist - create it
    newContent = createNewFile(entry);
  } else {
    const content = readFileSync(filePath, "utf-8");
    if (content.includes("## Tracking")) {
      // Case 3: Tracking section exists - append to it
      newContent = appendToTrackingSection(content, entry);
    } else {
      // Case 2: File exists but no Tracking section
      newContent = appendTrackingSection(content, entry);
    }
  }

  writeFileSync(filePath, newContent, "utf-8");

  return entry;
}

export default function Command() {
  const [searchText, setSearchText] = useState("");

  async function handleSubmit() {
    const entryText = searchText.trim();

    if (!entryText) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Entry cannot be empty",
      });
      return;
    }

    try {
      const entry = await logEntry(entryText);

      await showToast({
        style: Toast.Style.Success,
        title: "Logged",
        message: entry,
      });

      await closeMainWindow();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to log entry",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <List searchBarPlaceholder="What did you work on?" onSearchTextChange={setSearchText} filtering={false}>
      {searchText.trim() && (
        <List.Item
          title={searchText}
          subtitle={`Log at ${getTimestamp()}`}
          actions={
            <ActionPanel>
              <Action title="Log Entry" onAction={handleSubmit} />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}
