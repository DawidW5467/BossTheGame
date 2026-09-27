import { Fireball, ArenaMarker } from "./projectile";

export interface Phase {
    name: string;
    isFinished: boolean;
    start(bossX: number, bossY: number, arenaRadius: number): void;
    update(deltaTime: number): void;
    getFireballs(): Fireball[];
    getMarkers(): ArenaMarker[];

    getTongue?(): { x1: number; y1: number; x2: number; y2: number; angle: number } | null;
    getSector?(): { startAngle: number; sweepAngle: number; isDanger: boolean; opacity: number } | null;
    checkCustomCollisions?(players: any[]): void;
    getLasers?(): { lines: { x1: number; y1: number; x2: number; y2: number }[]; isDanger: boolean; opacity: number } | null;
}

// faza 1 - fierballs

export class FireballPhase implements Phase {
    name = "Fireballs";
    isFinished = false;

    private bossX: number = 0;
    private bossY: number = 0;
    private arenaRadius: number = 0;

    private markers: ArenaMarker[] = [];
    private fireballs: Fireball[] = [];

    private currentWave: number = 0;
    private maxWaves: number = 4;

    private waveState: "WARNING" | "SHOOT" = "WARNING";

    private warningTime: number = 0.8;
    private timeBetweenWaves: number = 1.4;

    private timer: number = 0;

    start(bossX: number, bossY: number, arenaRadius: number) {
        this.bossX = bossX;
        this.bossY = bossY;
        this.arenaRadius = arenaRadius;

        this.isFinished = false;
        this.currentWave = 0;
        this.fireballs = [];
        this.startNewWave();
    }

    private startNewWave() {
        this.currentWave++;
        this.waveState = "WARNING";
        this.timer = 0;
        this.markers = [];

        const count = Math.floor(Math.random() * 5) + 4;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.markers.push({
                angle,
                x: this.bossX + Math.cos(angle) * this.arenaRadius,
                y: this.bossY + Math.sin(angle) * this.arenaRadius,
            });
        }
    }

    update(deltaTime: number) {
        this.timer += deltaTime;

        if (this.waveState === "WARNING" && this.timer >= this.warningTime) {
            this.waveState = "SHOOT";

            for (const marker of this.markers) {
                this.fireballs.push(
                    new Fireball(this.bossX, this.bossY, marker.angle)
                );
            }
            this.markers = [];
        }

        if (this.waveState === "SHOOT") {
            if (this.currentWave >= this.maxWaves && this.timer >= 2.5) {
                this.isFinished = true;
            }
            else if (this.currentWave < this.maxWaves && this.timer >= this.timeBetweenWaves) {
                this.startNewWave();
            }
        }

        for (const fb of this.fireballs) {
            fb.update(deltaTime);
        }

        this.fireballs = this.fireballs.filter(
            (fb) => !fb.isOutOfBounds(1000, 1000)
        );
    }

    getFireballs() {
        return this.fireballs;
    }

    getMarkers() {
        return this.markers;
    }
}

// faza 2 - języczek

export class TonguePhase implements Phase {
    name = "Tongue";
    isFinished = false;

    private bossX: number = 0;
    private bossY: number = 0;
    private arenaRadius: number = 0;

    private state: "EXTEND" | "SWEEP" | "RETRACT" = "EXTEND";
    private timer: number = 0;

    private tongueAngle: number = 0;
    private sweepStartAngle: number = 0;
    private sweepDistance: number = Math.PI * 2 * 0.22;
    private sweepDir: 1 | -1 = 1;
    private currentLength: number = 0;

    start(bossX: number, bossY: number, arenaRadius: number) {
        this.bossX = bossX;
        this.bossY = bossY;
        this.arenaRadius = arenaRadius;
        this.isFinished = false;
        this.state = "EXTEND";
        this.timer = 0;
        this.currentLength = 0;

        this.tongueAngle = Math.random() * Math.PI * 2;
        this.sweepStartAngle = this.tongueAngle;
        this.sweepDir = Math.random() > 0.5 ? 1 : -1;
    }

    update(deltaTime: number) {
        this.timer += deltaTime;


        if (this.state === "EXTEND") {
            const progress = Math.min(1, this.timer / 0.35);
            this.currentLength = this.arenaRadius * progress;

            if (progress >= 1) {
                this.state = "SWEEP";
                this.timer = 0;
            }
        }

        else if (this.state === "SWEEP") {
            const sweepDuration = 1.3;
            const progress = Math.min(1, this.timer / sweepDuration);

            this.tongueAngle = this.sweepStartAngle + (this.sweepDistance * this.sweepDir * progress);

            if (progress >= 1) {
                this.state = "RETRACT";
                this.timer = 0;
            }
        }

        else if (this.state === "RETRACT") {
            const progress = Math.min(1, this.timer / 0.25);
            this.currentLength = this.arenaRadius * (1 - progress);

            if (progress >= 1) {
                this.isFinished = true;
            }
        }
    }

    checkCustomCollisions(players: any[]) {
        if (this.currentLength < this.arenaRadius * 0.7) return;

        for (const player of players) {
            if (!player.isAlive) continue;

            // Różnica kątowa
            let diff = Math.abs(this.tongueAngle - player.angle) % (Math.PI * 2);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;

            const arcDist = diff * this.arenaRadius;
            if (arcDist < 25) {
                player.isAlive = false;
            }
        }
    }

    getTongue() {
        if (this.isFinished || this.currentLength <= 0) return null;
        return {
            x1: this.bossX,
            y1: this.bossY,
            x2: this.bossX + Math.cos(this.tongueAngle) * this.currentLength,
            y2: this.bossY + Math.sin(this.tongueAngle) * this.currentLength,
            angle: this.tongueAngle,
        };
    }

    getFireballs() { return []; }
    getMarkers() { return []; }
}

// faza 3 - pole

export class SectorPhase implements Phase {
    name = "Danger Zone";
    isFinished = false;

    private startAngle: number = 0;
    private sweepAngle: number = Math.PI * 2 * 0.75;

    private state: "WARNING" | "ACTIVE" = "WARNING";
    private timer: number = 0;

    private warningDuration: number = 1.8;
    private activeDuration: number = 5.0;

    start() {
        this.isFinished = false;
        this.state = "WARNING";
        this.timer = 0;

        this.startAngle = Math.random() * Math.PI * 2;
    }

    update(deltaTime: number) {
        this.timer += deltaTime;

        if (this.state === "WARNING" && this.timer >= this.warningDuration) {
            this.state = "ACTIVE";
            this.timer = 0;
        } else if (this.state === "ACTIVE" && this.timer >= this.activeDuration) {
            this.isFinished = true;
        }
    }

    checkCustomCollisions(players: any[]) {
        if (this.state !== "ACTIVE") return;

        for (const player of players) {
            if (!player.isAlive) continue;

            let angle = (player.angle - this.startAngle) % (Math.PI * 2);
            if (angle < 0) angle += Math.PI * 2;

            if (angle <= this.sweepAngle) {
                player.isAlive = false;
            }
        }
    }

    getSector() {
        if (this.isFinished) return null;

        if (this.state === "WARNING") {
            const opacity = 0.25 + Math.sin(this.timer * 12) * 0.2;
            return {
                startAngle: this.startAngle,
                sweepAngle: this.sweepAngle,
                isDanger: false,
                opacity: Math.max(0.1, opacity),
            };
        } else {
            return {
                startAngle: this.startAngle,
                sweepAngle: this.sweepAngle,
                isDanger: true,
                opacity: 0.45,
            };
        }
    }

    getFireballs() { return []; }
    getMarkers() { return []; }
}

// faza 4 - lasery

export class LaserPhase implements Phase {
    name = "Lasers";
    isFinished = false;

    private bossX: number = 0;
    private bossY: number = 0;
    private arenaRadius: number = 0;

    private laserCount: number = 2;
    private baseAngle: number = 0;
    private rotationSpeed: number = 0.8;

    private state: "WARNING" | "ACTIVE" = "WARNING";
    private timer: number = 0;
    private warningDuration: number = 1.5;
    private activeDuration: number = 5.0;

    start(bossX: number, bossY: number, arenaRadius: number) {
        this.bossX = bossX;
        this.bossY = bossY;
        this.arenaRadius = arenaRadius;
        this.isFinished = false;
        this.state = "WARNING";
        this.timer = 0;

        this.laserCount = Math.random() > 0.5 ? 2 : 3;
        this.baseAngle = Math.random() * Math.PI * 2;
    }

    update(deltaTime: number) {
        this.timer += deltaTime;

        this.baseAngle = (this.baseAngle + this.rotationSpeed * deltaTime) % (Math.PI * 2);

        if (this.state === "WARNING" && this.timer >= this.warningDuration) {
            this.state = "ACTIVE";
            this.timer = 0;
        } else if (this.state === "ACTIVE" && this.timer >= this.activeDuration) {
            this.isFinished = true;
        }
    }

    checkCustomCollisions(players: any[]) {
        if (this.state !== "ACTIVE") return;

        const angles: number[] = [];
        const step = (Math.PI * 2) / this.laserCount;
        for (let i = 0; i < this.laserCount; i++) {
            angles.push((this.baseAngle + i * step) % (Math.PI * 2));
        }

        for (const player of players) {
            if (!player.isAlive) continue;

            for (const laserAngle of angles) {
                let diff = Math.abs(laserAngle - player.angle) % (Math.PI * 2);
                if (diff > Math.PI) diff = Math.PI * 2 - diff;

                const arcDist = diff * this.arenaRadius;
                if (arcDist < 20) {
                    player.isAlive = false;
                }
            }
        }
    }

    getLasers() {
        if (this.isFinished) return null;

        const lines = [];
        const step = (Math.PI * 2) / this.laserCount;
        const laserReach = this.arenaRadius * 1.6;

        for (let i = 0; i < this.laserCount; i++) {
            const a = this.baseAngle + i * step;
            lines.push({
                x1: this.bossX,
                y1: this.bossY,
                x2: this.bossX + Math.cos(a) * laserReach,
                y2: this.bossY + Math.sin(a) * laserReach,
            });
        }

        if (this.state === "WARNING") {
            const opacity = 0.2 + Math.sin(this.timer * 15) * 0.15;
            return { lines, isDanger: false, opacity: Math.max(0.1, opacity) };
        } else {
            return { lines, isDanger: true, opacity: 1.0 };
        }
    }

    getFireballs() { return []; }
    getMarkers() { return []; }

}