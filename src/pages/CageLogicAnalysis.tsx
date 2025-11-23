// Fichier: src/pages/CageLogicAnalysis.tsx
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    calculerChargesIncorporables, 
    ChargesGenerales, 
    Ajustements, 
    UNITE_MONETAIRE,
    ResultatCAGE
} from '../cageLogic';

export default function CageLogicAnalysis() {
    // Données initiales (basées sur votre exercice)
    const [charges] = useState<ChargesGenerales>({
        transport: 125000,
        servicesExtA: 100000,
        servicesExtB: 25000,
        impotsEtTaxes: 105000,
        autresCharges: 115000,
        chargePersonnel: 45000,
        fraisFinanciers: 90000,
        dotationsAmortissements: 40000,
        dotationsProvisions: 45000
    });

    const [ajustements] = useState<Ajustements>({
        cnifraisFinanciers: 90000,
        cniDotationsProvisions: 45000,
        cniTaxesEtSousActivite: 30000,
        remunerationAngelebanT: 1200000,
        capitalSocial: 2000000,
        tauxRemunerationCapital: 0.08
    });

    const [resultat, setResultat] = useState<ResultatCAGE | null>(null);

    useEffect(() => {
        const res = calculerChargesIncorporables(charges, ajustements);
        setResultat(res);
    }, [charges, ajustements]);

    if (!resultat) return <div>Calcul en cours...</div>;

    const fmt = (n: number) => n.toLocaleString('fr-FR');

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Analyse CAGE (Détaillée)</h1>
                    <p className="text-muted-foreground mt-2">
                        Calcul des charges incorporables selon la logique stricte.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Carte Charges Générales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-700">1. Charges Générales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex justify-between"><span>Transports</span> <span>{fmt(charges.transport)}</span></li>
                                <li className="flex justify-between"><span>Services Extérieurs</span> <span>{fmt(charges.servicesExtA + charges.servicesExtB)}</span></li>
                                <li className="flex justify-between"><span>Impôts & Taxes</span> <span>{fmt(charges.impotsEtTaxes)}</span></li>
                                <li className="flex justify-between"><span>Autres Charges</span> <span>{fmt(charges.autresCharges)}</span></li>
                                <li className="flex justify-between"><span>Personnel</span> <span>{fmt(charges.chargePersonnel)}</span></li>
                                <li className="flex justify-between"><span>Frais Financiers</span> <span>{fmt(charges.fraisFinanciers)}</span></li>
                                <li className="flex justify-between"><span>Dotations</span> <span>{fmt(charges.dotationsAmortissements + charges.dotationsProvisions)}</span></li>
                            </ul>
                            <div className="mt-4 pt-4 border-t flex justify-between font-bold">
                                <span>Total CG</span>
                                <span>{fmt(resultat.details.totalChargesGenerales)} {UNITE_MONETAIRE}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Carte Ajustements */}
                    <div className="space-y-6">
                        <Card className="bg-red-50 border-red-100">
                            <CardHeader>
                                <CardTitle className="text-lg text-red-700 flex items-center">
                                    <span className="mr-2">-</span> Charges Non-Incorporables
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-red-600 text-sm space-y-2">
                                <li className="flex justify-between"><span>Frais Financiers</span> <span>-{fmt(resultat.details.breakdownCNI.fraisFinanciers)}</span></li>
                                <li className="flex justify-between"><span>Dot. Provisions</span> <span>-{fmt(resultat.details.breakdownCNI.provisions)}</span></li>
                                <li className="flex justify-between"><span>Charges s/s activité</span> <span>-{fmt(resultat.details.breakdownCNI.taxesSousActivite)}</span></li>
                                <div className="pt-2 border-t border-red-200 font-bold flex justify-between">
                                    <span>Total CNI</span>
                                    <span>-{fmt(resultat.details.totalCNI)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-emerald-50 border-emerald-100">
                            <CardHeader>
                                <CardTitle className="text-lg text-emerald-700 flex items-center">
                                    <span className="mr-2">+</span> Charges Supplétives
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-emerald-600 text-sm space-y-2">
                                <li className="flex justify-between">
                                    <span>Rémun. Capital ({ajustements.tauxRemunerationCapital * 100}%)</span> 
                                    <span>+{fmt(resultat.details.breakdownCS.remunerationCapital)}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Rémun. Exploitant</span> 
                                    <span>+{fmt(resultat.details.breakdownCS.remunerationDirigeant)}</span>
                                </li>
                                <div className="pt-2 border-t border-emerald-200 font-bold flex justify-between">
                                    <span>Total CS</span>
                                    <span>+{fmt(resultat.details.totalCS)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Carte Résultat */}
                    <Card className="bg-slate-900 text-white border-slate-800 flex flex-col justify-center">
                        <CardContent className="text-center pt-6">
                            <h2 className="text-slate-400 uppercase tracking-wider text-xs font-bold mb-4">Montant à Répartir</h2>
                            <div className="text-5xl font-bold mb-2 tracking-tight">
                                {fmt(resultat.montantIncorporable)}
                            </div>
                            <span className="text-xl text-slate-400">{UNITE_MONETAIRE}</span>
                            <div className="mt-8 text-xs text-slate-500 bg-slate-800 px-4 py-2 rounded-full inline-block">
                                Formule : CG - CNI + CS
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
