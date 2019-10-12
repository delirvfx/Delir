export interface ErrorDetail {
  before?: Error
}

export class DelirException<T extends ErrorDetail = {}> extends Error {
  public before?: Error
  public message: string
  public detail?: ErrorDetail

  constructor(message: string, detail: T = {} as T) {
    super(message)

    this.message = message
    this.before = detail.before
    this.detail = detail
  }
}
