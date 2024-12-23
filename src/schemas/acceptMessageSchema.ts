import {z} from "zod";

export const AceeptMessageSchema = z.object({
   acceptMessages: z.boolean(),
})