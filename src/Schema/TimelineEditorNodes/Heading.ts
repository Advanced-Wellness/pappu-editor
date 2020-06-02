import { NodeSpec, DOMOutputSpec } from 'prosemirror-model'

const HeadingNodeSpec: NodeSpec = {
  attrs: {
    align: { default: null },
    color: { default: null },
    level: { default: 1 }
  },
  content: 'inline*',
  group: 'block',
  marks: '_',
  parseDOM: [
    {
      tag: 'h1',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        const { textAlign } = dom.style
        let align: string | null = dom.getAttribute('align') || textAlign || ''
        align = /(left|right|center|justify)/.test(align) ? align : null
        return {
          align,
          level: 1
        }
      }
    },
    {
      tag: 'h2',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        const { textAlign } = dom.style
        let align: string | null = dom.getAttribute('align') || textAlign || ''
        align = /(left|right|center|justify)/.test(align) ? align : null
        return {
          align,
          level: 2
        }
      }
    },
    {
      tag: 'h3',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        const { textAlign } = dom.style
        let align: string | null = dom.getAttribute('align') || textAlign || ''
        align = /(left|right|center|justify)/.test(align) ? align : null
        return {
          align,
          level: 3
        }
      }
    },
    {
      tag: 'h4',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        const { textAlign } = dom.style
        let align: string | null = dom.getAttribute('align') || textAlign || ''
        align = /(left|right|center|justify)/.test(align) ? align : null
        return {
          align,
          level: 4
        }
      }
    },
    {
      tag: 'h5',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        const { textAlign } = dom.style
        let align: string | null = dom.getAttribute('align') || textAlign || ''
        align = /(left|right|center|justify)/.test(align) ? align : null
        return {
          align,
          level: 5
        }
      }
    },
    {
      tag: 'h6',
      getAttrs: (gotDom) => {
        let dom = (gotDom as Node) as HTMLElement
        const { textAlign } = dom.style
        let align: string | null = dom.getAttribute('align') || textAlign || ''
        align = /(left|right|center|justify)/.test(align) ? align : null
        return {
          align,
          level: 6
        }
      }
    }
  ],
  toDOM: (node): DOMOutputSpec => {
    const { align } = node.attrs
    const attrs = {
      style: ''
    }

    let style = ''
    if (align && align !== 'left') {
      style += `text-align: ${align};`
    }

    style && (attrs.style = style)

    return [`h${node.attrs.level}`, attrs, 0]
  }
}

export default HeadingNodeSpec
