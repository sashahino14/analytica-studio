import { useState } from "react";
import { db } from "@/lib/db";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function ImportExport() {
  const [jsonData, setJsonData] = useState("");

  const handleExport = async () => {
    try {
      await db.init();
      const data = await db.exportData();
      
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comptaedu-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Export réalisé avec succès");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Erreur lors de l'export");
    }
  };

  const handleImport = async () => {
    if (!jsonData.trim()) {
      toast.error("Veuillez coller des données JSON valides");
      return;
    }

    if (!confirm("L'import va remplacer toutes vos données actuelles. Êtes-vous sûr ?")) {
      return;
    }

    try {
      await db.init();
      await db.importData(jsonData);
      toast.success("Import réalisé avec succès");
      setJsonData("");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error("Erreur lors de l'import. Vérifiez le format JSON.");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("ATTENTION : Cette action va supprimer TOUTES vos données. Êtes-vous absolument sûr ?")) {
      return;
    }

    if (!confirm("Dernière confirmation : Toutes les données seront perdues définitivement.")) {
      return;
    }

    try {
      await db.init();
      await db.clear("accounts");
      await db.clear("centers");
      await db.clear("entries");
      await db.clear("allocations");
      toast.success("Toutes les données ont été supprimées");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Import / Export</h1>
          <p className="text-muted-foreground mt-2">
            Sauvegardez et restaurez vos données comptables
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5 text-success" />
                Exporter les Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Téléchargez toutes vos données (comptes, centres, écritures) au format JSON.
                Vous pourrez les réimporter plus tard ou les utiliser comme sauvegarde.
              </p>
              <Button onClick={handleExport} className="w-full bg-success text-success-foreground hover:bg-success/90">
                <Download className="mr-2 h-4 w-4" />
                Télécharger l'Export JSON
              </Button>
            </CardContent>
          </Card>

          <Card className="border-warning">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trash2 className="mr-2 h-5 w-5 text-destructive" />
                Réinitialiser
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2 text-destructive">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <p className="text-sm">
                  <strong>Danger !</strong> Cette action supprimera définitivement toutes vos données.
                  Pensez à faire un export avant.
                </p>
              </div>
              <Button
                onClick={handleClearAll}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Tout Supprimer
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5 text-primary" />
              Importer des Données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-2 text-warning">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <p className="text-sm">
                L'import remplacera toutes vos données actuelles par celles du fichier JSON.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Collez votre JSON ici :
              </label>
              <Textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder='{"accounts": [...], "centers": [...], "entries": [...]}'
                className="font-mono text-xs min-h-[200px]"
              />
            </div>
            <Button
              onClick={handleImport}
              disabled={!jsonData.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer les Données
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guide d'Utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">📥 Import</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Ouvrez un fichier JSON exporté précédemment dans un éditeur de texte</li>
                <li>Copiez tout le contenu du fichier</li>
                <li>Collez-le dans la zone de texte ci-dessus</li>
                <li>Cliquez sur "Importer les Données"</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">📤 Export</h3>
              <p className="text-sm text-muted-foreground">
                Cliquez simplement sur le bouton d'export pour télécharger un fichier JSON contenant
                toutes vos données. Conservez ce fichier précieusement comme sauvegarde.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">🔄 Format des Données</h3>
              <p className="text-sm text-muted-foreground">
                Les données sont au format JSON standard et incluent : plan comptable, centres d'analyse,
                écritures comptables et règles de répartition. Vous pouvez partager ce fichier avec
                d'autres étudiants ou enseignants.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
