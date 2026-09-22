/** 对齐 ../mobile/utils/AppError.js */
export class AppError extends Error {
  code: number | string

  constructor(message: string, code: number | string = 0) {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}
