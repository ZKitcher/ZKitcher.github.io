let gameState;

function setup() {
    checkFramerate();
    createCanvas(window.innerWidth, window.innerHeight);

    gameState = new GameState;

    gameState.addHill();
    // gameState.addHill();
    // gameState.addHill();
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
    gameState.run();
}

const render = () => {
    renderText();
}

const renderText = () => {
    push();
    fill('#FFF');
    [
        `Framerate : ${frameRate().toFixed(0)}`,
    ].reverse().forEach((e, i) => text(e, 10, height - (13 * (i + 1))));
    pop();
}


function keyPressed(e) {
    // Switch case for key pressed event listeners.
    switch (e.key?.toLowerCase() || e.toLowerCase()) {
        case 'c':
            createCanvas(window.innerWidth, window.innerHeight);
            break;
    }
}

function mouseClicked() {
    // Function fired on mouse click events.

    gameState.addFood(1, mouseX, mouseY);

}