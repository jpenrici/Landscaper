/*
    Landscaper - Experimental
*/

// Elemento padrão
var model = {
    x: 0,
    y: 0,
    width: 64,
    height: 64,
    srcX: 0,
    srcY: 0,
    srcW: 64,
    srcH: 64,
    visible: true,
    selected: false,
    draggable: true,
    label: undefined,

    left: function() { return this.x; },
    right: function() { return this.x + this.width; },
    top: function() { return this.y; },
    bottom: function() { return this.y + this.height; },
};

// Controle
var loop = {
    animation: false,

    animate: function() {
        if (loop.animation) {
            render();
            window.requestAnimationFrame(loop.animate);
        }
    },

    start: function() {
        loop.animation = true;
        window.performance.now();
        window.requestAnimationFrame(loop.animate);
        console.log("Loop started ...");
    },

    stop: function() {
        loop.animation = false;
        console.log("Loop stoped ...");
    }
};

// Canvas
var canvas = document.getElementById("landscape");
var ctx = canvas.getContext("2d");
canvas.width = 1200;
canvas.height = 500;

var background = new Image();
background.src = "../images/bg.png";
var limit = { left: 150, right: 1135, top: 10, bottom: 435 };

var image = new Image();
image.src = "../images/plants.png";
image.rows = 2;
image.columns = 7;

// Eventos
window.addEventListener("keydown", handleKeyPress, false);
window.addEventListener("mouseup", mouseupHandler, false);
canvas.addEventListener("mousemove", mousemoveHandler, false);
canvas.addEventListener("mousedown", mousedownHandler, false);

// Elementos
var elements = [];

// Mouse
var mouseX = 0;
var mouseY = 0;
var oldMouseX = 0;
var oldMouseY = 0;

// Sprite Atual
var dragElem = null;
var delElem = false;

// Ativar
init();
loop.start();

// FUNÇÔES
function init() {

    // Menu - posição no Canvas
    var menu = { x: 12, y: 40 };

    // Sprites do Menu
    for (var i = 0; i < image.rows; i++) {
        for (var j = 0; j < image.columns; j++) {
            var num = (i * image.columns) + j;
            var obj = Object.create(model);
            obj.label = "original_" + (num).toString();
            obj.srcY = i * obj.srcH;
            obj.srcX = j * obj.srcW;
            obj.x = menu.x + (i * obj.srcW);
            obj.y = menu.y + (j * obj.srcH);
            obj.draggable = false;
            elements.push(obj);
            console.log("loading", obj.label, "...");
        }
    }

    console.log(elements.length, "elements");

    render();
}

function clone(element) {

    if (!loop.animation)
        return;

    // Clonar element do Menu
    var base = { x: 160, y: 20 };
    var obj = Object.create(model);
    obj.label = element.label.replace("original", "clone");
    obj.srcY = element.srcY;
    obj.srcX = element.srcX;
    obj.x = base.x;
    obj.y = base.y;
    obj.draggable = true;
    elements.push(obj);

    console.log(elements.length, "elements");
}

function handleKeyPress(event) {

    var keyCodes = {
        SPACEBAR_KEY: 32,
        DELETE: 46,
        START: 65,
        STOP: 83
    };

    if (event.keyCode == keyCodes.DELETE)
        delElem = ~delElem;

    if (event.keyCode == keyCodes.START)
        loop.start();

    if (event.keyCode == keyCodes.STOP)
        loop.stop();
}

function mousedownHandler(event) {

    if (!loop.animation)
        return;

    for (var i = elements.length - 1; i > -1; i--) {
        element = elements[i];

        if (!select(mouseX, mouseY, element)) {
            continue;
        }

        console.log("selceted", element.label);

        if (element.label.substring(0, 3) === "ori") {
            delElem = false;
            clone(element);
            console.log("clone", element.label, "...");
            break;
        }

        if (delElem) {
            elements.splice(i, 1);
            console.log("deleted", element.label, "...");
            console.log(elements.length, "elements");
            break;
        }

        if (element.draggable) {
            delElem = false;
            dragElem = element;
            elements.push(dragElem);
            elements.splice(i, 1);
            break;
        }
    }
}

function mousemoveHandler(event) {

    mouseX = event.pageX - canvas.offsetLeft;
    mouseY = event.pageY - canvas.offsetTop;

    for (var i = 0; i < elements.length; i++) {
        element = elements[i];

        if (select(mouseX, mouseY, element)) {
            canvas.style.cursor = "pointer";
            element.select = true;
            break;
        } else {
            canvas.style.cursor = "auto";
            element.select = false;
        }
    }

    if (dragElem !== null) {

        dragElem.x = mouseX - (oldMouseX - dragElem.x);
        dragElem.y = mouseY - (oldMouseY - dragElem.y);

        if (dragElem.x < limit.left) {
            dragElem.x = limit.left + 1;
        }
        if (dragElem.x > limit.right) {
            dragElem.x = limit.right - 1;
        }
        if (dragElem.y < limit.top) {
            dragElem.y = limit.top + 1;
        }
        if (dragElem.y > limit.bottom) {
            dragElem.y = limit.bottom - 1;
        }
    }

    oldMouseX = mouseX;
    oldMouseY = mouseY;
}

function mouseupHandler(event) {

    dragElem = null;
}

function select(mouseX, mouseY, element) {

    return mouseX > element.left() && mouseX < element.right() &&
        mouseY > element.top() && mouseY < element.bottom();
}

function render() {

    //  Background
    ctx.drawImage(background, 0, 0);

    // Sprites
    if (elements.length !== 0) {
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

            if (element.visible) {
                ctx.drawImage(
                    image,
                    element.srcX, element.srcY,
                    element.srcW, element.srcH,
                    Math.floor(element.x), Math.floor(element.y),
                    element.width, element.height
                );
            }

            if (element.select) {
                // marcar elemento observado           
                ctx.beginPath();
                ctx.lineWidth = "2";
                if (delElem && element.draggable)
                    ctx.strokeStyle = "#FF0000";
                else
                    ctx.strokeStyle = "#A0A0A0";
                ctx.rect(element.left(), element.top(), element.width, element.height);
                ctx.stroke();
            }
        }
    }
}