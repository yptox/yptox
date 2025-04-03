document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio script loaded.");

  // --- Global Variables ---
  // Comment-related Elements
  const commentForm = document.getElementById("comment-form");
  const commentsList = document.getElementById("comments-list");
  const nameInput = document.getElementById("comment-name");
  const commentInput = document.getElementById("comment-text");
  const submitButton = commentForm
    ? commentForm.querySelector('button[type="submit"]')
    : null; // Get submit button

  // --- New Canvas Background ---
  const canvas = document.getElementById("shader-canvas");
  let ctx;
  let animationFrameId;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // No need to redraw immediately on resize, animation loop handles it
  }

  // Revised lightweight scrolling stripes pattern (Dark Purple/Blue, Seamless)
  function drawPattern(time) {
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    // Base background color
    ctx.fillStyle = "#101020"; // Very dark blue/purple base
    ctx.fillRect(0, 0, width, height);

    const stripeWidth = 120; // Width of each stripe
    const speed = 30; // Pixels per second scroll speed

    // Calculate scroll offset based on time, wrapping around the stripe width for seamlessness
    const scrollOffset = ((time * speed) / 1000) % stripeWidth;

    // Calculate the number of stripes needed to cover the screen plus one extra for overlap
    const numStripes = Math.ceil(width / stripeWidth) + 1;

    for (let i = 0; i < numStripes; i++) {
      // Calculate the starting x position for this stripe, adjusted by the scroll offset.
      // Start drawing from -scrollOffset to cover the left edge as stripes move left.
      const x = i * stripeWidth - scrollOffset;

      // Create a vertical gradient for each stripe
      const gradient = ctx.createLinearGradient(x, 0, x, height);

      // Define gradient colors: Fixed Dark Purples and Blues
      // Alternating pattern for simplicity
      const color1 =
        i % 2 === 0 ? "hsla(260, 50%, 20%, 0.7)" : "hsla(240, 50%, 25%, 0.7)"; // Dark Purple / Dark Blue
      const color2 =
        i % 2 === 0 ? "hsla(250, 55%, 30%, 0.8)" : "hsla(230, 55%, 35%, 0.8)"; // Slightly Lighter Purple / Blue

      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.5, color2);
      gradient.addColorStop(1, color1);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, 0, stripeWidth, height); // Draw the stripe
    }

    // Request the next frame
    animationFrameId = requestAnimationFrame(drawPattern);
  }

  function initCanvasBackground() {
    if (!canvas) {
      console.warn("Canvas element #shader-canvas not found for pattern.");
      return;
    }
    ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get 2D context for canvas.");
      canvas.style.display = "none"; // Hide canvas if context fails
      document.body.style.backgroundColor = "#1a001a"; // Fallback
      return;
    }

    resizeCanvas(); // Initial size
    window.addEventListener("resize", resizeCanvas);

    // Stop previous animation if any
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    // Start the animation
    animationFrameId = requestAnimationFrame(drawPattern);
    console.log("Initialized 2D canvas pattern background.");
  }
  // --- End New Canvas Background ---

  // Random Text Logic (Disabled)
  /*
  const randomTextTargets = document.querySelectorAll(".random-text-target");
  const randomWords = ["fish", "fishy", "yay"];
  let randomTextInterval;
  function updateRandomText() {
    randomTextTargets.forEach((target) => {
      const randomIndex = Math.floor(Math.random() * randomWords.length);
      target.textContent = randomWords[randomIndex];
    });
  }
  function startRandomText() {
    if (randomTextInterval) clearInterval(randomTextInterval);
    updateRandomText();
    randomTextInterval = setInterval(updateRandomText, 1500);
  }
  startRandomText();
  */

  // --- Comment System Logic ---

  // Function to add a single comment object to the DOM
  function addCommentToDOM(comment) {
    if (!commentsList || !comment || !comment.name || !comment.comment) return; // Basic check

    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");

    const nameStrong = document.createElement("strong");
    // Basic sanitization: Use textContent to prevent HTML injection
    nameStrong.textContent = comment.name + ":";

    const commentP = document.createElement("p");
    // Basic sanitization: Use textContent
    commentP.textContent = " " + comment.comment; // Add space after name

    // Optional: Add timestamp
    if (comment.timestamp) {
      const timeSpan = document.createElement("span");
      timeSpan.style.fontSize = "0.8em";
      timeSpan.style.color = "#666666"; // Adjusted color for retro theme
      timeSpan.style.marginLeft = "10px";
      timeSpan.textContent = `(${new Date(
        comment.timestamp
      ).toLocaleString()})`;
      // Append timestamp after the comment text for inline style
      commentP.appendChild(timeSpan);
    }

    commentDiv.appendChild(nameStrong);
    commentDiv.appendChild(commentP);

    // Add to the top of the list (newest first - guestbook style)
    commentsList.prepend(commentDiv);
    // Or add to the bottom (oldest first)
    // commentsList.appendChild(commentDiv);
  }

  // Function to fetch and display all comments
  async function loadComments() {
    if (!commentsList) return;
    console.log("Loading comments...");
    // Keep the "Loading..." message initially present in HTML
    try {
      const response = await fetch("/comments"); // Fetch from Deno backend
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const comments = await response.json();

      // Clear the "Loading..." message or previous comments
      commentsList.innerHTML = "";

      if (Array.isArray(comments) && comments.length > 0) {
        // Sort comments by timestamp, newest first (more guestbook-like)
        comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        comments.forEach(addCommentToDOM); // Add each comment to the list
        console.log(`Loaded ${comments.length} comments.`);
      } else if (Array.isArray(comments) && comments.length === 0) {
        // Handle case where comments array is empty
        commentsList.innerHTML = "<p><i>yerp</i></p>";
        console.log("No comments found.");
      } else {
        // Handle unexpected non-array response
        console.warn("Received non-array response for comments:", comments);
        commentsList.innerHTML =
          "<p style='color: red;'>Could not display comments.</p>"; // Use red for error
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
      // Clear loading message and show error
      commentsList.innerHTML =
        "<p style='color: red;'>Failed to load comments.</p>";
    }
  }

  // Handle comment form submission
  if (commentForm && nameInput && commentInput && submitButton) {
    commentForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent default page reload

      const name = nameInput.value.trim();
      const commentText = commentInput.value.trim();

      if (name && commentText) {
        const originalButtonText = submitButton.textContent; // Store original text
        // Disable button while submitting
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {
          const response = await fetch("/comments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: name, comment: commentText }),
          });

          if (!response.ok) {
            const errorText = await response.text(); // Get error details from server
            throw new Error(
              `HTTP error! status: ${response.status} - ${errorText}`
            );
          }

          // Option 1: Add the new comment directly for instant feedback (using prepend)
          const newComment = await response.json();
          addCommentToDOM(newComment);
          // Remove the "Be the first..." message if it exists
          const firstMessage = commentsList.querySelector("p > i");
          if (
            firstMessage &&
            firstMessage.textContent === "Be the first to sign the guestbook!"
          ) {
            firstMessage.parentElement.remove();
          }

          // Option 2: Reload all comments to ensure consistency (alternative)
          // await loadComments();

          // Clear the form
          nameInput.value = "";
          commentInput.value = "";
        } catch (error) {
          console.error("Failed to submit comment:", error);
          alert(`Failed to submit comment: ${error.message}`); // Show error to user
        } finally {
          // Re-enable button
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText; // Restore original text
        }
      }
    });
  } else {
    console.warn("Comment form elements not found.");
  }

  // Intersection Observer for Section Fade-in (Disabled)
  /*
  const sections = document.querySelectorAll("section");
  const sectionObserverOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };
  const sectionObserverCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  };
  const sectionObserver = new IntersectionObserver(
    sectionObserverCallback,
    sectionObserverOptions
  );
  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
  */

  // Custom Cursor Logic (Keep this!)
  const catCursor = document.querySelector(".custom-cat-cursor");
  if (catCursor) {
    window.addEventListener("mousemove", (e) => {
      const posX = e.clientX;
      const posY = e.clientY;
      catCursor.style.left = `${posX}px`;
      catCursor.style.top = `${posY}px`;
    });
  } else {
    console.warn("Custom cat cursor element (.custom-cat-cursor) not found.");
  }

  // Smooth Scrolling & Active Nav Link (Disabled)
  /*
  const navLinks = document.querySelectorAll("header nav a");
  const header = document.querySelector("header");
  let headerHeight = header ? header.offsetHeight : 0;
  window.addEventListener("resize", () => {
    headerHeight = header ? header.offsetHeight : 0;
  });
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // Keep this to prevent default anchor jump if needed
      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Basic jump scrolling (no smooth)
        // Calculate position considering header if it's sticky/fixed
        // const targetPosition = targetElement.offsetTop - headerHeight;
        // window.scrollTo(0, targetPosition);

        // Or simpler jump:
         targetElement.scrollIntoView(); // Might not account for fixed header well
      }
    });
  });
  const highlightNav = () => {
    let currentSectionId = "";
    headerHeight = header ? header.offsetHeight : 0; // Recalculate on scroll
    const sections = document.querySelectorAll("section"); // Need sections here if using
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - headerHeight - 50; // Adjust offset as needed
      if (window.pageYOffset >= sectionTop) {
        currentSectionId = "#" + section.getAttribute("id");
      }
    });
    // Handle edge case for the top of the page before the first section
    if (
      sections.length > 0 &&
      window.pageYOffset < sections[0].offsetTop - headerHeight - 50
    ) {
      currentSectionId = "#hero"; // Default to hero if above the first section
    }

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === currentSectionId) {
        link.classList.add("active");
      }
    });
  };
  window.addEventListener("scroll", highlightNav);
  */

  // --- Initializations ---
  initCanvasBackground(); // Initialize the new canvas background
  loadComments(); // Load existing comments when the page loads
  // highlightNav(); // Initial nav highlighting (Disabled)
}); // End DOMContentLoaded
