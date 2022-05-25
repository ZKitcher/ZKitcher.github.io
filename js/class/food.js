class Food {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.isEaten = false;
        this.stockpile = 250;
    }

    run() {
        this.update(ants)
        this.render();
    }

    update(ants) {
        for (let i = 0; i < ants.length; i++) {
            let ant = ants[i];

            rectMode(CENTER);
            let range = new Rectangle(ant.position.x, ant.position.y, 16, 16);
            let points = foods.query(range);

            for (let p of points) {
                let d = p5.Vector.dist(this.position, p.item.position);
                if (d < 16) {
                    if (!ant.status.hasFood) {
                        ant.status.hasFood = true;
                        ant.enablePheromones();
                        ant.velocity.mult(-1)
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
        ellipse(this.position.x, this.position.y, 16, 16);
    }
}