export class Fireball {

    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number = 14;
    speed: number = 320;
    targetAngle: number;
    hasCrossedArena: boolean = false;

    constructor(startX: number, startY: number, angle: number) {

        this.x = startX;
        this.y = startY;

        this.targetAngle = angle;

        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;

    }

    update(deltaTime: number) {

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

    }

    isOutOfBounds(screenWidth: number, screenHeight: number): boolean {
        return (
            this.x < -100 ||
            this.x > screenWidth + 100 ||
            this.y < -100 ||
            this.y > screenHeight + 100
        );
    }
}

export interface ArenaMarker  {

    x: number;
    y: number;
    angle: number;

}