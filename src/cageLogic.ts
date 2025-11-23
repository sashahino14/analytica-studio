// Fichier: src/cageLogic.ts

/**
 * MODULE : Calcul des Charges Incorporables (CAGE)
 */

// --- DÉFINITIONS ---
export const UNITE_MONETAIRE = "FCFA";

export interface ChargesGenerales {
    transport: number;
    servicesExtA: number;
    servicesExtB: number;
    impotsEtTaxes: number;
    autresCharges: number;
    chargePersonnel: number;
    fraisFinanciers: number;
    dotationsAmortissements: number;
    dotationsProvisions: number;
}

export interface Ajustements {
    cnifraisFinanciers: number;
    cniDotationsProvisions: number;
    cniTaxesEtSousActivite: number;
    remunerationAngelebanT: number;
    capitalSocial: number;
    tauxRemunerationCapital: number;
}

export interface ResultatCAGE {
    montantIncorporable: number;
    details: {
        totalChargesGenerales: number;
        totalCNI: number;
        totalCS: number;
        breakdownCNI: {
            fraisFinanciers: number;
            provisions: number;
            taxesSousActivite: number;
        };
        breakdownCS: {
            remunerationCapital: number;
            remunerationDirigeant: number;
        };
    };
}

// --- LOGIQUE MÉTIER ---
export function calculerChargesIncorporables(charges: ChargesGenerales, ajustements: Ajustements): ResultatCAGE {
    // 1. Total Charges Générales
    const totalChargesGenerales = Object.values(charges).reduce((sum, current) => sum + current, 0);

    // 2. Charges Non-Incorporables (CNI)
    const totalCNI =
        ajustements.cnifraisFinanciers +
        ajustements.cniDotationsProvisions +
        ajustements.cniTaxesEtSousActivite;

    // 3. Charges Supplétives (CS)
    const csRemunerationCapital = ajustements.capitalSocial * ajustements.tauxRemunerationCapital;
    const csRemunerationDirigeant = ajustements.remunerationAngelebanT;
    const totalCS = csRemunerationCapital + csRemunerationDirigeant;

    // 4. Calcul Final
    const montantFinal = totalChargesGenerales - totalCNI + totalCS;

    return {
        montantIncorporable: montantFinal,
        details: {
            totalChargesGenerales,
            totalCNI,
            totalCS,
            breakdownCNI: {
                fraisFinanciers: ajustements.cnifraisFinanciers,
                provisions: ajustements.cniDotationsProvisions,
                taxesSousActivite: ajustements.cniTaxesEtSousActivite
            },
            breakdownCS: {
                remunerationCapital: csRemunerationCapital,
                remunerationDirigeant: csRemunerationDirigeant
            }
        }
    };
}

// --- EXECUTION (POUR TEST) ---
// Vous pouvez décommenter les lignes ci-dessous pour tester directement ce fichier
/*
const donneesCharges = {
    transport: 125000, servicesExtA: 100000, servicesExtB: 25000,
    impotsEtTaxes: 105000, autresCharges: 115000, chargePersonnel: 45000,
    fraisFinanciers: 90000, dotationsAmortissements: 40000, dotationsProvisions: 45000
};
const donneesAjustements = {
    cnifraisFinanciers: 90000, cniDotationsProvisions: 45000, cniTaxesEtSousActivite: 30000,
    remunerationAngelebanT: 1200000, capitalSocial: 2000000, tauxRemunerationCapital: 0.08
};
console.log(calculerChargesIncorporables(donneesCharges, donneesAjustements));
*/
