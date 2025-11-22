import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Download, RefreshCw, Plus, Trash2, Copy, FileSpreadsheet, BarChart3, PieChart, Info, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";

interface ChargeComptable {
  id: string;
  compte: string;
  libelle: string;
  montant: number;
  nonIncorporable: number;
  typeNonIncorporable: "fixe" | "pourcentage";
  pourcentageNonIncorporable: number;
}

interface ChargeSupplettive {
  id: string;
  libelle: string;
  type: "fixe" | "calcule";
  montantFixe: number;
  capital: number;
  taux: number;
  periode: "annuelle" | "semestrielle" | "trimestrielle";
}

type Scenario = "standard" | "optimiste" | "pessimiste";

export default function CAGE() {
  const [scenario, setScenario] = useState<Scenario>("standard");
  const [charges, setCharges] = useState<ChargeComptable[]>([
    {
      id: "1",
      compte: "61",
      libelle: "Achats stockés",
      montant: 0,
      nonIncorporable: 0,
      typeNonIncorporable: "fixe",
      pourcentageNonIncorporable: 0,
    },
  ]);

  const [chargesSupplettives, setChargesSupplettives] = useState<ChargeSupplettive[]>([
    {
      id: "1",
      libelle: "Rémunération exploitant",
      type: "fixe",
      montantFixe: 0,
      capital: 0,
      taux: 0,
      periode: "annuelle",
    },
  ]);

  const ajouterCharge = () => {
    const newCharge: ChargeComptable = {
      id: Date.now().toString(),
      compte: "6",
      libelle: "",
      montant: 0,
      nonIncorporable: 0,
      typeNonIncorporable: "fixe",
      pourcentageNonIncorporable: 0,
    };
    setCharges([...charges, newCharge]);
  };

  const supprimerCharge = (id: string) => {
    setCharges(charges.filter((c) => c.id !== id));
  };

  const ajouterChargeSupplettive = () => {
    const newCharge: ChargeSupplettive = {
      id: Date.now().toString(),
      libelle: "",
      type: "fixe",
      montantFixe: 0,
      capital: 0,
      taux: 0,
      periode: "annuelle",
    };
    setChargesSupplettives([...chargesSupplettives, newCharge]);
  };

  const supprimerChargeSupplettive = (id: string) => {
    setChargesSupplettives(chargesSupplettives.filter((c) => c.id !== id));
  };

  const updateCharge = (id: string, field: keyof ChargeComptable, value: any) => {
    setCharges(
      charges.map((c) => {
        if (c.id === id) {
          const updated = { ...c, [field]: value };
          
          // Recalculer nonIncorporable si c'est un pourcentage
          if (field === "montant" || field === "pourcentageNonIncorporable" || field === "typeNonIncorporable") {
            if (updated.typeNonIncorporable === "pourcentage") {
              updated.nonIncorporable = (updated.montant * updated.pourcentageNonIncorporable) / 100;
            }
          }
          
          return updated;
        }
        return c;
      })
    );
  };

  const updateChargeSupplettive = (id: string, field: keyof ChargeSupplettive, value: any) => {
    setChargesSupplettives(
      chargesSupplettives.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const calculerMontantSupplettif = (charge: ChargeSupplettive): number => {
    if (charge.type === "fixe") {
      return charge.montantFixe;
    } else {
      let facteur = 1;
      if (charge.periode === "semestrielle") facteur = 0.5;
      if (charge.periode === "trimestrielle") facteur = 0.25;
      return (charge.capital * charge.taux * facteur) / 100;
    }
  };

  const appliquerScenario = (montant: number): number => {
    switch (scenario) {
      case "optimiste":
        return montant * 0.9; // -10%
      case "pessimiste":
        return montant * 1.1; // +10%
      default:
        return montant;
    }
  };

  const totalChargesComptables = charges.reduce((sum, c) => sum + appliquerScenario(c.montant), 0);
  const totalNonIncorporables = charges.reduce((sum, c) => sum + appliquerScenario(c.nonIncorporable), 0);
  const totalSupplettives = chargesSupplettives.reduce((sum, c) => sum + appliquerScenario(calculerMontantSupplettif(c)), 0);
  const cage = totalChargesComptables - totalNonIncorporables + totalSupplettives;

  // Validation et alertes
  const pourcentageSupplettives = totalChargesComptables > 0 ? (totalSupplettives / totalChargesComptables) * 100 : 0;
  const alerteSupplettivesElevees = pourcentageSupplettives > 30;

  // Données pour les graphiques
  const dataBar = [
    { name: "Charges Comptables", value: totalChargesComptables, fill: "hsl(var(--primary))" },
    { name: "Non Incorporables", value: totalNonIncorporables, fill: "hsl(var(--destructive))" },
    { name: "Supplétives", value: totalSupplettives, fill: "hsl(var(--chart-2))" },
  ];

  const dataPie = [
    { name: "Incorporables", value: cage, fill: "hsl(var(--primary))" },
    { name: "Non Incorporables", value: totalNonIncorporables, fill: "hsl(var(--destructive))" },
  ];

  const reinitialiser = () => {
    setCharges([
      {
        id: "1",
        compte: "61",
        libelle: "Achats stockés",
        montant: 0,
        nonIncorporable: 0,
        typeNonIncorporable: "fixe",
        pourcentageNonIncorporable: 0,
      },
    ]);
    setChargesSupplettives([
      {
        id: "1",
        libelle: "Rémunération exploitant",
        type: "fixe",
        montantFixe: 0,
        capital: 0,
        taux: 0,
        periode: "annuelle",
      },
    ]);
    toast({
      title: "Données réinitialisées",
      description: "Toutes les données ont été effacées.",
    });
  };

  const exporterPDF = async () => {
    const element = document.getElementById("cage-results");
    const charts = document.getElementById("cage-charts");
    if (!element) return;

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Capture du tableau de résultats
      const canvas1 = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData1 = canvas1.toDataURL("image/png");
      const imgWidth = 190;
      const imgHeight1 = (canvas1.height * imgWidth) / canvas1.width;
      pdf.addImage(imgData1, "PNG", 10, 10, imgWidth, imgHeight1);
      
      // Capture des graphiques si présents
      if (charts) {
        pdf.addPage();
        const canvas2 = await html2canvas(charts, {
          scale: 2,
          backgroundColor: "#ffffff",
        });
        const imgData2 = canvas2.toDataURL("image/png");
        const imgHeight2 = (canvas2.height * imgWidth) / canvas2.width;
        pdf.addImage(imgData2, "PNG", 10, 10, imgWidth, imgHeight2);
      }
      
      pdf.save("CAGE-Resultat.pdf");
      
      toast({
        title: "Export réussi",
        description: "Le PDF a été téléchargé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter le PDF.",
        variant: "destructive",
      });
    }
  };

  const exporterCSV = () => {
    let csv = "Type,Libellé,Montant\n";
    charges.forEach(c => {
      csv += `Charge Comptable,${c.libelle || c.compte},${c.montant}\n`;
      if (c.nonIncorporable > 0) {
        csv += `Non Incorporable,${c.libelle || c.compte},${c.nonIncorporable}\n`;
      }
    });
    chargesSupplettives.forEach(c => {
      csv += `Charge Supplétive,${c.libelle},${calculerMontantSupplettif(c)}\n`;
    });
    csv += `\nTotal Charges Comptables,,${totalChargesComptables}\n`;
    csv += `Total Non Incorporables,,${totalNonIncorporables}\n`;
    csv += `Total Supplétives,,${totalSupplettives}\n`;
    csv += `CAGE,,${cage}\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CAGE-Export.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export CSV réussi",
      description: "Le fichier CSV a été téléchargé.",
    });
  };

  const copierResultat = () => {
    const texte = `Résultat CAGE (${scenario})
Charges Comptables: ${totalChargesComptables.toFixed(2)} €
Charges Non Incorporables: ${totalNonIncorporables.toFixed(2)} €
Charges Supplétives: ${totalSupplettives.toFixed(2)} €
CAGE: ${cage.toFixed(2)} €`;

    navigator.clipboard.writeText(texte);
    toast({
      title: "Copié !",
      description: "Le résultat a été copié dans le presse-papier.",
    });
  };

  return (
    <TooltipProvider>
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calcul de la CAGE</h1>
            <p className="text-muted-foreground mt-2">
              Comptabilité Analytique de Gestion d'Exploitation
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Définition :</strong> Les charges incorporables représentent les charges réellement prises en compte dans le calcul des coûts, 
              excluant les charges non incorporables et incluant les charges supplétives.
              <br />
              <strong>Formule :</strong> CAGE = (Charges comptables - Charges non incorporables) + Charges supplétives
            </AlertDescription>
          </Alert>

          {alerteSupplettivesElevees && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Attention :</strong> Les charges supplétives représentent {pourcentageSupplettives.toFixed(1)}% des charges comptables, 
                ce qui est élevé. Vérifiez vos données.
              </AlertDescription>
            </Alert>
          )}

          {/* Simulation par scénarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Scénarios de Simulation
              </CardTitle>
              <CardDescription>
                Simulez différents cas pour voir l'impact sur la CAGE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={scenario === "optimiste" ? "default" : "outline"}
                  onClick={() => setScenario("optimiste")}
                  className="flex-1"
                >
                  Optimiste (-10%)
                </Button>
                <Button
                  variant={scenario === "standard" ? "default" : "outline"}
                  onClick={() => setScenario("standard")}
                  className="flex-1"
                >
                  Standard
                </Button>
                <Button
                  variant={scenario === "pessimiste" ? "default" : "outline"}
                  onClick={() => setScenario("pessimiste")}
                  className="flex-1"
                >
                  Pessimiste (+10%)
                </Button>
              </div>
            </CardContent>
          </Card>

        {/* Charges Comptables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>1. Charges Comptables</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Les charges comptables sont les dépenses enregistrées en comptabilité générale (comptes 61 à 69). 
                    Exemple : achats de matières, services extérieurs, charges de personnel, etc.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button onClick={ajouterCharge} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardTitle>
            <CardDescription>
              Saisissez vos charges des comptes 61 à 69 (ou codes libres)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {charges.map((charge) => (
                <div key={charge.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg bg-card">
                  <div className="md:col-span-2">
                    <Label>Compte</Label>
                    <Input
                      value={charge.compte}
                      onChange={(e) => updateCharge(charge.id, "compte", e.target.value)}
                      placeholder="Ex: 61"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label>Libellé</Label>
                    <Input
                      value={charge.libelle}
                      onChange={(e) => updateCharge(charge.id, "libelle", e.target.value)}
                      placeholder="Description"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Montant (€)</Label>
                    <Input
                      type="number"
                      value={charge.montant}
                      onChange={(e) => updateCharge(charge.id, "montant", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Type Non Inc.</Label>
                    <Select
                      value={charge.typeNonIncorporable}
                      onValueChange={(value) => updateCharge(charge.id, "typeNonIncorporable", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixe">Montant fixe</SelectItem>
                        <SelectItem value="pourcentage">Pourcentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {charge.typeNonIncorporable === "fixe" ? (
                    <div className="md:col-span-2">
                      <Label>Non Inc. (€)</Label>
                      <Input
                        type="number"
                        value={charge.nonIncorporable}
                        onChange={(e) => updateCharge(charge.id, "nonIncorporable", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  ) : (
                    <div className="md:col-span-2">
                      <Label>Non Inc. (%)</Label>
                      <Input
                        type="number"
                        value={charge.pourcentageNonIncorporable}
                        onChange={(e) =>
                          updateCharge(charge.id, "pourcentageNonIncorporable", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        = {charge.nonIncorporable.toFixed(2)} €
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      onClick={() => supprimerCharge(charge.id)}
                      variant="destructive"
                      size="icon"
                      disabled={charges.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charges Supplétives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>2. Charges Supplétives</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Les charges supplétives ne sont pas enregistrées en comptabilité générale mais doivent être prises en compte 
                    en comptabilité analytique. Exemple : rémunération de l'exploitant, intérêts du capital propre.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button onClick={ajouterChargeSupplettive} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardTitle>
            <CardDescription>
              Charges à ajouter (rémunération exploitant, intérêts du capital, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chargesSupplettives.map((charge) => (
                <div key={charge.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg bg-card">
                  <div className="md:col-span-3">
                    <Label>Libellé</Label>
                    <Input
                      value={charge.libelle}
                      onChange={(e) => updateChargeSupplettive(charge.id, "libelle", e.target.value)}
                      placeholder="Ex: Rémunération exploitant"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Type</Label>
                    <Select
                      value={charge.type}
                      onValueChange={(value) => updateChargeSupplettive(charge.id, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixe">Montant fixe</SelectItem>
                        <SelectItem value="calcule">Calculé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {charge.type === "fixe" ? (
                    <div className="md:col-span-2">
                      <Label>Montant (€)</Label>
                      <Input
                        type="number"
                        value={charge.montantFixe}
                        onChange={(e) =>
                          updateChargeSupplettive(charge.id, "montantFixe", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="md:col-span-2">
                        <Label>Capital (€)</Label>
                        <Input
                          type="number"
                          value={charge.capital}
                          onChange={(e) => updateChargeSupplettive(charge.id, "capital", parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Taux (%)</Label>
                        <Input
                          type="number"
                          value={charge.taux}
                          onChange={(e) => updateChargeSupplettive(charge.id, "taux", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Période</Label>
                        <Select
                          value={charge.periode}
                          onValueChange={(value) => updateChargeSupplettive(charge.id, "periode", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annuelle">Annuelle</SelectItem>
                            <SelectItem value="semestrielle">Semestrielle</SelectItem>
                            <SelectItem value="trimestrielle">Trimestrielle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      onClick={() => supprimerChargeSupplettive(charge.id)}
                      variant="destructive"
                      size="icon"
                      disabled={chargesSupplettives.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {charge.type === "calcule" && (
                    <div className="md:col-span-12">
                      <p className="text-sm text-muted-foreground">
                        Montant calculé : {calculerMontantSupplettif(charge).toFixed(2)} €
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Résultats et Graphiques */}
        <Tabs defaultValue="tableau" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tableau">Tableau</TabsTrigger>
            <TabsTrigger value="graphiques">Graphiques</TabsTrigger>
          </TabsList>

          <TabsContent value="tableau" className="space-y-4">
            <Card id="cage-results">
              <CardHeader>
                <CardTitle>3. Résultats du Calcul (Scénario: {scenario})</CardTitle>
                <CardDescription>Synthèse et montant de la CAGE</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Libellé</TableHead>
                    <TableHead className="text-right">Montant (€)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Charges Comptables</TableCell>
                    <TableCell className="text-right font-mono">{totalChargesComptables.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-destructive">(-) Charges Non Incorporables</TableCell>
                    <TableCell className="text-right font-mono text-destructive">
                      -{totalNonIncorporables.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-success">(+) Charges Supplétives</TableCell>
                    <TableCell className="text-right font-mono text-success">+{totalSupplettives.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/10">
                    <TableCell className="font-bold text-lg">CAGE (Charges Incorporables)</TableCell>
                    <TableCell className="text-right font-bold text-lg font-mono text-primary">
                      {cage.toFixed(2)} €
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Charges Comptables</p>
                    <p className="text-2xl font-bold text-foreground">{totalChargesComptables.toFixed(2)} €</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-destructive/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Non Incorporables</p>
                    <p className="text-2xl font-bold text-destructive">{totalNonIncorporables.toFixed(2)} €</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-chart-2/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Supplétives</p>
                    <p className="text-2xl font-bold" style={{ color: "hsl(var(--chart-2))" }}>{totalSupplettives.toFixed(2)} €</p>
                  </CardContent>
                </Card>
              </div>
                </div>
              </CardContent>
            </Card>

            {/* Conseils pédagogiques */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Conseils pratiques :</strong>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Vérifiez que toutes les charges comptables sont bien classées dans les bons comptes (61-69)</li>
                  <li>Les charges non incorporables comprennent généralement les amortissements exceptionnels, provisions, etc.</li>
                  <li>Les charges supplétives permettent d'intégrer des coûts non comptabilisés mais économiquement réels</li>
                  <li>Utilisez les scénarios pour simuler différentes hypothèses de gestion</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="graphiques" className="space-y-4">
            <Card id="cage-charts">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Visualisation des Charges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Graphique en barres */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Comparaison des Charges</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataBar}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px"
                        }}
                        formatter={(value: number) => `${value.toFixed(2)} €`}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Montant (€)" radius={[8, 8, 0, 0]}>
                        {dataBar.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Graphique en camembert */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Répartition des Charges</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={dataPie}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value.toFixed(0)} €`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dataPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px"
                        }}
                        formatter={(value: number) => `${value.toFixed(2)} €`}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button onClick={reinitialiser} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button onClick={exporterPDF} variant="default">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={exporterCSV} variant="default">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={copierResultat} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copier
          </Button>
        </div>
        </div>
      </Layout>
    </TooltipProvider>
  );
}
