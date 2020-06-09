import React, { ReactElement, useCallback, FunctionComponent } from 'react'
import styled from 'styled-components'
import { toggleMark } from 'prosemirror-commands'
import { schema, useProseMirrorState } from '../../prosemirror'
import { markActive } from '../../utils'

const toggleBold = toggleMark(schema.marks.strong)
const toggleUnderline = toggleMark(schema.marks.u)
const toggleItalic = toggleMark(schema.marks.em)
const toggleStrike = toggleMark(schema.marks.s)

interface Props {}

export default function TimelineEditorMenuBar({}: Props): ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <MenuItemBold />
      <MenuItemUnderline />
      <MenuItemItalic />
    </div>
  )
}

const MenuItemBold: FunctionComponent = () => {
  const [active, applyCommand, view] = useProseMirrorState((state) =>
    markActive(state, schema.marks.strong),
  )

  const handleClick = useCallback(() => {
    applyCommand(toggleBold)
    view.focus()
  }, [applyCommand])

  return (
    <MenuButton
      active={active}
      onClick={(e) => {
        e.preventDefault()
        handleClick()
      }}
    >
      B
    </MenuButton>
  )
}

const MenuItemUnderline: FunctionComponent = () => {
  const [active, applyCommand, view] = useProseMirrorState((state) =>
    markActive(state, schema.marks.u),
  )

  const handleClick = useCallback(() => {
    applyCommand(toggleUnderline)
    view.focus()
  }, [applyCommand])

  return (
    <MenuButton
      active={active}
      onClick={(e) => {
        e.preventDefault()
        handleClick()
      }}
    >
      <span style={{ textDecoration: 'underline' }}>U</span>
    </MenuButton>
  )
}

const MenuItemItalic: FunctionComponent = () => {
  const [active, applyCommand, view] = useProseMirrorState((state) =>
    markActive(state, schema.marks.em),
  )

  const handleClick = useCallback(() => {
    applyCommand(toggleItalic)
    view.focus()
  }, [applyCommand])

  return (
    <MenuButton
      active={active}
      onClick={(e) => {
        e.preventDefault()
        handleClick()
      }}
    >
      <em>i</em>
    </MenuButton>
  )
}

const MenuButton = styled.div<{ active: boolean }>`
  padding: 5px;
  padding-top: 1px;
  padding-bottom: 1px;
  margin-right: 2px;
  cursor: pointer;
  font-size: 18px;
  border-radius: 5px;
  outline: none;
  border: none;
  display: flex;
  opacity: ${(props) => (props.active ? 1 : 0.4)};
  justify-content: center;
  align-items: center;
  background-color: ${(props) => (props.active ? '#f0f0f0' : 'white')};
  &:hover {
    background-color: #f0f0f0;
    font-weight: bolder;
    opacity: 0.6;
  }
`
