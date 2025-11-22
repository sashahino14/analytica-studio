import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Download, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

export default function CAGE() {
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

  const totalChargesComptables = charges.reduce((sum, c) => sum + c.montant, 0);
  const totalNonIncorporables = charges.reduce((sum, c) => sum + c.nonIncorporable, 0);
  const totalSupplettives = chargesSupplettives.reduce((sum, c) => sum + calculerMontantSupplettif(c), 0);
  const cage = totalChargesComptables - totalNonIncorporables + totalSupplettives;

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
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
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

  return (
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

        {/* Charges Comptables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>1. Charges Comptables</span>
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
              <span>2. Charges Supplétives</span>
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

        {/* Résultats */}
        <Card id="cage-results">
          <CardHeader>
            <CardTitle>3. Résultats du Calcul</CardTitle>
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
                <Card className="border-2 border-success/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Supplétives</p>
                    <p className="text-2xl font-bold text-success">{totalSupplettives.toFixed(2)} €</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={reinitialiser} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser les données
          </Button>
          <Button onClick={exporterPDF} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Exporter en PDF
          </Button>
        </div>
      </div>
    </Layout>
  );
}
