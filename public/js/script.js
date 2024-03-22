
const tags = [
    {id : 'score', text: 'Score: ', value: 0},
    {id : 'level', text: 'Level: ', value: 0},
    {id : 'message', text: 'Message: ', value: ''},
];

const buttons = [
    {id: "restart", name: "Restart", callback: "init()", text: "Restart: ", optionalKey: "[R / Del]", initDisplayNone: false},
    {id: "pause", name: "Pause", callback: "pause()", text: "Pause: ", optionalKey: "[Enter]", initDisplayNone: false},
    {id: "resume", name: "Resume", callback: "resume()", text: "Resume: ", optionalKey: "[Enter]", initDisplayNone: true},
];

const links = [
    {id: "snake", name: "Snake", url: "./snake.html"},
    {id: "tetris", name: "Tetris", url: "./tetris.html"},
    {id: "frogger", name: "Frogger", url: "./frogger.html"},
    {id: "tank", name: "Tank [Beta]", url: "./tank.html"},
    {id: "racing", name: "Racing", url: "./racing.html"}
]

const audios = [
    // {id: "bass", src: "./sound/bass.ogg"},
    {id: "click", src: "./sound/click.ogg"},
    {id: "gameover", src: "./sound/gameover.ogg"},
    {id: "move", src: "./sound/move.ogg"},
    {id: "point", src: "./sound/point.ogg"},
    // {id: "reset", src: "./sound/reset.ogg"},
    {id: "rotate", src: "./sound/rotate.ogg"},
    {id: "speedup", src: "./sound/speedup.ogg"},
    {id: "wrong", src: "./sound/wrong.ogg"}
];

function onPixel(x, y) {
    document.getElementById(`pixel_${x}_${y}`).className = "active";
}

function onFoodPixel(x, y) {
    document.getElementById(`pixel_${x}_${y}`).className = "food";
}

function offPixel(x, y) {
    document.getElementById(`pixel_${x}_${y}`).className = "";
}
/**
 * Generates the game screen by creating a container div and appending a table 
 * with 20 rows and 10 columns. Each cell in the table contains a span element 
 * with a unique id in the format `pixel_${xc}_${yc}`. The container div is 
 * then returned.
 *
 * @return {HTMLDivElement} The container div for the game screen.
 */
function setupGameScreen() {
    const containerDiv = document.createElement("div");
    const table = document.createElement("table");
    for (var yc = 0; yc < 20; yc++) {
        const tr = document.createElement("tr");
        for (var xc = 0; xc < 10; xc++) {
            const td = document.createElement("td");
            const span = document.createElement("span");
            span.id = `pixel_${xc}_${yc}`
            td.appendChild(span);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    containerDiv.appendChild(table);
    return containerDiv;
}

/**
 * Generates a result screen for the given name.
 *
 * @param {string} name - The name to be displayed on the result screen.
 * @return {HTMLElement} - The panelDiv element containing the result screen.
 */
function setupResultScreen(name) {
    const panelDiv = document.createElement("div");
    const table2 = document.createElement("table");
    table2.style="padding: 1em;";
    
    table2.appendChild(getTableRow((tr, td) => {
        const h1 = document.createElement("h1");
        h1.innerText = name + " Game";
        td.appendChild(h1);
    }));
    
    for(const tag of tags){
        table2.appendChild(getTableRow((tr, td) => {
            td.appendChild(getTextElement(null, tag.text, false));
            td.appendChild(getTextElement(tag.id, tag.value, true));
        }));
    }
    for(const btn of buttons){
        table2.appendChild(getTableRow((tr, td) => {
            td.appendChild(getTextElement(null, btn.text, false));
            td.appendChild(getButtonElement(btn.name, btn.callback));
            td.appendChild(getTextElement(null, btn.optionalKey, true));
            if (btn.initDisplayNone) {
                tr.style = "display: none;";
            }
            tr.id = btn.id;
        }));
    }
    table2.appendChild(getTableRow((tr, td) => {
        td.appendChild(document.createElement("hr"));
    }));
    table2.appendChild(getTableRow((tr, td) => {
        const h3 = document.createElement("h3");
        h3.innerText = "Other Games";
        td.appendChild(h3);
    }));
    
    for (const link of links) {
        table2.appendChild(getTableRow((tr, td) => {
            const a = document.createElement("a");
            a.href = link.url;
            a.innerText = link.name;
            if (name.toLowerCase() == link.id) {
                a.style = "font-weight: bold;";
            }
            td.appendChild(a);
        }));
    }
    panelDiv.appendChild(table2);
    return panelDiv;
    
}

/**
 * Sets up the game panel with the given name.
 *
 * @param {string} name - The name of the game panel.
 * @return {undefined} This function does not return a value.
 */
function setupGamePanel(name) {
    document.title = name + " | Bricks Game";
    const gamePanelDiv = document.getElementById("gamepanel");
    gamePanelDiv.appendChild(setupGameScreen());

    gamePanelDiv.appendChild(setupResultScreen(name));

    for (const audio of audios) {
        const srcTag = document.createElement("source");
        srcTag.src = audio.src;
        srcTag.type = "audio/ogg";
        const audioTag = document.createElement("audio");
        audioTag.id = audio.id;
        audioTag.appendChild(srcTag);
        document.body.appendChild(audioTag);
    }
}

function getTableRow(cb) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    cb(tr, td);
    tr.appendChild(td);
    return tr;
}

function getTextElement(id, name, isBold) {
    const text = document.createElement("text");
    if (id) {
        text.id = id;
    }
    text.innerText = name;
    if (isBold) {
        text.style = "font-weight: bold;";
    }
    return text;
}

function getButtonElement(name, callback) {
    const button = document.createElement("button");
    button.id = name.toLowerCase() + "btn";
    button.innerText = name;
    return button;
}

/**
 * Sets up a keyup event listener on the document object.
 *
 * @param {function} reloadFunc - The function to be called when the 'R' key or 'Delete' key is released.
 * @param {function} spaceFunc - The function to be called when the 'Space' key is released.
 * @param {function} upKeyFunc - The function to be called when the 'ArrowUp' key or 'KeyW' key is released.
 * @param {function} downKeyFunc - The function to be called when the 'ArrowDown' key or 'KeyS' key is released.
 * @param {function} leftKeyFunc - The function to be called when the 'ArrowLeft' key or 'KeyA' key is released.
 * @param {function} rightKeyFunc - The function to be called when the 'ArrowRight' key or 'KeyD' key is released.
 */
function setupKeyUpListener(
    reloadFunc,
    spaceFunc,
    upKeyFunc,
    downKeyFunc,
    leftKeyFunc,
    rightKeyFunc
) {
    document.addEventListener('keyup', (e) => {
        if (e.code == 'Enter') {
            spaceFunc();
        } else if ((e.code == 'ArrowUp' || e.code == 'KeyW')) {
            upKeyFunc();
        } else if ((e.code == 'ArrowDown' || e.code == 'KeyS')) {
            downKeyFunc();
        } else if ((e.code == 'ArrowLeft' || e.code == 'KeyA')) {
            leftKeyFunc();
        } else if ((e.code == 'ArrowRight' || e.code == 'KeyD')) {
            rightKeyFunc();
        } else if ((e.code == 'KeyR' || e.code == 'Delete')) {
            reloadFunc();
        }
    });
}