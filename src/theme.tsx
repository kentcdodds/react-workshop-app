const themeLight = {
  background: '#F4F6F8',
  backgroundLight: '#fff',
  text: '#212b36',
  textLightest: '#8E9EAC',
  primary: '#1675ff',
  sky: '#E9EDF1',
  skyLight: '#F4F6F8',
  skyDark: '#C4CDD5',
}
type Theme = typeof themeLight

const themeDark: Theme = {
  background: '#19212a',
  backgroundLight: '#212b36',
  text: '#fff',
  textLightest: '#8E9EAC',
  primary: '#3587ff',
  sky: '#0D1217',
  skyLight: '#11181E',
  skyDark: '#8E9EAC',
}

const theme = (mode: string): Theme =>
  mode === 'dark' ? themeDark : themeLight

export type {Theme}
export default theme

export const prismThemeLight = `
code[class*='language-'], pre[class*='language-'] {
  color: #403f53;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;

  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;

  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
}

pre[class*='language-']::-moz-selection,
pre[class*='language-'] ::-moz-selection,
code[class*='language-']::-moz-selection,
code[class*='language-'] ::-moz-selection {
text-shadow: none;
background: rgba(22, 117, 255, 1);
}

pre[class*='language-']::selection,
pre[class*='language-'] ::selection,
code[class*='language-']::selection,
code[class*='language-'] ::selection {
text-shadow: none;
background: rgba(22, 117, 255, 1);
}

@media print {
code[class*='language-'],
pre[class*='language-'] {
  text-shadow: none;
}
}

/* Code blocks */
pre {
padding: 1em;
margin: 0.5em 0;
overflow: auto;
}

:not(pre) > code,
pre {
color: #403f53;
background: #f0f0f0;
}

:not(pre) > code {
padding: 0.1em;
border-radius: 0.3em;
white-space: normal;
}

.token.comment,
.token.prolog,
.token.cdata {
color: rgb(152, 159, 177);
font-style: italic;
}

.token.punctuation {
color: rgb(153, 76, 195);
}

.namespace {
color: rgb(12, 150, 155);
}

.token.deleted {
color: rgba(64, 63, 83, 0.56);
font-style: italic;
}

.token.symbol,
.token.property {
color: rgb(153, 76, 195);
}

.token.tag,
.token.operator,
.token.keyword {
color: #994cc3;
}

.token.boolean {
color: rgb(188, 84, 84);
}

.token.number {
color: rgb(170, 9, 130);
}

.token.constant,
.token.function,
.token.builtin,
.token.char {
color: rgb(72, 118, 214);
}

.token.selector,
.token.doctype {
color: rgb(153, 76, 195);
font-style: italic;
}

.token.attr-name,
.token.inserted {
color: rgb(72, 117, 214);
font-style: italic;
}

.token.string,
.token.url,
.token.entity,
.language-css .token.string,
.style .token.string {
color: #c96765;
}

.token.class-name,
.token.atrule,
.token.attr-value {
color: #c96765;
}

.token.regex,
.token.important,
.token.variable {
color: rgb(64, 63, 83);
}

.token.important,
.token.bold {
font-weight: bold;
}

.token.italic {
font-style: italic;
}
`

export const prismThemeDark = `
code[class*='language-'],
pre[class*='language-'] {
  color: #d6deeb;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;

  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;

  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
}

pre[class*='language-']::-moz-selection,
pre[class*='language-'] ::-moz-selection,
code[class*='language-']::-moz-selection,
code[class*='language-'] ::-moz-selection {
  text-shadow: none;
  background: rgba(29, 59, 83, 0.99);
}

pre[class*='language-']::selection,
pre[class*='language-'] ::selection,
code[class*='language-']::selection,
code[class*='language-'] ::selection {
  text-shadow: none;
  background: rgba(29, 59, 83, 0.99);
}

@media print {
  code[class*='language-'],
  pre[class*='language-'] {
    text-shadow: none;
  }
}

/* Code blocks */
pre {
  padding: 1em;
  margin: 0.5em 0;
  overflow: auto;
}

:not(pre) > code,
pre {
  color: white;
  background: #011627;
}

:not(pre) > code {
  padding: 0.1em;
  border-radius: 0.3em;
  white-space: normal;
}

.token.comment,
.token.prolog,
.token.cdata {
  color: rgb(99, 119, 119);
  font-style: italic;
}

.token.punctuation {
  color: rgb(199, 146, 234);
}

.namespace {
  color: rgb(178, 204, 214);
}

.token.deleted {
  color: rgba(239, 83, 80, 0.56);
  font-style: italic;
}

.token.symbol,
.token.property {
  color: rgb(128, 203, 196);
}

.token.tag,
.token.operator,
.token.keyword {
  color: rgb(127, 219, 202);
}

.token.boolean {
  color: rgb(255, 88, 116);
}

.token.number {
  color: rgb(247, 140, 108);
}

.token.constant,
.token.function,
.token.builtin,
.token.char {
  color: rgb(130, 170, 255);
}

.token.selector,
.token.doctype {
  color: rgb(199, 146, 234);
  font-style: italic;
}

.token.attr-name,
.token.inserted {
  color: rgb(173, 219, 103);
  font-style: italic;
}

.token.string,
.token.url,
.token.entity,
.language-css .token.string,
.style .token.string {
  color: rgb(173, 219, 103);
}

.token.class-name,
.token.atrule,
.token.attr-value {
  color: rgb(255, 203, 139);
}

.token.regex,
.token.important,
.token.variable {
  color: rgb(214, 222, 235);
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}
`
