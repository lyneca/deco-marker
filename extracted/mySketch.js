/*
 * Particle Brush - click and drag, multitouch support
 *  ~ lyneca
 */

const PARTICLE_SIZE = 10;
const FRICTION = 0.97;
const OPACITY = 0.1
const SPAWN_SPREAD = 2;
const NUM_SPAWN = 4;

const SPEED_CAP = 10;

const DRAW_GAP = 1;

const touchDifferences = []

const particles = []

class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.angle = atan2(vy, vx);
        this.speed = min(SPEED_CAP, dist(vx, vy, 0, 0));
        this.lastSpeed = this.speed;
    }

    update() {
        this.lastX = this.x;
        this.lastY = this.y;
        this.lastSpeed = this.speed;

        this.speed *= FRICTION;

        if (this.angle > TWO_PI) this.angle -= TWO_PI;
        if (this.angle < 0) this.angle += TWO_PI;

        this.angle += (noise(this.x / 100, this.y / 100) * TWO_PI - PI) * 0.05

        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;

        if (this.speed < 1) {
            particles.splice(particles.indexOf(this), 1)
        }
    }

    draw() {
        noStroke();
        const angle = atan2(this.y - this.lastY, this.x - this.lastX);
        const distance = dist(this.x, this.y, this.lastX, this.lastY);
        const from = color(map(this.lastSpeed, 0, SPEED_CAP, 180, 300), 100, 100);
        const to = color(map(this.speed, 0, SPEED_CAP, 180, 300), 100, 100);

        for (let i = 0; i < distance; i += 1) {
            fill(lerpColor(from, to, i / distance));
            ellipse(
                this.lastX + cos(angle) * i,
                this.lastY + sin(angle) * i,
                PARTICLE_SIZE
            );
        }
    }
}

function makeParticles(x, y, lx, ly) {
    for (let i = 0; i < NUM_SPAWN; i++) {
        const p = new Particle(x, y, x - lx + random(-SPAWN_SPREAD, SPAWN_SPREAD), y - ly + random(-SPAWN_SPREAD, SPAWN_SPREAD));

        particles.push(p);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    background(252);
    frameRate(120);
    colorMode(HSB);
}

function draw() {
    // if (particles.length === 0) background(360, OPACITY);
    if (touches.length > 0) {
        touches.forEach(t => {
            const lastX = touchDifferences[t.id].x;
            const lastY = touchDifferences[t.id].y;

            if (abs(t.x - lastX) + abs(t.y - lastY) > 0) {
                makeParticles(t.x, t.y, lastX, lastY);
                touchDifferences[t.id].x = t.x;
                touchDifferences[t.id].y = t.y;
            }
        })
    } else if (mouseIsPressed && abs(mouseX - lastMouseX) + abs(mouseY - lastMouseY) > 0) {
        makeParticles(mouseX, mouseY, lastMouseX, lastMouseY)
    }
    lastMouseX = mouseX;
    lastMouseY = mouseY;

    particles.forEach(p => {
        p.update();
        p.draw();
    });
}

function touchStarted(event) {
    const [touch] = event.changedTouches;

    touchDifferences[touch.identifier] = {
        x: touch.clientX,
        y: touch.clientY
    }
}

function touchEnded(event) {
    const [touch] = event.changedTouches;

    delete touchDifferences[touch.identifier];
}
