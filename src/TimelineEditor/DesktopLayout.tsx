import React, { FunctionComponent, FocusEventHandler } from 'react'
import TimelineEditorMenuBar from './MenuBar'

interface DesktopLayoutProps {
  className?: string
  menuClassName?: string
  onFocus?: FocusEventHandler<HTMLDivElement>
  onBlur?: FocusEventHandler<HTMLDivElement>
}

const DesktopLayout: FunctionComponent<DesktopLayoutProps> = ({
  className,
  menuClassName,
  children,
  onFocus,
  onBlur,
}) => {
  return (
    <div className={className} onFocus={onFocus} onBlur={onBlur}>
      <TimelineEditorMenuBar />
      {children}
    </div>
  )
}

export default DesktopLayout
