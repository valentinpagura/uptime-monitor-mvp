function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source];
    const result = schema.safeParse(data);

    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      return res.status(400).json({ message: messages.join('. ') });
    }

    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
