import { z } from 'zod';

export const BatteryBankSchema = z.object({
  "bancoId": z.string(),
  "siteId": z.string(),
  "timestamp": z.coerce.date(),
  "tensaoV": z.number(),
  "correnteA": z.number(),
  "temperaturaC": z.number(),
  "estadoCarga": z.number(),
  "modo": z.enum([`flutuacao`, `descarga`, `recarga`])
})

export type TBatteryBank = z.infer<typeof BatteryBankSchema>