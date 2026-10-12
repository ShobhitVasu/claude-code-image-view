<h1 align="center">image-view</h1>

<p align="center">
  Preview images inside Claude Code.<br/>
  Thumbnails in a gallery. Click one for a full preview.
</p>

---

## Features

- **Gallery pane** with thumbnail, file name and pixel size for every image
- **Full preview** with `Back`, `Prev` and `Next` buttons and an `n/total` counter
- **Auto-detect**: paste an image or write an image path in a prompt and the pane opens by itself
- **Many formats**: png, jpg, gif, webp, heic, bmp, tiff
- **Aspect ratio kept** in both views

## Requirements

| Requirement | Notes |
| --- | --- |
| macOS | PNG conversion uses the built-in `sips` |
| Claude Code | Version with plugin support |
| Ghostty or kitty | Draws real pictures. Other terminals show the file name instead |

## Install

Inside Claude Code:

```
/plugin marketplace add ShobhitVasu/claude-code-image-view
/plugin install image-view@image-view-marketplace
```

Then run `/reload-plugins` or restart Claude Code.

## Usage

Open the pane with a path:

```
/image-view ~/Desktop/screenshot.png
/image-view ./a.jpg ./b.heic
```

Or mention a path in any prompt:

```
look at ~/Desktop/screenshot.png
```

| Action | How |
| --- | --- |
| Full preview | Click **Full preview** on a thumbnail |
| Next / previous image | Click **Next** / **Prev** |
| Back to gallery | Click **Back** |
| Clear gallery | Click **Clear** |
| Close pane | `Esc` |

## Limits

- Pasted images are found by reading Claude Code's temp image cache (`/tmp/claude-<uid>/*/images/`). If a pasted image does not show, use `/image-view <path>`.
- macOS only.
- Paths with spaces are not supported.
- The gallery keeps the last 30 images. Converted copies are stored as `/tmp/image-view-*.png`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| File name shown, no picture | Terminal lacks the kitty graphics protocol. Use Ghostty or kitty |
| `Cannot read <file>` | Wrong path, or format not supported by `sips` |
| Pane does not open | Run `/image-view <path>`. Terminals under 110 columns hide panes you did not open yourself |
| Plugin not found | Run `/reload-plugins` or restart Claude Code |
| Something else | Start with `claude --debug` and read the log |

## Development

```bash
git clone git@github.com:ShobhitVasu/claude-code-image-view.git
claude --plugin-dir ./claude-code-image-view
claude plugin validate ./claude-code-image-view
```

File edits reload the plugin while the session runs.

```
.claude-plugin/
  plugin.json          plugin manifest
  marketplace.json     marketplace entry for /plugin install
hooks/
  hooks.json           points at register.tsx
  register.tsx         command, prompt hook, pane UI
types/index.d.ts       plugin state contract
```

## License

MIT
