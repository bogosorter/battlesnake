import { Coord, GameState } from '../types';

export default function move(gameState: GameState) {
    const avoid = [...gameState.board.hazards];
    for (const battlesnake of gameState.board.snakes) {
        avoid.push(...battlesnake.body);
    }

    const height = gameState.board.height;
    const width = gameState.board.width;
    
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
        const value = isSafe(newHead, avoid, width, height)? 0 : -1;
        if (value > best) {
            best = value;
            moves = [direction]
        } else if (value == best) {
            moves.push(direction);
        }
    }

    const move = moves[Math.floor(Math.random() * moves.length)];

    console.log(`MOVE ${gameState.turn}: ${move}`);
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