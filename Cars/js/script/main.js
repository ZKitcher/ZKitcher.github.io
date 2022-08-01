// let myCar;
let cars;
let racetrack;
let walls;
let target;

const SCORE_MODES = {
    speed: 'SPEED',
    drift: 'DRIFT'
}

const TRACK_TYPE = {
    Asphalt: 1.5,
    Dirt: 0.75,
    Snow: 0.4,
    Ice: 0.2
}

// let TRACK = TRACK_TYPE.asphalt;
let TRACK = TRACK_TYPE.Dirt;
// let GAMEMODE = SCORE_MODES.speed;
let GAMEMODE = SCORE_MODES.drift;

let startingPos = { x: 150, y: 200 }

const buildWallTree = () => {
    walls = new QuadTree(new BoundingBox(0, 0, width * 2, height * 2), 10);
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    buildWallTree();
    racetrack = new RaceTrack();
    cars = new NEATPopulation(Car, 100)
    cars.mutateOutputActivation('tanh', 0.5)
    cars.styling.fontColour = '#FFF';

    if (width < 1000) {
        cars.toggleTopAgentsView();
        cars.fastForward(1);
        cars.toggleBrainRender();
    }

    // myCar = new Car()
}

function draw() {
    push();
    background(51);
    pop();
    run();
}

const run = () => {
    cars.run();
    // myCar.run();
    racetrack.run();

    if (keyIsDown(187)) {
        racetrack.addToTrack(mouseX, mouseY);
    }
    if (keyIsDown(189)) {
        racetrack.removeTrack(mouseX, mouseY);
    }

    renderText()

}

const renderText = () => {
    const textLabel = [
        `Game Mode: ${GAMEMODE}`,
        `Track Type: ${getObjectKey(TRACK_TYPE, TRACK)}`,
        `Evaluate: E`,
        `Restart: Q`,
        `Pause: P`,
        `Draw Brain: B`,
        `New Start Pos: S`,
        `Generate Random Track: G`,
        `Premade Track: T`,
        `Clear Track: 0`,
        `+25 Track Resolution: >`,
        `-25 Track Resolution: <`,
        `Add Track: +`,
        `Remove Track: -`,
        `Show top Agents: A`,
        `Resize canvase to window: C`,
        `Framerate : ${frameRate().toFixed(0)}`
    ]
    push()
    fill('#FFF')
    textLabel.reverse().forEach((e, i) => {
        text(e, 10, height - (13 * (i + 1)));
    })
    pop()
}


function keyPressed() {
    if (key === 'e') {
        cars.fastForward(1);
    }
    if (key === 'q') {
        cars.restart()
    }
    if (key === 'p') {
        cars.togglePause()
    }
    if (key === 'b') {
        cars.toggleBrainRender();
    }
    if (key === 's') {
        startingPos.x = mouseX
        startingPos.y = mouseY
        console.log(`New Starting Position:`, startingPos)
        cars.rerun();
    }
    if (key === 't') {
        racetrack.getPremadeTrack()
        cars.rerun()
    }
    if (key === '0') {
        racetrack.clearTrack()
    }
    if (key === '.') {
        racetrack.upRes()
        cars.rerun()
    }
    if (key === ',') {
        racetrack.downRes()
        cars.rerun()
    }
    if (key === 'g') {
        racetrack.generateTrack()
        cars.rerun()
    }
    if (key === 'c') {
        createCanvas(window.innerWidth, window.innerHeight);
    }
    if (key === 'a') {
        cars.toggleTopAgentsView();
    }
    if (key === 'o') {
        cars.mutateOutputActivation('tanh', 1);
    }
    if (key === '1') {
        GAMEMODE = SCORE_MODES.speed;
        cars.topFitness = 0;
    }
    if (key === '2') {
        GAMEMODE = SCORE_MODES.drift;
        cars.topFitness = 0;
    }
    if (key === '`') {
        const object = Object.keys(TRACK_TYPE)
        let index = object.findIndex(key => TRACK_TYPE[key] === TRACK) + 1;
        if (index === object.length) index = 0
        TRACK = TRACK_TYPE[object[index]]
    }
    if (key === 'n') {
        cars.nextBest();
    }
}

function mouseClicked() {
    racetrack.updateMap(mouseX, mouseY)
}

const completedGeneration = () => { }

const createMLObjectBrain = (id) => new NEATGenome(10, 2, id);

const getObjectKey = (obj, value) => Object.keys(obj).find(key => obj[key] === value);