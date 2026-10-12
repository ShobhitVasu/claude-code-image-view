export type Img = {
  id: string
  name: string
  png: string
  width: number
  height: number
}

declare module 'claude-code' {
  interface PluginState {
    'image-view': { images: Img[]; selected: string | null }
  }
}
