class Food {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.isEaten = false;
        this.size = random(10, 25)
        this.stockpile = this.size * 10;
    }

    run(ants) {
        this.update(ants)
        this.render();
    }

    update(ants) {
        for (let i = 0; i < ants.length; i++) {
            let ant = ants[i];

            rectMode(CENTER);
            let range = new Rectangle(ant.position.x, ant.position.y, ant.perceptionRadius, ant.perceptionRadius);
            let points = foods.query(range);

            for (let p of points) {
                let d = p5.Vector.dist(this.position, ant.position);
                if (d < this.size) {
                    if (!ant.status.hasFood) {
                        ant.status.hasFood = true;
                        ant.velocity.mult(-1);
                        ant.enablePheromones(p.size / 25 * points.length);
                        this.stockpile--;
                        break;
                    }
                }
            }
        }

        if (this.stockpile < 1) this.isEaten = true;
    }

    render() {
        fill(0, 255, 0);
        stroke(200);
        ellipse(this.position.x, this.position.y, this.size, this.size);
    }
}