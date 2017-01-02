var level;
var colors;
var limit;
var canvas_width;
var canvas_height;
var dir;
var width;
var height;
var rate;
var offset_x;
var offset_y;
var keys = [];
var final = [];
var radius;
var finished;
var interval;
var speed;
var max_speed;
var min_speed;
var title;
var stage;
var canvas;

$(document).ready(function() {
    init();
});

function init() {
    console.log("init");

    clearInterval(interval);
    interval = false;
    rate = 20;
    speed = 2;
    min_speed = 2;
    max_speed = 10;
    level = 0;
    title = "Color Circle";

    canvas = document.getElementById("main");
    canvas_width = canvas.width;
    canvas_height = canvas.height;

    stage = new createjs.Stage("main");
    stage.mouseMoveOutside = true;

    radius = 10;

    this.document.onkeydown = keydown;
    this.document.onkeyup = keyup;

    start(level);
}

function start(level) {
    console.log("start");

    // level parameters
    level = (level>=0) ? level : 0;
    limit = 5 + level;
    dir = 0;
    finished = 0;
    colors = [];
    final = [];
    clearInterval(interval);
    interval = false;

    // size
    width = 2 * limit * radius;
    height = 2 * limit * radius;
    if (canvas_width < width + 100) {
        canvas_width = width + 100;
        canvas.width = canvas_width;
    }
    if (canvas_height < height + 100) {
        canvas_height = height + 140;
        canvas.height = canvas_height;
        $("canvas").css("margin-top", 0);
    }
    offset_x = canvas_width/2 - width/2;
    offset_y = canvas_height/2 - height/2 + 20;

    // color parameters - h
    var color_h_start = getRandomInt(0, 300);
    var color_h_range = 360 - color_h_start - level*10;
    if (color_h_range < 60) {
        color_h_range = 60;
    }
    var color_h_end = color_h_start + color_h_range;

    // color parameters - s
    var color_s_start = getRandomInt(40, 70);
    var color_s_range = getRandomInt(10, 30);

    // color parameters - l
    var color_l_start = getRandomInt(50, 60);
    var color_l_range = getRandomInt(20, 40);

    var h_dir = (Math.random()>0.5) ? 1 : -1;
    var s_dir = (Math.random()>0.5) ? 1 : -1;
    var l_dir = (Math.random()>0.5) ? 1 : -1;

    // calculate colors and store in array
    for (var i = 0; i < limit; i++) {
        var h = Math.round(color_h_start + h_dir * i * color_h_range / limit);
        var s = Math.round(color_s_start + s_dir * i * color_s_range / limit);
        var l = Math.round(color_l_start + l_dir * i * color_l_range / limit);
        colors.push(new Array(h, s, l, i));
    }

    // draw game
    var main = stage.getChildByName("main");
    if (!main) {
        main = new createjs.Container();
        main.name = "main";
        stage.addChild(main);

        var background = new createjs.Shape();
        background.graphics.beginFill("#151517").drawRect(0, 0, canvas_width, canvas_height);
        main.addChild(background);
    } else {
        stage.setChildIndex(main, stage.getNumChildren()-1);
    }
    main.removeAllChildren();

    var game = new createjs.Container();
    game.name = "game";
    game.x = offset_x;
    game.y = offset_y;
    main.addChild(game);

    var background = new createjs.Shape();
    background.graphics.beginFill("#151500").drawRect(0, 0, width, height);
    game.addChild(background);

    var xs = [];
    var ys = [];
    for (var i = 0; i < colors.length; i++) {
        if (i == 0) {
            final.push(colors[i]);
        }

        var h = colors[i][0];
        var s = colors[i][1];
        var l = colors[i][2];
        var final_i = colors[i][3];

        // draw colors
        var piece = new createjs.Container();
        while (true) {
            piece.x = getRandomInt(0, width/radius/2-1);
            if (!xs.includes(piece.x)) {
                xs.push(piece.x);
                piece.x = 2*radius*piece.x + radius;
                break;
            }
        }
        while (true) {
            piece.y = getRandomInt(0, height/radius/2-1);
            if (!ys.includes(piece.y)) {
                ys.push(piece.y);
                piece.y = 2*radius*piece.y + radius;
                break;
            }
        }
        piece.h = h;
        piece.s = s;
        piece.l = l;
        piece.i = i;
        piece.final_i = final_i;
        piece.name = "piece_" + i;
        game.addChild(piece);

        var cir = new createjs.Shape();
        var color = 'hsl('+ h +', ' + s +'%, '+ l +'%)';
        cir.graphics.beginFill(color);
        cir.graphics.drawCircle(0, 0, radius);
        piece.addChild(cir);
    }

    var level_text = new createjs.Text("Level: " + (level+1), "bold 50px Arial", "#FFFFFF");
    level_text.textAlign = "center";
    level_text.x = canvas_width/2;
    level_text.y = 20;
    level_text.name = "level";
    level_text.shadow = new createjs.Shadow("#000000", 0, 0, 10);
    main.addChild(level_text);

    stage.update();

    // add ticker
    createjs.Ticker.removeAllEventListeners();
    createjs.Ticker.setFPS(rate);
    createjs.Ticker.addEventListener("tick", function(){
        tick(game);
    }, false);

    // add interval to check result
    if (interval == false) {
        interval = setInterval(function() {
            check_result(level);
        }, 100);
    }

    // add credits
    credit();
}

function check_result(level) {
    // console.log("level: %d", level);
    if (finished == 1) {
        next(level+1);
    }

    if (finished == -1) {
        next(level);
    }
}

function next(level){
    createjs.Ticker.removeAllEventListeners();
    createjs.Ticker.setFPS(rate);
    createjs.Ticker.addEventListener("tick", fadeout);
    clearInterval(interval);
    setTimeout(function(){
        createjs.Ticker.removeAllEventListeners();
        start(level);
    }, 1000);
}

function go(level) {
    next(level);
}

function fadeout(){
    var main = stage.getChildByName("main");
    if (!main) {
        return;
    }
    var game = main.getChildByName("game");
    if (!game) {
        return;
    }

    for (var i = 0; i < colors.length; i++) {
        var piece = game.getChildByName("piece_"+i);
        if (piece) {
            piece.alpha -= 0.1;
        }
    }
    stage.update();
}

function tick(game){
    // console.log("tick");

    if (!game) {
        return;
    }

    var piece = game.getChildByName("piece_0");
    if (!piece) {
        return;
    }

    if (keys[37]) {//left
        dir = 3;
    } else if (keys[38]) {//up
        dir = 0;
    } else if (keys[39]) {//right
        dir = 1;
    } else if (keys[40]) {//down
        dir = 2;
    } else if (keys[187]) {//+
        speed += 2;
        speed = (speed >= 10) ? max_speed : speed;
    } else if (keys[189]) {//-
        speed -= 2;
        speed = (speed <= 2) ? min_speed : speed;
    }
    if (dir == 0) {
        piece.y -= radius/rate * speed;
    } else if (dir == 1) {
        piece.x += radius/rate * speed;
    } else if (dir == 2) {
        piece.y += radius/rate * speed;
    } else if (dir == 3) {
        piece.x -= radius/rate * speed;
    }
    if (piece.x > width + radius) {
        piece.x = 0 - radius;
    } else if (piece.x < 0 - radius) {
        piece.x = width + radius;
    }
    if (piece.y > height + radius) {
        piece.y = 0 - radius;
    } else if (piece.y < 0 - radius) {
        piece.y = height + radius;
    }

    for (var i = 1; i < colors.length; i++) {
        var target = game.getChildByName("piece_" + i);
        if (target) {
            if (target.alpha <= 0) {
                continue;
            }
            var pt = target.localToLocal(radius/2, radius/2, piece);
            if (piece.hitTest(pt.x, pt.y)) {
                // console.log("hit: %s, pt(%s, %s)", target.name, pt.x, pt.y);
                if (final.length == target.final_i) {
                    target.alpha = 0;
                    final.push(colors[target.i]);
                    var cir = new createjs.Shape();
                    var color = 'hsl('+ target.h +', ' + target.s +'%, '+ target.l +'%)';
                    cir.graphics.beginFill(color);
                    cir.graphics.drawCircle(0, 0, final.length*radius);
                    cir.alpha = 0.5;
                    piece.addChild(cir);
                    piece.setChildIndex(cir, 0);
                    if (final.length == colors.length) {
                        finished = 1;
                    }
                } else {
                    finished = -1;
                }
            }
        }
    }

    stage.update(event);
}

function credit() {
    var credit = stage.getChildByName("credit");
    if (!credit) {
        credit = new createjs.Text(title + " by River Liu \u00A9" + new Date().getFullYear(), "20px Arial", "#FFFFFF");
        credit.textAlign = "center";
        credit.x = canvas_width/2;
        credit.y = canvas_height - 40;
        credit.alpha = 0.2;
        credit.shadow = new createjs.Shadow("#000000", 0, 0, 10);
        credit.on("click", function(event) {
            window.open("http://riverliu.net","_blank");
        });
        stage.addChild(credit);
    } else {
        stage.setChildIndex(credit, stage.getNumChildren()-1);
    }
    stage.update();
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function keydown(event) {
    keys[event.keyCode] = true;
    // console.log("keydown %s", event.keyCode);
}

function keyup(event) {
    delete keys[event.keyCode];
}
