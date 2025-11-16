import { useEffect, useState } from "react";
import { db, Center } from "@/lib/db";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Centers() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [formData, setFormData] = useState<Omit<Center, "id">>({
    code: "",
    name: "",
  });

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      await db.init();
      const data = await db.getAll<Center>("centers");
      setCenters(data);
    } catch (error) {
      console.error("Error loading centers:", error);
      toast.error("Erreur lors du chargement des centres");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        await db.update("centers", { ...formData, id: editingCenter.id });
        toast.success("Centre modifié avec succès");
      } else {
        await db.add("centers", formData);
        toast.success("Centre créé avec succès");
      }
      setFormData({ code: "", name: "" });
      setEditingCenter(null);
      loadCenters();
    } catch (error) {
      console.error("Error saving center:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (center: Center) => {
    setEditingCenter(center);
    setFormData({
      code: center.code,
      name: center.name,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce centre ?")) {
      try {
        await db.delete("centers", id);
        toast.success("Centre supprimé");
        loadCenters();
      } catch (error) {
        console.error("Error deleting center:", error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centres d'Analyse</h1>
          <p className="text-muted-foreground mt-2">
            Créez et gérez vos centres pour la comptabilité analytique
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingCenter ? "Modifier le Centre" : "Nouveau Centre"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code Centre</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: ADM"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du Centre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Administration"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  {editingCenter ? "Modifier" : "Créer"}
                </Button>
                {editingCenter && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingCenter(null);
                      setFormData({ code: "", name: "" });
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
            <CardTitle>Liste des Centres</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centers.map((center) => (
                  <TableRow key={center.id}>
                    <TableCell className="font-medium">{center.code}</TableCell>
                    <TableCell>{center.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(center)}
                        className="mr-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(center.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {centers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Aucun centre enregistré. Créez votre premier centre ci-dessus.
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
