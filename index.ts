// M7kra's battle snake
import runServer from './server';
import { GameState, InfoResponse, MoveResponse } from './types';
import basic from './snakes/basic';
import smarter from './snakes/smarter';
import greedy from './snakes/greedy';

function info(): InfoResponse {
    console.log('INFO');

    return {
        apiversion: '1',
        author: 'M7kra',
        color: '#286c93',
        head: 'default',
        tail: 'default',
    };
}

function start(gameState: GameState): void {
    console.log('GAME START');
}

function end(gameState: GameState): void {
    console.log('GAME OVER');
}

function move(gameState: GameState): MoveResponse {
    if (gameState.you.name == 'Basic') return basic(gameState);
    else if (gameState.you.name == 'Smarter') return smarter(gameState);
    else if (gameState.you.name == 'Greedy') return greedy(gameState);
    else return { move: 'down' };
}

runServer({
    info: info,
    start: start,
    move: move,
    end: end
});
