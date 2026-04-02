import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { Shirt, Layers } from "lucide-react";

import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { authQueryOptions } from "@/lib/auth/queries";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (!user) {
      throw redirect({ to: "/login" });
    }

    return { user };
  },
});

function AuthLayout() {
  const { user } = Route.useRouteContext();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10 bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link
              to="/wardrobe"
              className="flex items-center gap-2 text-lg font-bold tracking-tight"
            >
              <Shirt className="h-5 w-5" />
              <span className="tracking-widest uppercase">Outfitter</span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink to="/wardrobe">
                <Layers className="h-3.5 w-3.5" />
                Wardrobe
              </NavLink>
              <NavLink to="/outfits">
                <Shirt className="h-3.5 w-3.5" />
                Outfits
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs tracking-wider text-muted-foreground uppercase">
              {user.name}
            </span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group relative flex items-center gap-2 px-3 py-2 text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
    >
      {children}
      <span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-foreground transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
