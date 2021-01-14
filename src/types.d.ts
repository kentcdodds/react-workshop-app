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
  extraCreditNumber: number
}

type LazyComponents = Record<string, React.LazyExoticComponent<any>>

export {FileInfo, LazyComponents}

/*
eslint
  @typescript-eslint/no-explicit-any: "off",
*/
