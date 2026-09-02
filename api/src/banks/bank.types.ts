import z from "zod";

export type BankReadingQuery = {
	de?: string,
	ate?: string,
	pagina?: number,
}

export const ReadingsQuerySchema = z.object({
    de: z.coerce.date().optional(),
    ate: z.coerce.date().optional(),
    pagina: z.coerce.number().int().positive().default(1),
});

export type TQuerySchema = z.infer<typeof ReadingsQuerySchema>;