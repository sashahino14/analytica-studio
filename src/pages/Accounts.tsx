import { useEffect, useState } from "react";
import { db, Account } from "@/lib/db";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<Omit<Account, "id">>({
    code: "",
    label: "",
    type: "Charge",
    analyticsEnabled: false,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      await db.init();
      const data = await db.getAll<Account>("accounts");
      setAccounts(data);
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast.error("Erreur lors du chargement des comptes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await db.update("accounts", { ...formData, id: editingAccount.id });
        toast.success("Compte modifié avec succès");
      } else {
        await db.add("accounts", formData);
        toast.success("Compte créé avec succès");
      }
      setFormData({ code: "", label: "", type: "Charge", analyticsEnabled: false });
      setEditingAccount(null);
      loadAccounts();
    } catch (error) {
      console.error("Error saving account:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      label: account.label,
      type: account.type,
      analyticsEnabled: account.analyticsEnabled,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
      try {
        await db.delete("accounts", id);
        toast.success("Compte supprimé");
        loadAccounts();
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Plan Comptable</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos comptes comptables et activez l'analytique
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingAccount ? "Modifier le Compte" : "Nouveau Compte"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code Compte</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: 601"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Libellé</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Ex: Achats de matières"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de Compte</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="Passif">Passif</SelectItem>
                      <SelectItem value="Charge">Charge</SelectItem>
                      <SelectItem value="Produit">Produit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="analytics"
                    checked={formData.analyticsEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, analyticsEnabled: checked })
                    }
                  />
                  <Label htmlFor="analytics">Analytique activée</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  {editingAccount ? "Modifier" : "Créer"}
                </Button>
                {editingAccount && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingAccount(null);
                      setFormData({ code: "", label: "", type: "Charge", analyticsEnabled: false });
                    }}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Comptes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Analytique</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.code}</TableCell>
                    <TableCell>{account.label}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.type === "Charge" ? "bg-destructive/10 text-destructive" :
                        account.type === "Produit" ? "bg-success/10 text-success" :
                        account.type === "Actif" ? "bg-primary/10 text-primary" :
                        "bg-secondary/10 text-secondary"
                      }`}>
                        {account.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {account.analyticsEnabled ? (
                        <span className="text-success">✓ Oui</span>
                      ) : (
                        <span className="text-muted-foreground">Non</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
                        className="mr-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun compte enregistré. Créez votre premier compte ci-dessus.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
