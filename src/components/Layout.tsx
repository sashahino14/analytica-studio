import { Link, useLocation } from "react-router-dom";
import { Calculator, FileText, Target, TrendingUp, BarChart3, Database, Download, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Plan Comptable", href: "/accounts", icon: FileText },
  { name: "Centres d'Analyse", href: "/centers", icon: Target },
  { name: "Écritures", href: "/entries", icon: Calculator },
  { name: "Balance", href: "/balance", icon: TrendingUp },
  { name: "CAGE", href: "/cage", icon: DollarSign },
  { name: "Analytique", href: "/analytics", icon: Database },
  { name: "Import/Export", href: "/import-export", icon: Download },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border">
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <Calculator className="h-8 w-8 text-sidebar-primary" />
          <span className="ml-3 text-xl font-bold text-sidebar-foreground">Analytica</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="pl-64">
        <div className="px-8 py-6">
          {children}
        </div>

        <footer className="px-8 py-4 text-center text-sm text-muted-foreground border-t border-sidebar-border">
          © {new Date().getFullYear()} Hino Coding Lab (HCL). Tous droits réservés.
        </footer>
      </main>
    </div>
  );
}
