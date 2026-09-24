import { Boss } from "./boss";
import { Player } from "./player";


export class Game {

    boss: Boss;

    players: Player[];

    private running: boolean;

    level: number;


    constructor(
        boss: Boss,
        players: Player[]
    ) {

        this.boss = boss;

        this.players = players;

        this.running = false;

        this.level = 1;
    }


    start() {

        if (this.running) {
            return;
        }

        this.running = true;

        this.boss.startRotation();
    }


    stop() {

        if (!this.running) {
            return;
        }

        this.running = false;
    }


    update(deltaTime: number) {

        if (!this.running) {
            return;
        }


        /*
         * Aktualizacja bossa
         */
        this.boss.update();


        /*
         * Aktualizacja wszystkich graczy
         */
        for (const player of this.players) {

            player.update(deltaTime);
        }


        /*
         * Boss cały czas się obraca
         */
        if (!this.boss.isRotating) {

            this.boss.startRotation();
        }
    }


    changePlayerDirection(
        color:
            | "yellow"
            | "blue"
            | "red"
            | "green"
    ) {

        const player =
            this.players.find(
                player => player.color === color
            );


        if (!player) {
            return;
        }


        player.changeDirection();
    }


    setLevel(level: number) {

        this.level = level;
    }


    nextLevel() {

        this.level++;
    }


    isRunning() {

        return this.running;
    }
}