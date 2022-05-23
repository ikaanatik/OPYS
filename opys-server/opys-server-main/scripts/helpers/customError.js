export default class CustomError extends Error {
  constructor(message, status, success = false) {
    super(message);
    this.status = status;
    this.success = success;
  }
}
