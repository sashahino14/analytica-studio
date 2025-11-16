import { useEffect, useState } from "react";
import { db, Entry, EntryLine, Account, Center } from "@/lib/db";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Entries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    reference: "",
    label: "",
  });
  const [lines, setLines] = useState<EntryLine[]>([
    { accountCode: "", debit: 0, credit: 0, centerCode: "" },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await db.init();
      const [entriesData, accountsData, centersData] = await Promise.all([
        db.getAll<Entry>("entries"),
        db.getAll<Account>("accounts"),
        db.getAll<Center>("centers"),
      ]);
      setEntries(entriesData);
      setAccounts(accountsData);
      setCenters(centersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement des données");
    }
  };

  const addLine = () => {
    setLines([...lines, { accountCode: "", debit: 0, credit: 0, centerCode: "" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof EntryLine, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const calculateBalance = () => {
    const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    return { totalDebit, totalCredit, balanced: totalDebit === totalCredit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { balanced, totalDebit, totalCredit } = calculateBalance();

    if (!balanced) {
      toast.error(`Écriture non équilibrée ! Débit: ${totalDebit.toFixed(2)}€, Crédit: ${totalCredit.toFixed(2)}€`);
      return;
    }

    try {
      const entry: Omit<Entry, "id"> = {
        ...formData,
        lines: lines.filter(line => line.accountCode),
      };
      await db.add("entries", entry);
      toast.success("Écriture enregistrée avec succès");
      setFormData({
        date: new Date().toISOString().split("T")[0],
        reference: "",
        label: "",
      });
      setLines([{ accountCode: "", debit: 0, credit: 0, centerCode: "" }]);
      loadData();
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const balance = calculateBalance();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Saisie d'Écritures</h1>
          <p className="text-muted-foreground mt-2">
            Enregistrez vos opérations comptables avec affectation analytique
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nouvelle Écriture</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">N° Pièce</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Ex: FAC001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Libellé</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Ex: Achat fournitures"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-foreground">Lignes d'Écriture</h3>
                  <Button type="button" onClick={addLine} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une ligne
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Compte</TableHead>
                        <TableHead>Débit (€)</TableHead>
                        <TableHead>Crédit (€)</TableHead>
                        <TableHead>Centre</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={line.accountCode}
                              onValueChange={(value) => updateLine(index, "accountCode", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.map((account) => (
                                  <SelectItem key={account.id} value={account.code}>
                                    {account.code} - {account.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.debit || ""}
                              onChange={(e) => updateLine(index, "debit", Number(e.target.value))}
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.credit || ""}
                              onChange={(e) => updateLine(index, "credit", Number(e.target.value))}
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={line.centerCode}
                              onValueChange={(value) => updateLine(index, "centerCode", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Optionnel" />
                              </SelectTrigger>
                              <SelectContent>
                                {centers.map((center) => (
                                  <SelectItem key={center.id} value={center.code}>
                                    {center.code} - {center.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLine(index)}
                              disabled={lines.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Débit: {balance.totalDebit.toFixed(2)} €</div>
                    <div className="text-sm text-muted-foreground">Total Crédit: {balance.totalCredit.toFixed(2)} €</div>
                  </div>
                  {!balance.balanced && balance.totalDebit + balance.totalCredit > 0 && (
                    <div className="flex items-center text-destructive">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      <span className="font-medium">Écriture non équilibrée</span>
                    </div>
                  )}
                  {balance.balanced && balance.totalDebit > 0 && (
                    <div className="flex items-center text-success">
                      <span className="font-medium">✓ Écriture équilibrée</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!balance.balanced || balance.totalDebit === 0}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Enregistrer l'écriture
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des Écritures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="font-semibold">{entry.date}</span>
                      <span className="mx-2">•</span>
                      <span className="text-muted-foreground">{entry.reference}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{entry.label}</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Compte</TableHead>
                        <TableHead className="text-right">Débit</TableHead>
                        <TableHead className="text-right">Crédit</TableHead>
                        <TableHead>Centre</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entry.lines.map((line, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{line.accountCode}</TableCell>
                          <TableCell className="text-right">{line.debit ? `${line.debit.toFixed(2)} €` : "-"}</TableCell>
                          <TableCell className="text-right">{line.credit ? `${line.credit.toFixed(2)} €` : "-"}</TableCell>
                          <TableCell>{line.centerCode || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Aucune écriture enregistrée
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
