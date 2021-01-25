import type {RequestHandler} from 'msw'

type FileInfo = {
  title: string
  id: string
  fullFilePath: string
  filePath: string
  isolatedPath: string
  ext: string
  filename: string
  type: string
  number: number
  isExtraCredit: boolean
  extraCreditNumber?: number
  extraCreditTitle?: string
}

type NoPropsComponent = React.ComponentType<{}>

type LazyComponents = Record<
  string,
  React.LazyExoticComponent<NoPropsComponent> | undefined
>

type DynamicImportFn = () => Promise<{
  App?: NoPropsComponent
  default?: NoPropsComponent
}>

type DefaultDynamicImportFn = () => Promise<{
  default: NoPropsComponent
}>

type Imports = Record<string, DynamicImportFn | undefined>

type Backend = {
  handlers: Array<RequestHandler>
  quiet?: boolean
  serviceWorker?: {
    url?: string
  }
  [key: string]: unknown
}

export type {
  FileInfo,
  LazyComponents,
  Imports,
  Backend,
  NoPropsComponent,
  DynamicImportFn,
  DefaultDynamicImportFn,
}

/*
eslint
  @typescript-eslint/no-explicit-any: "off",
*/
