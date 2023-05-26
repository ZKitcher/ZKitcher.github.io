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

const updateGround = () => {
    switch (TRACK) {
        case TRACK_TYPE.Asphalt:
            groundColour = 30;
            break;
        case TRACK_TYPE.Dirt:
            groundColour = [66, 46, 33];
            break;
        case TRACK_TYPE.Snow:
            groundColour = [35, 62, 79];
            break;
        case TRACK_TYPE.Ice:
            groundColour = [56, 92, 90];
            break;
        default:
            groundColour = 51;
    }
}

let TRACK = TRACK_TYPE.Asphalt;
let GAMEMODE = SCORE_MODES.speed;
let groundColour;
updateGround();
let startingPos = { x: null, y: null };

const buildWallTree = () => {
    walls = new QuadTree(new BoundingBox(0, 0, width * 2, height * 2), 10);
}

function setup() {
    checkFramerate();
    createCanvas(window.innerWidth, window.innerHeight);

    buildWallTree();
    racetrack = new RaceTrack();
    cars = new NEATPopulation(Car, 100);
    cars.mutateOutputActivation(actFunc.tanh, 1);
    cars.styling.fontColour = '#FFF';

    if (width < 1000) {
        cars.toggleTopAgentsView();
        cars.fastForward(1);
        cars.toggleBrainRender();
    }
}

function draw() {
    if (customLoop) setTimeout(redraw, frameInterval);
    push();
    background(51);
    pop();

    run();
    render()
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
}

const render = () => {
    renderText();
}

const renderText = () => {
    // Render text at the bottom left of the screen.
    push();
    fill('#FFF');
    [
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
    ].reverse().forEach((e, i) => text(e, 10, height - (13 * (i + 1))));
    pop();
}

function keyPressed(e) {
    // Switch case for key pressed event listeners.
    switch (e.key?.toLowerCase() || e.toLowerCase()) {
        case 'e':
            cars.fastForward(1);
            break;
        case 'q':
            cars.restart();
            cars.mutateOutputActivation(actFunc.tanh, 1);
            break;
        case 'p':
            cars.togglePause();
            break;
        case 'b':
            cars.toggleBrainRender();
            break;
        case 's':
            startingPos.x = mouseX;
            startingPos.y = mouseY;
            clog(`New Starting Position:`, startingPos);
            cars.rerun();
            break;
        case 't':
            racetrack.getPremadeTrack();
            cars.rerun();
            break;
        case '0':
            racetrack.clearTrack();
            break;
        case '.':
            racetrack.upRes();
            cars.rerun();
            break;
        case ',':
            racetrack.downRes();
            cars.rerun();
            break;
        case 'g':
            racetrack.generateTrack();
            cars.rerun();
            break;
        case 'c':
            createCanvas(window.innerWidth, window.innerHeight);
            break;
        case 'a':
            cars.toggleTopAgentsView();
            break;
        case 'o':
            cars.mutateOutputActivation('tanh', 1);
            break;
        case '1':
            GAMEMODE = SCORE_MODES.speed;
            cars.topFitness = 0;
            break;
        case '2':
            GAMEMODE = SCORE_MODES.drift;
            cars.topFitness = 0;
            break;
        case '`':
            const object = Object.keys(TRACK_TYPE);
            let index = object.findIndex(key => TRACK_TYPE[key] === TRACK) + 1;
            if (index === object.length) index = 0;
            TRACK = TRACK_TYPE[object[index]];
            updateGround();
            break;
        case 'n':
            cars.nextBest();
            break;
    }
}

function mouseClicked() {
    racetrack.updateMap(mouseX, mouseY);
}

const completedGeneration = () => { }

const createNEATGenome = (id) => new NEATGenome(10, 2, id);

const getObjectKey = (obj, value) => Object.keys(obj).find(key => obj[key] === value);