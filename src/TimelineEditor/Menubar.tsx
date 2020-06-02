import React from 'react'
import styled from 'styled-components'
import { EditorView } from 'prosemirror-view'
import { toggleMark, setBlockType } from 'prosemirror-commands'
import { EditorState } from 'prosemirror-state'
import { TimelineEditorSchema } from '../Schema/TimelineEditor'

interface MenuBarProps {
  editorView: EditorView
  editorState: EditorState
}

const MenuBar: React.FC<MenuBarProps> = ({ editorView }: MenuBarProps) => {
  const { dispatch, state } = editorView

  const isBoldActive = state.selection.$anchor.marks().findIndex((m) => m.type.name === 'strong') !== -1
  const isUnderlineActive = state.selection.$anchor.marks().findIndex((m) => m.type.name === 'u') !== -1
  const isH1 =
    state.selection.$anchor.node().type === TimelineEditorSchema.nodes.heading && state.selection.$anchor.node().attrs.level === 1
  const isH2 =
    state.selection.$anchor.node().type === TimelineEditorSchema.nodes.heading && state.selection.$anchor.node().attrs.level === 2

  console.log('Marks:', isBoldActive, isUnderlineActive, isH1)
  return (
    <div style={{ display: 'flex', flexDirection: 'row', padding: 3 }}>
      {/* BOLD */}
      <MenuButton
        key="bold-menu-button"
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark(TimelineEditorSchema.marks.strong)(state, dispatch)
        }}
        active={isBoldActive}
        type="button"
      >
        <img
          width={buttonWidth}
          // eslint-disable-next-line no-constant-condition
          style={{ opacity: isBoldActive ? activeIconOpacity : nonActiveIconOpactity }}
          alt="bold"
          src="https://img.icons8.com/ios-glyphs/60/000000/bold.png"
        />
      </MenuButton>

      {/* UNDERLINE */}
      <MenuButton
        key="underline-menu-button"
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark(TimelineEditorSchema.marks.u)(state, dispatch)
        }}
        active={isUnderlineActive}
        type="button"
      >
        <img
          style={{ opacity: isUnderlineActive ? activeIconOpacity : nonActiveIconOpactity }}
          width={buttonWidth}
          alt="underline"
          src="https://img.icons8.com/ios-glyphs/60/000000/underline.png"
        />
      </MenuButton>

      {/* H1 */}
      <MenuButton
        key="h1-menu-button"
        onMouseDown={(event) => {
          event.preventDefault()
          if (isH1) {
            setBlockType(TimelineEditorSchema.nodes.paragraph)(state, dispatch)
          } else {
            setBlockType(TimelineEditorSchema.nodes.heading, { level: 1 })(state, dispatch)
          }
        }}
        style={{ marginLeft: 10 }}
        active={isH1}
        type="button"
      >
        <img
          style={{ opacity: isH1 ? activeIconOpacity : nonActiveIconOpactity }}
          width={buttonWidth}
          alt="h1"
          src="https://img.icons8.com/ios-glyphs/60/000000/header-1.png"
        />
      </MenuButton>

      {/* H2 */}
      <MenuButton
        key="h2-menu-button"
        onMouseDown={(event) => {
          event.preventDefault()
          if (isH2) {
            setBlockType(TimelineEditorSchema.nodes.paragraph)(state, dispatch)
          } else {
            setBlockType(TimelineEditorSchema.nodes.heading, { level: 2 })(state, dispatch)
          }
        }}
        active={isH2}
        type="button"
      >
        <img
          style={{ opacity: isH2 ? activeIconOpacity : nonActiveIconOpactity }}
          width={buttonWidth}
          alt="h2"
          src="https://img.icons8.com/ios-glyphs/60/000000/header-2.png"
        />
      </MenuButton>

      {/* ALLIGMENT OPERATORS */}

      {/* Align Left */}
      {/* <MenuButton
        key="alignLeft-menu-button"
        onMouseDown={(e) => {
          e.preventDefault()
          toggleLeftAlign(editor)
        }}
        active={isBlockLeftAlign(editor)}
        style={{ marginLeft: 10 }}
        type="button"
      >
        <img
          style={{ opacity: isBlockLeftAlign(editor) ? activeIconOpacity : nonActiveIconOpactity }}
          width={buttonWidth}
          alt="align-left"
          src="https://img.icons8.com/ios-glyphs/30/000000/align-left.png"
        />
      </MenuButton> */}

      {/* Align Center */}
      {/* <MenuButton
        key="alignCenter-menu-button"
        onMouseDown={(e) => {
          e.preventDefault()
          toggleCenterAlign(editor)
        }}
        active={isBlockCenterAlign(editor)}
        type="button"
      >
        <img
          style={{ opacity: isBlockCenterAlign(editor) ? activeIconOpacity : nonActiveIconOpactity }}
          width={buttonWidth}
          alt="align-left"
          src="https://img.icons8.com/ios-glyphs/30/000000/align-center.png"
        />
      </MenuButton> */}

      {/* Align Right */}
      {/* <MenuButton
        key="alignRight-menu-button"
        active={isBlockRightAlign(editor)}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleRightAlign(editor)
        }}
        type="button"
      >
        <img
          style={{ opacity: isBlockRightAlign(editor) ? activeIconOpacity : nonActiveIconOpactity }}
          width={buttonWidth}
          alt="align-left"
          src="https://img.icons8.com/ios-glyphs/30/000000/align-right.png"
        />
      </MenuButton> */}
    </div>
  )
}

export default MenuBar

// Default Props
const buttonWidth = '18px'
const activeIconOpacity = 0.7
const nonActiveIconOpactity = 0.2

const MenuButton = styled.button<{ active: boolean }>`
  padding: 3px;
  margin-right: 5px;
  cursor: pointer;
  border-radius: 5px;
  outline: none;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => (props.active ? '#f0f0f0' : 'white')};
  &:hover {
    background-color: #f0f0f0;
    font-weight: bolder;
  }
`