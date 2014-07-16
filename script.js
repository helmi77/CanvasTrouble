/* 
 * +---------------------------------------------------+
 * | Window Globals
 * +---------------------------------------------------+
 */

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

/* 
 * +---------------------------------------------------+
 * | Game Globals
 * +---------------------------------------------------+
 */

var intervalId = null;
var game = null;

/* 
 * +---------------------------------------------------+
 * | Key Events                                        
 * +---------------------------------------------------+
 */

window.addEventListener('keydown', keyPressed, true);
window.addEventListener('keyup', keyReleased, true);

function keyPressed(args)
{
	var code = args.keyCode;
	if (code === 87 && !game.player.shooting)
	{
		// W pressed
		game.player.shooting = true;
		game.player.bullet = new Bullet(game.player.x + game.player.baseLineWidth / 2, 
			game.player.y, 1, 200);
	}
	else if (code === 83)
	{
		// S pressed
		game.player.movementY = 1;
	}

	if (code === 68)
	{
		// D pressed
		game.player.movementX = 1;
	}
	else if (code === 65)
	{
		// A pressed
		game.player.movementX = -1;
	}

	if (code === 16)
	{
		// Shift pressed
	}
	if (code == 32)
	{
		// Spacebar pressed
	}
}

function keyReleased(args)
{
	var code = args.keyCode;
	if (code === 87)	
	{
		// W released
		game.player.movementY = 0;
	}
	if (code === 83)
	{
		// S released
		game.player.movementY = 0;
	}
	if (code === 68)
	{
		// D released
		if (game.player.movementX > 0)
		{
			game.player.movementX -= 1;
		}
	}
	if (code === 65)
	{
		// A released
		if (game.player.movementX < 0)
		{
			game.player.movementX += 1;
		}
	}

	if (code === 16)
	{
		// Shift pressed
	}
}

/* 
 * +---------------------------------------------------+
 * | Button Event Handlers
 * +---------------------------------------------------+
 */

function runClicked()
{
	game = new Game();
	var boundRun = game.run.bind(game);
	intervalId = setInterval(boundRun, 1);
	console.log("Game started");
}

function stopClicked()
{
	if (intervalId !== null)
	{
		game.clearCanvas();
		clearInterval(intervalId);
	}
	console.log("Game stopped");
}

/* 
 * +---------------------------------------------------+
 * | Game Prototype
 * +---------------------------------------------------+
 */

function Game()
{
	this.groundLevel = 25;
	this.groundColor = '#333';
	this.roofLevel = 425;
	this.roofColor = this.groundColor;
	this.player = new Player(canvas.width / 2, canvas.height - this.groundLevel, 32, 32);
	this.ball = new Ball(canvas.width / 2, 400, 18, '#333', '#000', 12);
	this.frameTime = 0;
	this.deltaTime = 0;
}

Game.prototype.run = function() 
{
	var newDeltaTime = (Date.now() - this.frameTime) / 1000;
	this.deltaTime = (newDeltaTime === 0) ? this.deltaTime : newDeltaTime;
	this.frameTime = Date.now();
	this.update();
}

Game.prototype.update = function()
{
	this.clearCanvas();
	this.player.update();
	this.ball.update();
	this.drawGround();
	this.drawRoof();
}

Game.prototype.clearCanvas = function()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
}

Game.prototype.drawGround = function()
{
	context.fillStyle = this.groundColor;
	context.fillRect(0, canvas.height - this.groundLevel, canvas.width, this.groundLevel);
}
Game.prototype.drawRoof = function()
{
	context.fillStyle = this.roofColor;
	context.fillRect(0, 0, canvas.width, canvas.height - this.roofLevel);
}

/* 
 * +---------------------------------------------------+
 * | Player Prototype
 * +---------------------------------------------------+
 */

function Player(x, y, baseLineWidth, height, speed)
{
	this.speed = (typeof speed === "undefined") ? 100 : speed;
	this.x = x;
	this.y = y;
	this.movementX = 0;
	this.movementY = 0;
	this.baseLineWidth = baseLineWidth;
	this.height = height;
	this.shooting = false;
	this.bullet = null;
}

Player.prototype.draw = function()
{
	context.beginPath();
	context.moveTo(this.x, this.y);
	context.lineTo(this.x + this.baseLineWidth, this.y);
	context.lineTo(this.x + this.baseLineWidth / 2, this.y - this.height);
	context.closePath();

	context.strokeStyle = "#333";
	context.fillStyle = "#000";
	context.lineWidth = 6;
	context.fill();
	context.stroke();
}

Player.prototype.update = function()
{
	var deltaX = this.movementX * this.speed * game.deltaTime;

	if (this.isValidXPosition(this.x + deltaX))
	{
		this.x += deltaX;
	}

	this.handleBullet();

	this.draw();
}

Player.prototype.handleBullet = function()
{
	if (this.bullet !== null)
	{
		this.bullet.move();
		this.bullet.draw();
		if (!this.bullet.isVisible())
		{
			console.log("invisible");
			this.bullet = null;
			this.shooting = false;
		}
	}
}

Player.prototype.isValidXPosition = function(x)
{
	if (x < 0 || x + this.baseLineWidth > canvas.width)
	{
		return false;
	}
	return true;
}

/* 
 * +---------------------------------------------------+
 * | Bullet Prototype
 * +---------------------------------------------------+
 */

function Bullet(x, y, width, speed)
{
	this.originX = x;
	this.originY = y;
	this.x = x;
	this.y = y;
	this.width = width;
	this.speed = speed;
}

Bullet.prototype.move = function()
{
	this.y -= this.speed * game.deltaTime;
}

Bullet.prototype.isVisible = function()
{
	if (this.y < canvas.height - game.roofLevel)
	{
		return false;
	}
	return true;
}

Bullet.prototype.draw = function()
{
	context.lineWidth = this.width;
	context.strokeStyle = "#000";

	context.moveTo(this.originX, this.originY);
	context.lineTo(this.x, this.y);
	var arrowHeadHeight = 8;
	var arrowHeadWidth = 6;
	context.moveTo(this.x + arrowHeadWidth, this.y + arrowHeadHeight);
	context.lineTo(this.x, this.y);
	context.lineTo(this.x - arrowHeadWidth, this.y + arrowHeadHeight);
	context.stroke();
}

/* 
 * +---------------------------------------------------+
 * | Ball Prototype
 * +---------------------------------------------------+
 */

function Ball(x, y, radius, strokeColor, fillColor, strokeWidth)
{
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.speed = 0.25;
	this.direction = 1;
	this.strokeColor = strokeColor;
	this.fillColor = fillColor;
	this.strokeWidth = strokeWidth;
}

Ball.prototype.draw = function()
{
	context.beginPath();
	context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
	context.lineWidth = this.strokeWidth;
	context.strokeStyle = this.strokeColor;
	context.fillStyle = this.fillColor;
	context.stroke();
	context.fill();
}

Ball.prototype.update = function()
{
	if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0)
	{
		this.direction *= -1;
	}
	var newX = this.x + this.speed * this.direction;
	var newY = canvas.height - Math.abs(Math.sin(this.x / 60)) * 150 - 45;

	this.x = newX;
	this.y = newY;

	this.draw();
}