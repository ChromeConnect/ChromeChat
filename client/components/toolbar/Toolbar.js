import React from "react";
import { RichUtils } from "draft-js";
import { inlineStyles, blockStyles } from "./styles";

const Toolbar = (props) => {
  const { editorState, setEditorState } = props;

  const handleInlineStyle = (event, style) => {
    event.preventDefault();
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    if (event.currentTarget.className === "toolbar-button-selected")
      event.currentTarget.className = "toolbar-button";
    else {
      event.currentTarget.className = "toolbar-button-selected";
    }
  };

  const handleBlockStyle = (event, style) => {
    event.preventDefault();
    setEditorState(RichUtils.toggleBlockType(editorState, style));
    if (event.currentTarget.className === "toolbar-button-selected")
      event.currentTarget.className = "toolbar-button";
    else {
      event.currentTarget.className = "toolbar-button-selected";
    }
  };

  return (
    <div id="editor-toolbar">
      {inlineStyles.map((style, index) => {
        return (
          <button
            key={index}
            onMouseDown={(event) => handleInlineStyle(event, style.type)}
            onClick={(event) => event.preventDefault()}
            className="toolbar-button"
          >
            <i className={style.iconClass}></i>
          </button>
        );
      })}
      {blockStyles.map((style, index) => {
        return (
          <button
            key={index}
            onMouseDown={(event) => handleBlockStyle(event, style.type)}
            onClick={(event) => event.preventDefault()}
          >
            <i className={style.iconClass}></i>
          </button>
        );
      })}
    </div>
  );
};

export default Toolbar;
