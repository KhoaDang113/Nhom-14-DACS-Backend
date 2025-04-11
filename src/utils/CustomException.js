class CustomException extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "CustomException";
  }
}

module.exports = CustomException;
