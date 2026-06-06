const notFoundHandler = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = error.message;

  if (error.type === "entity.parse.failed" || error instanceof SyntaxError) {
    statusCode = 400;
    message = "Malformed JSON body";
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = `${error.path || "id"} is invalid`;
  }

  res.status(statusCode).json({
    message,
  });
};

module.exports = { notFoundHandler, errorHandler };

