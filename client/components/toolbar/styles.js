export const inlineStyles = [
  { type: "BOLD", iconClass: "fa fa-bold" },
  { type: "ITALIC", iconClass: "fa fa-italic" },
  { type: "UNDERLINE", iconClass: "fa fa-underline" },
  {type: 'STRIKETHROUGH', iconClass: 'fa fa-strikethrough'},
  { type: "CODE", iconClass: "fa fa-code" },
  { type: 'HIGHLIGHT', iconClass: 'fa fa-tint'}
  // {type: 'LINK', iconClass: 'fa fa-link'}
];

export const blockStyles = [
  { type: "unordered-list-item", iconClass: "fa fa-list" },
  { type: "ordered-list-item", iconClass: "fa fa-list-ol" },
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
  'HIGHLIGHT': {
    backgroundColor: '#faed27'
  }
}
