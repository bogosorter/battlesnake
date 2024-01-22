import { Battlesnake, Coord, GameState } from '../types';

export default function move(gameState: GameState) {    
    const offsets: { [key: string]: Coord; } = {
        up: { x: 0, y: 1 },
        down: { x: 0, y: -1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
    }

    let best = -1;
    let moves = ['down'];
    for (const direction in offsets) {
        const newHead = moveHead(gameState.you.head, offsets[direction]);
        const value = evaluate(newHead, gameState);
        if (value > best) {
            best = value;
            moves = [direction]
        } else if (value == best) {
            moves.push(direction);
        }
    }

    const move = moves[Math.floor(Math.random() * moves.length)];
    return { move: move };
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
    return you.body[0].x != he.body[0].x || you.body[0].y != he.body[0].y;
}

function neighbor(a: Coord, b: Coord) {
    const offsetX = Math.abs(b.x - a.x);
    const offsetY = Math.abs(b.y - a.x);
    if (offsetX > 1 || offsetY > 1) return false;
    return offsetX != offsetY;
}

// Evaluates a position:
// -1: Death
// 0: Avoid
// 1: Neutral
// 2: Good
function evaluate(position: Coord, gameState: GameState) {
    const avoid = [...gameState.board.hazards];
    for (const battlesnake of gameState.board.snakes) {
        avoid.push(...battlesnake.body);
    }
    const height = gameState.board.height;
    const width = gameState.board.width;

    if (!isSafe(position, avoid, width, height)) return -1;
    for (const snake of gameState.board.snakes) {
        if (!enemy(gameState.you, snake)) continue;
        if (!neighbor(position, snake.body[0])) continue;
        if (snake.body.length > gameState.you.body.length) return 0;
        return 2;
    }
    return 1;
}