// --- UPDATED main.ts for Clean URLs on Deno Deploy ---

import { serve } from "https://deno.land/std@0.224.0/http/server.ts"; // Updated to a more recent version
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { extname, join } from "https://deno.land/std@0.224.0/path/mod.ts";

serve(async (req) => {
  const pathname = new URL(req.url).pathname;

  // This is the key logic for clean URLs.
  // We check if the requested path has NO file extension (like .css, .js, etc.).
  if (extname(pathname) === "") {
    // If it has no extension, we assume it's a page and try to serve the corresponding .html file.
    // e.g., a request for "/creation" becomes a lookup for "/creation.html".
    try {
      const filePath = join(Deno.cwd(), `${pathname}.html`);
      const file = await Deno.readFile(filePath);
      // If the file is found, serve it with the correct HTML content type.
      return new Response(file, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch (e) {
      // If we can't find the .html file (e.g., it's a 404 or a request for the root '/'),
      // we'll just ignore the error and let the serveDir logic below handle it.
      // This is not an error in the server, just a failed lookup.
    }
  }

  // For all other requests (like /css/style.css, /js/script.js, images, or the root path "/"),
  // we fall back to the original serveDir function. It's great at serving static files
  // and it will correctly serve index.html for the root "/" path.
  return serveDir(req, {
    fsRoot: ".", // Serve files from the current directory.
    urlRoot: "",
    showDirListing: false,
    enableCors: true,
  });
});

console.log("Static file server listening on http://localhost:8000");