class Colony {
    constructor() {
        this.quadTreeCapacity = 10;

        this.ants = [];
        this.antsTree = new QuadTree(new Rectangle(0, 0, width, height), this.quadTreeCapacity);
        this.antHills = new QuadTree(new Rectangle(0, 0, width, height), this.quadTreeCapacity);
        this.paths = {
            toFood: new QuadTree(new Rectangle(0, 0, width, height), this.quadTreeCapacity),
            toHome: new QuadTree(new Rectangle(0, 0, width, height), this.quadTreeCapacity)
        }

        this.antColour = [random(0, 255), random(0, 255), random(0, 255)]
    }

    initialise() {

        this.antHills.insert(new AntHill(random(0 + 100, width - 100), random(0 + 100, height - 100)))

    }

    run() {

        this.antsTree = new QuadTree(new Rectangle(0, 0, width, height), this.quadTreeCapacity);
        this.ants.forEach(e => this.antsTree.insert(e))
        this.ants.forEach(e => e.run(this.antsTree, this.paths, this.antHills, this.antColour))

        this.paths.toHome.runEachItem()
        this.paths.toHome = this.paths.toHome.filterTree('isGone', true)

        this.paths.toFood.runEachItem()
        this.paths.toFood = this.paths.toFood.filterTree('isGone', true)

        this.antHills.runEachItem(this.ants, this.antHills)
    }
}