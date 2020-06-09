import React, { FunctionComponent, CSSProperties } from 'react'
import { Svg } from './base'

interface ColorBackgroundIconProps {
  squareStyle: CSSProperties
}

export const ColorBackgroundIcon: FunctionComponent<ColorBackgroundIconProps> = ({
  squareStyle,
}) => {
  return <p style={squareStyle}>BG</p>
}
