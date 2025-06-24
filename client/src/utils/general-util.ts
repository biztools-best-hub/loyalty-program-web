export const delay = (millisecond: number) => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(resolve, millisecond)
    } catch (e) {
      reject(e)
    }
  })
}