import { Boss } from "./boss";
import { Player } from "./player";
import {Phase, FireballPhase, TonguePhase, SectorPhase, LaserPhase} from "./phases";
import { gameState } from "./gameState";


export class Game {

    boss: Boss;
    players: Player[];
    radius: number;

    state: "ROULETTE" | "PHASE" = "ROULETTE";
    stateTimer: number = 0;

    availablePhases: (() => Phase)[] = [
        () => new FireballPhase(),
        () => new TonguePhase(),
        () => new SectorPhase(),
    ];

    currentPhase: Phase | null = null;
    private running: boolean = false;
    onGameOver?: () => void;

    constructor(
        boss: Boss,
        players: Player[],
        radius: number,
        onGameOver?: ()=> void,
    ) {
        this.boss = boss;
        this.players = players;
        this.radius = radius;
        this.onGameOver = onGameOver;
    }

    getActivePhases(): (() => Phase)[] {
        const pool: (() => Phase)[] = [];
        if (gameState.phases.fireballs) pool.push(() => new FireballPhase());
        if (gameState.phases.tongue) pool.push(() => new TonguePhase());
        if (gameState.phases.sector) pool.push(() => new SectorPhase());
        if (gameState.phases.lasers) pool.push(() => new LaserPhase());

        if (pool.length === 0) pool.push(() => new FireballPhase());
        return pool;
    }

    start() {
        this.running = true;
        for (const p of this.players) p.reset();
        this.startRoulette();
    }

    stop() {
        this.running = false;
    }

    startRoulette() {
        this.state = "ROULETTE";
        this.stateTimer = 1.2;
        this.boss.setFastSpin(true);
        this.currentPhase = null;
    }

    startNextPhase() {
        this.state = "PHASE";
        this.boss.setFastSpin(false);

        const pool = this.getActivePhases();
        const randomIndex = Math.floor(Math.random() * pool.length);
        this.currentPhase = pool[randomIndex]();
        this.currentPhase.start(this.boss.x, this.boss.y, this.radius);
    }


    update(deltaTime: number) {
        if (!this.running) return;

        this.boss.update(deltaTime);
        for (const player of this.players) {
            player.update(deltaTime);
        }

        if (this.state === "ROULETTE") {
            this.stateTimer -= deltaTime;
            if (this.stateTimer <= 0) {
                this.startNextPhase();
            }
        } else if (this.state === "PHASE" && this.currentPhase) {
            this.currentPhase.update(deltaTime);
            this.checkCollisions();

            if (this.currentPhase.isFinished) {
                for (const player of this.players) {
                    if (player.isAlive) {
                        gameState.scores[player.color]++;
                    }
                }
                this.startRoulette();
            }
        }

        const allDead = this.players.every((p) => !p.isAlive);
        if (allDead && this.running) {
            this.stop();
            if (this.onGameOver) this.onGameOver();
        }
    }

    checkCollisions() {
        if (!this.currentPhase) return;

        const fireballs = this.currentPhase.getFireballs?.() || [];
        for (const fb of fireballs) {
            for (const player of this.players) {
                if (!player.isAlive) continue;
                const dx = fb.x - player.x;
                const dy = fb.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) < player.hitboxRadius + fb.radius) {
                    player.isAlive = false;
                }
            }
        }

        if (this.currentPhase.checkCustomCollisions) {
            this.currentPhase.checkCustomCollisions(this.players);
        }
    }

    changePlayerDirection(color: "yellow" | "blue" | "red" | "green") {
        const player = this.players.find((p) => p.color === color);
        if (player && player.isAlive) {
            player.changeDirection();
        }
    }
}