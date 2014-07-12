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
		game.clearCanvas();
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
	this.ballCollection = new Array();
	this.ballCollection.push(new Ball(canvas.width - 30, 400, 24, 1, '#333', '#000', 10));
	this.frameTime = Date.now();
	this.deltaTime = 0;
}

Game.prototype.run = function() 
{
	this.deltaTime = (Date.now() - this.frameTime) / 1000;
	this.frameTime = Date.now();
	this.update();
}

Game.prototype.update = function()
{
	this.clearCanvas();
	this.player.update();
	for (var ballIndex = 0; ballIndex < this.ballCollection.length; ++ballIndex)
	{
		this.ballCollection[ballIndex].update();
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

Player.prototype.draw = function()
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

Player.prototype.update = function()
{
	var deltaX = this.movement.x * this.speed * game.deltaTime;

	if (this.isValidXPosition(this.position.x + deltaX))
	{
		this.position.x += deltaX;
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
	context.lineWidth = this.width;
	context.strokeStyle = "#000";

	context.moveTo(this.origin.x, this.origin.y);
	context.lineTo(this.position.x, this.position.y);
	var arrowHeadHeight = 8;
	var arrowHeadWidth = 6;
	context.moveTo(this.position.x + arrowHeadWidth, this.position.y + arrowHeadHeight);
	context.lineTo(this.position.x, this.position.y);
	context.lineTo(this.position.x - arrowHeadWidth, this.position.y + arrowHeadHeight);
	context.stroke();
}

Bullet.prototype.stop = function()
{
	game.player.shooting = false;
	game.player.bullet = null;
}

/* 
 * +---------------------------------------------------+
 * | Ball Prototype
 * +---------------------------------------------------+
 */

function Ball(x, y, radius, sizeModifier, strokeColor, fillColor, strokeWidth, bounce)
{
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.actualRadius = radius * sizeModifier;
	this.speed = 80;
	this.sizeModifier = sizeModifier;
	this.direction = 1;
	this.strokeColor = strokeColor;
	this.fillColor = fillColor;
	this.strokeWidth = strokeWidth;
	this.wasOutside = false;
	this.bounceFunction = (typeof bounce === "undefined") ? null : bounce;
	this.offsetX = 0;
	var ball = this;
	this.movementFunction = function(x)
	{
		// Formula: abs(sin(x / 60)) * 150 - 45
		var minHeight = 2 * game.player.height;
		var heightMultiplier = (150 * ball.sizeModifier);// * ball.sizeModifier < minHeight) ? minHeight : 150 * ball.sizeModifier;
		var widthMultiplier = 1 / (60 * ball.sizeModifier);//  + (1 - ball.sizeModifier));
		return canvas.height - (game.groundLevel + ball.radius * ball.sizeModifier + Math.abs(Math.sin((x - ball.offsetX) * widthMultiplier)) * heightMultiplier);
	}
	this.getYPosition = (this.bounceFunction !== null) ? this.bounceFunction : this.movementFunction;
}

Ball.prototype.collidesWithPlayer = function()
{
	if (this.isInsideCircle(game.player.x - game.player.strokeWidth, game.player.y + game.player.strokeWidth)
		|| this.isInsideCircle(game.player.x + game.player.baseLineWidth + game.player.strokeWidth, game.player.y + game.player.strokeWidth)
		|| this.isInsideCircle(game.player.x + game.player.baseLineWidth / 2, game.player.y - game.player.height - game.player.strokeWidth))
	{
		return true;
	}
	return false;
}

Ball.prototype.collidesWithBullet = function()
{
	if (game.player.bullet == null)
	{
		return false;
	}
	if (this.isInsideCircle(game.player.bullet.position.x, this.y))
	{
		return this.y >= game.player.bullet.position.y;
	}
	return false;
}

Ball.prototype.isInsideCircle = function(x, y)
{
	return Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) < Math.pow(this.actualRadius, 2);
}

Ball.prototype.draw = function()
{
	context.beginPath();
	context.arc(this.x, this.y, this.actualRadius, 0, 2 * Math.PI);
	context.lineWidth = this.strokeWidth;
	context.strokeStyle = this.strokeColor;
	if (this.sizeModifier <= 0.75)
	{
		context.strokeStyle = 'darkgreen';
	}
	if (this.sizeModifier <= 0.5)
	{
		context.strokeStyle = 'orange';
	}
	if (this.sizeModifier <= 0.25)
	{
		context.strokeStyle = 'darkred';
	}
	context.lineWidth *= this.sizeModifier;
	context.fillStyle = this.fillColor;
	context.stroke();
	context.fill();
}

Ball.prototype.mirror = function(func, mirrorX)
{	
	var mirrored = function(x)
	{
		return func(2 * mirrorX - x);
	}
	return mirrored;
}

Ball.prototype.update = function()
{
	var outsideRight = this.x + this.actualRadius >= canvas.width;
	var outsideLeft = this.x - this.actualRadius <= 0;
	if ((outsideRight || outsideLeft) && !this.wasOutside)
	{
		// Should ensure that the change in direction only occurs once
		this.wasOutside = true;
		var mirrorX = this.x;
		if (this.direction === 1)
		{
			this.getYPosition = this.mirror(this.getYPosition, mirrorX);
		}
		else
		{
			this.getYPosition = this.mirror(this.getYPosition, mirrorX);
		}
		this.direction *= -1;
	}
	this.wasOutside = (outsideLeft || outsideRight) ? true : false;

	if (this.y + this.radius * this.sizeModifier >= canvas.height - game.groundLevel)
	{
		this.offsetX = this.x;
		this.getYPosition = this.movementFunction;
		console.log("hit ground");
	}

	this.x += this.speed * game.deltaTime * this.direction;
	this.y = this.getYPosition(this.x);
	
	if (this.collidesWithPlayer())
	{
		game.player.collisionDetected("Ball");
	}
	if (this.collidesWithBullet())
	{
		console.log("Collided with Bullet");
		game.player.bullet.stop();
		var ballIndex = game.ballCollection.indexOf(this);
		game.ballCollection.splice(ballIndex, 1);
		if (this.sizeModifier > 0.25)
		{
			var offset = this.x;
			var startY = this.y;
			var bounce = function(x)
			{
				return startY + Math.pow(x - offset - 50, 2) / 50 - 50;
			}
			var childSize = this.sizeModifier - 0.25;
			var rightChild = new Ball(this.x, this.y, this.radius,
				childSize, '#333', '#000', this.strokeWidth, bounce);

			var leftChild = new Ball(this.x, this.y, this.radius,
				childSize, '#333', '#000', this.strokeWidth, this.mirror(bounce, offset));
			leftChild.direction *= -1;
;
			game.ballCollection.push(rightChild);
			game.ballCollection.push(leftChild);
		}
	}

	this.draw();
}

/* 
 * +---------------------------------------------------+
 * | Utility - Vector (2D)
 * +---------------------------------------------------+
 */

function Vector(x, y)
{
	this.x = x;
	this.y = y;
}