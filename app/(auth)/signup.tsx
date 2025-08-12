import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";

import { useAuthStore } from "@/store/useAuthStore";
import { AuthInput } from "@/components/AuthInput";
import useTheme from "@/hooks/useTheme";

export default function SignUp() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, signUp, error } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push("/notes");
    }
  }, [user]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await signUp(email, password, name);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al crear cuenta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Crear cuenta</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Regístrate para empezar a usar nNnotes
        </Text>

        <AuthInput
          label="Nombre de usuario"
          value={name}
          onChangeText={setName}
          placeholder="Ingresa tu nombre de usuario"
          autoCapitalize="words"
        />

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
          newPassword={true}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.button }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="gray" />
          ) : (
            <Text
              style={[styles.submitButtonText, { color: colors.buttonText }]}
            >
              Regístrate
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-16 items-center"
          onPress={() => router.back()}
        >
          <Text style={[styles.switchButtonText, { color: colors.text }]}>
            Ya tienes una cuenta? {"  "}
            <Text className="underline">Inicia sesión</Text>
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
  switchButtonText: {
    fontSize: 14,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 8,
    padding: 24,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
