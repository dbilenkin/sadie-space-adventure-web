// GAME GLOBALS
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = 800;
const canvasHeight = 600;
const scoreHeight = 40;
const healthHight = 80;

const keys = [];

let tick = 0;
let gameStarted = false;
let shopShown = false;

let score = 0;
let starScore = 0;
let health = 100;

// ROCKET GLOBALS
let rocketSpeed = -1.5;
const rocketWidth = 66;
const rocketHeight = 46;

const rocketImage = new Image();
rocketImage.src = 'images/rocket.png';
const rocket = { x: 0, y: 0, speed: 0 };

const shopUpgrades = [
  {
    name: 'boostedEngine',
    description: 'Boosted Engine',
    cost: 30,
    speedy: 2,
  },
  {
    name: 'pinkRocket',
    description: 'Pink Rocket',
    cost: 50,
    health: 200,
  },
  {
    name: 'ufo',
    description: 'UFO',
    cost: 100,
    movex: true,
  },
  {
    name: 'laserRocket',
    description: 'Laser Rocket',
    cost: 150,
    speedy: 4,
  }
]

// STAR GLOBALS
let starSpeed = -1.5;
const starWidth = 25;
const starHeight = 25;
const starImage = new Image();
starImage.src = 'images/star.png';

const numStars = 20;
let stars = [];

// ASTEROID GLOBALS
let asteroidSpeed = -1.5;
const asteroidWidth = 115;
const asteroidHeight = 108;
const asteroidImage = new Image();
asteroidImage.src = 'images/asteroid.png';

const numAsteroids = 3;
let asteroids = [];

// UTILITY FUNCTIONS
function objectsIntersect(a, b) {

  const aLeftOfB = a.x + a.width < b.x;
  const aRightOfB = a.x > b.x + b.width;
  const aAboveB = a.y + a.height < b.y;
  const aBelowB = a.y > b.y + b.height;

  return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
}

function getRandomY(objectHeight) {
  return scoreHeight + objectHeight + Math.random() * (canvasHeight - objectHeight - scoreHeight - healthHight);
}

// INIT FUNCTIONS
function initShopImages() {
  for (const upgrade of shopUpgrades) {
    upgrade.image = new Image();
    upgrade.image.src = `images/${upgrade.name}.png`;
  }
}

// initShopImages();

function initRocket() {
  rocketImage.src = 'images/rocket.png';
  rocket.width = rocketWidth;
  rocket.height = rocketHeight;
  rocket.x = 50;
  rocket.y = (canvasHeight - rocketHeight) / 2;
  rocket.speedy = 1.5;
  rocket.starCount = 0;
  rocket.asteroidCount = 0;
}

function initStars() {
  for (let i = 0; i < numStars; i++) {
    const x = i * (canvasWidth / numStars);
    const y = getRandomY(starHeight);
    const width = starWidth;
    const height = starHeight;
    const speedx = starSpeed;
    const show = true;
    const star = { x, y, width, height, speedx, show }
    stars.push(star);
  }
}

function initAsteroids() {
  for (let i = 0; i < numAsteroids; i++) {
    const x = (i + 1) * (canvasWidth / (numAsteroids - 1));
    const y = getRandomY(asteroidHeight - 20);
    const width = asteroidWidth;
    const height = asteroidWidth; //since it's spinning, using larger value
    const speedx = asteroidSpeed;
    const dir = 0;
    const asteroid = { x, y, width, height, speedx, dir }
    asteroids.push(asteroid);
  }
}

// MOVE FUNCTIONS

function moveRocket() {
  if (keys['ArrowUp']) {
    if (rocket.y > 0 + scoreHeight) {
      rocket.y -= rocket.speedy;
    }
  } else if (keys['ArrowDown']) {
    if (rocket.y < canvasHeight - rocketHeight) {
      rocket.y += rocket.speedy;
    }
  } else if (keys['ArrowLeft']) {
    // rocket.x += -1;
  } else if (keys['ArrowRight']) {
    // rocket.x += 1;
  }
}

// DRAW FUNCTIONS

function drawRocket() {
  ctx.drawImage(rocketImage, rocket.x, rocket.y);
}

function drawStars() {
  let starTickCount = 0;

  for (const star of stars) {
    star.x += star.speedx;
    if (objectsIntersect(rocket, star)) {
      starTickCount++;
      if (starTickCount > rocket.starCount) {
        starScore++;
        rocket.starCount++;
      }
      star.show = false;
    }

    if (star.x < 0 - starWidth) {
      star.show = true;
      star.x = canvasWidth + (canvasWidth / numStars);
      star.y = getRandomY(starHeight);
    }

    if (star.show) {
      ctx.drawImage(starImage, star.x, star.y);
    }
  }

  rocket.starCount = starTickCount; //reset starCount to stars touching in this tick
}

function drawAsteroids() {
  for (const asteroid of asteroids) {
    asteroid.x += asteroid.speedx;
    const asteroidBox = {
      x: asteroid.x - asteroidWidth / 2,
      y: asteroid.y - asteroidHeight / 2,
      width: asteroidWidth,
      height: asteroidWidth
    }

    if (objectsIntersect(rocket, asteroidBox)) {
      health -= .3;
      // asteroid.show = false;
    }

    if (asteroid.x < 0 - asteroidWidth) {
      asteroid.x = canvasWidth + asteroidWidth;
      asteroid.y = getRandomY(asteroidHeight - 20);
    }
    asteroid.dir += .01;
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.dir);
    ctx.drawImage(asteroidImage, -asteroidWidth / 2, -asteroidHeight / 2);
    ctx.restore();
  }
}

function drawStarScore() {
  if (tick % 100 === 0) {
    score++;
  }

  ctx.font = '30px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#00ff00';
  ctx.fillText('Score: ' + score, 20, 40);

  ctx.fillStyle = 'yellow';
  ctx.fillText('Stars: ' + starScore, canvasWidth - 130, 40);
}

function drawHealth() {
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(0, canvasHeight - 30, health * 2, 15);
}

function draw() {
  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  tick++;

  moveRocket();

  drawHealth();
  drawStarScore();

  drawRocket();
  drawStars();
  drawAsteroids();


  if (health <= 0) {
    gameOver();
  }

  setTimeout(draw, 0);

}

// GAME CONTROLS
function continueGame() {
  if (gameStarted) return;

  gameStarted = true;
  shopShown = false;

  draw();
}

function start() {
  if (gameStarted) return;

  gameStarted = true;
  shopShown = false;

  score = 0;
  starScore = 0;
  health = 100;

  stars = [];
  asteroids = [];

  initRocket();
  initStars();
  initAsteroids();

  draw();
}

function drawMenu() {
  gameStarted = false;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const titleImage = new Image();
  titleImage.src = 'images/title.png';
  titleImage.onload = () => {
    ctx.drawImage(titleImage, 150, 100, 500, 150);
  };

  ctx.font = '40px sans-serif';
  ctx.fillStyle = '#f7bfbe';
  ctx.textAlign = 'center';
  ctx.fillText('Press space to start.', canvasWidth / 2, 400);
  ctx.fillText('Once in game, press Q to quit.', canvasWidth / 2, 450);
  ctx.fillText('Press S to enter the shop.', canvasWidth / 2, 500);
}

drawMenu();

function gameOver() {
  gameStarted = false;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const gameOverImage = new Image();
  gameOverImage.src = 'images/gameover.png';
  gameOverImage.onload = () => {
    ctx.drawImage(gameOverImage, 150, 100, 500, 150);
  };

  ctx.font = '40px sans-serif';
  ctx.fillStyle = '#f7bfbe';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff00';
  ctx.fillText('Score: ' + score, canvasWidth / 2, 300);

  ctx.fillStyle = 'yellow';
  ctx.fillText('Stars: ' + starScore, canvasWidth / 2, 400);

}

function equipUpgrade(upgradeIndex) {
  const upgrade = shopUpgrades[upgradeIndex];
  rocketImage.src = `images/${upgrade.name}.png`;
}

function purchaseOrEquip(upgradeIndex) {
  const upgrade = shopUpgrades[upgradeIndex];
  if (upgrade.purchased) {
    equipUpgrade(upgradeIndex);
  } else if (starScore >= upgrade.cost) {
    starScore -= upgrade.cost;
    upgrade.purchased = true;
    equipUpgrade(upgradeIndex);
  }

  if (shopShown) {
    drawShop();
  }
  
}

function drawShop() {
  gameStarted = false;
  shopShown = true;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.textAlign = 'left';
  ctx.font = '30px sans-serif';
  ctx.fillStyle = 'yellow';
  ctx.fillText('Stars: ' + starScore, canvasWidth - 130, 40);

  ctx.textAlign = 'center';
  ctx.font = '48px sans-serif';
  ctx.fillStyle = '#8904c2';
  ctx.fillText('Shop', canvasWidth / 2, 60);

  ctx.font = '30px sans-serif';
  ctx.fillStyle = '#8904c2';
  ctx.fillText('Type the number', canvasWidth / 2, 400);
  ctx.fillText('corresponding to an', canvasWidth / 2, 435);
  ctx.fillText('upgrade to purchase or', canvasWidth / 2, 470);
  ctx.fillText('equip it.', canvasWidth / 2, 505);

  for (const [i, upgrade] of shopUpgrades.entries()) {
    ctx.fillStyle = '#8904c2';
    ctx.fillRect(30 + i * (canvasWidth / 4), 100, 140, 180);
    ctx.fillStyle = '#d400e3';
    ctx.fillRect(36 + i * (canvasWidth / 4), 106, 128, 168);

    const image = new Image();
    image.src = `images/${upgrade.name}.png`;
    image.onload = () => {
      ctx.drawImage(image, 58 + i * (canvasWidth / 4), 130);
    };

    ctx.fillStyle = '#000000';
    ctx.font = '20px sans-serif';

    const descriptions = upgrade.description.split(" ");
    if (descriptions.length === 2) {
      for (const [j, description] of descriptions.entries()) {
        ctx.fillText(description, 100 + i * (canvasWidth / 4), 210 + j * 22);
      }
    } else {
      ctx.fillText(upgrade.description, 100 + i * (canvasWidth / 4), 220);
    }

    const costText = upgrade.purchased ? 'PURCHASED' : `${upgrade.cost} Stars`
    ctx.fillText(costText, 100 + i * (canvasWidth / 4), 260);

    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#f7bfbe';
    ctx.textAlign = 'center';
    ctx.fillText(i + 1, 100 + i * (canvasWidth / 4), 330);
  }

  ctx.font = '36px sans-serif';
  ctx.fillStyle = '#f7bfbe';
  ctx.textAlign = 'center';
  ctx.fillText('Press Q to exit.', canvasWidth / 2, 560);
}

// KEY EVENTS
document.body.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
document.body.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  if (e.key === 's') {
    drawShop();
  } else if ('1234'.indexOf(e.key) !== -1) {
    purchaseOrEquip(parseInt(e.key) - 1);
  }
  if (gameStarted) {
    if (e.key === 'q') {
      drawMenu();
    }
  } else {
    if (e.key === ' ') {
      if (shopShown) {
        continueGame();
      } else {
        start();
      }
    }
  }
});
