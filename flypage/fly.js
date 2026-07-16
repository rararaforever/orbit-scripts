function intialize() {
  const stage = document.getElementById("stage");
  const team = [
    {
      img: "https://freight.cargo.site/t/original/i/fed4109ae842c69f706135da8fb20bb911cfc8fef6ae5641e0cda73c8bae08f5/fly1.png",
      name: "Amir",
      sound:
        "https://cdn.jsdelivr.net/gh/rararaforever/orbit-scripts@main/flypage/fly.mp3",
    },
    {
      img: "https://freight.cargo.site/t/original/i/9a352e67bb270fc0d25d5750799119bffa13f3793e79b093d4f4bae5a44bb86d/fly2.png",
      name: "Jasmine",
      sound:
        "https://cdn.jsdelivr.net/gh/rararaforever/orbit-scripts@main/flypage/fly.mp3",
    },
    {
      img: "https://freight.cargo.site/t/original/i/eb48dd5c9026e84874a874d8cbe535b1dbc3d52c5378fc7d9ae8044cd4473220/fly3.png",
      name: "Khanh",
      sound:
        "https://cdn.jsdelivr.net/gh/rararaforever/orbit-scripts@main/flypage/fly.mp3",
    },
    {
      img: "https://freight.cargo.site/t/original/i/a4a0cd5e0d6321803d6c881e52e370ba7f8c8e1d4b9155035e44c684119d41f7/fly4.png",
      name: "Nandini",
      sound:
        "https://cdn.jsdelivr.net/gh/rararaforever/orbit-scripts@main/flypage/fly.mp3",
    },
  ];

  const container = document.createElement("div");
  container.className = "fly-container";

  team.forEach((member) => {
    const fly = document.createElement("div");
    fly.className = "fly";

    const img = document.createElement("img");
    img.src = member.img;
    // img.dataset.sound = "/flypage/fly.mp3";
    img.dataset.sound = member.sound;

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = member.name;

    fly.appendChild(img);
    fly.appendChild(name);
    container.appendChild(fly);
  });

  const button = document.createElement("button");
  button.className = "soundbtn";
  button.textContent = "Meet the team!";

  container.appendChild(button);

  stage.appendChild(container);
}

function run() {
  const flies = document.querySelectorAll(".fly");
  const soundBtn = document.querySelector(".soundbtn");
  const stage = document.getElementById("stage");
  let audioContext = null;
  let audioStarted = false;

  let mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };

  const flyObjects = [];

  document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  soundBtn.addEventListener("pointerdown", toggleSound, { once: true });
  stage.addEventListener("pointerdown", toggleSound, { once: true });

  function toggleSound() {
    if (audioStarted) return;

    audioStarted = true;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    audioContext.resume().then(() => {
      startAudio();
    });
    soundBtn.classList.add("off");
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function startAudio() {
    flyObjects.forEach((f, index) => {
      const temp = f.img;
      const audio = new Audio(temp.dataset.sound);
      audio.loop = true;

      const source = audioContext.createMediaElementSource(audio);
      const gain = audioContext.createGain();
      const pan = audioContext.createStereoPanner();

      gain.gain.value = 0;

      source.connect(gain);
      gain.connect(pan);
      pan.connect(audioContext.destination);
      audio.crossOrigin = "anonymous";
      audio.play();

      flyObjects[index].audio = audio;
      flyObjects[index].gain = gain;
      flyObjects[index].pan = pan;

      // const fly = {
      //   img,
      //   audio,
      //   gain,
      //   pan,

      //   x: random(0, window.innerWidth - 80),
      //   y: random(0, window.innerHeight - 80),

      //   angle: random(0, Math.PI * 2),

      //   speed: random(1.2, 3),

      //   paused: false,
      // };

      // flyObjects.push(fly);
    });

    requestAnimationFrame(animate);
  }

  function animate() {
    flyObjects.forEach((fly) => {
      if (!fly.paused) {
        fly.angle += random(-0.15, 0.15);

        fly.speed += random(-0.05, 0.05);
        fly.speed = Math.max(0.8, Math.min(3.5, fly.speed));

        fly.x += Math.cos(fly.angle) * fly.speed;
        fly.y += Math.sin(fly.angle) * fly.speed;

        if (fly.x < 0) {
          fly.x = 0;
          fly.angle = Math.PI - fly.angle;
        }

        if (fly.x > window.innerWidth - fly.e.offsetWidth) {
          fly.x = window.innerWidth - fly.e.offsetWidth;
          fly.angle = Math.PI - fly.angle;
        }

        if (fly.y < 0) {
          fly.y = 0;
          fly.angle = -fly.angle;
        }

        if (fly.y > window.innerHeight - fly.e.offsetHeight) {
          fly.y = window.innerHeight - fly.e.offsetHeight;
          fly.angle = -fly.angle;
        }
        fly.name.style.display = "none";
        fly.e.style.transform = "scale(1)";
        const now = Date.now();

        if (now - fly.lastRotation > fly.rotationDelay) {
          const wobble = Math.sin(now / 40 + fly.x) * 2;

          fly.img.style.transform = `rotate(${(fly.angle * 180) / Math.PI + 90 + wobble}deg)`;

          fly.lastRotation = now;
        }
      }
      //for pause
      else {
        fly.name.style.display = "block";
        fly.e.style.transform = "scale(1.6)";

        //   const wobble = Math.sin(fly.x) * 809;
        const now = Date.now();

        if (now - fly.lastRotation > fly.rotationDelay / 5) {
          fly.img.style.transform = `rotate(${random(20, 160)}deg)`;

          fly.lastRotation = now;
        }
      }
      const centerX = fly.x + fly.e.offsetWidth / 2;
      const centerY = fly.y + fly.e.offsetHeight / 2;

      const dx = centerX - mouse.x;
      const dy = centerY - mouse.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxDistance = 500;

      let volume = 1 - distance / maxDistance;
      volume = Math.max(0, Math.min(1, volume));

      if (fly.gain) {
        fly.gain.gain.value = volume * 0.7;
      }

      if (fly.pan) {
        fly.pan.pan.value = (centerX / window.innerWidth) * 2 - 1;
      }

      const wobble = 1;

      fly.e.style.left = fly.x + "px";
      fly.e.style.top = fly.y + "px";
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    mouse.x = window.innerWidth / 2;
    mouse.y = window.innerHeight / 2;
  });

  function initFlies() {
    flies.forEach((f) => {
      const fly = {
        e: f,
        img: f.children[0],
        name: f.children[1],
        x: random(0, window.innerWidth - 80),
        y: random(0, window.innerHeight - 80),

        angle: random(0, Math.PI * 2),

        speed: random(1.2, 3),

        paused: false,

        // audio starts empty
        gain: null,
        pan: null,
        analyser: null,
        data: null,
        lastRotation: 0,
        rotationDelay: 500,
      };

      flyObjects.push(fly);

      f.addEventListener("mouseenter", () => {
        fly.paused = true;
      });

      f.addEventListener("mouseleave", () => {
        fly.paused = false;
      });
    });
  }
  initFlies();
  animate();
}
intialize();
run();
