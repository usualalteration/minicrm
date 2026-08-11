import { useState } from "react";
import { Home, Users, Menu, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/customers", label: "Customers", icon: Users },
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
  <div className="flex h-full flex-col gap-2 p-4">
    <div className="flex items-center gap-2 px-2 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="text-sm font-bold">M</span>
      </div>
      <span className="text-lg font-semibold tracking-tight">Mini CRM</span>
    </div>

    <nav className="flex flex-1 flex-col gap-1">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>

    <p className="px-3 pt-2 text-xs text-muted-foreground">
      Mini CRM · Step 1 foundation
    </p>
  </div>
);

const Sidebar = () => (
  <aside className="hidden w-64 shrink-0 border-r bg-sidebar/60 md:block">
    <SidebarContent />
  </aside>
);

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs font-bold">M</span>
          </div>
          <span className="text-base font-semibold">Mini CRM</span>
        </div>
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-foreground hover:bg-accent"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-x-0 top-14 z-20 border-b bg-background shadow-lg">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-background">
    <Sidebar />
    <div className="flex min-w-0 flex-1 flex-col">
      <MobileNav />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  </div>
);