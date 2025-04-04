// script.js: (CSS Background Version)
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

  // --- Canvas Background Code REMOVED ---

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

    // Check if the placeholder "yerp" exists and remove it
    const placeholder = commentsList.querySelector("p > i");
    if (placeholder && placeholder.textContent === "yerp") {
      commentsList.innerHTML = ""; // Clear the placeholder
    }

    // Add to the top of the list (newest first - guestbook style)
    commentsList.prepend(commentDiv);
  }

  // Function to fetch and display all comments
  async function loadComments() {
    if (!commentsList) return;
    console.log("Loading comments...");
    commentsList.innerHTML = "<p><i>Loading...</i></p>"; // Explicit loading message
    try {
      const pageId = window.location.pathname; // Get the current page's URL path
      const response = await fetch(
        `/comments?pageId=${encodeURIComponent(pageId)}`
      ); // Fetch comments for the current page
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
        commentsList.innerHTML = "<p><i>yerp</i></p>"; // Your placeholder
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
      const pageId = window.location.pathname; // Get the current page's URL path

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
            body: JSON.stringify({
              name: name,
              comment: commentText,
              pageId: pageId,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text(); // Get error details from server
            throw new Error(
              `HTTP error! status: ${response.status} - ${errorText}`
            );
          }

          // Add the new comment directly using the function which handles placeholder removal
          const newComment = await response.json();
          addCommentToDOM(newComment);

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

  /* Commented out custom cursor - to be reimplemented later
  const cursor = document.querySelector(".custom-cat-cursor");
  if (cursor) {
    document.body.style.cursor = "none";
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX - 16 + "px";
      cursor.style.top = e.clientY - 16 + "px";
    });
  }
  */

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
  loadComments(); // Load existing comments when the page loads
  // highlightNav(); // Initial nav highlighting (Disabled)
  // No need to initialize canvas background anymore
}); // End DOMContentLoaded
