import React, { FunctionComponent, useState, useCallback } from 'react'
import styled from 'styled-components'
import { useProseMirrorState, schema } from '../../prosemirror'
import { ArrowUpIcon, ArrowDownIcon } from '../icons'
import { getFontFamily, setMark } from './utils'
import { Dropdown, DropdownItem } from './base'
import Overlay from './Overlay'

const PRESET = [
  'Dotum',
  'Gulim',
  'Batang',
  'Gungsuh',
  'NanumGothic',
  'NanumMyeongjo',
]

const LABELS = {
  Dotum: 'Dotum',
  Gulim: 'Gulim',
  Batang: 'Batang',
  Gungsuh: 'Gungsuh',
  NanumGothic: 'NanumGothic',
  NanumMyeongjo: 'NanumMyeongjo',
}

const FontSpan = styled('span')({
  minWidth: 60,
  textAlign: 'left',
})

const MenuItemFontFamily: FunctionComponent = () => {
  const [open, setOpen] = useState(false)
  const [fontFamily, applyCommand, view] = useProseMirrorState(getFontFamily)

  const handleClick = useCallback(() => {
    setOpen(!open)
  }, [open])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleCommit = useCallback(
    (value: string) => {
      setOpen(false)
      applyCommand(setMark(schema.marks.font_family, { family: value }))
      view.focus()
    },
    [applyCommand, view],
  )

  return (
    <>
      <a className="button is-small is-white" onClick={handleClick}>
        <FontSpan>{(fontFamily && LABELS[fontFamily]) || ''}</FontSpan>
        <span className="icon is-small">
          {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </span>
      </a>
      <Overlay open={open} onClose={handleClose}>
        <Dropdown className="dropdown is-active">
          <div className="dropdown-menu" role="menu">
            <div className="dropdown-content">
              {PRESET.map((value) => (
                <DropdownItem
                  key={value}
                  currentValue={fontFamily}
                  value={value}
                  onClick={handleCommit}
                >
                  {LABELS[value]}
                </DropdownItem>
              ))}
            </div>
          </div>
        </Dropdown>
      </Overlay>
    </>
  )
}

export default MenuItemFontFamily