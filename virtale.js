'use strict';

window.onerror = alert;

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

let game = {};
let toUpdate = [];
let keyPressed = {};
let keyActions = {};

const gameLoop = () => {
  for (const action in keyActions) {
    if (keyPressed[action]) {
      keyActions[action]();
    }
  }

  ctx.reset();
  toUpdate.forEach(e => e.update());
  for (const entity of Object.values(game)) {
    if (entity instanceof Object) {
      entity.update();
    }
  }

  window.requestAnimationFrame(gameLoop);
};

gameLoop();

class FillRect extends HTMLElement {
  static observedAttributes = ['x', 'y', 'w', 'h', 'color'];

  constructor() {
    super();
  }

  update() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }

  connectedCallback() {
    game[this.attributes[0].name] = this;
    this.update();
  }

  attributeChangedCallback() {
    this.update();
  }

  get x() { return +eval(this.getAttribute('x')); }
  set x(x) { this.setAttribute('x', eval(x)); }
  get y() { return +eval(this.getAttribute('y')); }
  set y(y) { this.setAttribute('y', eval(y)); }
  get w() { return +eval(this.getAttribute('w')); }
  set w(w) { this.setAttribute('w', eval(w)); }
  get h() { return +eval(this.getAttribute('h')); }
  set h(h) { this.setAttribute('h', eval(h)); }
  get color() { return this.getAttribute('color'); }
  set color(color) { this.setAttribute('color', color); }
}

class FillCircle extends HTMLElement {
  static observedAttributes = ['x', 'y', 'radius', 'color'];

  constructor() {
    super();
  }

  update() {
    if (this.radius > 0) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }
  }

  connectedCallback() {
    game[this.attributes[0].name] = this;
    this.update();
  }

  attributeChangedCallback() {
    this.update();
  }

  get x() { return +eval(this.getAttribute('x')); }
  set x(x) { this.setAttribute('x', eval(x)); }
  get y() { return +eval(this.getAttribute('y')); }
  set y(y) { this.setAttribute('y', eval(y)); }
  get radius() { return +eval(this.getAttribute('radius')); }
  set radius(radius) { this.setAttribute('radius', eval(radius)); }
  get color() { return this.getAttribute('color'); }
  set color(color) { this.setAttribute('color', color); }
}

class SetVar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    for (const attr of this.attributes) {
      game[attr.name] = Function(`return ${attr.value}`).bind(game)();
    }
  }
}

class GameLoop extends HTMLElement {
  constructor() {
    super();

    this.action = this.textContent;
    this.textContent = '';
  }

  update() {
    Function(this.action).bind(game)();
  }

  connectedCallback() {
    toUpdate.push(this);
  }
}

class SetKey extends HTMLElement {
  constructor() {
    super();

    this.action = this.textContent;
    this.textContent = '';
  }

  connectedCallback() {
    document.addEventListener('keydown', e => {
      if (this.hasAttribute('norepeat')) {
        if (e.key.toLowerCase() === this.attributes[0].name) {
          Function(this.action).bind(game)();
        }
      } else {
        keyPressed[e.key.toLowerCase()] = true;
        keyActions[this.attributes[0].name] = Function(this.action).bind(game);
      }
    });

    document.addEventListener('keyup', e => {
      keyPressed[e.key.toLowerCase()] = false;
    });
  }
}

customElements.define('set-var', SetVar);
customElements.define('fill-rect', FillRect);
customElements.define('fill-circle', FillCircle);
customElements.define('game-loop', GameLoop);
customElements.define('set-key', SetKey);
