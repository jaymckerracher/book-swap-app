import { View, StyleSheet, Dimensions, Text, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { PTSwatches } = require('../Styling')
const { PTGreen, PTBlue, PTRed, PTG1, PTG2, PTG3, PTG4 } = PTSwatches
const {width, height} = Dimensions.get("window")

export default function Footer({ newNotif }) {
	const navigation = useNavigation();

	return (
		<View style={styles.footer}>
			<View
				style={
					Platform.OS === "ios"
						? { ...styles.iosfix, ...styles.footerContent }
						: styles.footerContent
				}
			>
				<Ionicons
					name="home-outline"
					size={29}
					style={styles.icon}
					onPress={() => navigation.navigate("Home")}
				/>
				<Ionicons
					name="chatbubbles-outline"
					size={29}
					style={styles.icon}
					onPress={() => navigation.navigate("Messages")}
				/>
				<Ionicons
					name="add-outline"
					size={45}
					style={styles.icon}
					onPress={() => navigation.navigate("Search_Existing_Book")}
				/>
				<Ionicons
					name="notifications-outline"
					size={29}
					style={styles.icon}
					color={newNotif ? "red" : "white"}
					onPress={() => navigation.navigate("Notifications")}
				/>
				<Ionicons
					name="person-outline"
					size={29}
					style={styles.icon}
					onPress={() => navigation.navigate("UserProfile")}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	footer: {
		height: (height/27)*2,
		justifyContent: "center",
		alignItems: "center",
		position: "fixed",
		bottom: 0,
		width: width,
		borderWidth: 0,
		backgroundColor: PTGreen,
	},
	footerContent: {
		width: width - height/27,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	icon: {
		color: "white",
	},
	iosfix: {
		marginBottom: 20,
	},
});
