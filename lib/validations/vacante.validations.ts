import { z } from 'zod';

const ESTADOS_VALIDOS = ['borrador', 'abierta', 'pausada', 'cerrada'] as const;

const skillSchema = z.object({
  label:    z.string(),
  selected: z.boolean(),
});

const requisitosSchema = z.object({
  techSkills:    z.array(skillSchema).optional(),
  softSkills:    z.array(skillSchema).optional(),
  idiomaEs:      z.string().optional(),
  idiomaEn:      z.string().optional(),
  detallesExtra: z.string().optional(),
}).optional();

const matchingWeightsSchema = z.object({
  experienciaTecnica:  z.enum(['alto', 'medio', 'bajo']),
  afinidadCultural:    z.enum(['alto', 'medio', 'bajo']),
  ubicacion:           z.enum(['alto', 'medio', 'bajo']),
  expectativaSalarial: z.enum(['alto', 'medio', 'bajo']),
}).optional();

export const createVacanteSchema = z.object({
  titulo: z
    .string({ required_error: 'El título es requerido' })
    .trim()
    .min(3,   'Mínimo 3 caracteres')
    .max(150, 'Máximo 150 caracteres'),

  descripcion: z
    .string({ required_error: 'La descripción es requerida' })
    .trim()
    .min(10, 'Mínimo 10 caracteres'),

  estado: z.enum(ESTADOS_VALIDOS).default('borrador'),

  categoria:         z.string().trim().optional(),
  modalidad:         z.string().trim().optional(),
  experienciaMinima: z.number().int().min(0).max(50).default(0),
  requisitos:        requisitosSchema,
  matchingWeights:   matchingWeightsSchema,
});

export const updateVacanteSchema = createVacanteSchema.partial();

export const updateEstadoSchema = z.object({
  estado: z.enum(ESTADOS_VALIDOS, {
    required_error: 'Estado requerido',
    message:        'Estado inválido',
  }),
});

export type CreateVacanteDTO = z.infer<typeof createVacanteSchema>;
export type UpdateVacanteDTO = z.infer<typeof updateVacanteSchema>;
export type UpdateEstadoDTO  = z.infer<typeof updateEstadoSchema>;