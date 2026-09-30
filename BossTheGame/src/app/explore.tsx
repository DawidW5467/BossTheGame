import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { gameState, resetScores } from "./gameState";

export default function MenuScreen() {
  const router = useRouter();

  const [phases, setPhases] = useState(gameState.phases);
  const [scores, setScores] = useState({ ...gameState.scores });

  useFocusEffect(
      useCallback(() => {
        setScores({ ...gameState.scores });
      }, [])
  );

  const togglePhase = (key: keyof typeof phases) => {
    const updated = { ...phases, [key]: !phases[key] };
    gameState.phases = updated;
    setPhases(updated);
  };

  const handleStartGame = () => {
    gameState.hasStartedOnce = true;
    router.push("/");
  };

  const handleResetScores = () => {
    resetScores();
    setScores({ ...gameState.scores });
  };

  return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>BossTheGame</Text>
        <Text style={styles.subtitle}>Wybór Faz & Wyniki</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Synowie Bosa:</Text>

          <View style={styles.scoreRow}>
            <Text style={[styles.playerBadge, { backgroundColor: "#FFD700", color: "#000" }]}>Żółty</Text>
            <Text style={styles.scoreText}>{scores.yellow} pkt</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={[styles.playerBadge, { backgroundColor: "#1E90FF" }]}>Niebieski</Text>
            <Text style={styles.scoreText}>{scores.blue} pkt</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={[styles.playerBadge, { backgroundColor: "#32CD32" }]}>Zielony</Text>
            <Text style={styles.scoreText}>{scores.green} pkt</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={[styles.playerBadge, { backgroundColor: "#FF4500" }]}>Czerwony</Text>
            <Text style={styles.scoreText}>{scores.red} pkt</Text>
          </View>

          <Pressable style={styles.resetButton} onPress={handleResetScores}>
            <Text style={styles.resetButtonText}>Zresetuj punkty</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aktywne Fazy:</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Fierballe</Text>
            <Switch value={phases.fireballs} onValueChange={() => togglePhase("fireballs")} />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Język</Text>
            <Switch value={phases.tongue} onValueChange={() => togglePhase("tongue")} />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Pole</Text>
            <Switch value={phases.sector} onValueChange={() => togglePhase("sector")} />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Lasery</Text>
            <Switch value={phases.lasers} onValueChange={() => togglePhase("lasers")} />
          </View>
        </View>

        <Pressable style={styles.playButton} onPress={handleStartGame}>
          <Text style={styles.playButtonText}>ROZPOCZNIJ GRĘ</Text>
        </Pressable>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  content: { padding: 24, paddingTop: 50, alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", color: "#FFF" },
  subtitle: { fontSize: 16, color: "#888", marginBottom: 20 },
  card: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: "#FFF", marginBottom: 14 },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  playerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "bold",
    color: "#FFF",
  },
  scoreText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  resetButton: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  resetButtonText: { color: "#AAA", fontSize: 13 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: { color: "#DDD", fontSize: 16 },
  playButton: {
    width: "100%",
    backgroundColor: "#E94560",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  playButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});