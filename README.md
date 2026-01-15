# Time Audit

A Raycast extension to quickly log timestamped work entries to your Obsidian daily notes.

## Usage

1. Trigger "Track Time" command in Raycast
2. Type what you worked on
3. Press Enter to log the entry

Entries are logged in the format `- HH:mm: Your entry` under a `## Tracking` section in your daily note.

## Configuration

| Preference          | Description                 |
| ------------------- | --------------------------- |
| Obsidian Vault Path | Path to your Obsidian vault |

## Daily Note Format

The extension writes to `daily/YYYY-MM-DD.md` in your vault.

If the file doesn't exist, it creates:

```markdown
---
tags:
  - daily
---

# YYYY-MM-DD

## Tracking

- HH:mm: Your entry
```

If the file exists but has no `## Tracking` section, the section is appended. If the section exists, entries are added at the end of it.
