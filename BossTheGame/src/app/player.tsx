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

    /*
     * 1  = zgodnie z ruchem wskazówek zegara
     * -1 = przeciwnie do ruchu wskazówek zegara
     */
    direction: 1 | -1;

    /*
     * Prędkość w radianach na sekundę
     */
    speed: number;

    color: PlayerColor;


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


    /*
     * Zmiana kierunku ruchu
     */
    changeDirection() {

        this.direction =
            this.direction === 1
                ? -1
                : 1;
    }


    /*
     * Aktualizacja pozycji gracza
     */
    update(deltaTime: number) {

        /*
         * Zmiana kąta
         */
        this.angle +=
            this.speed *
            this.direction *
            deltaTime;


        /*
         * Wyliczenie pozycji na okręgu
         */
        this.x =
            this.centerX +
            Math.cos(this.angle) * this.radius;

        this.y =
            this.centerY +
            Math.sin(this.angle) * this.radius;
    }


    /*
     * Rysowanie gracza
     */
    draw(img: ReturnType<typeof useImage>) {

        if (!img) {
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
            />
        );
    }
}