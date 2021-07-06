import React, { useState } from 'react'
import { Editor, EditorState, RichUtils } from 'draft-js'
import 'draft-js/dist/Draft.css'
import MessageInput from './MessageInput'

const RichTextEditor = () => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)

    if (newState) {
      setEditorState(newState)
      return 'handled'
    }
    return 'not handled'
  }

  const makeBold = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'))
  }

  const makeItalic = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'))
  }

  return (
    <div> Helllo
      <button onClick={makeBold}>Bold</button>
      <button onClick={makeItalic}>Italic</button>
      <Editor editorState={editorState} onChange={setEditorState} handleKeyCommand={handleKeyCommand} />
      <MessageInput />
    </div>
  )
}

export default RichTextEditor
