// main.ts
import { serve } from "https://deno.land/std@0.180.0/http/server.ts"; // Use a specific version
import { serveDir } from "https://deno.land/std@0.180.0/http/file_server.ts"; // For serving static files easily

const COMMENTS_FILE = "./comments.json";

interface Comment {
  id: number; // Use timestamp as a simple unique ID
  name: string;
  comment: string;
  timestamp: string;
}

// --- Helper Function to Read Comments ---
async function readComments(): Promise<Comment[]> {
  try {
    const rawData = await Deno.readTextFile(COMMENTS_FILE);
    return JSON.parse(rawData) as Comment[];
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // File doesn't exist, return empty array
      return [];
    } else {
      // Other error (e.g., invalid JSON)
      console.error("Error reading comments file:", error);
      return []; // Return empty on error to avoid crashing
    }
  }
}

// --- Helper Function to Write Comments ---
async function writeComments(comments: Comment[]): Promise<boolean> {
  try {
    const dataToWrite = JSON.stringify(comments, null, 2); // Pretty print JSON
    await Deno.writeTextFile(COMMENTS_FILE, dataToWrite);
    return true;
  } catch (error) {
    console.error("Error writing comments file:", error);
    return false;
  }
}

console.log("Server starting on http://localhost:8000 ...");

serve(async (request: Request) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  console.log(`Request: ${request.method} ${pathname}`); // Log requests

  // --- API Endpoints ---
  if (pathname === "/comments" && request.method === "GET") {
    const comments = await readComments();
    return new Response(JSON.stringify(comments), {
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow requests from frontend
      },
      status: 200,
    });
  }

  if (pathname === "/comments" && request.method === "POST") {
    try {
      const newCommentData = await request.json();

      // Basic validation
      if (!newCommentData.name || !newCommentData.comment) {
        return new Response("Missing name or comment", { status: 400 });
      }

      const comments = await readComments();
      const newComment: Comment = {
        id: Date.now(), // Simple unique ID
        name: String(newCommentData.name).trim(), // Basic sanitization/trimming
        comment: String(newCommentData.comment).trim(),
        timestamp: new Date().toISOString(),
      };

      comments.push(newComment);
      const success = await writeComments(comments);

      if (success) {
        return new Response(JSON.stringify(newComment), {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 201, // 201 Created
        });
      } else {
        return new Response("Failed to save comment", { status: 500 });
      }
    } catch (error) {
      console.error("Error processing POST /comments:", error);
      return new Response("Invalid request body or server error", {
        status: 400,
      });
    }
  }

  // --- OPTIONS request handler for CORS preflight ---
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      status: 204, // No Content
    });
  }

  // --- Serve Static Files ---
  // Use serveDir for simplicity, serving from the current directory (".")
  try {
    // Map root ("/") to index.html explicitly
    const response = await serveDir(request, {
      fsRoot: ".", // Serve files from the directory where main.ts is run
      urlRoot: "",
      showDirListing: false,
      quiet: true, // Don't log file serving success/errors here
    });

    // Add CORS header to static files too, just in case
    response.headers.set("Access-Control-Allow-Origin", "*");

    // Manually set MIME type for .js files if needed (serveDir sometimes gets it wrong)
    if (pathname.endsWith(".js")) {
      response.headers.set("Content-Type", "application/javascript");
    }
    if (pathname.endsWith(".css")) {
      response.headers.set("Content-Type", "text/css");
    }
    if (pathname === "/" || pathname.endsWith(".html")) {
      response.headers.set("Content-Type", "text/html");
    }
    if (pathname.endsWith(".png")) {
      response.headers.set("Content-Type", "image/png");
    }

    return response;
  } catch (e) {
    // If serveDir throws an error (e.g., file not found), return 404
    if (e instanceof Deno.errors.NotFound) {
      console.warn(`Static file not found: ${pathname}`);
      return new Response("Not Found", { status: 404 });
    }
    console.error(`Error serving static file ${pathname}:`, e);
    return new Response("Internal Server Error", { status: 500 });
  }
});
