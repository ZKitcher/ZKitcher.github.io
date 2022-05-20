class Food {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.isEaten = false;
        this.stockpile = 500;
    }

    run() {
        this.update(ants)
        this.render();
    }

    update(ants) {
        let currentStock = this.stockpile;
        let currentPos = this.position;

        ants.forEach(ant => {
            rectMode(CENTER);
            let range = new Rectangle(ant.position.x, ant.position.y, 16, 16);
            let points = foods.query(range);

            for (let p of points) {
                let d = p5.Vector.dist(currentPos, p.item.position);
                if (d < 16) {
                    if (!ant.status.hasFood) {
                        ant.status.hasFood = true;
                        ant.enablePheromones();
                        currentStock--;
                        break;
                    }
                }
            }
        })

        this.stockpile = currentStock;
        if (this.stockpile < 0) this.isEaten = true;
    }

    render() {
        fill(0, 255, 0);
        stroke(200);
        ellipse(this.position.x, this.position.y, 16, 16);
    }
}