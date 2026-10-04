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
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// init
// ————————————————————————————————————————————————————————————
// ,,————————————————————————————————————————————————————————————
if (!data)
logSheetData();
else

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
    // initElemenets();
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
  }
  initFilters();
  console.log("Filteritems", filterItems);
  generateFilters();
  // create the card container?
  createBlocks();
  filterEvents();
  searchEvents();
  console.log("cardsContainer:", cardsContainer);
  console.log("filterCols", filterCols);
  console.log("searchCols", searchCols);
  console.log("Filteritems", filterItems);
}
/* -------------------------------------------
__
//,,-------------------------------------------*/
function initElements() {
  initFilters();
  generateFilters();
}
function createBlocks() {
  data.forEach((row, index) => {
    generateBlock(row);
  });
  //handle event of clicking on the card => nav to next page
  document.querySelectorAll(".archivecard__container").forEach((div) => {
    div.addEventListener("click", () => {
      const slug = div.dataset.slug;
      window.location.href = `/orbit-archivepage#${slug}`;
    });
  });
}
// fetch data for google sheet
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

/* -------------------------------------------
__ filters 
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
// generating the block for archive entry
function generateBlock(row) {
  const temp = getThumbnail(row);
  let imgSource = temp
    ? (temp.src ??
      "https://s3.amazonaws.com/arena_images-temp/uploads%2Fdb4c39ea-2fd3-42af-83bb-6ae6b820133a%2Fthumb-none.png")
    : "https://s3.amazonaws.com/arena_images-temp/uploads%2Fdb4c39ea-2fd3-42af-83bb-6ae6b820133a%2Fthumb-none.png";
  let tempBlock = createHTMLfragment(
    /* HTML */
    `<div class="archivecard__container" data-slug="${row.v}">
      <div class="thumbnail__container" src="${imgSource}"></div>
      <div class="infocard">
        <div class="infocard__title">${row.a}</div>
        <div class="infocard__tags">${row.n}</div>
      </div>
      <div class="infocard__des">${row.e}</div>
    </div>`,
  );
  let tempcard = {
    el: divmother,
    filters: {},
    searchs: {},
    visible: false,
  };
  filterCols.forEach((c) => {
    tempcard.filters[c.name] = row[c.col] ? String(row[c.col]) : "null";
  });
  searchCols.forEach((c) => {
    tempcard.searchs[c.name] = row[c.col] ? String(row[c.col]) : "null";
  });
  cardsContainer.push(tempcard);
  //append the element
  ele_tiger.appendChild(divmother);
}

/* -------------------------------------------
__ search
//,,-------------------------------------------*/
function searchEvents() {
  const searchInput = document.querySelector("#searchInput");
  const searchButton = document.querySelector("#searchButton");

  searchInput.addEventListener("input", () => {
    if (searchInput.value === "") {
      searchQuery = "";
      updateCards();
    }
  });

  searchButton.addEventListener("click", () => {
    searchQuery = searchInput.value.toLowerCase();
    updateCards();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchQuery = searchInput.value.toLowerCase();
      updateCards();
    }
  });
}
// searchquery
function matchesSearch(card, searchQuery) {
  if (!searchQuery) {
    return true;
  }
  console.log(card);
  return searchCols.some((column) => {
    console.log(column);
    console.log(card[column.name]);
    return card.searchs[column.name]
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
  });
}

// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// ''Filters click event
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
function filterEvents() {
  const filters = document.querySelectorAll(".filtermenu__item");
  const cards = document.querySelectorAll(".archivecard__container");
  filters.forEach((filter) => {
    filter.addEventListener("click", (e) => {
      restoreF();
      e.preventDefault();
      const filterCat = filter.dataset.value;
      const filterGroup = filter.dataset.group;
      // if already active
      if (selectedFilters[filterGroup].includes(filterCat)) {
        selectedFilters[filterGroup] = selectedFilters[filterGroup].filter(
          (item) => item !== filterCat,
        );
        filter.classList.remove("active");
      }
      // if not active
      else {
        selectedFilters[filterGroup].push(filterCat);
        filter.classList.add("active");
      }
      updateCards();
      updateFilterView();
      console.log("facccc:", facetedFilters);
    });
  });
  function updateFilterView() {
    cardsContainer.forEach((card) => {
      if (card.visible) {
        Object.entries(card.filters).forEach(([group, values]) => {
          values
            .split(",")
            .map((value) => value.trim())
            .forEach((value) => {
              if (
                !facetedFilters[group].includes(value) &&
                value !== "null" &&
                value != null
              ) {
                facetedFilters[group].push(value);
                console.log(value);
              }
            });
        });
      }
    });
    filters.forEach((filter) => {
      const filterCat = filter.dataset.value;
      if (!facetedFilters[filter.dataset.group].includes(filterCat)) {
        filter.classList.add("zero");
      } else {
        filter.classList.remove("zero");
      }
    });
  }
}
/* -------------------------------------------
__ updating cards and shit
//,,-------------------------------------------*/
function updateCards() {
  //entry counter to 0
  document.querySelector(".filter__count").innerHTML = 0;
  bing = Object.entries(selectedFilters);
  cardsContainer.forEach((card) => {
    const matches = Object.entries(selectedFilters).every(([group, values]) => {
      // no filters selected
      if (values.length === 0) return true;
      // if no filters
      return values.every((value) => card.filters[group].includes(value));
    });
    const matchesSea = matchesSearch(card, searchQuery);
    matches && matchesSea
      ? ((card.el.style.display = ""), (card.visible = true))
      : (card.el.style.display = "none");
    // card.el.style.display = matches ? "" : "none";
    matches && matchesSea
      ? document.querySelector(".filter__count").innerHTML++
      : null;
  });
}

// check card filters
function checkCardFilters(card) {
  const categories = card.dataset[bracktemp].split(",").map((c) => {
    return c.trim();
  });
}
// thing
function datasetParser(cardFilter) {
  return cardFilter.split(",").map((c) => c.trim());
}

function filterCheck(ar1, ar2) {
  return ar1.every((item) => ar2.includes(item));
}

// get thumbnail
function getThumbnail(row) {
  if (row[idRow] == null) return null;
  let t = parseToObjects(row[idRow]);
  let link = lookup[t[0].value];
  if (link == null) {
    console.log("No asset found for id: " + t[0].value);
    return { src: null, alt_text: null };
  } else {
    return { src: link.d ? link.d : null, alt_text: link.f };
  }
}

// partTobojects for the thing
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
function restoreF() {
  facetedFilters = {
    medium: [],
    programme: [],
    tags: [],
    year: [],
    language: [],
    country: [],
  };
}
/* -------------------------------------------
__ helpers
//,,-------------------------------------------*/
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
