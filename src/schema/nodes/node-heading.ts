import { NodeSpec } from 'prosemirror-model'
import * as block from './block'

export const heading: NodeSpec = {
  attrs: {
    ...block.attrs,
    level: { default: 1 }
  },
  content: 'inline*',
  group: 'block',
  defining: true,
  parseDOM: [
    {
      tag: 'h1',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        return { ...block.getAttrs(dom), level: 1 }
      }
    },
    {
      tag: 'h2',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        return { ...block.getAttrs(dom), level: 2 }
      }
    },
    {
      tag: 'h3',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        return { ...block.getAttrs(dom), level: 3 }
      }
    },
    {
      tag: 'h4',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        return { ...block.getAttrs(dom), level: 4 }
      }
    },
    {
      tag: 'h5',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        return { ...block.getAttrs(dom), level: 5 }
      }
    },
    {
      tag: 'h6',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        return { ...block.getAttrs(dom), level: 6 }
      }
    }
  ],
  toDOM(node) {
    const h = `h${node.attrs.level}`
    return [h, { ...block.style(node) }, 0]
  }
}
