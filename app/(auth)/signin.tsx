import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { AuthInput } from "@/components/AuthInput";
import { useAuthStore } from "@/store/useAuthStore";
import useTheme from "@/lib/themes";

export default function Auth() {
  const theme = useTheme(useColorScheme());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, signIn, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push("/notes");
    }
  }, [user]);

  const handleSubmit = async () => {
    await signIn(email, password);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme?.background },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme?.text }]}>
          Bienvenido a nNnotes
        </Text>
        <Text style={[styles.subtitle, { color: theme?.text }]}>
          Inicia sesión para continuar o regístrate
        </Text>

        <AuthInput
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          placeholder="Ingresa tu correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AuthInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Ingresa tu contraseña"
          secureTextEntry
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme?.button }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="gray" />
          ) : (
            <Text
              style={[styles.submitButtonText, { color: theme?.buttonText }]}
            >
              Iniciar sesión
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => router.push("/signup")}
        >
          <Text style={[styles.switchButtonText, { color: theme?.text }]}>
            No tienes una cuenta? {"  "}
            <Text className="underline">Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
    color: "red",
  },
  switchButton: {
    marginTop: 16,
    alignItems: "center",
  },
  switchButtonText: {
    fontSize: 14,
  },
});
