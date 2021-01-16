import type {PropsWithChildren} from 'react'

declare module '*.md' {
  const MDXComponent: (props: PropsWithChildren) => JSX.Element
  export default MDXComponent
}

declare global {
  interface Window {
    Babel?: {
      transformScriptTags: VoidFunction
    }
  }
}
