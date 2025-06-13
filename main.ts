// --- FINAL main.ts for Clean URLs, including nested pages ---

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { extname, join } from "https://deno.land/std@0.224.0/path/mod.ts";

serve(async (req) => {
  const pathname = new URL(req.url).pathname;

  // Handle clean URLs
  if (extname(pathname) === "") {
    try {
      // --- THIS IS THE LINE THAT WAS FIXED ---
      // We use .slice(1) to remove the leading "/" from the pathname.
      // e.g., "/projects/cholerics" becomes "projects/cholerics"
      const filePath = join(Deno.cwd(), `${pathname.slice(1)}.html`);
      // --- END OF FIX ---

      const file = await Deno.readFile(filePath);
      return new Response(file, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch {
      // Ignore error and fall through to serveDir
    }
  }

  // Fallback for all other static assets and the root index.html
  return serveDir(req, {
    fsRoot: ".",
    urlRoot: "",
    showDirListing: false,
    enableCors: true,
  });
});

console.log("Static file server listening on http://localhost:8000");