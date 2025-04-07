import { serve } from "https://deno.land/std@0.192.0/http/server.ts"; // Use a recent std version
import { serveDir } from "https://deno.land/std@0.192.0/http/file_server.ts";

serve((req) => {
  // Serve files from the current directory ('.')
  // If your files are in a 'public' subfolder, change '.' to 'public'
  return serveDir(req, {
    fsRoot: ".",
    urlRoot: "",
    showDirListing: false, // Don't show directory contents
    enableCors: true, // Allow requests from other origins if needed
  });
});

console.log("Static file server listening on http://localhost:8000"); // Log for local testing
