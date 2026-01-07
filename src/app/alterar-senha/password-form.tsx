"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type ChangePasswordFormProps = {
  redirectTo: string;
  forcing: boolean;
};

export function ChangePasswordForm({ redirectTo, forcing }: ChangePasswordFormProps) {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const currentPassword = (formData.get("currentPassword") ?? "").toString();
    const newPassword = (formData.get("newPassword") ?? "").toString();
    const confirmPassword = (formData.get("confirmPassword") ?? "").toString();

    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas informadas nao conferem.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Nao foi possivel atualizar a senha.");
      }
      await refetch();
      toast.success("Senha atualizada com sucesso.");
      router.replace(redirectTo || "/certificados");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Nao foi possivel atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Senha atual</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required disabled={loading} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova senha</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            minLength={8}
            placeholder="Minimo 8 caracteres"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            required
            disabled={loading}
          />
        </div>
      </div>
      {forcing ? (
        <p className="text-xs text-primary">
          Esta conta foi criada com uma senha temporaria. Atualize-a para continuar utilizando o sistema.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Atualizando senha..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}
