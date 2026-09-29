import { useRouter, useFocusEffect } from "expo-router";
import { gameState } from "./gameState";
import React, {useCallback, useEffect, useRef, useState} from "react";
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
    Circle,
} from "@shopify/react-native-skia";

import { Boss } from "./boss";
import { Game } from "./game";
import {Player} from "./player";


type ButtonValue = "blue" | "red" | "green" | "yellow";



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



function GenerateCornerButtons(
    onPress: (value: ButtonValue) => void
) {
    return (
        <View
            style={styles.buttonsContainer}
            pointerEvents="box-none"
        >

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



function createSectorPath(cx: number, cy: number, r: number, startAngle: number, sweepAngle: number) {
    const path = Skia.Path.Make();
    path.moveTo(cx, cy);
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
        const a = startAngle + (sweepAngle * i) / steps;
        path.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    path.close();
    return path;
}

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        if (!gameState.hasStartedOnce) {
            router.replace("/explore");
        }
    }, []);

    const { width, height } = useWindowDimensions();

    const radius = 175;


    const background = useImage(
        require("../../assets/images/background.png")
    );

    const boss_img = useImage(
        require("../../assets/images/boss-normal.png")
    );

    const playerYellowImg = useImage(require("../../assets/images/players/yellow_bg.png"));
    const playerBlueImg   = useImage(require("../../assets/images/players/blue_bg.png"));
    const playerGreenImg  = useImage(require("../../assets/images/players/green_bg.png"));
    const playerRedImg    = useImage(require("../../assets/images/players/red_bg.png"));



    const bossRef = useRef<Boss | null>(null);
    const gameRef = useRef<Game | null>(null);
    const playersRef = useRef<Player[]>([]);



    const [, forceRender] = useState<number>(0);



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

            new Player(
                bossX,
                bossY,
                radius,
                50,
                50,
                "yellow",
                0
            ),


            new Player(
                bossX,
                bossY,
                radius,
                50,
                50,
                "blue",
                Math.PI / 2
            ),


            new Player(
                bossX,
                bossY,
                radius,
                50,
                50,
                "green",
                Math.PI
            ),

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


        gameRef.current = new Game(bossRef.current, playersRef.current, radius, () => {
            setTimeout(() => {
                router.replace("/explore");
            }, 1200);
        });
    }



    useFocusEffect(
        useCallback(() => {
            if (!gameState.hasStartedOnce || !gameRef.current) {
                return;
            }

            gameRef.current.start();

            let animationFrame: number;
            let lastTime = 0;

            const gameLoop = (time: number) => {
                const deltaTime = lastTime === 0 ? 0 : (time - lastTime) / 1000;
                lastTime = time;

                const safeDelta = Math.min(deltaTime, 0.033);

                gameRef.current?.update(safeDelta);

                forceRender((value: number) => value + 1);

                animationFrame = requestAnimationFrame(gameLoop);
            };

            animationFrame = requestAnimationFrame(gameLoop);

            return () => {
                cancelAnimationFrame(animationFrame);
                gameRef.current?.stop();
            };
        }, [])
    );


    const handleButtonPress = (
        value: ButtonValue
    ) => {

        gameRef.current?.changePlayerDirection(value);

    };


    return (

        <View style={styles.container}>

            <StatusBar hidden />


            <Canvas style={styles.canvas}>

                {GenerateBackground(
                    background,
                    width,
                    height
                )}

                {(() => {
                    const sector = gameRef.current?.currentPhase?.getSector?.();
                    if (!sector) return null;
                    return (
                        <Path
                            path={createSectorPath(width / 2, height / 2, radius, sector.startAngle, sector.sweepAngle)}
                            color={sector.isDanger ? `rgba(235, 30, 30, ${sector.opacity})` : `rgba(255, 255, 255, ${sector.opacity})`}
                        />
                    );
                })()}


                <Circle
                    cx={width / 2}
                    cy={height / 2}
                    r={radius}
                    style="stroke"
                    strokeWidth={1}
                    color="white"
                />

                {gameRef.current?.currentPhase?.getMarkers().map((marker, i) => (
                    <Circle
                        key={`marker-${i}`}
                        cx={marker.x}
                        cy={marker.y}
                        r={10}
                        color="rgba(255, 60, 0, 0.75)"
                    />
                ))}

                {gameRef.current?.currentPhase?.getFireballs().map((fb, i) => (
                    <Circle
                        key={`fb-${i}`}
                        cx={fb.x}
                        cy={fb.y}
                        r={fb.radius}
                        color="#FF4500"
                    />
                ))}

                {(() => {
                    const tongue = gameRef.current?.currentPhase?.getTongue?.();
                    if (!tongue) return null;
                    return (
                        <Path
                            path={(() => {
                                const p = Skia.Path.Make();
                                p.moveTo(tongue.x1, tongue.y1);
                                p.lineTo(tongue.x2, tongue.y2);
                                return p;
                            })()}
                            color="#FF2E63"
                            style="stroke"
                            strokeWidth={22}
                            strokeCap="round"
                        />
                    );
                })()}

                {(() => {
                    const laserData = (gameRef.current?.currentPhase as any)?.getLasers?.();
                    if (!laserData || !laserData.lines) return null;

                    return laserData.lines.map((line: { x1: number; y1: number; x2: number; y2: number }, idx: number) => (
                        <Path
                            key={`laser-${idx}`}
                            path={(() => {
                                const p = Skia.Path.Make();
                                p.moveTo(line.x1, line.y1);
                                p.lineTo(line.x2, line.y2);
                                return p;
                            })()}
                            color={laserData.isDanger ? "#FF0033" : "rgba(255, 60, 60, 0.4)"}
                            style="stroke"
                            strokeWidth={laserData.isDanger ? 8 : 2}
                        />
                    ));
                })()}

                {bossRef.current?.draw(
                    boss_img
                )}

                {playersRef.current.map((player, index) => {

                    let img = null;

                    if (player.color === "yellow") {
                        img = playerYellowImg;
                    }

                    if (player.color === "blue") {
                        img = playerBlueImg;
                    }

                    if (player.color === "red") {
                        img = playerRedImg;
                    }

                    if (player.color === "green") {
                        img = playerGreenImg;
                    }

                    return (
                        <React.Fragment key={index}>
                            {player.draw(img)}
                        </React.Fragment>
                    );
                })}

            </Canvas>



            {GenerateCornerButtons(
                handleButtonPress
            )}

        </View>
    );
}


/*
 raz dwa dwa trzy cztery player games to moja gra michał wojtas się nazywam i w kurczaki wciąż wygrywam moja torba to mój skarb żyd na karku wciąż ma garb od king vona zjadłem dreda tu przystanek tu forteca bosss na mapie to nie żąrt te pieczarki to jest bart kiedy gościsz u mnie w dzielni to napewno zjesz w pizzerni jesteśmy głodni jak ptaki ten bogracz to nie są flaki 
 */
const styles = StyleSheet.create({

    container: {
        flex: 1,
    },


    canvas: {
        flex: 1,
    },



    buttonsContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },



    button: {
        position: "absolute",

        width: 110,
        height: 110,
    },



    buttonImage: {
        width: "100%",
        height: "100%",

        resizeMode: "contain",
    },



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
