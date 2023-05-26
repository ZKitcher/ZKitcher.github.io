class Food {
    constructor(x = random(width), y = random(height)) {
        this.position = createVector(x, y);
        this.isEaten = false;
        this.size = random(10, 25)
        this.stockpile = this.size * 10;
    }

    run() {
        this.update();
        this.render();
    }

    update() {
        if (this.stockpile < 1) {
            this.isEaten = true;
        }
    }

    render() {
        push()
        fill(0, 255, 0);
        stroke(200);
        translate(this.position.x, this.position.y);
        circle(0, 0, this.stockpile / 10)
        pop()
    }
}
