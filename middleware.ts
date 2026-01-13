// middleware.ts (racine)
import { proxy } from "@/lib/supabase/proxy";

export { proxy as middleware };

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
