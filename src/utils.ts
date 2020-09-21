// TODO: テスト書く
export const extractDateString = (str: string): string[] => {
  const regExp = /([0-9]{4})([0-9]{2})([0-9]{2})/g
  const result = regExp.exec(str)
  if (result == null || result.length === 0) {
    throw new Error('Invalid Directory Name')
  }
  return [result[1], result[2], result[3]] || []
}
