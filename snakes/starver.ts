import { Battlesnake, Coord, GameState } from '../types';

export default function move(gameState: GameState) {    
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

    console.log(`MOVE ${gameState.turn}: ${bestMove}`);
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
    return you.body[0] != he.body[0];
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
    for (const snake of gameState.board.snakes) {
        if (!enemy(gameState.you, snake)) continue;
        if (!neighbor(position, snake.body[0])) continue;
        if (snake.body.length >= gameState.you.body.length) return { priority: 0, score: 0 };
        return { priority: 1, score: 10 + foodPoints };
    }
    return { priority: 1, score: foodPoints };
}