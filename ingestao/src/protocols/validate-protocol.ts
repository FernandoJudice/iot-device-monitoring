import { z } from 'zod'
import { fromZodError } from 'zod-validation-error' 

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
	const parsedData = schema.safeParse(data)
	if (parsedData.success) {
		return parsedData.data
	} else {
		console.log(fromZodError(parsedData.error))
		return null
	}
}