import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Target, Calculator, TrendingUp } from "lucide-react";
import Layout from "@/components/Layout";

export default function Dashboard() {
  const [stats, setStats] = useState({
    accounts: 0,
    centers: 0,
    entries: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      await db.init();
      const accounts = await db.getAll("accounts");
      const centers = await db.getAll("centers");
      const entries = await db.getAll("entries");
      setStats({
        accounts: accounts.length,
        centers: centers.length,
        entries: entries.length,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenue dans Analytica - Votre assistant de comptabilité analytique
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comptes
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.accounts}</div>
              <p className="text-xs text-muted-foreground">Dans le plan comptable</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Centres d'Analyse
              </CardTitle>
              <Target className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.centers}</div>
              <p className="text-xs text-muted-foreground">Centres actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Écritures
              </CardTitle>
              <Calculator className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.entries}</div>
              <p className="text-xs text-muted-foreground">Enregistrées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Statut
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">Actif</div>
              <p className="text-xs text-muted-foreground">Système opérationnel</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Guide de Démarrage Rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Créez votre Plan Comptable</h3>
                <p className="text-sm text-muted-foreground">
                  Définissez vos comptes (Actif, Passif, Charges, Produits) avec leurs codes et libellés.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Définissez vos Centres d'Analyse</h3>
                <p className="text-sm text-muted-foreground">
                  Créez les centres pour suivre la répartition analytique de vos charges.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Saisissez vos Écritures</h3>
                <p className="text-sm text-muted-foreground">
                  Enregistrez vos opérations comptables avec leurs affectations analytiques.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Consultez votre Balance et Analytique</h3>
                <p className="text-sm text-muted-foreground">
                  Visualisez automatiquement votre balance comptable et les répartitions analytiques.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
