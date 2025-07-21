const errorController = {}

errorController.throwError = function (req, res, next) {
  throw new Error("This is an intentional 500 server error.")
}

module.exports = errorController
