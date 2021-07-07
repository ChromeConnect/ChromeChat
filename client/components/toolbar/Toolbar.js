import React from 'react'
import { RichUtils } from 'draft-js'
import { inlineStyles } from './inlineStyles'

const Toolbar = (props) => {
  const { editorState, setEditorState } = props

  const handleInlineStyle = (event, style) => {
    event.preventDefault()
    setEditorState(RichUtils.toggleInlineStyle(editorState, style))
  }

  return (
    <div id='editor-toolbar'>
      {inlineStyles.map((style, index) => {
        return (
          <button key={index} onMouseDown={(event) => handleInlineStyle(event, style.type)} onClick={(event) => event.preventDefault()}><i className={style.iconClass}></i></button>
          )
      })}
    </div>
  )
}

export default Toolbar
