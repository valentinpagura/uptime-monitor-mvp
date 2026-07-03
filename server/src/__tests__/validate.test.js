const {
  registerSchema,
  loginSchema,
  createSitioSchema,
  idParamSchema,
} = require('../utils/validate');

describe('registerSchema', () => {
  it('accepts valid email and password', () => {
    const result = registerSchema.safeParse({ email: 'test@example.com', password: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = registerSchema.safeParse({ password: '123456' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = registerSchema.safeParse({ email: 'not-an-email', password: '123456' });
    expect(result.success).toBe(false);
  });

  it('rejects short password (< 6 chars)', () => {
    const result = registerSchema.safeParse({ email: 'test@example.com', password: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = registerSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'anypass' });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({ password: 'anypass' });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(false);
  });
});

describe('createSitioSchema', () => {
  it('accepts valid url with optional fields', () => {
    const result = createSitioSchema.safeParse({
      url: 'https://example.com',
      nombre: 'Example',
      frecuencia_minutos: 10,
    });
    expect(result.success).toBe(true);
  });

  it('accepts url only (minimal)', () => {
    const result = createSitioSchema.safeParse({ url: 'https://google.com' });
    expect(result.success).toBe(true);
  });

  it('rejects missing url', () => {
    const result = createSitioSchema.safeParse({ nombre: 'No URL' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid url format', () => {
    const result = createSitioSchema.safeParse({ url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects negative frecuencia_minutos', () => {
    const result = createSitioSchema.safeParse({
      url: 'https://example.com',
      frecuencia_minutos: -1,
    });
    expect(result.success).toBe(false);
  });

  it('coerces string nombre', () => {
    const result = createSitioSchema.safeParse({ url: 'https://example.com', nombre: 'My Site' });
    expect(result.success).toBe(true);
  });
});

describe('idParamSchema', () => {
  it('accepts valid numeric id', () => {
    const result = idParamSchema.safeParse({ id: '123' });
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric id', () => {
    const result = idParamSchema.safeParse({ id: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejects negative id', () => {
    const result = idParamSchema.safeParse({ id: '-1' });
    expect(result.success).toBe(false);
  });
});
