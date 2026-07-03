const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password es requerido'),
});

const createSitioSchema = z.object({
  url: z.string().url('URL inválida'),
  nombre: z.string().optional(),
  frecuencia_minutos: z.number().int().positive().optional(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID debe ser numérico'),
});

module.exports = { registerSchema, loginSchema, createSitioSchema, idParamSchema };
