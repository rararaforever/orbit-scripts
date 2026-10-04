// import {} from "./";
/* -------------------------------------------
to do:
[] add open and expand for the filters
[] set offest hieight of filters to top margin of cards

//,.-------------------------------------------*/

// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
//  all the vars
// ————————————————————————————————————————————————————————————
// ,,————————————————————————————————————————————————————————————
window.noImageThumbnail =
  "https://s3.amazonaws.com/arena_images-temp/uploads%2Fdb4c39ea-2fd3-42af-83bb-6ae6b820133a%2Fthumb-none.png" ||
  {};
window.data = window.data || {};
window.assets = window.assets || {};
window.lookup = window.lookup || {};
// window.SPREADSHEET_ID = "1y3S825F2MRgSfZnA7Ip38b0ivhYdozC0p8KDSJZSEok" || {};
window.SPREADSHEET_ID = "1dqC7mhxzCJ5J8cfv4TS_ihnBU-he_c3Z9z82AGH4y88" || {};
window.SHEET_TITLE = "ALL" || {};
window.SHEET_ASSETS = "Assets" || {};
window.URLD =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}` ||
  {};
window.URLA =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${SHEET_ASSETS}` ||
  {};
window.popups = document.querySelectorAll(".popup") || {};
window.ele_tiger = document.querySelector(".tiger") || {};

window.filterItems = window.filterItems || {};
window.filterM = window.filterM || {};
window.filterP = window.filterP || {};
window.filterT = window.filterT || {};
window.selectedCategories = window.selectedCategories || {
  filterM: [],
  filterP: [],
  filterT: [],
};
window.cardsHolder = window.cardsHolder || [];
window.cardsContainer = window.cardsContainer || [];
// rows and stuff
window.filterCols = window.filterCols || [
  { col: "i", name: "medium" },
  { col: "j", name: "programme" },
  { col: "p", name: "tags" },
  { col: "n", name: "year" },
  { col: "l", name: "language" },
  { col: "k", name: "country" },
];
window.searchCols = window.searchCols || [
  { col: "a", name: "title" },
  { col: "b", name: "credits" },
  { col: "e", name: "desc" },
  { col: "o", name: "names relevant" },
  { col: "i", name: "medium" },
  { col: "j", name: "programme" },
  { col: "k", name: "country" },
  { col: "l", name: "language" },
  { col: "n", name: "year" },
  { col: "p", name: "tags" },
];
window.cardCols = window.cardCols || [
  { col: "a", name: "title" },
  { col: "b", name: "credits" },
  { col: "e", name: "desc" },
  { col: "o", name: "names relevant" },
  { col: "i", name: "medium" },
  { col: "j", name: "programme" },
  { col: "k", name: "country" },
  { col: "l", name: "language" },
  { col: "n", name: "year" },
  { col: "p", name: "tags" },
];
let idRow = "u";
let slugRow = "v";
// rows to show on the cards
let selectedFilters = {
  medium: [],
  programme: [],
  tags: [],
  year: [],
  language: [],
  country: [],
};
let facetedFilters = {
  medium: [],
  programme: [],
  tags: [],
  year: [],
  language: [],
  country: [],
};
let searchQuery = "";
let projectPerPage = 50;
// const archive = {
//  entries : [],
//  currentPage:1,
//  perPage: 50,
//  searchQuery: '',
//  filters: selectedFilters,

// }

// ============================================================
// ARCHIVE
// Filter → Search → Pagination → Render
// ============================================================

const archive = {
  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  projects: [],
  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------
  currentPage: 1,
  perPage: 50,
  search: "",
  filters: selectedFilters,

  // ----------------------------------------------------------
  // DOM
  // ----------------------------------------------------------
  container: document.querySelector(".tiger"),
  pagination: document.querySelector(".pagination"),
};
/* -------------------------------------------
__ start
//,,-------------------------------------------*/
if (!data.length) logSheetData();
// else

// async function fetchsheet(url)
async function logSheetData() {
  try {
    // fetch data for URL for data and assets
    [data, assets] = await Promise.all([fetchSheet(URLD), fetchSheet(URLA)]);
    lookup = createLookup(assets);
    lookupSlug = createSlugLookup(data);
    console.log("Sheet 1:", data);
    console.log("Sheet 2:", assets);
    console.log("Sheet 3:", lookup);
    initArchive(data);
    // initElemenets();
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
  }
  // initFilters();
  // console.log("Filteritems", filterItems);
  // generateFilters();
  // // create the card container?
  // createBlocks();
  // filterEvents();
  // searchEvents();
  console.log("cardsContainer:", cardsContainer);
  console.log("filterCols", filterCols);
  console.log("searchCols", searchCols);
  console.log("Filteritems", filterItems);
}

function initArchive() {
  //make the projects!
  //filter
  initFilters();
  archive.searchInput = document.querySelector("#searchInput");
  archive.projects = prepProjects();
  setupEvents();
  renderArchive();
}

function prepProjects() {
  return data.map((row) => {
    let tempcard = {
      filters: {},
      searchs: {},
      cardEls: {},
      visible: false,
    };
    filterCols.forEach((c) => {
      tempcard.filters[c.name] = row[c.col] ? String(row[c.col]) : "null";
    });
    searchCols.forEach((c) => {
      tempcard.searchs[c.name] = row[c.col] ? String(row[c.col]) : "null";
    });
    cardCols.forEach((c) => {
      tempcard.cardEls[c.name] = row[c.col] ? String(row[c.col]) : "null";
    });
    tempcard.thumbnail = getThumbnail(row).src;
    tempcard.slug = row.v;
    tempcard.title = row.a;
    return tempcard;
  });
}
function getThumbnail(row) {
  if (row[idRow] == null)
    return {
      src: noImageThumbnail,
      alt_text: null,
    };
  let t = parseToObjects(row[idRow]);
  let link = lookup[t[0].value];
  if (link == null) {
    console.log("No asset found for id: " + t[0].value);
    return {
      src: noImageThumbnail,
      alt_text: null,
    };
  } else {
    return { src: link.d ? link.d : null, alt_text: link.f };
  }
}

// ============================================================
// MAIN RENDER
// ============================================================

function renderArchive() {
  // ----------------------------------------------------------
  // 1. FILTER
  // ----------------------------------------------------------

  const filteredProjects = getFilteredProjects();

  // ----------------------------------------------------------
  // 2. CALCULATE PAGINATION
  // ----------------------------------------------------------

  const totalPages = Math.ceil(filteredProjects.length / archive.perPage);

  // If filtering causes the current page to no longer exist,
  // move back to the last valid page.

  if (totalPages === 0) {
    archive.currentPage = 1;
  } else if (archive.currentPage > totalPages) {
    archive.currentPage = totalPages;
  }

  // ----------------------------------------------------------
  // 3. GET CURRENT PAGE
  // ----------------------------------------------------------

  const pageProjects = getCurrentPage(filteredProjects);

  // ----------------------------------------------------------
  // 4. RENDER CARDS
  // ----------------------------------------------------------

  renderCards(pageProjects);

  // ----------------------------------------------------------
  // 5. RENDER PAGINATION
  // ----------------------------------------------------------

  renderPagination(totalPages);
}

// ============================================================
// FILTER
// ============================================================

function getFilteredProjects() {
  return archive.projects.filter((project) => {
    const bull = matchesFilters(project) && matchesSearch(project);
    // add the faceted filter stuff
    return bull;
  });
}

// ============================================================
// FILTER MATCHING
// ============================================================

function matchesFilters(project) {
  return Object.entries(archive.filters).every(([group, values]) => {
    // no filters selected
    if (values.length === 0) return true;
    // if no filters
    return values.every((value) => project.filters[group].includes(value));
  });
  for (const [group, selectedValues] of Object.entries(archive.filters)) {
    // No active filters in this group
    if (!selectedValues || selectedValues.size === 0) {
      continue;
    }

    const projectValue = project[group];

    // --------------------------------------------------------
    // Project has no value for this filter group
    // --------------------------------------------------------

    if (projectValue === undefined || projectValue === null) {
      return false;
    }

    // --------------------------------------------------------
    // Normalize project values
    // --------------------------------------------------------

    let projectValues;

    if (Array.isArray(projectValue)) {
      projectValues = projectValue;
    } else {
      projectValues = String(projectValue)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }

    // --------------------------------------------------------
    // OR within a filter group
    //
    // Example:
    //
    // medium:
    // ["film", "short"]
    //
    // Project passes if it has film OR short.
    // --------------------------------------------------------

    const matchesGroup = projectValues.some((value) =>
      selectedValues.has(value),
    );

    if (!matchesGroup) {
      return false;
    }
  }

  // Passed every filter group
  return true;
}

// ============================================================
// SEARCH
// ============================================================

function matchesSearch(project) {
  if (!archive.search) {
    return true;
  }
  return searchCols.some((column) => {
    return project.searchs[column.name]
      ?.toLowerCase()
      .includes(archive.search.toLowerCase());
  });
  const query = archive.search.trim().toLowerCase();

  // Empty search
  if (!query) {
    return true;
  }

  // ----------------------------------------------------------
  // Search only the fields you actually want searchable.
  //
  // You can change these to your actual project fields.
  // ----------------------------------------------------------

  const searchableText = [
    project.title,
    project.description,
    project.mediums,
    project.year,
    project.tags,
  ]
    .flat()
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // ----------------------------------------------------------
  // Quoted search = exact phrase
  //
  // "graphic design"
  // ----------------------------------------------------------

  if (query.startsWith('"') && query.endsWith('"')) {
    const exactPhrase = query.slice(1, -1);

    return searchableText.includes(exactPhrase);
  }

  // ----------------------------------------------------------
  // Normal search
  // ----------------------------------------------------------

  return searchableText.includes(query);
}

// ============================================================
// PAGINATION
// ============================================================

function getCurrentPage(projects) {
  const start = (archive.currentPage - 1) * archive.perPage;

  return projects.slice(start, start + archive.perPage);
}

// ============================================================
// RENDER CARDS
// ============================================================

function renderCards(projects) {
  // Remove the old page
  archive.container.replaceChildren();

  // Create everything off-DOM
  const fragment = document.createDocumentFragment();

  for (const project of projects) {
    const card = createCard(project);

    fragment.append(card);
  }

  // One DOM insertion
  archive.container.append(fragment);
}

// ============================================================
// CREATE CARD
// ============================================================

function createCard(project) {
  const card = document.createElement("article");

  card.className = "archivecard__container";

  // Store useful information on the element
  card.dataset.id = project.id;
  card.dataset.slug = project.slug;

  card.innerHTML = `
    <div class="archivecard__image">
      ${
        project.thumbnail
          ? `<img
              src="${project.thumbnail}"
              alt=""
              loading="lazy"
              decoding="async"
            >`
          : ""
      }
    </div>

    <div class="archivecard__title">
      ${project.title ?? ""}
    </div>

    <div class="archivecard__year">
      ${project.year ?? ""}
    </div>
  `;

  return card;
}

// ============================================================
// PAGINATION UI
// ============================================================

function renderPagination(totalPages) {
  archive.pagination.replaceChildren();

  // No pagination needed
  if (totalPages <= 1) {
    return;
  }

  const fragment = document.createDocumentFragment();

  // ----------------------------------------------------------
  // PREVIOUS
  // ----------------------------------------------------------

  const previous = document.createElement("button");

  previous.type = "button";
  previous.className = "pagination__previous";
  previous.dataset.pageAction = "previous";
  previous.textContent = "Previous";

  previous.disabled = archive.currentPage === 1;

  fragment.append(previous);

  // ----------------------------------------------------------
  // PAGE NUMBERS
  // ----------------------------------------------------------

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "pagination__page";

    button.dataset.page = page;

    button.textContent = page;

    if (page === archive.currentPage) {
      button.classList.add("active");
      button.setAttribute("aria-current", "page");
    }

    fragment.append(button);
  }

  // ----------------------------------------------------------
  // NEXT
  // ----------------------------------------------------------

  const next = document.createElement("button");

  next.type = "button";
  next.className = "pagination__next";
  next.dataset.pageAction = "next";
  next.textContent = "Next";

  next.disabled = archive.currentPage === totalPages;

  fragment.append(next);

  archive.pagination.append(fragment);
}

// ============================================================
// EVENTS
// ============================================================

function setupEvents() {
  // ----------------------------------------------------------
  // CARD CLICK
  //
  // ONE listener for all cards.
  // ----------------------------------------------------------

  archive.container.addEventListener("click", (event) => {
    const card = event.target.closest(".archivecard__container");

    if (!card) {
      return;
    }

    const slug = card.dataset.slug;

    if (!slug) {
      return;
    }

    window.location.href = `/orbit-archivepage#${slug}`;
  });

  // ----------------------------------------------------------
  // PAGINATION CLICK
  //
  // ONE listener for all pagination buttons.
  // ----------------------------------------------------------

  archive.pagination.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-page]");

    if (pageButton) {
      archive.currentPage = Number(pageButton.dataset.page);

      renderArchive();

      return;
    }

    const actionButton = event.target.closest("[data-page-action]");

    if (!actionButton) {
      return;
    }

    const action = actionButton.dataset.pageAction;

    if (action === "previous") {
      archive.currentPage--;
    } else if (action === "next") {
      archive.currentPage++;
    }

    renderArchive();
  });

  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

  if (archive.searchInput) {
    archive.searchInput.addEventListener("input", (event) => {
      archive.search = event.target.value;

      // Search results always start
      // from page 1.

      archive.currentPage = 1;

      renderArchive();
    });
  }
}

// ============================================================
// FILTER API
// ============================================================

function setFilter(group, value, active) {
  // Create the Set if it doesn't exist
  if (!archive.filters[group]) {
    archive.filters[group] = new Set();
  }

  const values = archive.filters[group];

  if (active) {
    values.add(value);
  } else {
    values.delete(value);
  }

  // ----------------------------------------------------------
  // Remove empty filter groups
  // ----------------------------------------------------------

  if (values.size === 0) {
    delete archive.filters[group];
  }

  // ----------------------------------------------------------
  // ALWAYS return to page 1 after filtering
  // ----------------------------------------------------------

  archive.currentPage = 1;

  renderArchive();
}

// ============================================================
// CLEAR ALL FILTERS
// ============================================================

function clearFilters() {
  archive.filters = {};

  archive.currentPage = 1;

  renderArchive();
}

// ============================================================
// CHANGE ITEMS PER PAGE
// ============================================================

function setPerPage(amount) {
  archive.perPage = amount;

  archive.currentPage = 1;

  renderArchive();
}

/* -------------------------------------------
__ filters init
//,,-------------------------------------------*/
function initFilters() {
  filterItems = [];
  filterCols.forEach((c) => {
    filterItems.push({
      group: c.name,
      id: `f-${c.col}`,
      data: getallfilters(c.col),
    });
  });
  generateFilters();
}
function getallfilters(row) {
  return [
    ...new Set(
      data.flatMap(
        (item) =>
          String(item[row])
            ?.split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "null") || [],
      ),
    ),
  ].sort();
}
function generateFilters() {
  //generate the filters
  let allFilters = filterItems
    .map((f, index) => {
      const itemsHTML = f.data
        .map(
          (item) =>
            /* HTML */ ` <div
              class="filtermenu__item ${f.id}"
              data-group="${f.group}"
              data-value="${item.trim()}"
            >
              ${item}
            </div>`,
        )
        .join("");
      const fly = /* HTML */ `
        <div class="filtermenu" id="${f.id}">
          <div class="filtermenu__title">${filterCols[index].name}</div>
          <div class="filtermenu__items">${itemsHTML}</div>
        </div>
      `;
      return fly;
    })
    .join("");
  // genereate the element
  const filterTemp = createHTMLfragment(/* HTML */ `
    <div class="filter__search">
      <input id="searchInput" type="text" />
      <button id="searchButton">Search</button>
    </div>
    <div class="filtermenu--container">${allFilters}</div>
    <div class="viewmenu--container">
      <div class="view__title">view toggles</div>
      <div class="viewbtn--container">
        <button class="view__btn">░</button>
        <button class="view__btn">▤</button>
        <button class="view__btn">fun1</button>
        <button class="view__btn">fun2</button>
      </div>
      <div class="viewoptions--container"></div>
    </div>
  `);
  document.querySelector(".filter--container").append(filterTemp);
}

/* -------------------------------------------
__ helpers
//,,-------------------------------------------*/

async function fetchSheet(url) {
  const response = await fetch(url);
  const text = await response.text();
  const jsonString = text.substring(
    text.indexOf("{"),
    text.lastIndexOf("}") + 1,
  );
  const json = JSON.parse(jsonString);
  return json.table.rows.map((row) => {
    const obj = {};
    for (let i = 0; i < row.c.length; i++) {
      obj[String.fromCharCode(97 + i)] = row.c[i] ? row.c[i].v : null;
    }
    return obj;
  });
}
//look up for finding the assets
function createLookup(sheet2Data) {
  return Object.fromEntries(sheet2Data.map((row) => [row.a, row]));
}
//create slug lookup
function createSlugLookup(sheetData) {
  return Object.fromEntries(sheetData.map((row) => [row.v, row]));
}
//html helpers
function createFromHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function createHTMLfragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content;
}
function parseToObjects(text) {
  const lines = text.split("\n"); // works even if no \n
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      if (line.includes(":")) {
        const [key, ...rest] = line.split(":");
        return { [key.trim()]: rest.join(":").trim() };
      }
      return { value: line };
    });
}
