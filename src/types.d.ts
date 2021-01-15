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

type LazyComponents = Record<string, React.LazyExoticComponent<any> | undefined>

type DynamicImportFn = () => Promise<{default: React.ComponentType<unknown>}>

type Imports = Record<string, DynamicImportFn>

type Backend = {
  handlers: Array<RequestHandler>
  quiet?: boolean
  serviceWorker?: {
    url?: string
  }
  [key: string]: unknown
}

export {FileInfo, LazyComponents, Imports, Backend, DynamicImportFn}

/*
eslint
  @typescript-eslint/no-explicit-any: "off",
*/
