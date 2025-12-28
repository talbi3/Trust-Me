function validateRequest(schema) {
  return async function validator(req, res, next) {
    try {
      const validated = await schema.validateAsync(req.body, {
        abortEarly: false,
      });
      req.body = validated;
      next();
    } catch (err) {
      next(err); 
    }
  };
}

export default validateRequest;