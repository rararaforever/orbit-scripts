// const params = new URLSearchParams(window.location.search);
// const slug = params.get("slug");

let ele_tiger = document.querySelector(".tiger");

window.SPREADSHEET_ID = "1y3S825F2MRgSfZnA7Ip38b0ivhYdozC0p8KDSJZSEok" || {};
window.SHEET_TITLE = "ALL" || {};
window.SHEET_ASSETS = "Assets" || {};
window.URLD =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}` ||
  {};
window.URLA =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${SHEET_ASSETS}` ||
  {};

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
    lookupSlug = createSlugLookup(datas);

    console.log("Sheet 1:", datas);
    console.log("Sheet 2:", ass);
    console.log("Sheet 3:", loo);
    console.log("Sheet 3:", lookupSlug);
    const slug = window.location.hash.substring(1);
    console.log(slug);
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
  }
  generatePage();
}

function generatePage() {
  let row = lookupSlug[`${slug}`];
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

  ele_tiger.appendChild(divmother);
}
//sss
function getThumbnail(row) {
  if (row.u == null) return null;
  let t = parseToObjects(row.u);
  let link = lookup[t[0].value];
  // console.log(link.b);
  return { src: link.d ? link.d : null, alt_text: link.f };
}
