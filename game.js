const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = 800;
const canvasHeight = 600;
const scoreHeight = 40;
const healthHight = 80;

ctx.font = '24px sans-serif';

const keys = [];

let tick = 0;
let gameStarted = false;

let score = 0;
let starScore = 0;
let health = 100;

const rocketWidth = 66;
const rocketHeight = 46;

const rocketImage = new Image();
rocketImage.src = 'images/rocket.png';
const rocket = { x: 0, y: 0, speed: 0 };

const starWidth = 25;
const starHeight = 25;
const starImage = new Image();
starImage.src = 'images/star.png';

const numStars = 20;
let stars = [];

const asteroidWidth = 115;
const asteroidHeight = 108;
const asteroidImage = new Image();
asteroidImage.src = 'images/asteroid.png';

const numAsteroids = 3;
let asteroids = [];

function objectsIntersect(a, b) {

    const aLeftOfB = a.x + a.width < b.x;
    const aRightOfB = a.x > b.x + b.width;
    const aAboveB = a.y + a.height < b.y;
    const aBelowB = a.y > b.y + b.height;

    return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
  }

  function initRocket() {
    rocket.width = rocketWidth;
    rocket.height = rocketHeight;
    rocket.x = 50;
    rocket.y = (canvasHeight - rocketHeight) / 2;
    rocket.starCount = 0;
    rocket.asteroidCount = 0;
  }

  function drawRocket() {
    ctx.drawImage(rocketImage, rocket.x, rocket.y);
  }

  function getRandomY(objectHeight) {
    return scoreHeight + objectHeight + Math.random() * (canvasHeight - objectHeight - scoreHeight - healthHight);
  }

  function initStars() {
    for (let i = 0; i < numStars; i++) {
      const x = i * (canvasWidth / numStars);
      const y = getRandomY(starHeight);
      const width = starWidth;
      const height = starHeight;
      const speedx = -1;
      const show = true;
      const star = { x, y, width, height, speedx, show }
      stars.push(star);
    }
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

  function initAsteroids() {
    for (let i = 0; i < numAsteroids; i++) {
      const x = (i + 1) * (canvasWidth / (numAsteroids - 1));
      const y = getRandomY(asteroidHeight - 20);
      const width = asteroidWidth;
      const height = asteroidWidth; //since it's spinning, using larger value
      const speedx = -1;
      const dir = 0;
      const asteroid = { x, y, width, height, speedx, dir }
      asteroids.push(asteroid);
    }
  }

  function drawAsteroids() {
    for (const asteroid of asteroids) {
      asteroid.x += asteroid.speedx;

      if (objectsIntersect(rocket, asteroid)) {
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

    ctx.font = '24px sans-serif';
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

  function moveRocket() {
    if (keys['ArrowUp']) {
      if (rocket.y > 0 + scoreHeight) {
        rocket.y += -1;
      }
    } else if (keys['ArrowDown']) {
      if (rocket.y < canvasHeight - rocketHeight) {
        rocket.y += 1;
      }
    } else if (keys['ArrowLeft']) {
      // rocket.x += -1;
    } else if (keys['ArrowRight']) {
      // rocket.x += 1;
    }
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

  function start() {
    if (gameStarted) return;

    gameStarted = true;

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
    titleImage.onload = function() {
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
    gameOverImage.onload = function() {
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

  // key events
  document.body.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });
  document.body.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    if (gameStarted) {
      if (e.key === 'q') {
        drawMenu();
      } 
    } else {
      if (e.key === ' ') {
        start();
      }
    }
  });
