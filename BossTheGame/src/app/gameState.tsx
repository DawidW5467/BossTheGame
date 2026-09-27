export interface GameConfig {
    phases: {
        fireballs: boolean;
        tongue: boolean;
        sector: boolean;
        lasers: boolean;
    };
    scores: {
        yellow: number;
        blue: number;
        green: number;
        red: number;
    };
    hasStartedOnce: boolean;
}

export const gameState: GameConfig = {
    phases: {
        fireballs: true,
        tongue: true,
        sector: true,
        lasers: true,
    },
    scores: {
        yellow: 0,
        blue: 0,
        green: 0,
        red: 0,
    },
    hasStartedOnce: false,
};

export function resetScores() {
    gameState.scores = {
        yellow: 0,
        blue: 0,
        green: 0,
        red: 0,
    };
}