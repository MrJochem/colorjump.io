// constantes voor breedte en hoogte canvas
const w = 400;
const h = 600;
new p5(); // nodig om p5 functies te gebruiken buiten setup()
// speelkleuren
let colors = [color(0,255,255), color(255,20,147), color(255,204, 0), color(170,0,204)];

colorPacks = [
    [color(0,255,255), color(255,20,147), color(255,204, 0), color(170,0,204)], //lichtblauw, roze, geel, paars
    [color(250,0,250),color(50,0,250),color(0,250,250),color(0,250,50)], // paars, blauw, turqoise, felgroen
    [color(25),color(100),color(175),color(250)], //donkergrijs, grijs, lichtgrijs, wit
    [color(250,0,0),color(250,150,0),color(250,250,0), color(250,100,0)], // rood, oranje, geel, donkeroranje
    [color(0,250,250), color(0,200,250), color(0,150,250), color(0,100,250)], // neonblauw, lichtblauw, blauw, donkerblauw
    [color(250,0,0), color(0,250,0), color(0,0,250), color(250)] // rood, blauw, groen, wit
];
let gamestate = 0; // houdt bij wat de huidige stand van het spel is

// functie die afbeelding e.d. voorlaadt zodat deze later gebruikt kunnen worden
function preload() {
    myFont = loadFont('assets/Blissful Thinking.otf');
    homeImage = loadImage('assets/home.png');
    retryImage = loadImage('assets/retry.png');
    playImage = loadImage('assets/play.png');
    handImage = loadImage('assets/hand.png');
    pointImage = loadImage('assets/point.png');
    shopImage = loadImage('assets/shop.png');
}
// setup functie voor het maken van canvas en zetten van framerate
function setup() {
    frameRate(60);
    let canvas = createCanvas(w,h);
    if (windowHeight/windowWidth > 1.5) {
        canvas.style('width:100%')
        canvas.style('height:auto');
    } else {
        canvas.style('height: 100%');
        canvas.style('width : auto');
    }
    canvas.id("canvas");
    document.getElementById("canvas").ontouchstart = function() {
        if (event.type != 'touchstart') return true
        if (gamestate === 1) {
            player.up();
        }
    }
    document.getElementById("canvas").onmousedown = function() {
        if (event.type != 'touchstart') return true
        if (gamestate === 1) {
            player.up();
        }
    }
}
// player class, dit is de speler, deze heeft een aantal waardes die bij de speler horen in de constructor, ook heeft deze een show functie die de speler laat zien,
// een update functie die de speler naar beneden laat vallen, een up functie om de speler omhoog te duwen, en een aantal functies om te berekenen of de speler een ander object raakt.
class Player {
    constructor() {
        this.x = w/2;
        this.y = h/1.30;
        this.size = 20;
        this.gravity = 0.9;
        this.velocity = 0;
        this.lift = -18;
        this.playColor = colors[floor(random(0,4))];
    }
    show() {
        fill(this.playColor);
        noStroke();
        ellipse(this.x, this.y, this.size);
    }  
    update() {
        this.velocity += this.gravity;
        this.velocity *= 0.9;
        this.y += this.velocity;
        if(this.velocity <= this.lift/1.5) {
            this.velocity = this.lift/1.5;
        }
        if (this.y > bottomHand.y - 50) {
            this.y = bottomHand.y - 50;
            this.velocity = 0;
        } 
        if (this.y < h/3) {
            this.y = h/3;
        }
        if (this.y >= h) {
            gamestate = 2;
        }
    }
    up() {
        this.velocity += this.lift;
    }
    intersects(other) {
        if (getDistance(this.x, this.y, other.x, other.y) < this.size/2 + other.size/2) {
            return true;
        } else {
            return false;
        }
    }
    intersectsCircle(other) {
        let d = getDistance(this.x, this.y, other[0].x, other[0].y);
        if ((d < this.size/2 + other[0].size/2) && !(d < other[other.length - 1].size/2 - this.size/2)) {
            return true;
        } else {
            return false;
        }
    }
    intersectCircleColor(other) {
        for(let i = 1; i < other.length; i++) {
            if(this.y > other[i].y && other[i].pi < HALF_PI + PI/64 && other[i].obstacleColor != this.playColor) {
                return true;
            }
            if(this.y < other[i].y && other[i].pi > PI - PI/64 && other[i].pi < PI + HALF_PI + PI/64 && other[i].obstacleColor != this.playColor) {
                return true;
            }
        }
        return false;
    }
    intersectsLine(other) {
        for (let i = 0; i < other.length; i++) {
            for (let j = 0; j < other[i].length; j++) {
                if(((other[i][j].x <= this.x + this.size/2 && other[i][j].x + other[i][j].size >= this.x + this.size/2) 
                || (other[i][j].x <= this.x - this.size/2 && other[i][j].x + other[i][j].size >= this.x - this.size/2))
                &&((other[i][j].y <= this.y + this.size/2 && other[i][j].y + other[i][j].height >= this.y + this.size/2) 
                || (other[i][j].y <= this.y - this.size/2 && other[i][j].y + other[i][j].height >= this.y - this.size/2))
                && other[i][j].color != this.playColor) {
                        return true;
                }
            }
        }
        return false;
    }
}
// deze class wordt gebruikt om cirkels te maken op het scherm waneer de speler doodgaat.
class playerDeathEllipse {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.color = colors[int(random(0,3))];
        this.gravity = 0.2;
        this.size = random(8, 12);
        if ((random(0,1) > 0.5)) {
        this.xVelocity = random(5, 10);
        } else {
            this.xVelocity = -random(5,10);
        }
        if (random(0,1) > 0.5) {
            this.yVelocity = -random(0, 15);
        } else {
            this.yVelocity = random(-5, 5);
        }
    }
    show() {
        noStroke();
        fill(this.color);
        ellipse(this.x, this.y, this.size);
    }
    update() {
        this.yVelocity += this.gravity;
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        if (this.x >= w - this.size/2 || this.x <= 0 + this.size/2) {
            this.xVelocity = - this.xVelocity;
        }
    }
}
// dit is de functie die de cirkels aanmaakt wanneer de speler doodgaat.
function createPlayerDeathCircles() {
    let deathEllipse = [];
    for(let i = 0; i < 25; i++) {
        deathEllipse.push(new playerDeathEllipse(player.x,player.y));
    }
    return deathEllipse;
}
// dit zijn de objecten die ervoor zorgen dat de speler van kleur verandert.
class ColorSwitcher {
    constructor(y) {
        this.x = w/2;
        this.y = y;
        this.size = 35;
        this.used = false;
    }
    show() {
        if(!this.used) {
            for (var i = 0; i < 4; i++) {
                fill(colors[i]);
                noStroke();
                arc(this.x, this.y, this.size, this.size, i*HALF_PI, i*HALF_PI + HALF_PI, PIE);
            }
        }
    }
    screenUpdate(player) {
        if (player.y <= h/3 + h/30 && player.velocity < 0) {
            this.y -= player.velocity;
        }
    }
}
// dit zijn de objecten die ervoor zorgen dat de speler een punt krijgt.
class Point {
    constructor(y) {
        this.y = y;
        this.x = w/2;
        this.size = 35;
        this.used = false;
        this.counter = 0;
    }
    show() {
        if (!this.used) {
            image(pointImage, this.x, this.y , this.size, this.size);
        }
        if (this.used && this.counter < 45) {
            textSize(30);
            fill(255);
            text("+1",this.x,this.y);
            this.counter += 1;
        }
    }
    screenUpdate(player) {
        if (player.y <= h/3 + h/30 && player.velocity < 0) {
            this.y -= player.velocity;
        }
    }
}
// dit is een obstakel dat bestaat uit een cirkel waarvan de buitenranden 4 verschillende kleuren hebben. elk object heeft zijn eigen kleur, voor het obstakel zijn er dus 4 objecten nodig.
class CircleObstacle {
    constructor(x, y, s, c, startPi, speed) {
        this.x = x;
        this.y = y;
        this.centerY = y;
        this.size = s;
        this.obstacleColor = c;
        this.pi = startPi;
        this.speed = speed;
    }
    show() {
        noStroke();
        fill(this.obstacleColor);
        arc(this.x, this.y, this.size, this.size, this.pi, this.pi + HALF_PI + PI/128, PIE);
    }
    update() {
        this.pi += PI/128 * this.speed;
        if (this.pi >= TWO_PI && this.speed > 0) {
            this.pi = 0;
        }
        if (this.pi <= 0 && this.speed < 0) {
            this.pi = TWO_PI;
        }
    }
    screenUpdate(player) {
        if (player.y <= h/3 + h/30 && player.velocity < 0) {
            this.y -= player.velocity;
            this.centerY -= player.velocity;
        }
    }
}
// dit is een class die gebruikt wordt om een cirkel te tekenen in het midden van de cirkel van het obstakel.
class CircleObstacleEllipse {
    constructor(x,y,s,v) {
        this.x = x;
        this.y = y;
        this.centerY = y;
        this.size = s;
        this.visible = boolean(v);
    }
    show() {
        fill(40);
        if (!this.visible) {
            noFill();
            noStroke();
        }
        ellipse(this.x,this.y,this.size);
    }
    update() {}
    screenUpdate(player) {
        if (player.y <= h/3 + h/30 && player.velocity < 0) {
            this.y -= player.velocity;
            this.centerY -= player.velocity;
        }
    }
}
// deze functie maakt een cirkel aan voor het bedekken van het cirkel-obstakel
function createCircle(x,y,s,speed, thickness) {
    let circle = [new CircleObstacleEllipse(x,y,s, false)];
    for (let i = 0; i < 4; i++) {
        circle.push(new CircleObstacle(x, y, s, colors[i], i * HALF_PI, speed));
    }
    circle.push(new CircleObstacleEllipse(x,y, s - thickness, true));
    return circle;
}
// dit is de functie die één volledige cirkelobstakel aanmaakt.
function createCircleObstacle(x,y,s,speed, thickness) {
    let circleObstacle = [new CircleObstacleEllipse(x,y,s, false)];
    for (let i = 0; i < 4; i++) {
        circleObstacle.push(new CircleObstacle(x, y, s, colors[i], i * HALF_PI, speed));
    }
    circleObstacle.push(new CircleObstacleEllipse(x,y, s - thickness, true));
    points.push(new Point(y));
    colorSwitchers.push(new ColorSwitcher(y-s/2-75));
    return circleObstacle;
}
// dit is een class die gebruikt wordt om het lijnobstakel te maken, elk object is dan één stukje van de lijn met één kleur.
class LineObstacle {
    constructor(x,y,W,H,c,s) {
        this.x = x;
        this.y = y;
        this.centerY = y;
        this.size = W;
        this.height = H;
        this.color = c;
        this.speed = s;
        this.respawn = -400*s;
        this.border = 400*s;
    }
    show() {
        fill(this.color);
        noStroke();
        rect(this.x, this.y, this.size + 2,this.height);
    }
    update() {
        this.x += this.speed*2.5;
        if(this.speed > 0) {
            if(this.x > this.border) {
            this.x = this.respawn;
        }
        }
        if(this.speed < 0) {
            if(this.x < this.border) {
            this.x = this.respawn;
            }
        }
    }
    screenUpdate(player) {
        if (player.y <= h/3 + h/30 && player.velocity < 0) {
            this.y -= player.velocity;
            this.centerY -= player.velocity;
        }
    }
}
// dit maakt één lijn aan van objecten die naar rechts bewegen
function createLineObstacleForward(y) {
    let lineObstacle = [];
    for(let i = 0; i < 8; i++) {
        if (i < 4) {
            lineObstacle.push(new LineObstacle(300 - 100*i, y, 101, 22.5, colors[i], 1));
        } 
        if (i >= 4) {
            lineObstacle.push(new LineObstacle(300 - 100*i, y, 101, 22.5, colors[i - 4], 1));
        }
    }
    return lineObstacle;
}
// dit maakt één lijn aan van objecten die naar links bewegen.
function createLineObstacleBack(y) {
    let lineObstacle = [];
    for(let i = 0; i < 8; i++) {
        if (i < 4) {
            lineObstacle.push(new LineObstacle(100*i, y, 101, 22.5, colors[i], -1));
        } 
        if (i >= 4) {
             lineObstacle.push(new LineObstacle(100*i, y, 101, 22.5, colors[i - 4], -1));
        }
    }
    return lineObstacle;
}
// dit is de functie die één voledig lijnobstakel aanmaakt, het maakt het zo dat er om en om een obstakel naar links en rechts beweegt
function createLineObstacle(y, amount) {
    let lineObstacle = [];
    for(var i = 0; i < amount; i++) {
        if (i != amount - 1) {
            points.push(new Point(y - 67.5 - 150*i));
        } else {
            colorSwitchers.push(new ColorSwitcher(y - 75 - 150*i));
        }
        if (i%2 === 0) {
            lineObstacle.push(createLineObstacleForward(y - 150*i));
        }
        else if (i%2 === 1) {
            lineObstacle.push(createLineObstacleBack(y-150*i));
        }
    }
    return lineObstacle;
}
// dit is een class voor de ruit-cirkel obstakel, dit obstakel bestaat uit allemaal cirkeltjes die in een ruit bewegen. elk object is één van deze cirkels.
class DiamondEllipsesObstacle {
    constructor(x,y,centerY,xSpeed,ySpeed,size,color) {
      this.centerY = centerY;
      this.x = x;
      this.y = y; 
      this.dx = xSpeed;
      this.dy = ySpeed;
      this.size = size;
      this.color = color; 
    }
    show() {
      noStroke();
      fill(this.color);
      ellipse(this.x, this.y, this.size);
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x === 200 && this.dx === 1) {
            this.dy = 1;
        }
        if (this.x === 300) {
            this.dx = -1;
        }
        if (this.x === 200 && this.dx === -1) {
            this.dy = -1;
        } 
        if (this.x === 100) {
            this.dx = 1;
        }
      }
    screenUpdate(player) {
        if (player.y <= h/3 + h/30 && player.velocity < 0) {
            this.centerY -= player.velocity;   
            this.y -= player.velocity;
        }
    }
}
 // dit is de functie die één ruit-cirkel obstakel aanmaakt, het geeft het volledige obstakel terug in een array, wat bestaat uit objecten.
 function createDiamondEllipsesObstacle(y) {
    let diamondEllipsesObstacle = [];
    let size = 25;
    let distance = 20;
    for (let i = 0; i < 20; i++) {
        if (i < 5) {
        diamondEllipsesObstacle.push(new DiamondEllipsesObstacle(200 + distance*i, y + distance*i - 100,y,1,1,size,colors[0]));
        }
        else if (i < 10) {
        diamondEllipsesObstacle.push(new DiamondEllipsesObstacle(300 - distance*(i-5),y + distance*(i-5),y,-1,1,size,colors[1]));
        }
        else if (i < 15) {
        diamondEllipsesObstacle.push(new DiamondEllipsesObstacle(200 - distance*(i-10),y + 100 - distance*(i-10),y,-1,-1,size,colors[2]));
        }
        else if (i < 20) {
        diamondEllipsesObstacle.push(new DiamondEllipsesObstacle(100 + distance*(i-15),y - distance*(i-15),y,1,-1,size,colors[3]));
        }
    }
    points.push(new Point(y));
    colorSwitchers.push(new ColorSwitcher(y-175));
    return diamondEllipsesObstacle;
}
// deze class wordt gebruikt voor de ronddraaiende cirkels, elk object is één van de cirkels die in de baan van de grotere cirkel meebeweegt.
class CircleEllipsesObstacle {
    constructor(centerY,radius, speed, startPi, color) {
        this.centerY = centerY;
        this.centerX = 200;
        this.size = 2*PI*radius/22.5;
        this.speed = speed;
        this.color = color;
        this.radius = radius;
        this.angle = startPi;
        this.y = this.centerY + sin(this.angle)*this.radius;
        this.x = this.centerX + cos(this.angle)*this.radius;
    }
    show() {
        fill(this.color);
        noStroke();
        ellipse(this.x,this.y,this.size);
    }
    update() {    
        this.angle += PI/128 * this.speed
        this.x = this.centerX + cos(this.angle)*this.radius;
        this.y = this.centerY + sin(this.angle)*this.radius;
    }
    screenUpdate(player) {
        if (player.y <= h/3 + h/30 && player.velocity < 0) {
            this.centerY -= player.velocity; 
        }
    }
}
// dit is de functie die één cirkel-cirkel obstakel aanmaakt, het geeft het volledige obstakel terug in een array, wat bestaat uit objecten.
function createCircleEllipsesObstacle(y, radius, speed) {
    let circleEllipsesObstacle = [];
    for(let i = 0; i < 20; i++) {
        if(i < 5) {
            circleEllipsesObstacle.push(new CircleEllipsesObstacle(y, radius, speed, i*PI/10, colors[0]));
        }
        else if(i < 10) {
            circleEllipsesObstacle.push(new CircleEllipsesObstacle(y, radius, speed, i*PI/10,colors[1]));      
        }
        else if(i < 15) {
            circleEllipsesObstacle.push(new CircleEllipsesObstacle(y ,radius, speed, i*PI/10, colors[2]));
        }
        else if(i < 20) {
            circleEllipsesObstacle.push(new CircleEllipsesObstacle(y, radius, speed, i*PI/10, colors[3]));      
        }
    }
    points.push(new Point(y));
    colorSwitchers.push(new ColorSwitcher(y-radius-75));
    return circleEllipsesObstacle;
}
// dit is het kruisobstakel, elk kruis bestaat uit 4 van deze objecten.
class CrossObstacle {
    constructor(x,y,radius,speed,startPi,color) {
        this.centerX = x;
        this.centerY = y;
        this.radius = radius;
        if (this.radius <= 50) {
            this.radius2 = 7.5;
        } else  {
            this.radius2 = 12.5;
        }
        this.angle = startPi;
        this.x1 = this.radius2;
        this.x2 = this.radius2;
        this.x3 = -this.radius2;
        this.x4 = -this.radius2; 
        this.y1 = -this.radius2;
        this.y2 = -this.radius + this.radius2;
        this.y3 = -this.radius + this.radius2;
        this.y4 = -this.radius2;
        this.speed = speed;
        this.color = color;
        this.circle =  {
            x : this.centerX + cos(this.angle)*(this.radius - this.radius2),
            y : this.centerY + sin(this.angle)*(this.radius - this.radius2),
            size : getDistance(this.x1,this.y1,this.x4,this.y4)
        }
    }
    show() {
        noStroke();
        fill(this.color);
        this.circle.x = this.centerX + cos(this.angle)*(this.radius - this.radius2);
        this.circle.y = this.centerY + sin(this.angle)*(this.radius - this.radius2);
        ellipse(this.circle.x,this.circle.y,this.circle.size);
        push();
        translate(this.centerX,this.centerY);
        rotate(this.angle + HALF_PI);
        beginShape();
        vertex(0,0);
        vertex(this.x1, this.y1);
        vertex(this.x2, this.y2);
        vertex(this.x3, this.y3);
        vertex(this.x4, this.y4);
        vertex(0,0);
        endShape();
        pop();
    }
    update() {
        this.angle += PI/128 * this.speed;
    }
    screenUpdate(player) {
        if (player.y <= h/3 + h/30 && player.velocity < 0) {
            this.centerY -= player.velocity;   
            this.circle.y -= player.velocity;
        }
    }
}
// dit is een functie die één volledig kruisobstakel aanmaakt, deze geeft hij dan terug als een array van objecten.
function createCrossObstacle(x,y,radius,speed) {
    let crossObstacle = [];
    if (speed > 0) {
        for (let i = 0; i < 4; i++) {
            crossObstacle.push(new CrossObstacle(x,y,radius,speed,HALF_PI * i,colors[i]));
        }
    }
    if (speed < 0) {
        for (let i = 0; i < 4; i++) {
            crossObstacle.push(new CrossObstacle(x,y,radius,speed,HALF_PI * i - HALF_PI,colors[3-i]));
        }
    }
    points.push(new Point(y - radius - 10));
    colorSwitchers.push(new ColorSwitcher(y - radius - 75));
    return crossObstacle;
}
// dit is een functie die een obstakel aanmaakt dat bestaat uit een ruit-cirkel obstakel en een klein cirkel obstakel.
function createCircleDiamondEllipsesObstacle(y) {
    let circleDiamondEllipsesObstacle = [[new CircleObstacleEllipse(200,y,100, false)]];
    circleDiamondEllipsesObstacle.push(createDiamondEllipsesObstacle(y));
    for (var i = 0; i < 4; i++) {
        if (i == 0) {
            circleDiamondEllipsesObstacle[0].push(new CircleObstacle(200,y,115,colors[1], i*HALF_PI, 0.64))
        }
        if (i == 1) {
            circleDiamondEllipsesObstacle[0].push(new CircleObstacle(200,y,115,colors[2], i*HALF_PI, 0.64))
        }
        if (i == 2) {
            circleDiamondEllipsesObstacle[0].push(new CircleObstacle(200,y,115,colors[3], i*HALF_PI, 0.64))
        }
        if (i == 3) {
            circleDiamondEllipsesObstacle[0].push(new CircleObstacle(200,y,115,colors[0], i*HALF_PI, 0.64))
        }
    }
    circleDiamondEllipsesObstacle[0].push(new CircleObstacleEllipse(200,y,100-5,true));
    return circleDiamondEllipsesObstacle;
}
// deze class wordt gebruikt voor de dingen die je in de winkel kan kopen
class ShopItem {
    constructor(x,y,colors, price, unlocked, selected) {
        this.x = x;
        this.y = y;
        this.colors = colors;
        this.price = price;
        this.unlocked = unlocked;
        this.selected = selected;
        this.buying = false;
        this.selecting = false;
    }
    show() {
        fill(10);
        if (this.unlocked) {
            fill(65);
        }
        if (!this.unlocked && getDistance(this.x,this.y,mouseX,mouseY) < 40) {
            fill(25);
        }
        if (this.unlocked && getDistance(this.x,this.y,mouseX,mouseY) < 40) {
            fill(75);
        }
        if (this.selected) {
            stroke(255);
            strokeWeight(3);
        }
        ellipse(this.x,this.y,80)
        noStroke();
        for (let i = 0; i < this.colors.length; i++) {
            fill (this.colors[i])
            if (i < 2) {
                ellipse(this.x - 12.5 + 25*i,this.y-12.5, 25, 25);
            }
            if (i >= 2) {
                ellipse(this.x - 12.5+25*(i-2),this.y-12.5+25,25,25);
            }
        }
        if (!this.unlocked) {
            fill(255);
            textFont(myFont);
            textSize(20);
            image(pointImage,this.x-10,this.y+50, 17.5,17.5);
            text(this.price, this.x+10,this.y+50);
        }
    }
    buy() {
        fill(65)
        rectMode(CENTER);
        stroke(0);
        rect(w/2,h/2,w-w/6,h/3);
        noStroke();
        fill(10);
        ellipse(w/2,h/2-h/12,75,75)
        for (let i = 0; i < this.colors.length; i++) {
            fill (this.colors[i])
            if (i < 2) {
                ellipse(w/2 - 12.5 + 25*i,h/2-h/12-12.5, 25, 25);
            }
            if (i >= 2) {
                ellipse(w/2 -12.5 + 25*(i-2),h/2-h/12-12.5+25,25,25);
            }
        }
        fill(255);
        textFont(myFont);
        textSize(20);
        image(pointImage,w/2-10,h/2-h/12+50, 17.5,17.5);
        text(this.price, w/2+10,h/2-h/12+50);
        fill (75);
        if ((mouseX > w/2-w/6/2 && mouseX < w/2+w/12) && (mouseY > (h/2+h/9-h/40) && mouseY < (h/2+h/9+h/40))) {
            fill (65);
        }
        stroke(0);
        rect(w/2,h/2+h/9, w/6,h/20);
        noStroke();
        fill(255);
        text("buy", w/2,h/2+h/9);
    }
    select() {
        fill(65)
        rectMode(CENTER);
        stroke(0);
        rect(w/2,h/2,w-w/6,h/3);
        noStroke();
        fill(85);
        ellipse(w/2,h/2-h/12,75,75)
        for (let i = 0; i < this.colors.length; i++) {
            fill (this.colors[i])
            if (i < 2) {
                ellipse(w/2 - 12.5 + 25*i,h/2-h/12-12.5, 25, 25);
            }
            if (i >= 2) {
                ellipse(w/2 -12.5 + 25*(i-2),h/2-h/12-12.5+25 ,25 ,25);
            }
        }
        fill (85);
        if ((mouseX > (w/2-w/12) && mouseX < (w/2+w/12)) && (mouseY > (h/2-h/40) && mouseY < (h/2+h/40))) {
            fill (95);
        }
        stroke(0);
        rect(w/2,h/2+h/9, w/6,h/20);
        noStroke();
        fill(255);
        textSize(20);
        text("select", w/2,h/2+h/9);
    }
}
// dit is het logo dat gebruikt wordt als cosmetica in de menu's en tijdens het begin van het spel.
class ColorJumpLogo {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.O1 = createCircle(this.x - 27.5, this.y - 17.5, 35, -1.5, 10);
        this.O2 = createCircle(this.x + 30, this.y - 17.5, 35, 1.5, 10);
    }
    show() {
        textAlign(CENTER, CENTER);
        fill(255);
        textFont(myFont);
        textSize(50);
        text("C", this.x - 60, this.y - 20);
        text("L", this.x + 5, this.y - 20);
        text("R", this.x + 62.5, this.y - 20);
        text("JUMP", this.x, this.y + 20);
        for (let i = 0; i < this.O1.length; i++) {
            this.O1[i].show();
            this.O1[i].update();
            this.O2[i].show();
            this.O2[i].update();
        }
    }
    screenUpdate(player) {
        if (player.y <= h/3 + h/30 && player.velocity < 0) {
            this.y -= player.velocity;
        }
        for (let i = 0; i < this.O1.length; i++) {
            this.O1[i].screenUpdate(player);
            this.O2[i].screenUpdate(player);
        }
    }
}
// dit is het logo dat gezien wordt in de winke.
class ShopLogo {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.o = createCircle(this.x + 20, this.y+6, 55, -1.5, 15);
    }
    show() {
        textAlign(CENTER, CENTER);
        fill(255);
        textFont(myFont);
        textSize(80);
        text("SHOP", this.x, this.y);
        for (let i = 0; i < this.o.length; i++) {
            this.o[i].show();
            this.o[i].update();
        }
    }
}
// dit is de hand die de speler tegenhoud aan het begin van het spel zodat deze niet gelijk valt en doodgaat.
class BottomHand {
    constructor() {
        this.x = w/2 + w/40;
        this.y =  h - h/5;
    }
    show() {
        imageMode(CENTER);
        image(handImage, this.x, this.y, 60, 60);
    }
    screenUpdate(player) {
        if (player.y <= h/3 + h/30 && player.velocity < 0) {
            this.y -= player.velocity;
        }
    }
}
// een knop om opnieuw het spel te spelen
function retryButton() {
    if (getDistance(w/2, h/1.5, mouseX, mouseY) < 50) {
        fill(65);
    } else {
        fill(75);
    }
    ellipse(w/2, h/1.5, 100, 100);
    imageMode(CENTER);
    image(retryImage, w/2,h/1.5,75,75);
}
// een knop om terug te gaan naar het beginscherm
function backHomeButton() {
    if (getDistance(w * 0.13, h*0.1,mouseX,mouseY) < 30) {
        fill (65);
    } else {
        fill(75);
    }
    imageMode(CENTER);
    ellipse(w * 0.13, h * 0.1, 60, 60);
    image(homeImage, w*0.13, h * 0.1, 40,40);
}
// een knop om naar de winkel te gaan
function shopButton(x,y,size) {
    if (getDistance(x, y,mouseX,mouseY) < size/2) {
        fill (65);
    } else {
        fill(75);
    }
    imageMode(CENTER);
    ellipse(x, y, size, size);
    image(shopImage, x, y, 0.6*size,0.6*size);
}
// een knop om het spel te beginnen
function playButton() {
    if (getDistance(w/2, h/2, mouseX, mouseY) < 75) {
        fill(65);
    } else {
        fill(75);
    }
    noStroke();
    ellipse(w/2,h/2, 150,150);
    imageMode(CENTER);
    image(playImage, w* 0.515,h/2, 125, 130);
}
// dit is een functie die 2 punten als input neemt en de afstand tussen de punten uitrekent.
function getDistance(x1, y1, x2, y2) {
    xDistance = Math.abs(x2 - x1);
    yDistance = Math.abs(y2 - y1);
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}
// deze functie is bedoeld om een obstakel te creëren in de array met obstakels of er eentje aan te passen.
function createObstacle(obstacle, previousObstacleHighestY) {
    let randomNumber = floor(random(0,13));
    let y = previousObstacleHighestY
    if (randomNumber === 0) {
        obstacle.type  = "circle";
        obstacle.height = 100;
        obstacle.obstacle = createCircleObstacle(w/2, y - 150 - obstacle.height, 200, -1, 30);
    }
    if (randomNumber === 1) {
        obstacle.type = "circle";
        obstacle.height = 100;
        obstacle.obstacle = createCircleObstacle(w/2,  y - 150 - obstacle.height, 200, 1, 30);
    }
    if (randomNumber === 2) {
        obstacle.type = "line";
        obstacle.height = 150;
        obstacle.obstacle = createLineObstacle(y - 150, 3);
    }
    if (randomNumber === 3) {
        obstacle.type = "circleEllipses";
        obstacle.height = 100;
        obstacle.obstacle = createCircleEllipsesObstacle( y - 150 - obstacle.height,100,1.5);
    }
    if (randomNumber === 4) {
        obstacle.type = "circleEllipses"
        obstacle.height = 100;
        obstacle.obstacle = createCircleEllipsesObstacle( y - 150 - obstacle.height,100,-1.5);
    }
    if (randomNumber === 5) {
        obstacle.type = "diamondEllipses";
        obstacle.height = 100;
        obstacle.obstacle = createDiamondEllipsesObstacle( y - 150 - obstacle.height);
    }
    if (randomNumber === 6) {
        obstacle.type = "cross";
        obstacle.height = 100;
        obstacle.obstacle = createCrossObstacle(300-player.size/2, y - 150 - obstacle.height,100,-1);
    }
    if (randomNumber === 7) {
        obstacle.type = "cross";
        obstacle.height = 100;
        obstacle.obstacle = createCrossObstacle(300-player.size/2,  y - 150 - obstacle.height, 100, 1);
    }
    if (randomNumber === 8) {
        obstacle.type = "cross";
        obstacle.height = 100;
        obstacle.obstacle = createCrossObstacle(100+player.size/2,  y - 150 - obstacle.height, 100, -1);
    }
    if (randomNumber === 9) {
        obstacle.type = "cross";
        obstacle.height = 100;
        obstacle.obstacle = createCrossObstacle(100+player.size/2,  y - 150 - obstacle.height, 100, 1);
    }
    if (randomNumber === 10) {
        obstacle.type = "doubleCross";
        obstacle.height = 75;
        obstacle.obstacle = [createCrossObstacle(150,  y - 150 - obstacle.height, 50, -1), 
        createCrossObstacle(250, y-150-obstacle.height, 50, 1)]; 
        points.pop();
        colorSwitchers.pop(); 
    }
    if (randomNumber === 11) {
        obstacle.type = "doubleCross";
        obstacle.height = 50;
        obstacle.obstacle = [createCrossObstacle(150,  y - 150 - obstacle.height, 50, 1), 
        createCrossObstacle(250, y-150-obstacle.height, 50, -1)];   
        points.pop();
        colorSwitchers.pop();
    }
    if (randomNumber === 12) {
        obstacle.type = "circleDiamondEllipses";
        obstacle.height = 75;
        obstacle.obstacle = createCircleDiamondEllipsesObstacle( y - 150 - obstacle.height);
    }
}
// interactiviteit met muis
// function mousePressed() {
//     if (event.type != 'touchstart') return true
//     if (gamestate === 1) {
//         player.up();
//     }
// }
// interactiviteit met toetsen, in dit geval alleen met spatiebalk om het spel te beginnen of herstarten
keyPressed = function() {
    if(keyCode == 32) {
        player.up();
        if (gamestate === 0 || gamestate === 3) {
            gamestate = 1;
            score = 0;
        }
    }
}
// interactiviteit met de muis voor elke gamestate
mouseClicked = function() {
    if (gamestate === 0 && (getDistance(w/2, h/2, mouseX, mouseY) < 75)) {
        gamestate = 1;
        score = 0;
    }
    if (gamestate === 3 && (getDistance(w/2, h/1.5, mouseX, mouseY) < 50)) {
        gamestate = 1;
        score = 0;
    }
    if ((gamestate === 3  || gamestate === 4) && (getDistance(w*0.13,h*0.1,mouseX,mouseY) < 30)) {
        gamestate = 0;
    }
    if (gamestate === 0 && (getDistance(w/2, h*0.85,mouseX,mouseY) < 50)){
        gamestate = 4;
    }
    if (gamestate === 3 && (getDistance(w*0.87,h*0.1,mouseX,mouseY) < 30)) {
        gamestate = 4;
    }
    if (gamestate === 4) {
        for (let i = 0; i < shopItems.length; i++) {
            rect(w/2,h/2,w-w/6,h/3);
            if (!shopItems[i].unlocked && getDistance(shopItems[i].x,shopItems[i].y, mouseX,mouseY) < 40 && !selectingOrBuying) {
                shopItems[i].buying = true;
                selectingOrBuying = true;
                break;
            }
            if (getDistance(shopItems[i].x,shopItems[i].y, mouseX,mouseY) < 40 && shopItems[i].unlocked && !selectingOrBuying) {
                shopItems[i].selecting = true;
                selectingOrBuying = true;
                break;
            }
            if (shopItems[i].buying && (mouseX > w/2-w/6/2 && mouseX < w/2+w/12) && (mouseY > (h/2+h/9-h/40) && mouseY < (h/2+h/9+h/40)) && totalScore >= shopItems[i].price) {
                shopItems[i].unlocked = true;
                totalScore -= shopItems[i].price;
                localStorage.setItem("totalScore",JSON.stringify(totalScore));
                shopItems[i].buying = false;
                for (let j = 0; j < shopItems.length;j++) {
                    shopItems[j].selected = false;
                }
                shopItems[i].selected = true;
                colors = shopItems[i].colors;
                shopLogo = new ShopLogo(w/2,h*0.1);
                colorJumpLogoGame = new ColorJumpLogo(200, 300);
                colorJumpLogoMenu = new ColorJumpLogo(200,75);
                homeCircle1 = createCircle(w/2,h/2, 175, -1, 20);
                homeCircle2 = createCircle(w/2,h/2, 210, 1, 30);
                homeCircle3 = createCircle(w/2,h/2, 255, -1, 40);
                selectingOrBuying = false;
                break;
            } 
            if (shopItems[i].buying && !((mouseX > w/2-(w-w/6)/2 && mouseX < w/2+(w-w/6)/2) && (mouseY > h/2-h/3/2 && mouseY < h/2+h/3/2))) {
                shopItems[i].buying = false;
                selectingOrBuying = false;
                break;
            }
            if (shopItems[i].selecting && (mouseX > w/2-w/6/2 && mouseX < w/2+w/12) && (mouseY > (h/2+h/9-h/40) && mouseY < (h/2+h/9+h/40))) {
                for (let j = 0; j < shopItems.length;j++) {
                    shopItems[j].selected = false;
                }
                shopItems[i].selected = true;
                colors = shopItems[i].colors;
                shopLogo = new ShopLogo(w/2,h*0.1);
                colorJumpLogoGame = new ColorJumpLogo(200, 300);
                colorJumpLogoMenu = new ColorJumpLogo(200,75);
                homeCircle1 = createCircle(w/2,h/2, 175, -1, 20);
                homeCircle2 = createCircle(w/2,h/2, 210, 1, 30);
                homeCircle3 = createCircle(w/2,h/2, 255, -1, 40);
                shopItems[i].selecting = false;
                selectingOrBuying = false;
                break;
            } 
            if (shopItems[i].selecting && !((mouseX > w/2-(w-w/6)/2 && mouseX < w/2+(w-w/6)/2) && (mouseY > h/2-h/3/2 && mouseY < h/2+h/3/2))) {
                shopItems[i].selecting = false;
                selectingOrBuying = false;
                break;
            }

        }
    }
}
// definiëren variabelen e.d. voor in het spel
let colorSwitchers = [];
let points = [];
let player = new Player();
let playerDeathCircles = false;
let counter = 0;
let colorJumpLogoGame = new ColorJumpLogo(200, 300);
let colorJumpLogoMenu = new ColorJumpLogo(200,75);
let shopLogo = new ShopLogo(w/2,h*0.1);
let bottomHand = new BottomHand();
let score = 0;
let selectingOrBuying = false;
let homeCircle1 = createCircle(w/2,h/2, 175, -1, 20);
let homeCircle2 = createCircle(w/2,h/2, 210, 1, 30);
let homeCircle3 = createCircle(w/2,h/2, 255, -1, 40);
let obstacles = [ 
    {obstacle: createCircleObstacle(200,100,200,-1,30), type : "circle", height: 100},
    {obstacle: createCircleObstacle(200, -250, 200, 1, 30), type : "circle", height: 100},
    {}
];
createObstacle(obstacles[2], -350);
// het aanmaken van de shopitems, deze wordt gehaald vanuit de localstorage, mocht dit er nog niet in staan wordt het naar false gezet en dan aangemaakt
let shopItems = JSON.parse(localStorage.getItem("shopItems") || "false");
if (!shopItems) {
    shopItems = [new ShopItem((w-(w/10))/3, h/1.5 - 150, colorPacks[0], 25,true, true)];
    for (let i = 1; i < colorPacks.length; i++) {
        if (i < floor(colorPacks.length/2)) {
            shopItems.push(new ShopItem((w-(w/10))/3+i*85, h/1.5 - 150, colorPacks[i], 20 + 10*i, false, false));
        } else {
            shopItems.push(new ShopItem((w-(w/10))/3+((i-floor(colorPacks.length/2))*85), h/1.5, colorPacks[i], 20 + 10*i, false, false));
        }
    }
}
// JSON neemt alleen de toestand van een object mee, niet de methodes, dus deze worden nog gegeven aan de zojuist opgehaalde objecten
for (let i = 0; i < shopItems.length; i++) {
    shopItems[i] = Object.assign(new ShopItem(), shopItems[i]);
    shopItems[i].colors = colorPacks[i];
    // zodat altijd de eerste selected is bij opstarten.
    shopItems[i].selected = false;
    shopItems[0].selected = true;
}

let bestScore = 0
let totalScore = JSON.parse(localStorage.getItem("totalScore") || "0");
// draw functie voor al het animeren
function draw() {
    background(40);
    if (gamestate === 0) { // thuisscherm     
        for(let i = 0; i < homeCircle3.length; i++ ) {
            homeCircle3[i].show();
            homeCircle3[i].update();
        }
        for(let i = 0; i < homeCircle2.length; i++ ) {
            homeCircle2[i].show();
            homeCircle2[i].update();
        }
        for(let i = 0; i < homeCircle1.length; i++ ) {
            homeCircle1[i].show();
            homeCircle1[i].update();
        }
        playButton();
        colorJumpLogoMenu.show();
        shopButton(w/2,h*0.85,100);

    }
    if (gamestate === 1 || gamestate === 2) { // het bewegen en tekenen van de verschillende obstakels en andere game elementen
        colorJumpLogoGame.show();
        bottomHand.show();
        for (let i = 0; i < obstacles.length; i++) {
            for (let j = 0; j < obstacles[i].obstacle.length; j++) {
                if (obstacles[i].type == "line" || obstacles[i].type == "circleDiamondEllipses" || obstacles[i].type == "doubleCross") {
                    for (let k = 0; k < obstacles[i].obstacle[j].length; k++) {
                        obstacles[i].obstacle[j][k].show();
                        obstacles[i].obstacle[j][k].update();
                        if (obstacles[i].obstacle[floor(obstacles[i].obstacle.length/2)][k].centerY > h + obstacles[i].height + 150) {
                            if (i === 0 && (obstacles[obstacles.length - 1].type == "line" || obstacles[obstacles.length - 1].type == "circleDiamondEllipses" || obstacles[obstacles.length -1].type == "doubleCross")) {
                                createObstacle(obstacles[i], int(obstacles[obstacles.length-1].obstacle[floor(obstacles[obstacles.length-1].obstacle.length/2)][0].centerY - obstacles[obstacles.length-1].height));
                            } else if (i === 0) {
                                createObstacle(obstacles[i], int(obstacles[obstacles.length-1].obstacle[j].centerY - obstacles[obstacles.length-1].height));
                            } else if (obstacles[i-1].type == "line" || obstacles[i-1].type == "circleDiamondEllipses" || obstacles[i-1].type == "doubleCross") {
                                createObstacle(obstacles[i], int(obstacles[i-1].obstacle[floor(obstacles[i-1].obstacle.length/2)][0].centerY - obstacles[i-1].height - obstacles[i].height));
                            }  else {
                                createObstacle(obstacles[i], int(obstacles[i-1].obstacle[j].centerY - obstacles[i-1].height - obstacles[i].height));
                            }
                        }
                    }
                } else {
                    obstacles[i].obstacle[j].show();
                    obstacles[i].obstacle[j].update();
                    if (obstacles[i].obstacle[j].centerY > h + obstacles[i].height + 50) {
                        if (i === 0 && (obstacles[obstacles.length - 1].type == "line" || obstacles[obstacles.length - 1].type == "circleDiamondEllipses" || obstacles[obstacles.length - 1].type == "doubleCross")) {
                            createObstacle(obstacles[i], int(obstacles[obstacles.length-1].obstacle[floor(obstacles[obstacles.length-1].obstacle.length/2)][0].centerY - obstacles[obstacles.length-1].height));
                        } else if (i === 0) {
                            createObstacle(obstacles[i], int(obstacles[obstacles.length-1].obstacle[j].centerY - obstacles[obstacles.length-1].height));
                        } else if (obstacles[i-1].type == "line" || obstacles[i-1].type == "circleDiamondEllipses" || obstacles[i].type == "doubleCross") {
                            createObstacle(obstacles[i], int(obstacles[i-1].obstacle[floor(obstacles[i-1].obstacle.length/2)][0].centerY - obstacles[i-1].height));
                        }  else {
                            createObstacle(obstacles[i], int(obstacles[i-1].obstacle[j].centerY - obstacles[i-1].height));
                        }
                    }
                }
            }
        } 
        for (let i = 0; i < colorSwitchers.length; i++) {
        colorSwitchers[i].show();
        }
        for (let i = 0; i < points.length; i++) {
            points[i].show();
        }
    }
    // alles wat er getekend moet worden wanneer de speler leeft,
    //  de functies die ervoor zorgen dat de obstakels meebewegen en de functies die ervoor zorgen dat de speler doodgaat wanneer deze een obstakel aanraakt dat niet dezelfde kleur is
    if (gamestate === 1) { 
        textSize(50);
        textFont(myFont);
        fill(255);
        text(score, w/8, h/15);
        player.show();
        player.update();
        for (let i = 0; i < points.length; i++) {
            points[i].screenUpdate(player);
            if (player.intersects(points[i]) && !points[i].used) {
                score += 1;
                points[i].used = true;
            }
        }
        for (let i = 0; i < colorSwitchers.length; i ++){
            colorSwitchers[i].screenUpdate(player);
            if (player.intersects(colorSwitchers[i]) && !colorSwitchers[i].used) {
                player.playColor = colors[floor(random(0,4))];
                colorSwitchers[i].used = true;
            }
        }
        bottomHand.screenUpdate(player);
        colorJumpLogoGame.screenUpdate(player);
        for (let i = 0; i < obstacles.length; i++) {
            for (let j = 0; j < obstacles[i].obstacle.length; j++) {
                if (obstacles[i].type === "line" || obstacles[i].type === "circleDiamondEllipses" || obstacles[i].type === "doubleCross") {
                    for (let k = 0; k < obstacles[i].obstacle[j].length; k++) {
                        obstacles[i].obstacle[j][k].screenUpdate(player);
                        if (obstacles[i].type === "line" && player.intersectsLine(obstacles[i].obstacle)) {
                            gamestate = 2;
                        }
                        if (obstacles[i].type === "circleDiamondEllipses") {
                            if (player.intersectsCircle(obstacles[i].obstacle[0]) && player.intersectCircleColor(obstacles[i].obstacle[0])) {
                                gamestate = 2;
                            }
                            if (player.intersects(obstacles[i].obstacle[1][k]) && player.playColor != obstacles[i].obstacle[1][k].color) {
                                gamestate = 2;
                            }
                        }
                        if (obstacles[i].type === "doubleCross" && player.intersects(obstacles[i].obstacle[j][k].circle) && player.playColor != obstacles[i].obstacle[j][k].color) {
                            gamestate = 2;
                        }
                    }
                }
                else if (obstacles[i].type === "circle") {
                    obstacles[i].obstacle[j].screenUpdate(player);
                    if (player.intersectsCircle(obstacles[i].obstacle) && player.intersectCircleColor(obstacles[i].obstacle)) {
                        gamestate = 2;
                    }
                } 
                else if (obstacles[i].type === "cross") {
                    obstacles[i].obstacle[j].screenUpdate(player);
                    if (player.intersects(obstacles[i].obstacle[j].circle) && player.playColor != obstacles[i].obstacle[j].color) {
                        gamestate = 2;
                    }
                } else {
                    obstacles[i].obstacle[j].screenUpdate(player);
                    if (player.intersects(obstacles[i].obstacle[j]) && player.playColor != obstacles[i].obstacle[j].color) {
                        gamestate = 2;
                    }
                }
            }
        } 
    }
    if(gamestate === 2) { // alles wat er gedaan moet worden wanneer de speler doodgaat
        if (counter < 90) {
            if (!playerDeathCircles) {
            playerDeathCircles = createPlayerDeathCircles();
            }
            for (i = 0; i < playerDeathCircles.length; i++) {
            playerDeathCircles[i].show();
            playerDeathCircles[i].update();
            }
            counter += 1;
        }
    } 
        if(counter >= 90) {
            gamestate = 3;
            bestScore = Math.max(score, parseInt(localStorage.getItem("bestScore") || "0"));
            localStorage.setItem("bestScore", JSON.stringify(bestScore));
            totalScore += score;
            localStorage.setItem("totalScore",JSON.stringify(totalScore));
    }
    if (gamestate === 3) { // het eindscherm dat getoond wordt nadat de speler dood is.
        playerDeathCircles = false;
        counter = 0;
        colorSwitchers = [];
        points = [];
        player = new Player();
        obstacles = [ 
            {obstacle: createCircleObstacle(200,100,200,-1,30), type : "circle", height : 100},
            {obstacle: createCircleObstacle(200, -250, 200, 1, 30), type : "circle", height: 100},
            {}
        ];
        createObstacle(obstacles[2], -350);
        colorJumpLogoGame = new ColorJumpLogo(200, 300);
        bottomHand = new BottomHand();
        rectMode(CORNER);
        fill(65);
        rect(-2,160, w + 50, 35);
        fill(255,128,0);
        rect(-2, 245, w + 50, 35);
        fill(255);
        textSize(40);
        text('SCORE', 200, 175);
        text('BEST SCORE', 200, 260);
        textSize(50);
        text(score, 200, 215);
        text(bestScore, 200, 300);
        retryButton();
        backHomeButton();
        colorJumpLogoMenu.show();
        shopButton(w*0.87,h*0.1,60);
        image(pointImage, w/2, h * 0.8, 30,30);
        textSize(40);
        fill(255);
        text(totalScore, w/2, h* 0.8 + 30);
    }
    if (gamestate === 4) { // de winkel.
        shopLogo.show();
        backHomeButton();
        for (let i = 0; i < shopItems.length; i++) {
            if (!selectingOrBuying) {
                shopItems[i].show();
            }
        }
        for (let i = 0; i < shopItems.length; i++) {
            if (shopItems[i].selecting) {
                shopItems[i].select();
            }
            if (shopItems[i].buying) {
                shopItems[i].buy();
            }
        }
        image(pointImage, w * 0.87, h * 0.1, 30,30);
        textSize(40);
        text(totalScore, w*0.87, h* 0.1 + 30);
        colorSwitchers = [];
        points = [];
        player = new Player();
        obstacles = [ 
            {obstacle: createCircleObstacle(200,100,200,-1,30), type : "circle", height : 100},
            {obstacle: createCircleObstacle(200, -250, 200, 1, 30), type : "circle", height: 100},
            {}
        ];
        createObstacle(obstacles[2], -350);
        localStorage.setItem("shopItems", JSON.stringify(shopItems));
        localStorage.setItem("colors", JSON.stringify(colors));
    }
}