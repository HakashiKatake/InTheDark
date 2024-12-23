import {z} from "zod";

export const usernameValidation = z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(15, "Username must be less than 15 characters long")
        .regex(/^[a-zA-Z0-9]+$/, "Username must only contain letters and numbers")
        .nonempty("Username is required");


export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Email must be a valid email address"}).nonempty({message: "Email is required"}),
    password: z.string().min(8, {message: "Password must be at least 8 characters long"}).nonempty({message: "Password is required"})
})