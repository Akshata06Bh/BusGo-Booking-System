/* ============================================================
   BUSGO - script.js
   Simple beginner-friendly JavaScript for the BusGo home page.
   No backend, no database. All data below is DUMMY / STATIC data.
   ============================================================ */

/* ---------- DUMMY OFFERS DATA ---------- */
/* "category" is used by the offer tab filter buttons */
const offerData = [
  { category: "first", title: "First Booking Offer", desc: "Get 20% OFF on your first booking.", code: "FIRST20", validTill: "30 Sep" },
  { category: "weekend", title: "Weekend Discount", desc: "Flat ₹100 OFF on weekend travel.", code: "WEEKEND100", validTill: "30 Sep" },
  { category: "student", title: "Student Discount", desc: "Extra 10% OFF for students.", code: "STUDY10", validTill: "31 Oct" },
  { category: "festival", title: "Festival Offer", desc: "Get ₹150 cashback this festive season.", code: "FEST150", validTill: "15 Nov" },
  { category: "weekend", title: "Weekend Getaway", desc: "Save up to ₹200 on weekend routes.", code: "GETAWAY200", validTill: "30 Sep" },
  { category: "student", title: "Campus Special", desc: "Extra cashback for student ID holders.", code: "CAMPUS50", validTill: "31 Oct" }
];

/* ---------- SAVED SEARCH DATA (Assignment 1) ---------- */
/* Array of journey objects; stored persistently as JSON in localStorage. */
let savedSearches = [];

/* ---------- DUMMY BUS OPERATOR DATA ---------- */
const operatorData = [
  { name: "Shree Travels", initials: "ST", rating: 4.2, desc: "1200+ services including Sleeper and Semi Sleeper buses." },
  { name: "City Link Travels", initials: "CL", rating: 3.9, desc: "800+ services connecting major cities every day." },
  { name: "National Express", initials: "NE", rating: 4.4, desc: "Premium AC coaches with onboard charging points." },
  { name: "Comfort Cruiser", initials: "CC", rating: 4.6, desc: "Highly rated sleeper buses for overnight journeys." },
  { name: "Speedway Travels", initials: "SW", rating: 3.7, desc: "Budget-friendly seater buses on popular routes." },
  { name: "Royal Coach Lines", initials: "RC", rating: 4.1, desc: "Comfortable semi-sleeper coaches with top ratings." }
];

/* ============================================================
   NAVIGATION HELPERS
   This trimmed version only has the home page, so this simply
   scrolls back to the top (kept so the logo's onclick still works).
   ============================================================ */
function showSection(sectionId) {
  window.scrollTo(0, 0);
}

/* Scrolls down to the offers section on the home page (used by navbar link) */
function scrollToOffers() {
  const offersEl = document.getElementById("offersSection");
  if (offersEl) {
    offersEl.scrollIntoView({ behavior: "smooth" });
  }
}

/* ============================================================
   SWAP FROM / TO BUTTON
   ============================================================ */
function swapLocations() {
  const fromInput = document.getElementById("fromCity");
  const toInput = document.getElementById("toCity");

  const temp = fromInput.value;
  fromInput.value = toInput.value;
  toInput.value = temp;
}

/* Used by "Popular Routes" cards to quickly fill the search form */
function quickSearch(from, to) {
  document.getElementById("fromCity").value = from;
  document.getElementById("toCity").value = to;

  // Set date to today if empty
  const dateInput = document.getElementById("journeyDate");
  if (!dateInput.value) {
    dateInput.value = getLocalDateString(new Date());
  }

  searchBuses();
}

/* ============================================================
   SEARCH BUSES
   (Demo only - this trimmed version has no results page.)
   ============================================================ */
async function searchBuses() {
  const from = document.getElementById("fromCity").value.trim();
  const to = document.getElementById("toCity").value.trim();
  const date = document.getElementById("journeyDate").value;
  const ladiesPriority = document.getElementById("ladiesToggle").checked;

  const message = document.getElementById("searchMessage");
  message.textContent = "";
  message.className = "search-message";

  // Basic client-side validation
  if (from === "" || to === "" || date === "") {
    showSearchMessage("Please fill in all journey details.", "error");
    return;
  }

  try {
    // Send journey details to the Node.js server
    const response = await fetch("/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source: from,
        destination: to,
        travelDate: date
      })
    });

    const result = await response.json();

    // Display the error returned by the server
    if (!response.ok) {
      showSearchMessage(result.message, "error");
      return;
    }

    // Save the journey only after server-side validation succeeds
    const journey = {
      from: result.journey.source,
      to: result.journey.destination,
      date: result.journey.travelDate,
      ladiesPriority: ladiesPriority,
      searchedAt: new Date().toLocaleString()
    };

    savedSearches.push(journey);

    try {
      localStorage.setItem(
        "busgoSavedSearches",
        JSON.stringify(savedSearches)
      );
    } catch (error) {
      savedSearches.pop();
      showSearchMessage(
        "Server validation succeeded, but the search could not be saved in your browser.",
        "error"
      );
      return;
    }

    renderSavedSearches();

    showSearchMessage(
      "Server validation successful! Journey: " +
      from + " to " + to + " on " + date + ".",
      "success"
    );

  } catch (error) {
    showSearchMessage(
      "Unable to connect to the server. Please make sure the Node.js server is running.",
      "error"
    );
  }
}
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function showSearchMessage(text, type) {
  const message = document.getElementById("searchMessage");
  message.textContent = text;
  message.className = "search-message " + type;
}

function loadSavedSearches() {
  try {
    const savedJSON = localStorage.getItem("busgoSavedSearches");
    const parsedData = savedJSON ? JSON.parse(savedJSON) : [];
    savedSearches = Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    savedSearches = [];
  }
}

function renderSavedSearches() {
  const list = document.getElementById("savedSearchesList");
  if (!list) return;
  list.innerHTML = "";

  if (savedSearches.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-searches";
    emptyMessage.textContent = "No searches saved yet.";
    list.appendChild(emptyMessage);
    return;
  }

  savedSearches.slice(-5).reverse().forEach(function (journey) {
    const item = document.createElement("div");
    item.className = "saved-search-item";

    const route = document.createElement("strong");
    route.textContent = journey.from + " → " + journey.to;

    const date = document.createElement("span");
    date.textContent = "Journey date: " + journey.date;

    const searchedAt = document.createElement("small");
    searchedAt.textContent = "Saved: " + journey.searchedAt;

    item.appendChild(route);
    item.appendChild(date);
    item.appendChild(searchedAt);
    list.appendChild(item);
  });
}

function clearSavedSearches() {
  if (!window.confirm("Are you sure you want to clear saved search history?")) return;
  savedSearches = [];
  localStorage.removeItem("busgoSavedSearches");
  renderSavedSearches();
  showSearchMessage("Saved search history has been cleared.", "success");
}

/* ============================================================
   LOGIN MODAL
   ============================================================ */
function openLoginModal() {
  // Close the account panel first (if it's open) so only one popup shows
  closeAccountPanel();
  document.getElementById("loginModal").classList.add("active");
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.remove("active");
}

/* Called when the user clicks the Login/Continue button inside the modal.
   No real authentication happens here - it's just a demo. */
function loginModal() {
  alert("This is a demo login. No real account has been created or checked.");
  closeLoginModal();
}

/* ============================================================
   ACCOUNT SLIDE PANEL (opens from the right, like a real site)
   ============================================================ */
function openAccountPanel() {
  document.getElementById("accountPanel").classList.add("active");
  document.getElementById("accountOverlay").classList.add("active");
}

function closeAccountPanel() {
  document.getElementById("accountPanel").classList.remove("active");
  document.getElementById("accountOverlay").classList.remove("active");
}

/* ============================================================
   QUICK DATE BUTTONS (Today / Tomorrow)
   daysToAdd = 0 for today, 1 for tomorrow
   ============================================================ */
function setQuickDate(daysToAdd) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  document.getElementById("journeyDate").value = date.toISOString().split("T")[0];
}

/* ============================================================
   RENDER OFFER CARDS
   Builds the offer cards from offerData and shows only the
   ones matching the selected tab category ("all" shows every offer).
   ============================================================ */
function renderOffers(filterCategory) {
  const offerGrid = document.getElementById("offerGrid");
  offerGrid.innerHTML = ""; // clear old cards

  offerData.forEach(function (offer) {
    // Skip this offer if a specific tab is selected and it doesn't match
    if (filterCategory !== "all" && offer.category !== filterCategory) {
      return;
    }

    const card = document.createElement("div");
    card.className = "offer-card";
    card.innerHTML = `
      <div>
        <h3>${offer.title}</h3>
        <p>${offer.desc}</p>
        <div class="valid-till">Valid till ${offer.validTill}</div>
      </div>
      <div class="promo-code">${offer.code}</div>
    `;
    offerGrid.appendChild(card);
  });
}

/* Called when the user clicks one of the offer filter tabs */
function filterOffers(category, buttonEl) {
  // Remove "active" class from all tab buttons, then add it to the clicked one
  const allTabs = document.querySelectorAll(".tab-btn");
  allTabs.forEach(function (tab) {
    tab.classList.remove("active");
  });
  buttonEl.classList.add("active");

  renderOffers(category);
}

/* ============================================================
   RENDER BUS OPERATOR CARDS
   ============================================================ */
function renderOperators() {
  const operatorGrid = document.getElementById("operatorGrid");
  operatorGrid.innerHTML = ""; // clear old cards

  operatorData.forEach(function (op) {
    const card = document.createElement("div");
    card.className = "operator-card";
    card.innerHTML = `
      <div class="operator-card-top">
        <div class="operator-avatar">${op.initials}</div>
        <div>
          <div class="operator-name-row">
            <strong>${op.name}</strong>
            <span class="operator-rating-badge">&#9733; ${op.rating}</span>
          </div>
        </div>
      </div>
      <div class="operator-desc">${op.desc}</div>
      <div class="operator-footer-strip">Trusted BusGo demo operator</div>
    `;
    operatorGrid.appendChild(card);
  });
}

/* ============================================================
   PAGE LOAD SETUP
   ============================================================ */
window.onload = function () {
  // Set the date input's minimum value to today (can't book past dates)
  const dateInput = document.getElementById("journeyDate");
  const today = getLocalDateString(new Date());
  dateInput.min = today;
  dateInput.value = today;

  // Load saved JSON data, then build the page sections.
  loadSavedSearches();
  renderSavedSearches();
  renderOffers("all");
  renderOperators();
};
