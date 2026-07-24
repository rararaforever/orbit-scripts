// const params = new URLSearchParams(window.location.search);
// const slug = params.get("slug");
const slug = window.location.hash.substring(1);

console.log(slug);

const lookupSlug = sessionStorage.getItem("lookupslug");
const lookup = sessionStorage.getItem("lookup");

let ele_tiger = document.querySelector(".tiger");

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
