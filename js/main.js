const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
const difficulty = [
	[3, 3],
	[3, 5],
	[5, 8],
];
// const difficulty_level = Number(document.URL.split("?")[1].split("level=")[1]);
let level;
if (Number(localStorage.getItem("level"))) {
	level = Number(localStorage.getItem("level"));
} else {
	level = 0;
}
const difficulty_level = level;
console.log(difficulty_level);
const config = {
	width: window.innerWidth,
	height: window.innerHeight,
	rows: difficulty[difficulty_level][0],
	columns: difficulty[difficulty_level][1],
};
config.init_cell = {
	row: Math.floor(Math.random() * config.rows),
	column: Math.floor(Math.random() * config.columns),
};
config.unit_length = {
	width: config.width / config.columns,
	height: config.height / config.rows,
};
const engine = Engine.create();
engine.gravity.y = 0;
const { world } = engine;
const static = {
	isStatic: true,
};
const wall_options = { ...static, render: { fillStyle: "#703800" } };
const maze_walls = {
	...static,
	label: "maze_wall",
	render: {
		fillStyle: "white",
		strokeStyle: "black",
	},
};
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: config.width,
		height: config.height,
		wireframes: false,
	},
});
const check_win = (event) => {
	event.pairs.forEach((collision) => {
		const labels = ["ball", "goal"];
		if (
			labels.includes(collision.bodyA.label) &&
			labels.includes(collision.bodyB.label)
		) {
			win();
		}
	});
};
const win = () => {
	engine.gravity.y = 1;
	world.bodies.forEach((body) => {
		if (body.label === "maze_wall") {
			Body.setStatic(body, false);
		}
	});
	localStorage.setItem("level", difficulty_level + 1);
	const success_overlay = document.querySelector(".success");
	success_overlay.classList.remove("hidden");
	success_overlay.style.animation = "";
	success_overlay.style.animation = "reveal 1s ease-in-out 0s 1 forwards";
	Events.off(engine, "collisionStart");
	document.addEventListener("click", () => {
		if (success_overlay.classList.contains("hidden")) {
			success_overlay.classList.remove("hidden");
			success_overlay.style.animation = "reveal 1s ease-in-out 0s 1 forwards";
		} else {
			success_overlay.style.animation = "hide 1s ease-in-out 0s 1 forwards";
			setTimeout(() => {
				success_overlay.classList.add("hidden");
			}, 1000);
		}
	});
};
Render.run(render);
Runner.run(Runner.create(), engine);

// Canvas Walls
const walls = [
	Bodies.rectangle(config.width / 2, 0, config.width, 4, wall_options),
	Bodies.rectangle(config.width / 2, config.height, config.width, 4, wall_options),
	Bodies.rectangle(0, config.height / 2, 4, config.height, wall_options),
	Bodies.rectangle(config.width, config.height / 2, 4, config.height, wall_options),
];
World.add(world, walls);

// Maze Generation
const grid = Array(config.rows)
	.fill(null)
	.map(() => Array(config.columns).fill(false));
const verticals = Array(config.rows)
	.fill(null)
	.map(() => Array(config.columns - 1).fill(false));
const horizontals = Array(config.rows - 1)
	.fill(null)
	.map(() => Array(config.columns).fill(false));

const explore = (row, column) => {
	// If I have visited the cell at [row, column] in the grid array, then return
	if (grid[row][column]) {
		return;
	}

	// Mark this cell as being visited (in the grid array)
	grid[row][column] = true;

	// Assemble a randomly-ordered list of neighbours
	const neighbours = shuffle([
		[row - 1, column, "up"],
		[row + 1, column, "down"],
		[row, column - 1, "left"],
		[row, column + 1, "right"],
	]);

	// For each neighbour:
	for (const neighbour of neighbours) {
		const [next_row, next_column, direction] = neighbour;

		// 1. See if the neighbour is out of bounds and check the next neighbour if so
		if (
			next_row < 0 ||
			next_row >= config.rows ||
			next_column < 0 ||
			next_column >= config.columns
		) {
			continue;
		}

		// 2. Check if the neighbour has already been visited
		if (grid[next_row][next_column]) {
			continue;
		}

		// 3. If not, remove the wall inbetween
		switch (direction) {
			case "left":
			case "right":
				verticals[row][Math.floor(average(column, next_column))] = true;
				break;
			case "up":
			case "down":
				horizontals[Math.floor(average(row, next_row))][column] = true;
				break;
		}

		// 4. "explore" the neighbour.
		explore(next_row, next_column);
	}
};
explore(config.init_cell.row, config.init_cell.column);

/* Maze Walls */

// Horizontal Walls
horizontals.forEach((row, row_index) => {
	row.forEach((open, col_index) => {
		if (open) return;
		const wall = Bodies.rectangle(
			col_index * config.unit_length.width + config.unit_length.width / 2,
			(row_index + 1) * config.unit_length.height,
			config.unit_length.width,
			2,
			maze_walls
		);
		World.add(world, wall);
	});
});

// Vertical Walls
verticals.forEach((row, row_index) => {
	row.forEach((open, col_index) => {
		if (open) return;
		const wall = Bodies.rectangle(
			(col_index + 1) * config.unit_length.width,
			(row_index + 1) * config.unit_length.height - config.unit_length.height / 2,
			2,
			config.unit_length.height,
			maze_walls
		);
		World.add(world, wall);
	});
});

// Create goal
const side = Math.min(config.unit_length.width, config.unit_length.height) * 0.8;
const goal = Bodies.rectangle(
	config.width - config.unit_length.width / 2,
	config.height - config.unit_length.height / 2,
	side,
	side,
	{
		...static,
		label: "goal",
		render: {
			fillStyle: "#008000",
		},
	}
);
World.add(world, goal);

// Ball
const radius = Math.min(config.unit_length.width, config.unit_length.height) * 0.4;
const ball = Bodies.circle(
	config.unit_length.width / 2,
	config.unit_length.height / 2,
	radius,
	{
		label: "ball",
		render: {
			fillStyle: "#f80",
		},
	}
);
World.add(world, ball);

// Keyboard Controls
document.addEventListener("keydown", (event) => {
	const { x, y } = ball.velocity;
	switch (event.key) {
		case "w":
			Body.setVelocity(ball, { x, y: y - 5 });
			break;
		case "a":
			Body.setVelocity(ball, { x: x - 5, y });
			break;
		case "s":
			Body.setVelocity(ball, { x, y: y + 5 });
			break;
		case "d":
			Body.setVelocity(ball, { x: x + 5, y });
			break;
	}
	if (ball.velocity.x > 6) Body.setVelocity(ball, { x: 6, y: ball.velocity.y });
	if (ball.velocity.x < -6) Body.setVelocity(ball, { x: -6, y: ball.velocity.y });
	if (ball.velocity.y > 6) Body.setVelocity(ball, { x: ball.velocity.x, y: 6 });
	if (ball.velocity.y < -6) Body.setVelocity(ball, { x: ball.velocity.x, y: -6 });
});

// Win Condition
Events.on(engine, "collisionStart", check_win);

console.log(document.URL);
