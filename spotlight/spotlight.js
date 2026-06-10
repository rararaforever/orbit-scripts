let data;
const SPREADSHEET_ID = "1ss8B5h4rJbP9pAfxvN5aq0GRdIh13jTkCSUelQXcvoU";
const SHEET_TITLE = "Amir - Web";

const URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}`;

async function logSheetData() {
  try {
    const response = await fetch(URL);
    const text = await response.text();

    const jsonString = text.substring(
      text.indexOf("{"),
      text.lastIndexOf("}") + 1,
    );
    const json = JSON.parse(jsonString);

    const rows = json.table.rows;

    data = rows.map((row) => {
      return {
        a: row.c[0] ? row.c[0].v : null,
        b: row.c[1] ? row.c[1].v : null,
        c: row.c[2] ? row.c[2].v : null,
        d: row.c[3] ? row.c[3].v : null,
        e: row.c[4] ? row.c[4].v : null,
        f: row.c[5] ? row.c[5].v : null,
        g: row.c[6] ? row.c[6].v : null,
      };
    });

    console.log("Google Sheet Data:", data);
    createPopup(data);
    createImages(data);
    popupSetup();
  } catch (error) {
    console.error("❌ Error fetching sheet:", error);
  }
}

logSheetData();

function popupSetup() {
  const popups = document.querySelectorAll(".popup");

  function openPopup(id) {
    console.log("Opening popup:", id);

    closeAllPopups();

    const popuptemp = document.getElementById(id);
    console.log("Found popup element:", popuptemp);
    if (!popuptemp) return;

    popuptemp.classList.toggle("active");
    popuptemp.style.display = "block";
  }

  function closeAllPopups() {
    popups.forEach((popup) => {
      popup.classList.remove("active");
      popup.style.display = "none";
    });
  }

  function closePopup(id) {
    document.getElementById(`${popup}${id}`).style.display = "none";
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".popup-trigger");

    if (trigger) {
      console.log("Popup trigger clicked:", trigger.dataset.popup);
      if (
        trigger.dataset.popup != "popup3" &&
        trigger.dataset.popup != "popup5"
      )
        openPopup(trigger.dataset.popup);
      else if (trigger.dataset.popup === "popup3")
        window.location.assign("https://www.youtube.com/watch?v=MbtWYtUO6gk");
      else if (trigger.dataset.popup === "popup5")
        window.location.assign("https://www.youtube.com/watch?v=TdXAzUyEsgQ");
    }
  });
}

function createImages(data) {
  let images = [];
  data.forEach((row) => {
    images.push(row.f);
  });
  const SIZE = 50;
  let zIndexCounter = 1;

  // function randPos(input) {
  //   return {
  //     x: Math.random() * (window.innerWidth * 0.7 - SIZE),
  //     y: Math.random() * (window.innerWidth * 0.7 - SIZE),
  //   };
  // }
  function randPos(index) {
    const halfW = window.innerWidth / 3;
    const halfH = window.innerHeight / 3;

    const col = index % 2; // 0 or 1
    const row = Math.floor(index / 2); // 0 or 1

    const xMin = col * halfW;
    const yMin = row * halfH;

    return {
      x: xMin + Math.random() * (halfW - SIZE),
      y: yMin + Math.random() * (halfH - SIZE),
    };
  }
  images.forEach((src, index) => {
    const pos = randPos(index);
    const img = document.createElement("img");

    img.className = "img popup-trigger";
    img.src = src;
    img.dataset.popup = `popup${index + 1}`;

    img.style.position = "absolute";
    img.style.left = `${pos.x}px`;
    img.style.top = `${pos.y}px`;

    if (window.innerWidth < 500) {
      // img.style.width = "150px";
    }

    document.getElementById("stage").appendChild(img);

    makeDraggable(img);
  });
}

function createPopup(data) {
  data.forEach((row) => {
    const popup = document.createElement("div");
    popup.className = "popup";
    // popup.classList.add("");
    const closeBtn = document.createElement("div");
    closeBtn.className = "close-btn";
    closeBtn.innerText = "✖";
    closeBtn.onclick = function () {
      document.getElementById(`popup${row.a}`).style.display = "none";
    };
    popup.appendChild(closeBtn);
    const container = document.createElement("div");
    container.className = "popup__container";
    const header = document.createElement("h3");
    header.innerText = row.c;
    container.appendChild(header);
    // conditions //
    if (row.a === 1) {
      // carasoul
      popup.id = "popup1";
      createImageCarousel({
        container: container,
        images: [
          "https://d2w9rnfcy7mm78.cloudfront.net/46778335/original_11353ef463509436772039323f61925e.jpeg?1780676602?bc=0",
          "https://d2w9rnfcy7mm78.cloudfront.net/46778337/original_7b710dd7b55cc9a67765096e8703ea39.jpeg?1780676602?bc=0",
          "https://d2w9rnfcy7mm78.cloudfront.net/46778336/original_40e27aa92f60e7bef2be62712e44fa24.jpeg?1780676602?bc=0",
        ],
      });
    }
    if (row.a === 2) {
      // audio
      popup.id = "popup2";
      const imgt = document.createElement("img");
      imgt.src =
        "https://d2w9rnfcy7mm78.cloudfront.net/46116463/original_5947a7b48f6f6ddc8eb45c60651addf7.jpeg?1778682155?bc=0";
      container.appendChild(imgt);
      container.innerHTML += ` <audio controls>
    <source src="https://attachments.are.na/46397004/5a7cd958c42e10770af3626c66df729a.mp3?1779388381" type="audio/mpeg">
    Your browser does not support the audio element.</audio>`;
      container.appendChild(parseText(row.g));
    }
    if (row.a === 3) {
      // video to link
      popup.id = "popup3";
    }
    if (row.a === 4) {
      // video + text
      popup.id = "popup4";
      container.innerHTML += `<iframe
          src="https://player.vimeo.com/video/1040969253?h=5b4383a2ae&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=5847"
          width="100%"
          height="360"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
        ></iframe>`;
      container.appendChild(parseText(row.g));
    }
    popup.appendChild(container);
    document.body.appendChild(popup);
  });
}

// parser for popup
function parseText(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const p = document.createElement("p");

  const parts = text.split("\n");

  parts.forEach((line, lineIndex) => {
    const span = document.createElement("span");

    const lineParts = line.split(urlRegex);

    lineParts.forEach((part) => {
      if (part.match(urlRegex)) {
        const a = document.createElement("a");
        a.href = part;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "popup__link";
        a.textContent = part;
        span.appendChild(a);
      } else {
        span.appendChild(document.createTextNode(part));
      }
    });

    p.appendChild(span);

    if (lineIndex < parts.length - 1) {
      p.appendChild(document.createElement("br"));
    }
  });

  return p;
}

function makeDraggable(element) {
  let zIndexCounter = 1;
  let isDragging = false;
  let hasDragged = false;

  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  const DRAG_THRESHOLD = 5;

  element.addEventListener("pointerdown", (e) => {
    isDragging = true;
    hasDragged = false;

    startX = e.clientX;
    startY = e.clientY;

    initialLeft = parseFloat(element.style.left) || 0;
    initialTop = parseFloat(element.style.top) || 0;

    // Bring to front
    element.style.zIndex = ++zIndexCounter;

    element.setPointerCapture(e.pointerId);

    e.preventDefault();
  });

  element.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!hasDragged && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      hasDragged = true;
    }

    if (!hasDragged) return;

    let left = initialLeft + dx;
    let top = initialTop + dy;

    // Keep inside viewport
    left = Math.max(0, Math.min(left, window.innerWidth - element.offsetWidth));

    top = Math.max(0, Math.min(top, window.innerHeight - element.offsetHeight));

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
    e.preventDefault();
  });

  element.addEventListener("pointerup", () => {
    isDragging = false;
    hasDragged = false;
    e.preventDefault();
  });

  element.addEventListener("pointercancel", () => {
    isDragging = false;
    e.preventDefault();
  });

  // Prevent popup opening after dragging
  element.addEventListener(
    "click",
    (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true,
  );
}

//image carrousel

function createImageCarousel({ container, images = [], height = "350px" }) {
  if (!container || !images.length) return;

  // Create main elements
  const carousel = document.createElement("div");
  const track = document.createElement("div");
  const prevBtn = document.createElement("button");
  const nextBtn = document.createElement("button");

  let index = 0;

  // Styles
  carousel.style.position = "relative";
  carousel.style.overflow = "hidden";
  carousel.style.maxWidth = "600px";
  carousel.style.margin = "20px auto";

  track.style.display = "flex";
  track.style.transition = "transform 0.4s ease";

  prevBtn.textContent = "‹";
  nextBtn.textContent = "›";

  [prevBtn, nextBtn].forEach((btn) => {
    btn.style.position = "absolute";
    btn.style.top = "50%";
    btn.style.transform = "translateY(-50%)";
    btn.style.width = "30px";
    btn.style.height = "30px";
    btn.style.borderRadius = "50%";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.background = "rgba(0,0,0,0.5)";
    btn.style.color = "white";
    btn.style.zIndex = "10";
  });

  prevBtn.style.left = "10px";
  nextBtn.style.right = "10px";

  // Build slides
  images.forEach((src) => {
    const slide = document.createElement("div");
    slide.style.minWidth = "100%";

    const img = document.createElement("img");
    img.src = src;
    img.style.width = "100%";
    img.style.objectFit = "cover";
    img.draggable = false;

    slide.appendChild(img);
    track.appendChild(slide);
  });

  carousel.appendChild(track);
  carousel.appendChild(prevBtn);
  carousel.appendChild(nextBtn);
  container.appendChild(carousel);

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  // Buttons
  nextBtn.addEventListener("click", () => {
    index = (index + 1) % images.length;
    update();
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + images.length) % images.length;
    update();
  });

  // Swipe / drag support
  let startX = 0;
  let isDown = false;

  const start = (x) => {
    startX = x;
    isDown = true;
  };

  const move = (x) => {
    if (!isDown) return;
  };

  const end = (x) => {
    if (!isDown) return;
    isDown = false;

    const diff = startX - x;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        index = (index + 1) % images.length;
      } else {
        index = (index - 1 + images.length) % images.length;
      }
      update();
    }
  };

  // Touch
  carousel.addEventListener("touchstart", (e) => start(e.touches[0].clientX));
  carousel.addEventListener("touchend", (e) =>
    end(e.changedTouches[0].clientX),
  );

  // Mouse drag (desktop swipe)
  carousel.addEventListener("mousedown", (e) => start(e.clientX));
  carousel.addEventListener("mouseup", (e) => end(e.clientX));
  carousel.addEventListener("mouseleave", () => (isDown = false));
}
