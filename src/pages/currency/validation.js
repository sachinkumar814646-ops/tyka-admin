import { z } from "zod";

const currencySchema = z.object({
    name: z.string().trim().min(2, "Currency name is required."),
    code: z.string().regex(/^[A-Z]{3}$/, "Code must be exactly 3 uppercase letters."),
    symbol: z.string().trim().min(1, "Currency symbol is required."),
    flag: z.string().optional(),
    country: z.string().optional(),
    status: z.boolean(),
});

export default currencySchema;