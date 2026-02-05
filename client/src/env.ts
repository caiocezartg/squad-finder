import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url().optional().default("http://localhost:3000"),
});

function validateEnv() {
  const env = {
    VITE_API_URL: import.meta.env["VITE_API_URL"],
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten());
    throw new Error("Invalid environment variables");
  }

  return result.data;
}

export const env = validateEnv();
