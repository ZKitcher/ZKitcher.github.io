let colonies = [];
let foods;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);

    let boundary = new Rectangle(0, 0, width, height);

    foods = new QuadTree(boundary, 2);

    for (let i = 0; i < 5; i++) {
        foods.insert(new Food(random(100, width - 100), random(100, height - 100)))
    }

    for (let i = 0; i < 1; i++) {
        let colony = new Colony()
        colony.initialise()
        colonies.push(colony)
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

}

const run = () => {

    colonies.forEach(e => {
        e.run()
        foods.runEachItem(e.ants)
    })
    foods = foods.filterTree('isEaten', true)

    if (!foods.getEachItem().length) {
        foods = new QuadTree(new Rectangle(0, 0, width, height), 2);
        for (let i = 0; i < 10; i++) {
            foods.insert(new Food(random(100, width - 100), random(100, height - 100)))
        }
    }
}

function mousePressed() {
    //ants.push(new Ant(mouseX, mouseY))
    foods.insert(new Food(mouseX, mouseY));
}

const mouseHeld = () => {
    //walls.push(new Wall(mouseX, mouseY))
}