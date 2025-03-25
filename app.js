// Canvas setup
const c = document.getElementById("c");
let w = (c.width = window.innerWidth);
let h = (c.height = window.innerHeight);
const ctx = c.getContext("2d");
let hw = w / 2; // half-width
let hh = h / 2; // half-height

// Audio elements
const bgMusic = document.getElementById("bgMusic");
const fireworkSound = document.getElementById("fireworkSound");

// UI elements
const musicToggle = document.getElementById("musicToggle");
const fireworkBtn = document.getElementById("fireworkBtn");
const customizeBtn = document.getElementById("customizeBtn");
const customizePanel = document.getElementById("customizePanel");
const nameInput = document.getElementById("nameInput");
const messageInput = document.getElementById("messageInput");
const colorTheme = document.getElementById("colorTheme");
const applyBtn = document.getElementById("applyBtn");
const nameDisplay = document.getElementById("nameDisplay");

// Particles array for fireworks
const particles = [];

// Configuration options
const opts = {
  strings: ["HAPPY", "BIRTHDAY!", "REETHU"],
  charSize: 30,
  charSpacing: 35,
  lineHeight: 40,

  cx: w / 2,
  cy: h / 2,

  fireworkPrevPoints: 10,
  fireworkBaseLineWidth: 5,
  fireworkAddedLineWidth: 8,
  fireworkSpawnTime: 200,
  fireworkBaseReachTime: 30,
  fireworkAddedReachTime: 30,
  fireworkCircleBaseSize: 20,
  fireworkCircleAddedSize: 10,
  fireworkCircleBaseTime: 30,
  fireworkCircleAddedTime: 30,
  fireworkCircleFadeBaseTime: 10,
  fireworkCircleFadeAddedTime: 5,
  fireworkBaseShards: 5,
  fireworkAddedShards: 5,
  fireworkShardPrevPoints: 3,
  fireworkShardBaseVel: 4,
  fireworkShardAddedVel: 2,
  fireworkShardBaseSize: 3,
  fireworkShardAddedSize: 3,
  gravity: 0.1,
  upFlow: -0.1,
  letterContemplatingWaitTime: 360,
  balloonSpawnTime: 20,
  balloonBaseInflateTime: 10,
  balloonAddedInflateTime: 10,
  balloonBaseSize: 20,
  balloonAddedSize: 20,
  balloonBaseVel: 0.4,
  balloonAddedVel: 0.4,
  balloonBaseRadian: -(Math.PI / 2 - 0.5),
  balloonAddedRadian: -1,

  // Color themes
  //   colorThemes: {
  //     default: {
  //       hueStart: 0,
  //       hueEnd: 360,
  //       saturation: 80,
  //       lightness: 50,
  //     },
  //     pastel: {
  //       hueStart: 0,
  //       hueEnd: 360,
  //       saturation: 70,
  //       lightness: 70,
  //     },
  //     neon: {
  //       hueStart: 120,
  //       hueEnd: 300,
  //       saturation: 100,
  //       lightness: 60,
  //     },
  //     gold: {
  //       hueStart: 30,
  //       hueEnd: 60,
  //       saturation: 90,
  //       lightness: 55,
  //     },
  //   },

  colorThemes: {
    default: {
      hueStart: 0,
      hueEnd: 360,
      saturation: 80,
      lightness: 50,
    },
    pastel: {
      hueStart: 0,
      hueEnd: 360,
      saturation: 50,
      lightness: 80,
    },
    neon: {
      hueStart: 120,
      hueEnd: 300,
      saturation: 100,
      lightness: 70,
    },
    gold: {
      hueStart: 38,
      hueEnd: 50,
      saturation: 95,
      lightness: 55,
    },
    sunset: {
      hueStart: 10,
      hueEnd: 50,
      saturation: 90,
      lightness: 60,
    },
    floral: {
      hueStart: 290,
      hueEnd: 340,
      saturation: 70,
      lightness: 75,
    },
    ocean: {
      hueStart: 180,
      hueEnd: 220,
      saturation: 85,
      lightness: 50,
    },
    monochrome: {
      hueStart: 0,
      hueEnd: 0,
      saturation: 0,
      lightness: 50,
    },
  },

  // Current theme
  currentTheme: "default",

  // Audio settings
  musicEnabled: false,
  soundEnabled: true,
};

// Calculate total width based on character spacing and string length
const calc = {
  totalWidth: opts.charSpacing * Math.max(...opts.strings.map((s) => s.length)),
};

const Tau = Math.PI * 2;
const TauQuarter = Tau / 4;
const letters = [];

// Set font for text rendering
ctx.font = opts.charSize + "px Verdana";

// Letter constructor
function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;

  this.dx = -ctx.measureText(char).width / 2;
  this.dy = +opts.charSize / 2;

  this.fireworkDy = this.y - hh;

  // Get color based on current theme
  const theme = opts.colorThemes[opts.currentTheme];
  const hueRange = theme.hueEnd - theme.hueStart;
  const hue = theme.hueStart + (x / calc.totalWidth) * hueRange;

  this.color = `hsl(${hue},${theme.saturation}%,${theme.lightness}%)`;
  this.lightAlphaColor = `hsla(${hue},${theme.saturation}%,light%,alp)`;
  this.lightColor = `hsl(${hue},${theme.saturation}%,light%)`;
  this.alphaColor = `hsla(${hue},${theme.saturation}%,${theme.lightness}%,alp)`;

  this.reset();
}

// Update and draw particles
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // gravity
    p.alpha -= 0.02;
    p.life--;

    if (p.life <= 0 || p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// Reset letter animation
Letter.prototype.reset = function () {
  this.phase = "firework";
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
  this.reachTime =
    (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) |
    0;
  this.lineWidth =
    opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
  this.prevPoints = [[0, hh, 0]];
};

// Animation step for letter
Letter.prototype.step = function () {
  if (this.phase === "firework") {
    if (!this.spawned) {
      ++this.tick;
      if (this.tick >= this.spawningTime) {
        this.tick = 0;
        this.spawned = true;
      }
    } else {
      ++this.tick;

      var linearProportion = this.tick / this.reachTime,
        armonicProportion = Math.sin(linearProportion * TauQuarter),
        currentX = linearProportion * this.x,
        currentY = hh + armonicProportion * this.fireworkDy;

      if (this.prevPoints.length > opts.fireworkPrevPoints)
        this.prevPoints.shift();

      this.prevPoints.push([
        currentX,
        currentY,
        linearProportion * this.lineWidth,
      ]);

      var lineWidthProportion = 1 / (this.prevPoints.length - 1);

      for (let i = 1; i < this.prevPoints.length; ++i) {
        var point = this.prevPoints[i],
          point2 = this.prevPoints[i - 1];

        ctx.strokeStyle = this.alphaColor.replace(
          "alp",
          i / this.prevPoints.length
        );
        ctx.lineWidth = point[2] * lineWidthProportion * i;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
      }

      if (this.tick >= this.reachTime) {
        this.phase = "contemplate";

        this.circleFinalSize =
          opts.fireworkCircleBaseSize +
          opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime =
          (opts.fireworkCircleBaseTime +
            opts.fireworkCircleAddedTime * Math.random()) |
          0;
        this.circleCreating = true;
        this.circleFading = false;

        this.circleFadeTime =
          (opts.fireworkCircleFadeBaseTime +
            opts.fireworkCircleFadeAddedTime * Math.random()) |
          0;
        this.tick = 0;
        this.tick2 = 0;

        this.shards = [];

        var shardCount =
            (opts.fireworkBaseShards +
              opts.fireworkAddedShards * Math.random()) |
            0,
          angle = Tau / shardCount,
          cos = Math.cos(angle),
          sin = Math.sin(angle),
          x = 1,
          y = 0;

        for (let i = 0; i < shardCount; ++i) {
          var x1 = x;
          x = x * cos - y * sin;
          y = y * cos + x1 * sin;

          this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
        }

        // Play firework sound if enabled
        if (opts.soundEnabled) {
          playFireworkSound();
        }
      }
    }
  } else if (this.phase === "contemplate") {
    ++this.tick;

    if (this.circleCreating) {
      ++this.tick2;
      var proportion = this.tick2 / this.circleCompleteTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 50 + 50 * proportion)
        .replace("alp", proportion);
      ctx.beginPath();
      ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick2 > this.circleCompleteTime) {
        this.tick2 = 0;
        this.circleCreating = false;
        this.circleFading = true;
      }
    } else if (this.circleFading) {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      ++this.tick2;
      const proportion = this.tick2 / this.circleFadeTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 100)
        .replace("alp", 1 - armonic);
      ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
    } else {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
    }

    for (var i = 0; i < this.shards.length; ++i) {
      this.shards[i].step();

      if (!this.shards[i].alive) {
        this.shards.splice(i, 1);
        --i;
      }
    }

    if (this.tick > opts.letterContemplatingWaitTime) {
      this.phase = "balloon";

      this.tick = 0;
      this.spawning = true;
      this.spawnTime = (opts.balloonSpawnTime * Math.random()) | 0;
      this.inflating = false;
      this.inflateTime =
        (opts.balloonBaseInflateTime +
          opts.balloonAddedInflateTime * Math.random()) |
        0;
      this.size =
        (opts.balloonBaseSize + opts.balloonAddedSize * Math.random()) | 0;

      var rad =
          opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
        vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

      this.vx = Math.cos(rad) * vel;
      this.vy = Math.sin(rad) * vel;
    }
  } else if (this.phase === "balloon") {
    ctx.strokeStyle = this.lightColor.replace("light", 80);

    if (this.spawning) {
      ++this.tick;
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      if (this.tick >= this.spawnTime) {
        this.tick = 0;
        this.spawning = false;
        this.inflating = true;
      }
    } else if (this.inflating) {
      ++this.tick;

      var proportion = this.tick / this.inflateTime,
        baloon_x = (this.cx = this.x),
        baloon_y = (this.cy = this.y - this.size * proportion);

      ctx.fillStyle = this.alphaColor.replace("alp", proportion);
      ctx.beginPath();
      generateBalloonPath(baloon_x, baloon_y, this.size * proportion);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(baloon_x, baloon_y);
      ctx.lineTo(baloon_x, this.y);
      ctx.stroke();

      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      if (this.tick >= this.inflateTime) {
        this.tick = 0;
        this.inflating = false;
      }
    } else {
      this.cx += this.vx;
      this.cy += this.vy += opts.upFlow;

      ctx.fillStyle = this.color;
      ctx.beginPath();
      generateBalloonPath(this.cx, this.cy, this.size);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.lineTo(this.cx, this.cy + this.size);
      ctx.stroke();

      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

      if (this.cy + this.size < -hh || this.cx < -hw || this.cy > hw)
        this.phase = "done";
    }
  }
};

// Shard constructor (firework particles)
function Shard(x, y, vx, vy, color) {
  var vel =
    opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

  this.vx = vx * vel;
  this.vy = vy * vel;

  this.x = x;
  this.y = y;

  this.prevPoints = [[x, y]];
  this.color = color;

  this.alive = true;

  this.size =
    opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}

// Animation step for shard
Shard.prototype.step = function () {
  this.x += this.vx;
  this.y += this.vy += opts.gravity;

  if (this.prevPoints.length > opts.fireworkShardPrevPoints)
    this.prevPoints.shift();

  this.prevPoints.push([this.x, this.y]);

  var lineWidthProportion = this.size / this.prevPoints.length;

  for (var k = 0; k < this.prevPoints.length - 1; ++k) {
    var point = this.prevPoints[k],
      point2 = this.prevPoints[k + 1];

    ctx.strokeStyle = this.color.replace("alp", k / this.prevPoints.length);
    ctx.lineWidth = k * lineWidthProportion;
    ctx.beginPath();
    ctx.moveTo(point[0], point[1]);
    ctx.lineTo(point2[0], point2[1]);
    ctx.stroke();
  }

  if (this.prevPoints[0][1] > hh) this.alive = false;
};

// Generate balloon path
function generateBalloonPath(x, y, size) {
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x - size / 2,
    y - size / 2,
    x - size / 4,
    y - size,
    x,
    y - size
  );
  ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y);
}

// Create a click firework
function createFirework(x, y) {
  // Get color based on current theme
  const theme = opts.colorThemes[opts.currentTheme];
  const hue = theme.hueStart + Math.random() * (theme.hueEnd - theme.hueStart);
  const color = `hsl(${hue},${theme.saturation}%,${theme.lightness}%)`;

  // Create 30 particles
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    const size = 2 + Math.random() * 3;

    const particle = {
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: size,
      color: color,
      alpha: 1,
      life: 30 + Math.random() * 20,
    };

    particles.push(particle);
  }

  // Play firework sound if enabled
  if (opts.soundEnabled) {
    playFireworkSound();
  }
}

// Play firework sound with random pitch
function playFireworkSound() {
  try {
    // Clone the audio element to allow multiple sounds at once
    const sound = fireworkSound.cloneNode();
    sound.volume = 0.3;
    sound.playbackRate = 0.8 + Math.random() * 0.4; // Random pitch
    sound.play().catch((e) => console.log("Audio play failed:", e));

    // Remove the element when done playing
    sound.onended = () => sound.remove();
  } catch (e) {
    console.log("Sound error:", e);
  }
}

// Animation loop
function anim() {
  window.requestAnimationFrame(anim);

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, w, h);

  ctx.translate(hw, hh);

  var done = true;
  for (var l = 0; l < letters.length; ++l) {
    letters[l].step();
    if (letters[l].phase !== "done") done = false;
  }

  ctx.translate(-hw, -hh);

  // Update and draw particles
  updateParticles();

  if (done) {
    for (let l = 0; l < letters.length; ++l) letters[l].reset();

    // Trigger fireworks when animation resets
    if (Math.random() < 0.3) {
      // 30% chance
      launchMultipleFireworks();
    }
  }
}

// Initialize letters
function initLetters() {
  letters.length = 0; // Clear existing letters

  for (var i = 0; i < opts.strings.length; ++i) {
    for (var j = 0; j < opts.strings[i].length; ++j) {
      letters.push(
        new Letter(
          opts.strings[i][j],
          j * opts.charSpacing +
            opts.charSpacing / 2 -
            (opts.strings[i].length * opts.charSpacing) / 2,
          i * opts.lineHeight +
            opts.lineHeight / 2 -
            (opts.strings.length * opts.lineHeight) / 2
        )
      );
    }
  }
}

// Launch multiple fireworks
function launchMultipleFireworks() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createFirework(Math.random() * w, h * 0.5 + Math.random() * (h * 0.3));
    }, i * 200); // Stagger the fireworks
  }
}

// // Apply customization changes
// function applyCustomization() {
//   const name = nameInput.value.trim().toUpperCase();
//   const message = messageInput.value.trim().toUpperCase();
//   const theme = colorTheme.value;

//   if (name && message) {
//     opts.strings = [message, name];
//     opts.currentTheme = theme;
//     nameDisplay.textContent = name.charAt(0) + name.slice(1).toLowerCase();

//     // Reinitialize letters with new text
//     initLetters();

//     // Launch fireworks to celebrate the change
//     launchMultipleFireworks();

//     // Hide customize panel
//     customizePanel.classList.remove("active");
//   }
// }

// // Toggle music
// function toggleMusic() {
//   if (opts.musicEnabled) {
//     bgMusic.pause();
//     musicToggle.classList.remove("active");
//   } else {
//     bgMusic.play().catch((e) => console.log("Audio play failed:", e));
//     musicToggle.classList.add("active");
//   }
//   opts.musicEnabled = !opts.musicEnabled;
// }

// // Event listeners
// window.addEventListener("resize", () => {
//   w = c.width = window.innerWidth;
//   h = c.height = window.innerHeight;

//   hw = w / 2;
//   hh = h / 2;

//   ctx.font = opts.charSize + "px Verdana";
// });

// // Click/touch event to create fireworks
// c.addEventListener("click", (e) => {
//   createFirework(e.clientX, e.clientY);
// });

// // UI control event listeners
// musicToggle.addEventListener("click", toggleMusic);
// fireworkBtn.addEventListener("click", launchMultipleFireworks);
// customizeBtn.addEventListener("click", () => {
//   customizePanel.classList.toggle("active");
// });
// applyBtn.addEventListener("click", applyCustomization);

// // Initialize
// initLetters();
// anim();

// // Update name display
// nameDisplay.textContent =
//   opts.strings[2].charAt(0) + opts.strings[2].slice(1).toLowerCase();

// // Set up music toggle button state
// musicToggle.classList.toggle("active", opts.musicEnabled);

// abcd
// Apply customization changes
function applyCustomization() {
  const name = nameInput.value.trim().toUpperCase();
  const message = messageInput.value.trim().toUpperCase();
  const theme = colorTheme.value;

  if (name && message) {
    opts.strings = message.split(" "); // Ensuring multi-line message
    opts.strings.push(name); // Adding name on a new line
    opts.currentTheme = theme;
    nameDisplay.textContent = name.charAt(0) + name.slice(1).toLowerCase();

    // Reinitialize letters with new text
    initLetters();

    // Launch fireworks to celebrate the change
    launchMultipleFireworks();

    // Hide customize panel
    customizePanel.classList.remove("active");
  }
}

// Toggle music
function toggleMusic() {
  if (opts.musicEnabled) {
    bgMusic.pause();
    musicToggle.classList.remove("active");
  } else {
    bgMusic.play().catch((e) => console.log("Audio play failed:", e));
    musicToggle.classList.add("active");
  }
  opts.musicEnabled = !opts.musicEnabled;
}

// Event listeners
window.addEventListener("resize", () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;

  hw = w / 2;
  hh = h / 2;

  ctx.font = opts.charSize + "px Verdana";
});

// Click/touch event to create fireworks
c.addEventListener("click", (e) => {
  createFirework(e.clientX, e.clientY);
});

// UI control event listeners
musicToggle.addEventListener("click", toggleMusic);
fireworkBtn.addEventListener("click", launchMultipleFireworks);
customizeBtn.addEventListener("click", () => {
  customizePanel.classList.toggle("active");
});
applyBtn.addEventListener("click", applyCustomization);

// Initialize
initLetters();
anim();

// Update name display
nameDisplay.textContent =
  opts.strings[opts.strings.length - 1].charAt(0) +
  opts.strings[opts.strings.length - 1].slice(1).toLowerCase();

// Set up music toggle button state
musicToggle.classList.toggle("active", opts.musicEnabled);

// abcd
// function createConfetti() {
//   const confettiCount = 25;
//   const confetti = [];
//   for (let i = 0; i < confettiCount; i++) {
//     confetti.push({
//       x: Math.random() * w,
//       y: Math.random() * -h,
//       size: Math.random() * 6 + 4,
//       //   color: `hsl(${Math.random() * 360}, 100%, 70%)`,
//       color: getConfettiColor(),
//       velocityX: (Math.random() - 0.5) * 2,
//       velocityY: Math.random() * 5 + 2,
//       rotation: Math.random() * 360,
//     });
//   }

//   function getConfettiColor() {
//     const theme = opts.colorThemes[opts.currentTheme];
//     const hue =
//       theme.hueStart + Math.random() * (theme.hueEnd - theme.hueStart);
//     return `hsl(${hue}, ${theme.saturation}%, ${theme.lightness}%)`;
//   }

//   function drawConfetti() {
//     ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // Slight transparency
//     ctx.fillRect(0, 0, w, h); // Keeps the background without erasing elements
//     for (let i = 0; i < confetti.length; i++) {
//       const c = confetti[i];
//       ctx.fillStyle = c.color;
//       ctx.beginPath();
//       ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
//       ctx.fill();
//       c.x += c.velocityX;
//       c.y += c.velocityY;
//       c.rotation += 5;

//       if (c.y > h) {
//         c.y = -10;
//         c.x = Math.random() * w;
//       }
//     }
//     requestAnimationFrame(drawConfetti);
//   }
//   drawConfetti();
// }
// window.onload = createConfetti;

function getConfettiColor() {
  const theme = opts.colorThemes[opts.currentTheme];
  const hue = theme.hueStart + Math.random() * (theme.hueEnd - theme.hueStart);
  return `hsl(${hue}, ${theme.saturation}%, ${theme.lightness}%)`;
}

function createConfetti() {
  const confettiCount = 25;
  const confetti = [];

  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * w,
      y: Math.random() * -h,
      size: Math.random() * 6 + 4,
      color: getConfettiColor(), // Uses theme color
      velocityX: (Math.random() - 0.5) * 2,
      velocityY: Math.random() * 5 + 2,
      rotation: Math.random() * 360,
    });
  }

  function drawConfetti() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // Slight transparency
    ctx.fillRect(0, 0, w, h); // Keeps the background without erasing elements

    for (let i = 0; i < confetti.length; i++) {
      const c = confetti[i];
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.fill();
      c.x += c.velocityX;
      c.y += c.velocityY;
      c.rotation += 5;

      // Reset confetti when it goes off screen
      if (c.y > h) {
        c.y = -10;
        c.x = Math.random() * w;
        c.color = getConfettiColor(); // Update color when resetting
      }
    }
    requestAnimationFrame(drawConfetti);
  }

  drawConfetti();
}

// Ensure confetti updates when the user selects a new theme
function updateConfettiColors() {
  for (let i = 0; i < confetti.length; i++) {
    confetti[i].color = getConfettiColor();
  }
}

// Start confetti when page loads
window.onload = createConfetti;
