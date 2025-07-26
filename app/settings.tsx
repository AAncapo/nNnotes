import useTheme from "@/lib/themes";
import { isPlatformWeb } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotesStore } from "@/store/useNotesStore";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

function Settings() {
  const theme = useTheme(useColorScheme());
  const { user, signOut } = useAuthStore();
  const { folders, setSelectedFolder, getNoteByFolder, syncNotes, loading } =
    useNotesStore();

  const handleSelectFolder = (folderId: string | null) => {
    setSelectedFolder(folderId);
    if (isPlatformWeb) router.setParams({ view: "notes" });
    else router.back();
  };

  const handleGoBack = () => {
    if (isPlatformWeb) router.setParams({ view: "notes" });
    else router.back();
  };

  return (
    <View
      className={` ${isPlatformWeb ? "w-3/12" : "flex-1"}`}
      style={{
        backgroundColor: theme?.background,
      }}
    >
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity className="flex-1" onPress={handleGoBack}>
            <Text style={{ color: theme?.text }}>Back</Text>
          </TouchableOpacity>
          <Text
            className="flex-1 text-center text-2xl font-semibold"
            style={{ color: theme?.text }}
          >
            Settings
          </Text>
          <TouchableOpacity className="flex-1 items-end">
            <Text>EN</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          {/* Account Section */}
          <View style={[styles.section]}>
            <Text style={[styles.sectionTitle, { color: theme?.text }]}>
              Cuenta
            </Text>

            {user ? (
              <>
                <View style={styles.accountCard}>
                  <View style={styles.profileInfo}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: theme?.background },
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {user.email?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.name, { color: theme?.text }]}>
                        {user.user_metadata.username || user.email}
                      </Text>
                      <Text style={[styles.status, { color: theme?.text }]}>
                        {!user ? "Guest User" : "Signed In"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.buttonGroup}>
                    {/* Sync */}
                    <TouchableOpacity
                      style={[
                        styles.button,
                        { backgroundColor: theme?.button },
                      ]}
                      onPress={syncNotes}
                    >
                      <MaterialIcons
                        name="sync"
                        size={20}
                        color={theme?.iconButton}
                      />
                      <Text
                        style={[
                          styles.buttonText,
                          { color: theme?.buttonText },
                        ]}
                      >
                        Sync Data
                      </Text>
                    </TouchableOpacity>

                    {/* Sign Out */}
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: "red" }]}
                      onPress={signOut}
                    >
                      <AntDesign name="logout" size={20} color="white" />
                      <Text style={[styles.buttonText, { color: theme?.text }]}>
                        Sign Out
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {loading && (
                    <View className="items-center justify-center gap-2 py-2">
                      <ActivityIndicator color={"gray"} />
                      <Text style={{ color: theme?.text }}>
                        Sincronizando...
                      </Text>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.guestCard}>
                <Text style={[styles.guestText, { color: theme?.text }]}>
                  You're using nNnotes as a guest
                </Text>
                <TouchableOpacity
                  style={[
                    styles.authButton,
                    { backgroundColor: theme?.button },
                  ]}
                  onPress={() => router.push("/signin")}
                >
                  <Text
                    className="font-bold"
                    style={{ color: theme?.buttonText }}
                  >
                    Sign In / Register
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {/* Folders */}
          <View>
            <Text
              className="text-xl font-semibold"
              style={{ color: theme?.text }}
            >
              Folders
            </Text>
            <TouchableOpacity
              className="p-2 flex-row justify-between"
              onPress={() => handleSelectFolder(null)}
            >
              <Text style={{ color: theme?.text }}>All Notes</Text>
              <Text className="font-semibold" style={{ color: theme?.text }}>
                {getNoteByFolder(null).length}
              </Text>
            </TouchableOpacity>
            {folders.map((f) => (
              <TouchableOpacity
                key={f.id}
                className="p-2 flex-row justify-between"
                onPress={() => handleSelectFolder(f.id)}
              >
                <Text style={{ color: theme?.text }}>{f.name}</Text>
                <Text className="font-semibold" style={{ color: theme?.text }}>
                  {f.notes.length}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Theme Selector Section */}
          {/* <View style={[styles.section, { backgroundColor: colorScheme?.secondary }]}>
            <Text style={[styles.sectionTitle, { color: colorScheme?.text }]}>
              Appearance
            </Text>

            <View style={styles.themeOptions}>
              {(["device", "light", "dark"] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor:
                        themeMode === mode ? theme.primary : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setThemeMode(mode)}
                >
                  <MaterialIcons
                    name={
                      mode === "device"
                        ? "devices"
                        : mode === "light"
                          ? "wb-sunny"
                          : "nights-stay"
                    }
                    size={24}
                    color={themeMode === mode ? "white" : theme.text}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: themeMode === mode ? "white" : theme.text },
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View> */}
        </ScrollView>
      </View>
    </View>
  );
}

export default Settings;

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  accountCard: {
    flexDirection: "column",
    gap: 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  status: {
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: "500",
  },
  guestCard: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  guestText: {
    fontSize: 16,
  },
  authButton: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
});
