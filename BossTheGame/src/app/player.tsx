import { Image, useImage } from "@shopify/react-native-skia";

export type PlayerColor =
    | "yellow"
    | "blue"
    | "red"
    | "green";


export class Player {

    x: number;
    y: number;

    width: number;
    height: number;

    centerX: number;
    centerY: number;

    radius: number;

    angle: number;

    direction: 1 | -1;

    speed: number;

    color: PlayerColor;

    isAlive: boolean = true;
    hitboxRadius: number = 18;

    constructor(
        centerX: number,
        centerY: number,
        radius: number,
        width: number,
        height: number,
        color: PlayerColor,
        startAngle: number = 0
    ) {

        this.centerX = centerX;
        this.centerY = centerY;

        this.radius = radius;

        this.width = width;
        this.height = height;

        this.color = color;

        this.angle = startAngle;

        this.direction = 1;

        this.speed = 2;

        this.x = centerX + Math.cos(this.angle) * radius;
        this.y = centerY + Math.sin(this.angle) * radius;
    }

    reset() {
        this.isAlive = true;
    }

    changeDirection() {

        this.direction =
            this.direction === 1
                ? -1
                : 1;
    }


    update(deltaTime: number) {

        /*
         * Zmiana kąta
         */
        this.angle +=
            this.speed *
            this.direction *
            deltaTime;

        this.x =
            this.centerX +
            Math.cos(this.angle) * this.radius;

        this.y =
            this.centerY +
            Math.sin(this.angle) * this.radius;
    }

    draw(img: ReturnType<typeof useImage>) {

        if (!img || !this.isAlive) {
            return null;
        }

        return (
            <Image
                image={img}

                x={this.x - this.width / 2}
                y={this.y - this.height / 2}

                width={this.width}
                height={this.height}

                fit="contain"

                origin={{

                    x: this.x,
                    y: this.y
                }}

                transform={[
                    {
                        rotate: Math.PI / 2,
                    }
                ]}

            />
        );
    }
}