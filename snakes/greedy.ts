import { Battlesnake, Coord, GameState } from '../types';

export default function move(gameState: GameState) {
    console.log('move start')  
    const offsets: { [key: string]: Coord; } = {
        up: { x: 0, y: 1 },
        down: { x: 0, y: -1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
    }

    let bestPriority = -1;
    let bestScore = 0;
    let bestMove = 'down';
    for (const direction in offsets) {
        const newHead = moveHead(gameState.you.head, offsets[direction]);
        const value = evaluate(newHead, gameState);
        if (value.priority > bestPriority || (value.priority == bestPriority && value.score > bestScore)) {
            bestPriority = value.priority;
            bestScore = value.score;
            bestMove = direction;
        }
    }

    return { move: bestMove };
}

function isSafe(position: Coord, avoid: Coord[], width: number, height: number) {
    if (position.x < 0 || position.y < 0) return false;
    if (position.x >= width || position.y >= height) return false;
    if (avoid.some(coord => coord.x === position.x && coord.y === position.y)) return false;
    return true;
}

function moveHead(position: Coord, offset: Coord) {
    return { x: position.x + offset.x, y: position.y + offset.y };
}

function enemy(you: Battlesnake, he: Battlesnake) {
    return distance(you.head, he.head) > 0;
}

function neighbor(a: Coord, b: Coord) {
    const offsetX = Math.abs(b.x - a.x);
    const offsetY = Math.abs(b.y - a.x);
    if (offsetX > 1 || offsetY > 1) return false;
    return offsetX != offsetY;
}

function distance(a: Coord, b: Coord) {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

function getFloodSize(position: Coord, gameState: GameState) {
    const width = gameState.board.width;
    const height = gameState.board.height;
    const board = Array.from(Array(width), () => new Array(height).fill(0));
    const avoid = [...gameState.board.hazards];
    for (const battlesnake of gameState.board.snakes) {
        avoid.push(...battlesnake.body);
    }
    for (const cell of avoid) {
        board[cell.y][cell.x] = -1;
    }
    const queue = [position];
    const index = 0;
    let count = 0;
    while (queue.length > index) {
        const cell = queue.shift() as Coord;
        if (cell.x < 0 || cell.y < 0) continue;
        if (cell.x >= width || cell.y >= height) continue;
        if (board[cell.y][cell.x] != 0) continue;
        board[cell.y][cell.x] = 1;
        count++;
        queue.push({ x: cell.x + 1, y: cell.y });
        queue.push({ x: cell.x - 1, y: cell.y });
        queue.push({ x: cell.x, y: cell.y + 1 });
        queue.push({ x: cell.x, y: cell.y - 1 });
    }
    return count;
}

// Evaluates a position:
// Priority:
// -1: Death
// 0: Avoid
// 1: Neutral
// 2: Winner move
// Score: the higher the better
function evaluate(position: Coord, gameState: GameState) {
    const avoid = [...gameState.board.hazards];
    for (const battlesnake of gameState.board.snakes) {
        avoid.push(...battlesnake.body);
    }
    const height = gameState.board.height;
    const width = gameState.board.width;

    let foodDst = width + height;
    for (const food of gameState.board.food) {
        const dst = distance(position, food);
        if (dst < foodDst) foodDst = dst;
    }
    const foodPoints = width + height - foodDst; 

    if (!isSafe(position, avoid, width, height)) return { priority: -1, score: 0 };
    console.log(getFloodSize(position, gameState) < gameState.you.body.length / 2);
    if (getFloodSize(position, gameState) < gameState.you.body.length / 2) return { priority: 0, score: 0 };
    for (const snake of gameState.board.snakes) {
        if (!enemy(gameState.you, snake)) continue;
        if (!neighbor(position, snake.body[0])) continue;
        if (snake.body.length >= gameState.you.body.length) return { priority: 0, score: 0 };
        return { priority: 1, score: 10 + foodPoints };
    }
    return { priority: 1, score: foodPoints };
}