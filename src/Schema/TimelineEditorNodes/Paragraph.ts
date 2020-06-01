import { NodeSpec, DOMOutputSpec } from "prosemirror-model";

const ParagraphNodeSpec: NodeSpec = {
    attrs: {
        align: { default: null },
        color: { default: null },
    },
    content: 'inline*',
    group: 'block',
    parseDOM: [
        { 
            tag: 'p', 
            getAttrs: (gotDom) => {
                let dom = gotDom as Node as HTMLElement
                const { textAlign } = dom.style
                let align: string | null = dom.getAttribute('align') || textAlign || '';
                align = /(left|right|center|justify)/.test(align) ? align : null;
                return {
                    align
                }
            } 
        }
    ],
    toDOM: (node): DOMOutputSpec => {
        const {
            align
        } = node.attrs;
        const attrs = {
            style: ''
        };
    
        let style = '';
        if (align && align !== 'left') {
            style += `text-align: ${align};`;
        }

        style && (attrs.style = style);
    
        return ['p', attrs, 0];
    }
}

export default ParagraphNodeSpec

