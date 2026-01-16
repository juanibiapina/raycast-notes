import { showToast, Toast, closeMainWindow, popToRoot } from "@raycast/api";
import { appendToSection } from "./daily-note";

interface Arguments {
  text: string;
}

export default async function Command(props: { arguments: Arguments }) {
  const entryText = props.arguments.text.trim();

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

    await popToRoot();
    await closeMainWindow();
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to log entry",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
