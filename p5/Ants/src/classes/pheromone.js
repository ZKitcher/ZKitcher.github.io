class Pheromone {
    constructor(pos, type) {
        this.position = createVector(pos.x, pos.y);
        this.strength = 20;
        this.type = type;
        this.remove = false;
    }

    run() {
        this.update();
        // if (this.type === 'TOFOOD') this.render();
        // this.render();
    }

    update() {
        if (frameCount % 60 === 0) {
            this.strength--;
        }

        if (this.strength === 0) {
            this.remove = true;
        }
    }

    render() {
        push()
        if (this.type === 'TOHOME') {
            stroke(255, 255, 255, (this.strength / 20) * 255);
        }
        if (this.type === 'TOFOOD') {
            stroke(0, 255, 0, (this.strength / 20) * 255);
        }
        point(this.position.x, this.position.y)
        pop()
    }
}
