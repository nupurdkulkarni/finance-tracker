import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { THEME } from "../lib/constants";

export default function Layout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={THEME.colors.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: THEME.colors.bg } }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
});
