import { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Picker as SelectPicker } from "@react-native-picker/picker";

import { Back } from "@/components/common/Icons";
import useNote from "@/hooks/useNote";
import useTheme from "@/hooks/useTheme";
import { isPlatformWeb } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { ColorTheme } from "@/types";

export const themeOptions = ["device", "light", "dark"];

function Settings() {
  const { theme, colors, changeTheme } = useTheme();
  const { user, signOut } = useAuthStore();
  const { folders, selectFolder, getNoteByFolder, syncNotes, loading } =
    useNote();

  const handleSelectFolder = (folderId: string | null) => {
    selectFolder(folderId || undefined);
    if (isPlatformWeb) router.setParams({ view: "notes" });
    else router.back();
  };

  const handleGoBack = () => {
    if (isPlatformWeb) router.setParams({ view: "notes" });
    else router.back();
  };

  const allNotes = useMemo(() => getNoteByFolder().length, [folders]);

  return (
    <View
      className={` ${isPlatformWeb ? "w-3/12" : "flex-1"}`}
      style={{
        backgroundColor: colors.background,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center p-4">
        <TouchableOpacity className="flex-1 p-2" onPress={handleGoBack}>
          <Back color={colors.icon} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center text-2xl font-semibold"
          style={{ color: colors.text }}
        >
          Settings
        </Text>
        <TouchableOpacity className="flex-1 items-end p-2">
          <Text>EN</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="p-4">
        {/* Account Section */}
        <View style={[styles.section]}>
          {user ? (
            <>
              <View style={styles.accountCard}>
                <View style={styles.profileInfo}>
                  <View style={[styles.avatar, { backgroundColor: "#000" }]}>
                    <Text style={styles.avatarText}>
                      {user.email?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.name, { color: colors.text }]}>
                      {user.user_metadata.username || user.email}
                    </Text>
                    <Text style={[styles.status, { color: colors.text }]}>
                      {!user ? "Guest User" : "Signed In"}
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonGroup}>
                  {/* Sync */}
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.button }]}
                    onPress={syncNotes}
                  >
                    <MaterialIcons
                      name="sync"
                      size={20}
                      color={colors.iconButton}
                    />
                    <Text
                      style={[styles.buttonText, { color: colors.buttonText }]}
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
                    <Text style={[styles.buttonText, { color: "white" }]}>
                      Sign Out
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Syncing Indicator */}
                {loading && (
                  <View className="items-center justify-center gap-2 py-2">
                    <ActivityIndicator color={"gray"} />
                    <Text style={{ color: colors.text }}>Sincronizando...</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.guestCard}>
              <Text style={[styles.guestText, { color: colors.text }]}>
                You're using nNnotes as a guest
              </Text>
              <TouchableOpacity
                style={[styles.authButton, { backgroundColor: colors.button }]}
                onPress={() => router.push("/signin")}
              >
                <Text
                  className="font-bold"
                  style={{ color: colors.buttonText }}
                >
                  Sign In / Register
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* Theme Selector */}
        <View className="flex-row justify-between items-center p-2">
          <Text
            className="flex-1 text-lg font-semibold"
            style={{ color: colors.text }}
          >
            Appearance
          </Text>
          <SelectPicker
            mode="dropdown"
            selectedValue={theme}
            onValueChange={(value) =>
              changeTheme(value.toLowerCase() as ColorTheme | "device")
            }
            dropdownIconColor={colors.icon}
            selectionColor={colors.secondary}
            style={{
              flex: 1,
              borderRadius: 8,
              backgroundColor: colors.secondary,
              color: colors.text,
            }}
          >
            {themeOptions.map((mode) => (
              <SelectPicker.Item
                key={mode}
                label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                value={mode}
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.text,
                }}
              />
            ))}
          </SelectPicker>
        </View>
        {/* Folders */}
        <View>
          <Text
            className="text-xl font-semibold"
            style={{ color: colors.text }}
          >
            Folders
          </Text>
          <TouchableOpacity
            className="p-2 flex-row justify-between"
            onPress={() => handleSelectFolder(null)}
          >
            <Text style={{ color: colors.text }}>All Notes</Text>
            <Text className="font-semibold" style={{ color: colors.text }}>
              {allNotes}
            </Text>
          </TouchableOpacity>
          {folders.map((f) => (
            <TouchableOpacity
              key={f.id}
              className="p-2 flex-row justify-between"
              onPress={() => handleSelectFolder(f.id)}
            >
              <Text style={{ color: colors.text }}>{f.name}</Text>
              <Text className="font-semibold" style={{ color: colors?.text }}>
                {getNoteByFolder(f.id).length}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default Settings;

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    padding: 4,
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
