import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Pressable,
    Image as RNImage,
    StyleSheet,
    useWindowDimensions,
    StatusBar
} from "react-native";

import {
    Canvas,
    Image as SkiaImage,
    useImage,
    Path,
    Skia,
} from "@shopify/react-native-skia";

import { Boss } from "./boss";
import { Game } from "./game";
import {Player} from "./player";


type ButtonValue = "blue" | "red" | "green" | "yellow";


/*
 * Rysowanie okręgu
 */
function DrawCircle(
    radius: number,
    centerX: number,
    centerY: number
) {
    const path = Skia.Path.Make();

    for (let i = 0; i <= 360; i++) {
        const angle = (i * Math.PI) / 180;

        const x = Math.cos(angle) * radius + centerX;
        const y = Math.sin(angle) * radius + centerY;

        if (i === 0) {
            path.moveTo(x, y);
        } else {
            path.lineTo(x, y);
        }
    }

    path.close();

    return path;
}


/*
 * Okrąg na arenie
 */
function GeneratePath(
    radius: number,
    centerX: number,
    centerY: number,
    strokeWidth: number
) {
    return (
        <Path
            path={DrawCircle(radius, centerX, centerY)}
            color="white"
            style="stroke"
            strokeWidth={strokeWidth}
        />
    );
}


/*
 * Tło
 */
function GenerateBackground(
    background: ReturnType<typeof useImage>,
    width: number,
    height: number
) {
    if (!background) {
        return null;
    }

    return (
        <SkiaImage
            image={background}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
        />
    );
}


/*
 * Przyciski w rogach ekranu
 */
function GenerateCornerButtons(
    onPress: (value: ButtonValue) => void
) {
    return (
        <View
            style={styles.buttonsContainer}
            pointerEvents="box-none"
        >

            {/* LEWY GÓRNY - ŻÓŁTY */}
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.topLeft,
                    pressed && styles.buttonPressed,
                ]}
                onPress={() => onPress("yellow")}
            >
                <RNImage
                    source={require("../../assets/images/buttons/yellow.png")}
                    style={styles.buttonImage}
                />
            </Pressable>


            {/* PRAWY GÓRNY - NIEBIESKI */}
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.topRight,
                    pressed && styles.buttonPressed,
                ]}
                onPress={() => onPress("blue")}
            >
                <RNImage
                    source={require("../../assets/images/buttons/blue.png")}
                    style={styles.buttonImage}
                />
            </Pressable>


            {/* LEWY DOLNY - CZERWONY */}
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.bottomLeft,
                    pressed && styles.buttonPressed,
                ]}
                onPress={() => onPress("red")}
            >
                <RNImage
                    source={require("../../assets/images/buttons/red.png")}
                    style={styles.buttonImage}
                />
            </Pressable>


            {/* PRAWY DOLNY - ZIELONY */}
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.bottomRight,
                    pressed && styles.buttonPressed,
                ]}
                onPress={() => onPress("green")}
            >
                <RNImage
                    source={require("../../assets/images/buttons/green.png")}
                    style={styles.buttonImage}
                />
            </Pressable>

        </View>
    );
}

/*
 * Główny ekran gry
 */
export default function Index() {

    const { width, height } = useWindowDimensions();

    const radius = 175;

    /*
     * Obrazy
     */
    const background = useImage(
        require("../../assets/images/background.png")
    );

    const boss_img = useImage(
        require("../../assets/images/boss-normal.png")
    );


    /*
     * Boss i Game przechowywane w ref,
     * żeby nie tworzyć ich ponownie przy każdym renderze.
     */
    const bossRef = useRef<Boss | null>(null);
    const gameRef = useRef<Game | null>(null);
    const playersRef = useRef<Player[]>([]);


    /*
     * Wymusza ponowne rysowanie ekranu
     * po każdym klatce gry.
     */
    const [, forceRender] = useState<number>(0);


    /*
     * Utworzenie bossa i gry
     */
    if (
        bossRef.current === null &&
        boss_img !== null
    ) {

        const bossX = width / 2;
        const bossY = height / 2;

        bossRef.current = new Boss(
            bossX,
            bossY,
            100,
            120
        );


        playersRef.current = [

            // ŻÓŁTY
            new Player(
                bossX,
                bossY,
                radius,
                50,
                50,
                "yellow",
                0
            ),

            // NIEBIESKI
            new Player(
                bossX,
                bossY,
                radius,
                50,
                50,
                "blue",
                Math.PI / 2
            ),

            // ZIELONY
            new Player(
                bossX,
                bossY,
                radius,
                50,
                50,
                "green",
                Math.PI
            ),

            // CZERWONY
            new Player(
                bossX,
                bossY,
                radius,
                50,
                50,
                "red",
                Math.PI * 1.5
            )
        ];


        gameRef.current = new Game(
            bossRef.current,
            playersRef.current
        );
    }


    /*
     * Pętla gry
     */
    useEffect(() => {

        if (!gameRef.current) {
            return;
        }


        /*
         * Uruchomienie gry
         */
        gameRef.current.start();


        let animationFrame: number;


        let lastTime = 0;

        const gameLoop = (time: number) => {

            const deltaTime =
                lastTime === 0
                    ? 0
                    : (time - lastTime) / 1000;

            lastTime = time;


            gameRef.current?.update(
                deltaTime
            );


            forceRender(
                (value: number) => value + 1
            );


            animationFrame =
                requestAnimationFrame(gameLoop);
        };


        animationFrame =
            requestAnimationFrame(gameLoop);


        /*
         * Czyszczenie po opuszczeniu ekranu
         */
        return () => {

            cancelAnimationFrame(
                animationFrame
            );

            gameRef.current?.stop();
        };

    }, [boss_img]);


    /*
     * Obsługa przycisków
     */
    const handleButtonPress = (
        value: ButtonValue
    ) => {

        console.log(
            "Kliknięto przycisk:",
            value
        );


        switch (value) {

            case "blue":
                console.log("BLUE");
                break;


            case "red":
                console.log("RED");
                break;


            case "green":
                console.log("GREEN");
                break;


            case "yellow":
                console.log("YELLOW");
                break;
        }
    };


    return (

        <View style={styles.container}>

            <StatusBar hidden />
            {/* ========================= */}
            {/* GRA */}
            {/* ========================= */}

            <Canvas style={styles.canvas}>

                {/* TŁO */}
                {GenerateBackground(
                    background,
                    width,
                    height
                )}


                {/* OKRĄG ARENY */}
                {GeneratePath(
                    radius,
                    width / 2,
                    height / 2,
                    1
                )}


                {/* BOSS */}
                {bossRef.current?.draw(
                    boss_img
                )}

                {playersRef.current.map((player, index) => {

                    let img = null;

                    if (player.color === "yellow") {
                        img = boss_img;
                    }

                    if (player.color === "blue") {
                        img = boss_img;
                    }

                    if (player.color === "red") {
                        img = boss_img;
                    }

                    if (player.color === "green") {
                        img = boss_img;
                    }

                    return (
                        <React.Fragment key={index}>
                            {player.draw(img)}
                        </React.Fragment>
                    );
                })}

            </Canvas>


            {/* ========================= */}
            {/* PRZYCISKI */}
            {/* ========================= */}

            {GenerateCornerButtons(
                handleButtonPress
            )}

        </View>
    );
}


/*
 * STYLE
 */
const styles = StyleSheet.create({

    container: {
        flex: 1,
    },


    canvas: {
        flex: 1,
    },


    /*
     * Kontener zajmuje cały ekran.
     */
    buttonsContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },


    /*
     * Rozmiar pojedynczego przycisku.
     */
    button: {
        position: "absolute",

        width: 110,
        height: 110,
    },


    /*
     * Sam obraz przycisku.
     */
    buttonImage: {
        width: "100%",
        height: "100%",

        resizeMode: "contain",
    },


    /*
     * LEWY GÓRNY
     */
    topLeft: {
        top: -15,
        left: -15,
    },


    topRight: {
        top: -15,
        right: -15,
    },

    bottomLeft: {
        bottom: -15,
        left: -15,
    },

    bottomRight: {
        bottom: -15,
        right: -15,
    },

    buttonPressed: {
        opacity: 0.45,
        transform: [
            { scale: 0.92 }
        ],
    },

});