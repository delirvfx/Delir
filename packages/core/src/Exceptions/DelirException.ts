export class DelirException extends Error {
  public before: Error
  public message: string
  public info?: Object

  constructor(message: string, info: any = {}) {
    super(message)

    this.message = message
    this.before = info.before
    this.info = info
  }
}
