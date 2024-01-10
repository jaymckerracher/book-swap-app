import {
  Text,
  StyleSheet,
  Pressable,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import ListedBook from "./ListedBook";
import Collapsible from "react-native-collapsible";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import Modal from "react-native-modal";
import { Dimensions } from "react-native";
import {
  VollkornSC_400Regular,
  Bellefair_400Regular,
  CormorantGaramond_400Regular,
  Lora_400Regular,
  JosefinSans_400Regular,
} from "@expo-google-fonts/dev";

const api = process.env.GOOGLE_BOOKS_API_KEY;

export default function AvailableListings({ route }) {
  const navigation = useNavigation();
  const { session, listing } = route.params;
  const [listings, setListings] = useState([]);
  const [userName, setUserName] = useState("");
  const [bookInfo, setBookInfo] = useState({});
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [swapRequestMade, setSwapRequestMade] = useState(false);
  const googleID = route.params.listing.google_book_id;

  useEffect(() => {
    async function getBookInfo() {
      // if googlebooks ID exists, will find info from API
      if (googleID) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${googleID}?key=${api}`
          );
          const data = await response.json();
          setBookInfo(data.volumeInfo);
        } catch (error) {
          console.error(error);
        }
      }
    }
    async function getAllListings() {
      const { data, error } = await supabase
        .from("Listings")
        .select("*")
        .eq("book_title", listing.book_title);
      setListings(data);
    }
    async function getBookOwner() {
      const { data, error } = await supabase
        .from("Users")
        .select("username")
        .eq("user_id", listing.user_id);
      setUserName(data[0].username);
    }
    getBookInfo();
    getAllListings();
    getBookOwner();
  }, []);
  // remove <p> and <br> from description
  const blurb = bookInfo.description;
  let newBlurb;
  if (blurb) {
    const regex = /<\/?[^>]+>/g;
    newBlurb = blurb.replace(regex, "");
  }

  return (
    <View style={styles.container}>
      <View style={styles.halfPage}>
        <View style={styles.bookInfoBox}>
          <LinearGradient
            colors={["#307361", "rgba(169, 169, 169, 0.10)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 30,
              overflow: "hidden",
              height: '100%',
              marginBottom: 25,
            }}
          >
            <Text style={styles.title}> {bookInfo.title}</Text>
            <Image style={styles.bookCard} source={{ uri: listing.img_url }} />
            {Object.keys(bookInfo).length > 0 ? (
              <View>
                <Text style={styles.title}> {bookInfo.authors}</Text>
                <Text style={styles.text}>
                  {" "}
                  Released on {bookInfo.publishedDate}
                </Text>
                <Pressable
                  onPress={() => setIsModalVisible(true)}
                  style={styles.descriptionButton}
                >
                  <Text style={styles.text}>
                    About
                  </Text>
                </Pressable>
                <Modal isVisible={isModalVisible} backdropOpacity={2}>
                  <View style={styles.modal}>
                    <Text style={styles.text}>{newBlurb}</Text>
                    <Pressable
                      onPress={() => setIsModalVisible(false)}
                    >
                      <Text style={styles.text}>Close</Text>
                    </Pressable>
                  </View>
                </Modal>
              </View>
            ) : (
              <Text style={styles.text}> No information available </Text>
            )}
          </LinearGradient>
        </View>
      </View>

      <View style={[styles.halfPage, { marginTop: 70}]}>
        <Text style={styles.title}>Books listed by users:</Text>
          <FlatList
            data={listings}
            keyExtractor={(item) => item.book_id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.text}> Posted by {userName} on {new Date(
                    item.date_posted
                  ).toLocaleDateString()} </Text>
                <Text style={styles.text}> {item.condition} Condition </Text>
                <Pressable  style={styles.descriptionButton}>
                  <ListedBook
                    username={item.username}
                    route={{ session: session, listing: item }}
                  />
                </Pressable>
              </View>
            )}
          />
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#272727",
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center"
  },
  halfPage: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    color: "white",
    padding: 10,
    fontFamily: "JosefinSans_400Regular",
    padding: 20,
  },
  text: {
    fontFamily: "CormorantGaramond_400Regular",
    color: "white",
    fontSize: 16,
    textAlign: "center",
    padding: 10,
  },
  descriptionButton: {
    backgroundColor: "#3B8D77",
    fontSize: 10,
    alignSelf: "center",
    width: Dimensions.get("window").width * 0.33,
    borderRadius: 15,
    marginTop: 10,
    textAlign: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  // requestSwapButton: {
  //   backgroundColor: "#3B8D77",
  //   fontSize: 10,
  //   alignSelf: "center",
  //   width: Dimensions.get("window").width * 0.33,
  //   borderRadius: 15,
  //   marginTop: 10,
  //   textAlign: "center",
  //   justifyContent: "center",
  //   marginBottom: 10,
  // },
  // requestSwapButtonPressed: {
  //   backgroundColor: "#3B8D77", // Change this to whatever color you want
  //   fontSize: 10,
  //   alignSelf: "center",
  //   width: Dimensions.get("window").width * 0.33,
  //   borderRadius: 15,
  //   borderColor: "Green",
  //   borderWidth: 3,
  //   marginTop: 10,
  //   textAlign: "center",
  //   justifyContent: "center",
  //   marginBottom: 10,
  // },
  bookInfoBox: {
    borderColor: "white",
    borderRadius: 30,
    borderWidth: 3,
    margin: 15,
  },
  button: {
    borderWidth: 2,
    borderColor: "blue",
  },
  bookCard: {
    height: 150,
    resizeMode: "contain",
    borderRadius: 50,
    
  },
  item: {
    borderColor: "black",
    borderWidth: 2,
  },
  image: {
    width: 100,
    height: 100,
  },
  listItem: {
   borderTopWidth: 1,
   borderBlockColor: "white",
    // borderRadius: 30,
    // borderWidth: 3,
  },
  // footer: {
  //   justifyContent: "flex-end",
  //   marginBottom: Dimensions.get("window").height * 0.08,
  //   height: 10,
  //   // borderColor: "gray",
  //   // borderWidth: 10,
  //   // borderRadius: 5,
  // },
});
