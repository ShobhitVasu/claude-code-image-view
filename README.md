# image-view

Claude Code plugin. Preview images in a side pane: thumbnails in a gallery, click one for a full preview.

## Features

- `/image-view <path> [path...]` opens the **Images** pane.
- Image paths typed in a prompt (e.g. `~/Desktop/shot.png`) are added automatically.
- **Gallery:** thumbnail, name, pixel size, **Full preview** button, **Clear** button.
- **Full preview:** image fills the pane, aspect ratio kept. **Back / Prev / Next** buttons, title shows `name · W×H · n/total`.
- Formats: anything macOS `sips` reads (png, jpg, gif, webp, heic, bmp, tiff).

## Requirements

| Need | Why |
| --- | --- |
| macOS | PNG conversion and sizing use `sips` |
| Claude Code with plugin support | Runs the hooks module |
| Kitty-graphics terminal (kitty, Ghostty) | Draws real pictures. Other terminals show the file name instead |

## Install

### Option A: try it for one session (quickest)

```bash
claude --plugin-dir ~/Desktop/image-view
```

Edits to files reload the plugin while the session runs.

### Option B: install permanently via local marketplace

Inside Claude Code:

```
/plugin marketplace add ~/Desktop/image-view
/plugin install image-view@image-view-local
```

Then run `/reload-plugins`, or restart Claude Code.

### Option C: share via GitHub

1. Push this folder to a repo (e.g. `youruser/image-view`).
2. Others run:

```
/plugin marketplace add youruser/image-view
/plugin install image-view@image-view-local
```

## Usage

```
/image-view ~/Desktop/screenshot.png
/image-view ./a.jpg ./b.heic
```

Or just write a path in a normal prompt: `look at ~/Desktop/screenshot.png`. The pane opens with the image.

Click **Full preview** on a thumbnail. Use **Back** to return to the gallery. **Esc** closes the pane.

## Verify

```bash
claude plugin validate ~/Desktop/image-view
```

Expect `Validation passed`. One warning about `prompt.submit` having no `.catch` is expected: the hook wraps its work in `try/catch` so a preview failure never blocks a prompt.

## Limits

- Images pasted directly into the prompt cannot be previewed. Plugins receive only the attachment type, not its bytes. Use a file path.
- macOS only (`sips`).
- Gallery keeps the last 30 images. Converted PNGs go to `/tmp/image-view-*.png`.
- Paths containing spaces are not supported. Rename the file or move it.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Pane shows file name, no picture | Terminal lacks kitty graphics. Use Ghostty or kitty |
| `Cannot read <file>` | Path wrong or format unsupported by `sips` |
| Pane does not open | Run `/image-view <path>` manually. Narrow terminals (< 110 cols) hide unasked panes |
| Plugin not found | Run `/reload-plugins` or restart Claude Code |
| Hook errors | Start with `claude --debug` and read the log |

## Layout

```
image-view/
├── .claude-plugin/
│   ├── plugin.json        manifest
│   └── marketplace.json   local/GitHub install
├── hooks/
│   ├── hooks.json         points at register.tsx
│   └── register.tsx       command, prompt hook, pane UI
└── types/index.d.ts       plugin state contract
```
