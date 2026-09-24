import { Image, useImage } from "@shopify/react-native-skia";

export class Boss {
    x: number;
    y: number;

    width: number;
    height: number;

    phase: number;

    rotation: number;
    isRotating: boolean;

    private rotationStart: number;
    private rotationDuration: number;
    private rotationCount: number;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.phase = 1;

        this.rotation = 0;

        // Na początku NIE obracamy
        this.isRotating = false;

        this.rotationStart = 0;

        // 3 obroty w 2 sekundy
        this.rotationDuration = 3000;
        this.rotationCount = 3;
    }

    setPhase(phase: number) {
        this.phase = phase;
    }

    startRotation() {
        if (this.isRotating) {
            return;
        }

        this.isRotating = true;

        // KLUCZOWE
        this.rotationStart = Date.now();

        // zaczynamy od początku
        this.rotation = 0;
    }

    update() {
        if (!this.isRotating) {
            return;
        }

        const now = Date.now();

        const elapsed = now - this.rotationStart;

        let progress = elapsed / this.rotationDuration;

        if (progress >= 1) {
            progress = 1;
            this.isRotating = false;
        }

        this.rotation =
            progress *
            Math.PI *
            2 *
            this.rotationCount;
    }

    draw(img: ReturnType<typeof useImage>) {
        return (
            <Image
                image={img}

                x={this.x - this.width / 2}
                y={this.y - this.height / 2}

                width={this.width}
                height={this.height}

                fit="cover"

                origin={{
                    x: this.x,
                    y: this.y
                }}

                transform={[
                    {
                        rotate: this.rotation
                    }
                ]}
            />
        );
    }
}