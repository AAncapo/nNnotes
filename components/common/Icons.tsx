import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

export const Back = ({ size = 24, color = "black" }) => (
  <Ionicons name="arrow-back-outline" size={size} color={color} />
);

export const Pin = ({ size = 24, color = "black" }) => (
  <MaterialCommunityIcons name="pin" size={size} color={color} />
);

export const PinOff = ({ size = 24, color = "black" }) => (
  <MaterialCommunityIcons name="pin-off" size={size} color={color} />
);

export const Delete = ({ size = 24, color = "black" }) => (
  <MaterialIcons name="delete" size={size} color={color} />
);

export const Tags = ({ size = 24, color = "black" }) => (
  <MaterialCommunityIcons name="tag-multiple" size={size} color={color} />
);

export const Close = ({ size = 24, color = "black" }) => (
  <AntDesign name="close" size={size} color={color} />
);

export const Search = ({ size = 24, color = "black" }) => (
  <Ionicons name="search-sharp" size={size} color={color} />
);
