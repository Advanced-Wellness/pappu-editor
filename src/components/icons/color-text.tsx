import React, { FunctionComponent, CSSProperties } from 'react'
import { Svg } from './base'

interface ColorTextIconProps {
  circleStyle: CSSProperties
}

export const ColorTextIcon: FunctionComponent<ColorTextIconProps> = ({
  circleStyle,
}) => {
  return <p style={circleStyle}>C</p>
}
