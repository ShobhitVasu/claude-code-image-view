import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Img } from '../types'

const PANE = 'image-view'
const images = atom({ plugin: 'image-view', key: 'images' } as const, [])
const selected = atom({ plugin: 'image-view', key: 'selected' } as const, null)

const PATH = /(?:^|\s)((?:~|\/)[^\s'"]+\.(?:png|jpe?g|gif|webp|heic|bmp|tiff?))/gi
const CELL = 2 // a terminal cell is about twice as tall as wide

// Largest box inside maxCols x maxRows that keeps the picture's shape.
const fit = (img: Img, maxCols: number, maxRows: number) => {
  const ratio = img.height / img.width / CELL
  const cols = Math.max(1, Math.min(maxCols, Math.floor(maxRows / ratio)))
  const rows = Math.max(1, Math.min(maxRows, Math.round(cols * ratio)))

  return { cols: Math.min(255, cols), rows: Math.min(255, rows) }
}

let count = 0

async function add($: any, raw: string): Promise<string | null> {
  const home = (await $.process.run(['sh', '-c', 'printf %s "$HOME"'])).stdout
  const src = raw.replace(/^~/, home)
  const name = src.split('/').pop() ?? src
  const png = `/tmp/image-view-${Date.now()}-${count++}.png`
  const made = await $.process.run(['sips', '-s', 'format', 'png', src, '--out', png])
  if (made.exitCode !== 0) return `Cannot read ${name}`
  const info = await $.process.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', png])
  const width = Number(/pixelWidth: (\d+)/.exec(info.stdout)?.[1] ?? 0)
  const height = Number(/pixelHeight: (\d+)/.exec(info.stdout)?.[1] ?? 0)
  if (!width || !height) return `Cannot size ${name}`
  const img: Img = { id: png, name, png, width, height }
  await update($, images, list => [...list.filter(i => i.name !== name), img].slice(-30))

  return null
}

function show($: any) {
  return $.ui.open({ id: PANE, title: 'Images', closeOnEscape: true })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'image-view',
      description: 'Preview images: /image-view <path> [path...]',
    })

    return next(e)
  })

  on('command.run', { command: 'image-view' }, async ($, e) => {
    const paths = e.args.match(/\S+/g) ?? []
    const errors: string[] = []
    for (const p of paths) {
      const err = await add($, p)
      if (err) errors.push(err)
    }
    await show($)

    return { text: errors.length ? errors.join('\n') : 'Images pane opened.' }
  })

  // Image paths typed or dropped into a prompt join the gallery.
  on('prompt.submit', async ($, e, next) => {
    const found = [...e.text.matchAll(PATH)].map(m => m[1] as string)
    if (found.length) {
      try {
        for (const p of found) await add($, p)
        void show($)
      } catch {
        // preview is best effort; never block the prompt
      }
    }

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Image } = $.ui.resolve(e)
    const list = await read($, images)
    const id = await read($, selected)
    const cols = e.viewport?.columns ?? 80
    const rows = e.viewport?.rows ?? 24

    if (list.length === 0) {
      return (
        <Box flexDirection="column" paddingX={1}>
          <Text dimColor>No images yet.</Text>
          <Text dimColor>Run /image-view {'<path>'} or put an image path in a prompt.</Text>
        </Box>
      )
    }

    const current = list.find(i => i.id === id)
    if (current) {
      const i = list.indexOf(current)
      const { cols: c, rows: r } = fit(current, cols - 4, rows - 6)

      return (
        <Box flexDirection="column" paddingX={1}>
          <Box>
            <Button key="back" onPress={() => update($, selected, () => null)}>
              Back
            </Button>
            <Text> </Text>
            <Button
              key="prev"
              onPress={() => update($, selected, () => list[(i - 1 + list.length) % list.length]!.id)}
            >
              Prev
            </Button>
            <Text> </Text>
            <Button
              key="next"
              onPress={() => update($, selected, () => list[(i + 1) % list.length]!.id)}
            >
              Next
            </Button>
            <Text dimColor>
              {'  '}
              {current.name} · {current.width}×{current.height} · {i + 1}/{list.length}
            </Text>
          </Box>
          <Image source={{ file: current.png, format: 'png' }} columns={c} rows={r} alt={current.name} />
        </Box>
      )
    }

    return (
      <Box flexDirection="column" paddingX={1}>
        {list.map(img => {
          const t = fit(img, 20, 6)

          return (
            <Box key={img.id} marginBottom={1}>
              <Image source={{ file: img.png, format: 'png' }} columns={t.cols} rows={t.rows} alt={img.name} />
              <Box flexDirection="column" marginLeft={2}>
                <Text bold>{img.name}</Text>
                <Text dimColor>
                  {img.width}×{img.height}
                </Text>
                <Button key={`open-${img.id}`} onPress={() => update($, selected, () => img.id)}>
                  Full preview
                </Button>
              </Box>
            </Box>
          )
        })}
        <Button key="clear" onPress={() => update($, images, () => [])}>
          Clear
        </Button>
      </Box>
    )
  })
}
