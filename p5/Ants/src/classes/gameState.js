class GameState {
    constructor() {
        this.hills = [];
        this.food = [];
    }

    run() {
        this.hills.forEach(e => e.run(this.food));
        this.food.forEach(e => e.run());
        this.removeEatenFood();
        this.render();
    }

    addHill() {
        this.hills.push(new AntHill)
    }

    addFood(num = 1, x, y) {
        for (let i = 0; i < num; i++) {
            this.food.push(new Food(x || random(width), y || random(height)))
        }
    }

    removeEatenFood() {
        this.food = this.food.filter(e => e.isEaten === false);

        if (this.food.length === 0) {
            this.addFood(5)
        }
    }

    render() {
    }
}
