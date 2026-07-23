// let data;
window.data = window.data || {};
window.assets = window.assets || {};
window.lookup = window.lookup || {};
window.SPREADSHEET_ID = "1y3S825F2MRgSfZnA7Ip38b0ivhYdozC0p8KDSJZSEok" || {};
window.SHEET_TITLE = "ALL" || {};
window.SHEET_ASSETS = "Assets" || {};
window.URLD =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}` ||
  {};
window.URLA =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${SHEET_ASSETS}` ||
  {};
window.popups = document.querySelectorAll(".popup") || {};

let ele_tiger = document.querySelector(".tiger");

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

// async function fetchsheet(url)
async function logSheetData() {
  try {
    [data, assets] = await Promise.all([fetchSheet(URLD), fetchSheet(URLA)]);
    lookup = createLookup(assets);
    console.log("Sheet 1:", data);
    console.log("Sheet 2:", assets);
    console.log("Sheet 3:", lookup);
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
  }
}

function processData() {
  data.forEach((row, index) => {
    let thumbURL;
    if (
      row.m == "PDF" ||
      row.m == "PDFs" ||
      row.m == "JPEG" ||
      row.m == "JPEGs"
    ) {
    }
  });
}

//look up for finding the assets
function createLookup(sheet2Data) {
  return Object.fromEntries(sheet2Data.map((row) => [row.a, row]));
}
// get thumbnail
function getThumbnail(row) {
  let link = lookup[parseToObjects(row.t)[0]];
  return { src: link.d, alt_text: link.f };
}
// parser for text
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

logSheetData();
