let ants = [];
let antsTree;
let foods;
let antHills;
let walls;

let paths = {
    toFood: [],
    toHome: []
}
const quadTreeCapacity = 10;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);

    let boundary = new Rectangle(0, 0, width, height);
    paths.toHome = new QuadTree(boundary, quadTreeCapacity);
    paths.toFood = new QuadTree(boundary, quadTreeCapacity);
    foods = new QuadTree(boundary, quadTreeCapacity);
    antHills = new QuadTree(boundary, quadTreeCapacity);
    antsTree = new QuadTree(boundary, quadTreeCapacity);

    const antHillLoc = {
        x: random(100, width - 100),
        y: random(100, height - 100)
    }

    for (let i = 0; i < 1; i++) {
        antHills.insert(new Point(new AntHill(antHillLoc.x, antHillLoc.y)))
    }
    for (let i = 0; i < 150; i++) {
        // ants.push(new Ant(antHillLoc.x, antHillLoc.y))
    }
    for (let i = 0; i < 5; i++) {
        foods.insert(new Point(new Food(random(100, width - 100), random(100, height - 100))))
    }
}

function draw() {
    push()
    background(51);
    text(int(getFrameRate()), width - 30, 30);
    pop()

    run()

    if (mouseIsPressed === true) {
        mouseHeld();
    }


    rectMode(CENTER);

    //paths.toHome.show();

    /*
    stroke(0, 255, 0);
    let range = new Rectangle(mouseX, mouseY, 100, 100);
    range.show();

    if (mouseX < width && mouseY < height) {


        if (range.x > width - range.w / 2) {


            console.log('FIGHT')

            rectMode(CORNER);
            let wrappingBound = new Rectangle(range.x - width, range.y, range.w, range.h)
            wrappingBound.show();

            if (wrappingBound.x < wrappingBound.w / 2) {
                console.log('ALERT')
            }

        }
    }
    */

}

const run = () => {

    antsTree = new QuadTree(new Rectangle(0, 0, width, height), quadTreeCapacity);
    ants.forEach(e => antsTree.insert(new Point(e)))
    ants.forEach(e => e.run(antsTree))
    //ants.forEach(e => e.run(antsTree))

    foods.runEachItem()
    foods = foods.filterTree('isEaten', true)

    paths.toHome.runEachItem()
    paths.toHome = paths.toHome.filterTree('isGone', true)

    paths.toFood.runEachItem()
    paths.toFood = paths.toFood.filterTree('isGone', true)

    antHills.runEachItem()

    if (!foods.getEachItem().length) {
        foods = new QuadTree(new Rectangle(0, 0, width, height), quadTreeCapacity);
        for (let i = 0; i < 10; i++) {
            foods.insert(new Point(new Food(random(100, width - 100), random(100, height - 100))))
        }
    }
}

function mousePressed() {
    //ants.push(new Ant(mouseX, mouseY))
    foods.insert(new Point(new Food(mouseX, mouseY)));
}

const mouseHeld = () => {
    //walls.push(new Wall(mouseX, mouseY))
}