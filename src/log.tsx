import { List, ActionPanel, Action, showToast, Toast, closeMainWindow } from "@raycast/api";
import { useState } from "react";
import { appendToSection } from "./daily-note";

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
      const entry = appendToSection(entryText, {
        sectionName: "Log",
        formatEntry: (text) => `- ${text}`,
      });

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
    <List searchBarPlaceholder="Log entry" onSearchTextChange={setSearchText} filtering={false}>
      {searchText.trim() && (
        <List.Item
          title={searchText}
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
