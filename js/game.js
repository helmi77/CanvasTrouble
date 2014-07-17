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
		game.player.bullet = new Bullet(
			new Vector(game.player.position.x + game.player.baseLineWidth / 2, game.player.position.y), 1, 250
		);
	}
	if (code === 83)
	{
		// S pressed
		game.player.movement.y = 1;
	}
	if (code === 68)
	{
		// D pressed
		game.player.movement.x = 1;
	}
	if (code === 65)
	{
		// A pressed
		game.player.movement.x = -1;
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
	}
	if (code === 83)
	{
		// S released
	}
	if (code === 68)
	{
		// D released
		if (game.player.movement.x > 0)
		{
			game.player.movement.x -= 1;
		}
	}
	if (code === 65)
	{
		// A released
		if (game.player.movement.x < 0)
		{
			game.player.movement.x += 1;
		}
	}
	if (code === 16)
	{
		// Shift released
	}
}

/* 
 * +---------------------------------------------------+
 * | Button Event Handlers
 * +---------------------------------------------------+
 */

function runClicked()
{
	if (game === null)
	{
		game = new Game();
		var boundRun = game.run.bind(game);
		intervalId = setInterval(boundRun, 1);
		console.log("Game started");
	}
}
function restartClicked()
{
	stopClicked();
	game = new Game();
	var boundRun = game.run.bind(game);
	intervalId = setInterval(boundRun, 1);
	console.log("Game restarted");
}
function stopClicked()
{	
	if (intervalId !== null && game !== null)
	{
		//game.clearCanvas();
		clearInterval(intervalId);
	}
	game = null;
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
	this.spikeHeight = 10;
	this.spikeWidth = 15;
	this.player = new Player(new Vector(canvas.width / 2, canvas.height - this.groundLevel), 32, 32);
	this.bubbleCollection = new Array();
	this.bubbleCollection.push(new Bubble(new Vector(canvas.width - 30, 400), 24, 1, '#000', 4));
	this.frameTime = Date.now();
	this.deltaTime = 0;
}

Game.prototype.run = function() 
{
	this.deltaTime = (Date.now() - this.frameTime) / 1000;
	this.frameTime = Date.now();
	this.update();
	this.draw();
}

Game.prototype.update = function()
{
	this.player.update();
	for (var bubbleIndex = 0; bubbleIndex < this.bubbleCollection.length; ++bubbleIndex)
	{
		this.bubbleCollection[bubbleIndex].update();
	}
}

Game.prototype.draw = function()
{
	this.clearCanvas();
	this.player.draw();
	for (var bubbleIndex = 0; bubbleIndex < this.bubbleCollection.length; ++bubbleIndex)
	{
		this.bubbleCollection[bubbleIndex].draw();
	}
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
	// Draw the spikes which are hanging from the roof
	context.beginPath();
	context.moveTo(0, canvas.height - this.roofLevel);

	var spikeCount = canvas.width / game.spikeWidth;
	for (var spikeIndex = 1; spikeIndex <= spikeCount + 1; ++spikeIndex)
	{
		context.lineTo(game.spikeWidth * (spikeIndex - 1) + game.spikeWidth / 2, canvas.height - this.roofLevel + game.spikeHeight);
		context.lineTo(spikeIndex * game.spikeWidth, canvas.height - this.roofLevel);
	}
	context.closePath();
	context.fill();
	context.strokeStyle = this.roofColor;
	context.lineWidth = 1;
	context.stroke();
}

/* 
 * +---------------------------------------------------+
 * | Player Prototype
 * +---------------------------------------------------+
 */

function Player(position, baseLineWidth, height, speed)
{
	this.speed = (typeof speed === "undefined") ? 100 : speed;
	this.position = position;
	this.movement = new Vector(0, 0);
	this.baseLineWidth = baseLineWidth;
	this.height = height;
	this.shooting = false;
	this.bullet = null;
	this.strokeWidth = 6;
}

Player.prototype.collisionDetected = function(collider)
{
	console.log("Player collided with " + collider);
}

Player.prototype.drawPlayer = function()
{
	context.beginPath();
	context.moveTo(this.position.x, this.position.y);
	context.lineTo(this.position.x + this.baseLineWidth, this.position.y);
	context.lineTo(this.position.x + this.baseLineWidth / 2, this.position.y - this.height);
	context.closePath();

	context.strokeStyle = "#333";
	context.fillStyle = "#000";
	context.lineWidth = this.strokeWidth;
	context.fill();
	context.stroke();
}

Player.prototype.draw = function()
{
	if (this.bullet !== null)
	{
		this.bullet.draw();
	}
	this.drawPlayer();
}

Player.prototype.update = function()
{
	var deltaX = this.movement.x * this.speed * game.deltaTime;

	if (this.isValidXPosition(this.position.x + deltaX))
	{
		this.position.x += deltaX;
	}

	this.handleBullet();
}

Player.prototype.handleBullet = function()
{
	if (this.bullet !== null)
	{
		this.bullet.move();
		if (!this.bullet.isVisible())
		{
			console.log("Bullet is invisible");
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

function Bullet(position, width, speed)
{
	this.origin = new Vector(position.x, position.y);
	this.position = position;
	this.width = width;
	this.speed = speed;
}

Bullet.prototype.move = function()
{
	this.position.y -= this.speed * game.deltaTime;
}

Bullet.prototype.isVisible = function()
{
	if (this.position.y < canvas.height - game.roofLevel + game.spikeHeight)
	{
		return false;
	}
	return true;
}

Bullet.prototype.draw = function()
{
	var arrowHeadHeight = 8;
	var arrowHeadWidth = 6;

	context.beginPath();
	context.moveTo(this.origin.x, this.origin.y);
	context.lineTo(this.position.x, this.position.y);
	context.moveTo(this.position.x + arrowHeadWidth, this.position.y + arrowHeadHeight);
	context.lineTo(this.position.x, this.position.y);
	context.lineTo(this.position.x - arrowHeadWidth, this.position.y + arrowHeadHeight);

	context.lineWidth = this.width;
	context.strokeStyle = "#000";
	context.stroke();
}

Bullet.prototype.stop = function()
{
	game.player.shooting = false;
	game.player.bullet = null;
}

/* 
 * +---------------------------------------------------+
 * | Bubble Prototype
 * +---------------------------------------------------+
 */

function Bubble(position, radius, sizeModifier, fillColor, splitCount, bounce, maxJumpHeight, maxJumpWidth)
{
	this.position = position;
	this.radius = radius;
	this.speed = 80;
	this.sizeModifier = sizeModifier;
	this.actualRadius = radius * sizeModifier;
	this.direction = 1;

	var darkGreen = Color.hsl(0.283, 0.7083, 0.26);
	var end = darkGreen.hslData();

	var darkRed = Color.rgb(172, 15, 11);
	var start = darkRed.hslData();

	var newH = start[0] + (end[0] - start[0]) * this.sizeModifier;
	this.strokeColor = Color.hsl(newH, start[1], start[2]).rgb();

	this.fillColor = fillColor;
	var minStrokeWidth = 5;
	this.strokeWidth = 2 * this.actualRadius * 0.2;
	this.strokeWidth = (this.strokeWidth < minStrokeWidth) ? minStrokeWidth : this.strokeWidth;
	this.sizeStep = 1 / splitCount;
	this.splitCount = splitCount;
	this.wasOutside = false;
	this.bounceFunction = (typeof bounce === "undefined") ? null : bounce;
	this.maxJumpHeight = (typeof maxHeight === "undefined") ? 150 : maxJumpHeight;
	this.maxJumpWidth = (typeof maxWidth === "undefined") ? 60 : maxJumpWidth;
	this.offsetX = 0;
	var bubble = this;
	this.movementFunction = function(x)
	{
		var minHeight = game.player.height + (game.player.height / 2);
		var heightMultiplier = (bubble.maxJumpHeight * bubble.sizeModifier);
		heightMultiplier = (heightMultiplier < minHeight) ? minHeight : heightMultiplier;

		var widthDenominator = bubble.maxJumpWidth * bubble.sizeModifier;
		widthDenominator = (widthDenominator < game.player.baseLineWidth / 1.5) ? game.player.baseLineWidth / 1.5 : widthDenominator;
		var widthMultiplier = 1 / widthDenominator;

		return canvas.height - (game.groundLevel + bubble.actualRadius + bubble.strokeWidth / 2 + Math.abs(Math.sin((x - bubble.offsetX) * widthMultiplier)) * heightMultiplier);
	}
	this.getYPosition = (this.bounceFunction !== null) ? this.bounceFunction : this.movementFunction;
}

Bubble.prototype.collidesWithPlayer = function()
{
	var playerX = game.player.position.x;
	var playerY = game.player.position.y;
	if (this.isInsideCircle(playerX - game.player.strokeWidth, playerY + game.player.strokeWidth)
		|| this.isInsideCircle(playerX + game.player.baseLineWidth + game.player.strokeWidth, playerY + game.player.strokeWidth)
		|| this.isInsideCircle(playerX + game.player.baseLineWidth / 2, playerY - game.player.height - game.player.strokeWidth))
	{
		return true;
	}
	return false;
}

Bubble.prototype.collidesWithBullet = function()
{
	if (game.player.bullet == null)
	{
		return false;
	}
	if (this.isInsideCircle(game.player.bullet.position.x, this.position.y))
	{
		return this.position.y >= game.player.bullet.position.y;
	}
	return false;
}

Bubble.prototype.isInsideCircle = function(x, y)
{
	return Math.pow(x - this.position.x, 2) + Math.pow(y - this.position.y, 2) < Math.pow(this.actualRadius + this.strokeWidth / 2, 2);
}

Bubble.prototype.draw = function()
{
	context.beginPath();
	context.arc(this.position.x, this.position.y, this.actualRadius, 0, 2 * Math.PI);
	context.lineWidth = this.strokeWidth;
	context.strokeStyle = this.strokeColor;

	context.fillStyle = this.fillColor;
	context.strokeStyle = this.strokeColor;
	context.lineWidth = this.strokeWidth;
	context.stroke();
	context.fill();
}

Bubble.prototype.isBelowGround = function()
{
	return this.position.y + this.actualRadius >= canvas.height - game.groundLevel;
}

Bubble.prototype.split = function()
{
	var offset = this.position.x;
	var startY = this.position.y;
	var bounce = function(x)
	{
		return startY + Math.pow(x - offset - 50, 2) / 50 - 50;
	}

	var childSize = this.sizeModifier - this.sizeStep;
	var rightChild = new Bubble(new Vector(this.position), this.radius, childSize, 
		'#000', this.splitCount, bounce);

	var leftChild = new Bubble(new Vector(this.position), this.radius, childSize, 
		'#000', this.splitCount, mirrorFunction(bounce, offset));
	leftChild.direction *= -1;

	game.bubbleCollection.push(rightChild);
	game.bubbleCollection.push(leftChild);
}

Bubble.prototype.update = function()
{
	var outsideRight = this.position.x + this.actualRadius + this.strokeWidth / 2 >= canvas.width;
	var outsideLeft = this.position.x - this.actualRadius - this.strokeWidth / 2 <= 0;
	if ((outsideRight || outsideLeft) && !this.wasOutside)
	{
		// Should ensure that the change in direction only occurs once
		this.wasOutside = true;
		var mirrorX = this.position.x;
		this.getYPosition = mirrorFunction(this.getYPosition, mirrorX);
		this.direction *= -1;
	}
	this.wasOutside = (outsideLeft || outsideRight) ? true : false;

	if (this.isBelowGround())
	{
		this.offsetX = this.position.x;
		this.getYPosition = this.movementFunction;
		console.log("hit ground");
	}

	this.position.x += this.speed * game.deltaTime * this.direction;
	this.position.y = this.getYPosition(this.position.x);
	
	if (this.collidesWithPlayer())
	{
		game.player.collisionDetected("Bubble");
	}
	if (this.collidesWithBullet())
	{
		console.log("Collided with Bullet");
		game.player.bullet.stop();
		var bubbleIndex = game.bubbleCollection.indexOf(this);
		game.bubbleCollection.splice(bubbleIndex, 1);
		console.log(this.sizeModifier.toFixed(2) + " / " + this.sizeStep.toFixed(2));
		if (this.sizeModifier > this.sizeStep)
		{
			this.split();
		}
	}
}

/* 
 * +---------------------------------------------------+
 * | Utility - Vector (2D)
 * +---------------------------------------------------+
 */

function Vector()
{
	if (arguments.length === 2)
	{
		this.x = arguments[0];
		this.y = arguments[1];
	}
	else if (arguments.length === 1)
	{
		this.x = arguments[0].x;
		this.y = arguments[0].y;
	}
}

/* 
 * +---------------------------------------------------+
 * | Utility - Functions
 * +---------------------------------------------------+
 */

function mirrorFunction(func, mirrorX)
{
	var mirrored = function(x)
	{
		return func(2 * mirrorX - x);
	}
	return mirrored;
}
