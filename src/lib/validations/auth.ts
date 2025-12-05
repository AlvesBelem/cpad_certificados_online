import { z } from "zod";

export const registerSchema = z.object({
  nomeIgreja: z
    .string()
    .min(1, "Informe o nome da igreja.")
    .min(3, "O nome da igreja deve ter pelo menos 3 caracteres."),
  nomeAdmin: z
    .string()
    .min(1, "Informe o responsavel.")
    .min(3, "O nome do administrador deve ter pelo menos 3 caracteres."),
  email: z.string().min(1, "Digite um e-mail valido.").email("E-mail invalido."),
  senha: z.string().min(1, "Informe uma senha.").min(8, "A senha deve ter no minimo 8 caracteres."),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Digite seu e-mail.").email("E-mail invalido."),
  senha: z.string().min(1, "Informe sua senha."),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
