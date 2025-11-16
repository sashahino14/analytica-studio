import { useEffect, useState } from "react";
import { db, Entry, Account } from "@/lib/db";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";

interface BalanceLine {
  accountCode: string;
  accountLabel: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export default function Balance() {
  const [balanceLines, setBalanceLines] = useState<BalanceLine[]>([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0, balanced: true });

  useEffect(() => {
    calculateBalance();
  }, []);

  const calculateBalance = async () => {
    try {
      await db.init();
      const entries = await db.getAll<Entry>("entries");
      const accounts = await db.getAll<Account>("accounts");

      const accountMap = new Map<string, BalanceLine>();

      entries.forEach((entry) => {
        entry.lines.forEach((line) => {
          if (!accountMap.has(line.accountCode)) {
            const account = accounts.find((a) => a.code === line.accountCode);
            accountMap.set(line.accountCode, {
              accountCode: line.accountCode,
              accountLabel: account?.label || "Inconnu",
              totalDebit: 0,
              totalCredit: 0,
              balance: 0,
            });
          }
          const current = accountMap.get(line.accountCode)!;
          current.totalDebit += line.debit || 0;
          current.totalCredit += line.credit || 0;
          current.balance = current.totalDebit - current.totalCredit;
        });
      });

      const lines = Array.from(accountMap.values()).sort((a, b) =>
        a.accountCode.localeCompare(b.accountCode)
      );

      const totalDebit = lines.reduce((sum, line) => sum + line.totalDebit, 0);
      const totalCredit = lines.reduce((sum, line) => sum + line.totalCredit, 0);

      setBalanceLines(lines);
      setTotals({
        debit: totalDebit,
        credit: totalCredit,
        balanced: Math.abs(totalDebit - totalCredit) < 0.01,
      });
    } catch (error) {
      console.error("Error calculating balance:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Balance Comptable</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble de tous vos comptes et leur équilibre
          </p>
        </div>

        {!totals.balanced && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span className="font-medium">
                  Attention : Balance non équilibrée ! Écart de {Math.abs(totals.debit - totals.credit).toFixed(2)} €
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Détail de la Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compte</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead className="text-right">Total Débit</TableHead>
                  <TableHead className="text-right">Total Crédit</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balanceLines.map((line) => (
                  <TableRow key={line.accountCode}>
                    <TableCell className="font-medium">{line.accountCode}</TableCell>
                    <TableCell>{line.accountLabel}</TableCell>
                    <TableCell className="text-right">{line.totalDebit.toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{line.totalCredit.toFixed(2)} €</TableCell>
                    <TableCell className={`text-right font-medium ${
                      line.balance > 0 ? "text-primary" : line.balance < 0 ? "text-destructive" : ""
                    }`}>
                      {line.balance.toFixed(2)} €
                    </TableCell>
                  </TableRow>
                ))}
                {balanceLines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune écriture enregistrée. La balance est vide.
                    </TableCell>
                  </TableRow>
                )}
                {balanceLines.length > 0 && (
                  <TableRow className="font-bold bg-muted">
                    <TableCell colSpan={2}>TOTAUX</TableCell>
                    <TableCell className="text-right">{totals.debit.toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{totals.credit.toFixed(2)} €</TableCell>
                    <TableCell className={`text-right ${
                      totals.balanced ? "text-success" : "text-destructive"
                    }`}>
                      {totals.balanced ? "✓ Équilibré" : `Écart: ${Math.abs(totals.debit - totals.credit).toFixed(2)} €`}
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
