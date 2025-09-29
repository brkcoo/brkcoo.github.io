const fishDex = {
  basculin: {
    weightRange: [50, 100],
    lengthRange: [50, 100],
    valueMultiplier: 1,
    image: "basculin.jpg",
  },
  tentacool: {
    weightRange: [50, 100],
    lengthRange: [50, 100],
    valueMultiplier: 1,
    image: "tentacool.jpg",
  },
  corphish: {
    weightRange: [50, 100],
    lengthRange: [50, 100],
    valueMultiplier: 1,
    image: "corphish.jpg",
  },
  kyogre: {
    weightRange: [50, 100],
    lengthRange: [50, 100],
    valueMultiplier: 3,
    image: "kyogre.jpg",
  },
  whiscash: {
    weightRange: [50, 100],
    lengthRange: [50, 100],
    valueMultiplier: 2,
    image: "whiscash.jpg",
  },
  feebas: {
    weightRange: [50, 100],
    lengthRange: [50, 100],
    valueMultiplier: 2,
    image: "feebas.jpg",
  },
};

class Fish {
  static activeFish = [];
  element;
  image;

  dir;
  velocity;

  weight;
  length;
  value;

  constructor(template) {
    const { weightRange, lengthRange, valueMultiplier, image } = template;

    this.weight = randomRange(weightRange[0], weightRange[1]).toFixed(2);
    this.length = randomRange(lengthRange[0], lengthRange[1]).toFixed(2);
    this.value = this.weight * this.length * valueMultiplier;

    this.dir = Math.random() >= 0.5 ? 1 : -1;
    this.velocity = randomRange(1, 8);

    this.element = document.createElement("img");
    this.element.className = "fishie";
    this.element.src = "images/fish/" + image;
  }
  destroy() {
    var i = Fish.activeFish.indexOf(this);
    Fish.activeFish.splice(i, 1);
    this.element.remove();
  }
  move = () => {
    if (!this.element.isConnected) return;
    let left = parseFloat(this.element.style.left) || 0;
    left += this.velocity * this.dir;
    this.element.style.left = left + "px";

    const rect = this.element.getBoundingClientRect();
    if (rect.right < -250 || rect.left > window.innerWidth + 250) {
      this.destroy();
      return;
    }

    requestAnimationFrame(this.move);
  };

  static spawn() {
    // create new fish object
    let values = Object.values(fishDex);
    let template = values[randomRange(0, values.length - 1)];
    const fish = new Fish(template);

    // find where to place in document
    var [top, bot] = [
      window.scrollY + 100,
      window.innerHeight + window.scrollY + 100,
    ];
    var y = randomRange(bot, top);
    fish.element.style.top = `${y}px`;

    // left or right side
    fish.element.style.left =
      fish.dir === 1 ? "-200px" : `${window.innerWidth + 200}px`;

    body.append(fish.element);
    Fish.activeFish.push(fish);

    fish.move();
  }
}

const body = document.querySelector("body");

async function goFishing(step) {
  window.scrollBy(0, step);

  if (Math.random() < 0.015 && step > 0) {
    Fish.spawn();
  }

  if (
    window.innerHeight + window.scrollY < document.body.scrollHeight &&
    step > 0
  ) {
    requestAnimationFrame(function () {
      goFishing(4);
    });
  } else if (window.scrollY != 0) {
    requestAnimationFrame(function () {
      goFishing(-4);
    });
  }
}

const hook = (() => {
  const hookElement = document.getElementById("hook");

  function checkCollision(fish) {
    const rect1 = hookElement.getBoundingClientRect();
    const rect2 = fish.element.getBoundingClientRect();
    var overlap = !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
    if (overlap) return true;
    return false;
  }

  function update() {
    for (const fish of Fish.activeFish) {
      if (checkCollision(fish)) {
        fish.destroy();
        console.log('fish caught');
      }
    }
    requestAnimationFrame(update);
  }

  update();
})();

function randomRange(min, max) {
  // inclusive
  return Math.floor(Math.random() * (max - min + 1) + min);
}

window.scrollTo(0, 0);
goFishing(4);
