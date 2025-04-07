// script.js: Cleaned up for Cusdis integration
document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio script loaded.");

  // --- Global Variables ---
  // REMOVED comment-related variables (commentForm, commentsList, etc.)

  // --- Canvas Background Code REMOVED --- // Keep removed

  // Random Text Logic (Disabled) // Keep disabled or remove if not needed
  /*
  const randomTextTargets = document.querySelectorAll(".random-text-target");
  const randomWords = ["fish", "fishy", "yay"];
  let randomTextInterval;
  // ... (rest of random text functions)
  startRandomText();
  */

  // --- Comment System Logic ---
  // REMOVED addCommentToDOM function
  // REMOVED loadComments function
  // REMOVED commentForm event listener

  // Intersection Observer for Section Fade-in (Disabled) // Keep disabled or remove
  /*
  const sections = document.querySelectorAll("section");
  // ... (rest of observer code)
  */

  // Custom Cursor (Commented out) // Keep commented out or uncomment if used
  /*
  const cursor = document.querySelector(".custom-cat-cursor");
  if (cursor) {
    document.body.style.cursor = "none";
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX - 16 + "px";
      cursor.style.top = e.clientY - 16 + "px";
    });
  }
  */

  // Smooth Scrolling & Active Nav Link (Disabled) // Keep disabled or remove
  /*
  const navLinks = document.querySelectorAll("header nav a");
  // ... (rest of scrolling/nav code)
  */

  // --- Initializations ---
  // REMOVED loadComments() call
  // highlightNav(); // Keep disabled or remove
}); // End DOMContentLoaded
