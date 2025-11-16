import { useEffect, useState } from "react";
import { db, Entry, Center } from "@/lib/db";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CenterAnalytics {
  centerCode: string;
  centerName: string;
  totalCharges: number;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<CenterAnalytics[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    calculateAnalytics();
  }, []);

  const calculateAnalytics = async () => {
    try {
      await db.init();
      const entries = await db.getAll<Entry>("entries");
      const centers = await db.getAll<Center>("centers");

      const centerMap = new Map<string, number>();

      entries.forEach((entry) => {
        entry.lines.forEach((line) => {
          if (line.centerCode) {
            const current = centerMap.get(line.centerCode) || 0;
            centerMap.set(line.centerCode, current + (line.debit || 0));
          }
        });
      });

      const analyticsData: CenterAnalytics[] = Array.from(centerMap.entries()).map(
        ([code, total]) => {
          const center = centers.find((c) => c.code === code);
          return {
            centerCode: code,
            centerName: center?.name || "Inconnu",
            totalCharges: total,
          };
        }
      );

      const totalCharges = analyticsData.reduce((sum, item) => sum + item.totalCharges, 0);

      setAnalytics(analyticsData);
      setTotal(totalCharges);
    } catch (error) {
      console.error("Error calculating analytics:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comptabilité Analytique</h1>
          <p className="text-muted-foreground mt-2">
            Répartition des charges par centre d'analyse
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Charges Analytiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{total.toFixed(2)} €</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Centres Utilisés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analytics.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Moyenne par Centre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analytics.length > 0 ? (total / analytics.length).toFixed(2) : "0.00"} €
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Centre</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code Centre</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Total Charges</TableHead>
                  <TableHead className="text-right">Pourcentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map((item) => (
                  <TableRow key={item.centerCode}>
                    <TableCell className="font-medium">{item.centerCode}</TableCell>
                    <TableCell>{item.centerName}</TableCell>
                    <TableCell className="text-right">{item.totalCharges.toFixed(2)} €</TableCell>
                    <TableCell className="text-right">
                      {total > 0 ? ((item.totalCharges / total) * 100).toFixed(1) : "0.0"} %
                    </TableCell>
                  </TableRow>
                ))}
                {analytics.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Aucune charge analytique enregistrée
                    </TableCell>
                  </TableRow>
                )}
                {analytics.length > 0 && (
                  <TableRow className="font-bold bg-muted">
                    <TableCell colSpan={2}>TOTAL</TableCell>
                    <TableCell className="text-right">{total.toFixed(2)} €</TableCell>
                    <TableCell className="text-right">100.0 %</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>À propos de la Répartition Analytique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Qu'est-ce que la comptabilité analytique ?</h3>
              <p className="text-sm text-muted-foreground">
                La comptabilité analytique permet de suivre et d'analyser les coûts par activité, projet ou département.
                Elle complète la comptabilité générale en offrant une vision plus détaillée de la performance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Comment utiliser les centres d'analyse ?</h3>
              <p className="text-sm text-muted-foreground">
                Lors de la saisie des écritures, affectez vos charges aux centres concernés. Le système calcule
                automatiquement la répartition et vous permet de voir où vos ressources sont utilisées.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Types de répartition</h3>
              <p className="text-sm text-muted-foreground">
                • <strong>Coûts directs</strong> : Affectés directement à un centre (ex: salaire d'un service)<br />
                • <strong>Coûts indirects</strong> : Répartis entre plusieurs centres selon des clés de répartition<br />
                • <strong>Coûts complets</strong> : Incluent tous les coûts directs et indirects
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
