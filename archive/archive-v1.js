// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// '' all the vars
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————

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

window.datas = window.datas || {};
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
const selectedFilters = {
  medium: [],
  programme: [],
  tags: [],
  year: [],
  language: [],
  country: [],
};
let searchQuery = "";

// fix this!

let datas, ass, loo;

// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// '' start
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————

logSheetData();

// async function fetchsheet(url)
async function logSheetData() {
  try {
    [data, assets] = await Promise.all([fetchSheet(URLD), fetchSheet(URLA)]);
    // datas = data.slice(0, 100);
    // ass = assets.slice(0, 100);
    datas = data;
    ass = assets;
    loo = createLookup(ass);
    lookup = createLookup(assets);
    lookupSlug = createSlugLookup(datas);

    console.log("Sheet 1:", datas);
    console.log("Sheet 2:", ass);
    console.log("Sheet 3:", loo);
    console.log("Sheet 3:", lookupSlug);
    sessionStorage.setItem("lookupslug", lookupSlug);
    sessionStorage.setItem("lookup", lookup);
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
  }
  createBlocks();
  createFilters();
  generateFilter();
  filterEvents();
  searchEvents();
  console.log("cardsContainer:", cardsContainer);
}

function createBlocks() {
  datas.forEach((row, index) => {
    generateBlock(row);
  });
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

//look up for finding the assets
function createLookup(sheet2Data) {
  return Object.fromEntries(sheet2Data.map((row) => [row.a, row]));
}
//create slug lookup
function createSlugLookup(sheetData) {
  return Object.fromEntries(sheetData.map((row) => [row.v, row]));
}

// create filters arrays
function createFilters() {
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
      datas.flatMap(
        (item) =>
          String(item[row])
            ?.split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "null") || [],
      ),
    ),
  ].sort();
}

function generateFilter() {
  const pounce = createFromHTML(`
    <div class="filter__search">
    <input id="searchInput" type="text">
    <button id="searchButton">Search</button> 
    </div>
    `);

  document.getElementById("filter__container").append(pounce);
  almost = createFromHTML(`<div class="filtermenu__container"><div>`);
  filterItems.forEach((f, index) => {
    const itemsHTML = f.data
      .map(
        (item) => `
    <div class="filtermenu__item ${f.id}" data-group="${f.group}" data-value="${item.trim()}">
    ${item}
  </div>`,
      )
      .join("");
    const fly = createFromHTML(` 
  <div class="filtermenu" id="${f.id}">
    <div class="filtermenu__title">
    ${filterCols[index].name} <div class="droptriangle">▼</div>
    </div>
    <div class="filtermenu__items">
    ${itemsHTML}
    </div>
  </div>
`);
    almost.append(fly);
  });
  document.getElementById("filter__container").append(almost);
}

// generating the block for archive entry
function generateBlock(row) {
  let divmother = document.createElement("div");
  let div1 = document.createElement("div");
  let div2 = document.createElement("div");
  let div21 = document.createElement("div");
  let div22 = document.createElement("div");
  let div3 = document.createElement("div");
  //image
  let img = document.createElement("img");
  const temp = getThumbnail(row);
  img.src = temp
    ? (temp.src ??
      "https://s3.amazonaws.com/arena_images-temp/uploads%2Fdb4c39ea-2fd3-42af-83bb-6ae6b820133a%2Fthumb-none.png")
    : "https://s3.amazonaws.com/arena_images-temp/uploads%2Fdb4c39ea-2fd3-42af-83bb-6ae6b820133a%2Fthumb-none.png";

  img.classList.add("thumbnail__img");
  div1.appendChild(img);
  div1.classList.add("thumbnail__container");
  // title and tags
  div21.innerHTML += row.a;
  div21.classList.add("infocard__title");
  let yeardiv = document.createElement("div");
  yeardiv.innerHTML = row.n;
  div22.classList.add("infocard__tags");
  div22.appendChild(yeardiv);
  div2.appendChild(div21);
  div2.appendChild(div22);
  div2.classList.add("infocard");
  //descriptin div
  div3.innerHTML = row.e;
  div3.className = "infocard__des";
  //div mother
  divmother.appendChild(div1);
  divmother.appendChild(div2);
  divmother.appendChild(div3);
  //dd
  divmother.className = "archivecard__container";
  divmother.dataset.slug = row.v;

  // make the cards container for filtering
  let tempcard = {
    el: divmother,
  };
  filterCols.forEach((c) => {
    tempcard[c.name] = row[c.col] ? String(row[c.col]) : "null";
  });
  searchCols.forEach((c) => {
    tempcard[c.name] = row[c.col] ? String(row[c.col]) : "null";
  });
  cardsContainer.push(tempcard);

  //append the element
  ele_tiger.appendChild(divmother);
}
//function to generate from html
function createFromHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// '' Search
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————

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
    return card[column.name]?.toLowerCase().includes(searchQuery.toLowerCase());
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
    });
  });
}

// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// ''updating cards
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
function updateCards() {
  //entry counter to 0
  document.querySelector(".filter__count").innerHTML = 0;
  bing = Object.entries(selectedFilters);
  cardsContainer.forEach((card) => {
    const matches = Object.entries(selectedFilters).every(([group, values]) => {
      // no filters selected
      if (values.length === 0) return true;

      // if no filters
      return values.every((value) => card[group].includes(value));
    });
    const matchesSea = matchesSearch(card, searchQuery);

    // card.el.style.display = matches ? "" : "none";
    card.el.style.display = matches && matchesSea ? "" : "none";
    // card.el.style.display = matches ? "" : "none";
    matches && matchesSea
      ? document.querySelector(".filter__count").innerHTML++
      : null;
  });
}
// search

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
  console.log(t);
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
