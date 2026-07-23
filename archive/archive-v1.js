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

let datas, ass, loo;

let ele_tiger = document.querySelector(".tiger");

// end of vars

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
    datas = data.slice(0, 100);
    ass = assets.slice(0, 100);
    loo = createLookup(ass);
    lookup = createLookup(assets);
    console.log("Sheet 1:", datas);
    console.log("Sheet 2:", ass);
    console.log("Sheet 3:", loo);
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
  }
  processData();
}

function processData() {
  datas.forEach((row, index) => {
    generateBlock(row);
  });
}

//look up for finding the assets
function createLookup(sheet2Data) {
  return Object.fromEntries(sheet2Data.map((row) => [row.a, row]));
}
// get thumbnail
function getThumbnail(row) {
  if (row.t == null) return null;
  let t = parseToObjects(row.t);
  let link = lookup[t[0].value];
  // console.log(link.b);
  return { src: link.d ? link.d : null, alt_text: link.f };
}
// function parseAssets()
// {
//   const parts = text.split("\n")
//   parts.forEach((line)=>{

//   });
// }
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

function generateBlock(row) {
  console.log("do we get here");
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
  //div mother
  divmother.appendChild(div1);
  divmother.appendChild(div2);
  divmother.appendChild(div3);
  //dd
  divmother.className = "archivecard__container";

  ele_tiger.appendChild(divmother);
}

logSheetData();
