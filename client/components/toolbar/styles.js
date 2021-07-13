export const inlineStyles = [
  { type: "BOLD", iconClass: "fa fa-bold", toolTip: "Bold" },
  { type: "ITALIC", iconClass: "fa fa-italic", toolTip: "Italic" },
  { type: "UNDERLINE", iconClass: "fa fa-underline", toolTip: "Underline" },
  { type: 'STRIKETHROUGH', iconClass: 'fa fa-strikethrough', toolTip: "Strikethrough" },
  { type: "CODE", iconClass: "fa fa-code", toolTip: "Code Block" },
];

export const blockStyles = [
  { type: "unordered-list-item", iconClass: "fa fa-list", toolTip: "Unordered List" },
  { type: "ordered-list-item", iconClass: "fa fa-list-ol", toolTip: "Ordered List" },
];

export const styleMap = {
  'CODE': {
    backgroundColor: '#EEEEEE',
    fontFamily: 'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New',
    padding: 2,
    fontSize: '11px'
  },
  'STRIKETHROUGH': {
    textDecoration: 'line-through'
  },
}
