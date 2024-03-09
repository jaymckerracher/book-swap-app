// Complete Requests lead here
// sender is the other user
// reciever is you

import {
  Text,
  StyleSheet,
  Pressable,
  View,
  Dimensions,
  Image,
  FlatList,
} from "react-native";
import Modal from "react-native-modal";
import {
  ScreenWidth,
  ScreenHeight,
  color,
} from "react-native-elements/dist/helpers";
import { useNavigation } from "@react-navigation/native";
import supabase from "../config/supabaseClient";
import { useEffect, useState, useRef } from "react";
import {
  Entypo,
  Ionicons,
  Octicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { JosefinSans_400Regular } from "@expo-google-fonts/dev";
import LibraryBookItem from "./LibraryBookItem";

const { PTStyles, PTSwatches } = require("../Styling");
const {
  heading,
  subHeading,
  body,
  page,
  pillButton,
  roundButton,
  roundButtonPressed,
} = PTStyles;
const { PTGreen, PTBlue, PTRed, PTG1, PTG2, PTG3, PTG4 } = PTSwatches;
const { width, height } = Dimensions.get("screen");

export default function SwapNegotiationPage({ route }) {
  const [title, setTitle] = useState([]);
  const navigation = useNavigation();
  const [user1ProfilePic, setUser1ProfilePic] = useState();
  const [user2ProfilePic, setUser2ProfilePic] = useState();
  const [user2BookUrl, setUser2BookUrl] = useState("");
  const [reconsidered, setReconsidered] = useState(false);
  const [timeKey, setTimeKey] = useState(Date.now());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeUserLibrary, setActiveUserLibrary] = useState([]);
  const [nonActiveUserLibrary, setNonActiveUserLibrary] = useState([]);
  const activeUserLibraryRef = useRef(activeUserLibrary);
  const nonActiveUserLibraryRef = useRef(nonActiveUserLibrary);

  // Passed down props from swap card or notifications
  const { info, session, type } = route.params;
  const [currType, setCurrType] = useState(type);
  const [currSwap, setCurrSwap] = useState(info);
  const {
    user1_author,
    user1_book_imgurl,
    user1_book_title,
    user1_id,
    user1_listing_id,
    user1_username,
    user1_category,
    user1_condition,
    user1_desc,
    user2_author,
    user2_book_imgurl,
    user2_book_title,
    user2_id,
    user2_listing_id,
    user2_username,
    user2_category,
    user2_condition,
    user2_desc,
  } = currSwap;

  console.log(currSwap);

  const activeUserID =
    session.user.id === info.user1_id ? info.user1_id : info.user2_id;
  const nonActiveUserID =
    session.user.id === info.user1_id ? info.user2_id : info.user1_id;
  const [activeUserCheck, setActiveUserCheck] = useState();
  const [modalUserID, setModalUserID] = useState();
  const [modalLibrary, setModalLibrary] = useState();

  useEffect(() => {
    activeUserLibraryRef.current = activeUserLibrary;
  }, [activeUserLibrary]);
  useEffect(() => {
    nonActiveUserLibraryRef.current = nonActiveUserLibrary;
  }, [nonActiveUserLibrary]);

  useEffect(() => {
    updateSwapInfo(currSwap);
  }, [currSwap]);

  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        const [activeUserListings, nonActiveUserListings] = await Promise.all([
          getListings(activeUserID),
          getListings(nonActiveUserID),
        ]);

        setActiveUserLibrary(activeUserListings);
        setNonActiveUserLibrary(nonActiveUserListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchAllListings();
  }, [activeUserID, nonActiveUserID]);

  // MVP ONLY - NEEDS REFACTORING TO BE SCALABLE!
  useEffect(() => {
    switch (info.user1_id) {
      case "10240ee4-1b43-4749-afbe-1356c83af4da":
        setUser1ProfilePic(
          require("../assets/ExampleUserProfilePictures/Nav.jpg")
        );
        break;
      case "a4624164-bbbb-4cb6-b199-06b2fdd6f14a":
        setUser1ProfilePic(
          require("../assets/ExampleUserProfilePictures/Jake.jpg")
        );
        break;
      case "c563d513-b021-42f2-a3b3-77067b8547af":
        setUser1ProfilePic(
          require("../assets/ExampleUserProfilePictures/Jay.jpg")
        );
        break;
      case "ce083d4c-a1e8-45d0-9f93-6bc092f7155b":
        setUser1ProfilePic(
          require("../assets/ExampleUserProfilePictures/Ana.jpg")
        );
        break;
      case "2f71dabd-2f9c-48c3-8edd-4ae7495f59ce":
        setUser1ProfilePic(
          require("../assets/ExampleUserProfilePictures/Alicia.jpg")
        );
        break;
      case "b45b3687-4e73-46e2-8474-da10e307691b":
        setUser1ProfilePic(
          require("../assets/ExampleUserProfilePictures/Faith.jpg")
        );
        break;
    }
  }, []);
  useEffect(() => {
    switch (info.user2_id) {
      case "10240ee4-1b43-4749-afbe-1356c83af4da":
        setUser2ProfilePic(
          require("../assets/ExampleUserProfilePictures/Nav.jpg")
        );
        break;
      case "a4624164-bbbb-4cb6-b199-06b2fdd6f14a":
        setUser2ProfilePic(
          require("../assets/ExampleUserProfilePictures/Jake.jpg")
        );
        break;
      case "c563d513-b021-42f2-a3b3-77067b8547af":
        setUser2ProfilePic(
          require("../assets/ExampleUserProfilePictures/Jay.jpg")
        );
        break;
      case "ce083d4c-a1e8-45d0-9f93-6bc092f7155b":
        setUser2ProfilePic(
          require("../assets/ExampleUserProfilePictures/Ana.jpg")
        );
        break;
      case "2f71dabd-2f9c-48c3-8edd-4ae7495f59ce":
        setUser2ProfilePic(
          require("../assets/ExampleUserProfilePictures/Alicia.jpg")
        );
        break;
      case "b45b3687-4e73-46e2-8474-da10e307691b":
        setUser2ProfilePic(
          require("../assets/ExampleUserProfilePictures/Faith.jpg")
        );
        break;
    }
  }, []);

  async function getListings(user_id) {
    const { data, error } = await supabase
      .from("Listings")
      .select("*")
      .eq("user_id", user_id)
      .order("date_posted", { ascending: false });

    if (error) {
      alert(error);
    } else {
      return data;
    }
  }

  async function updateSwapInfo(currSwap) {
    const { data, error } = await supabase
      .from("Pending_Swaps")
      .update(currSwap)
      .eq("pending_swap_id", currSwap.pending_swap_id);

    if (error) {
      console.log(error);
    }
    console.log(data[0]);
    return data[0];
  }

  function renderModal(activeUserCheck, user_id, library) {
    return activeUserCheck === true ? (
      <View>
        <View style={{ height: height - (height / 27) * 4 }}>
          <View
            style={{
              justifyContent: "center",
              width: width,
              flex: 1,
            }}
          >
            <Text style={{ ...heading, color: PTG1, textAlign: "center" }}>
              Your Library
            </Text>
          </View>

          <View
            style={{
              flex: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FlatList
              data={activeUserLibrary}
              renderItem={({ item }) => (
                <LibraryBookItem
                  book={item}
                  id={item.book_id}
                  inSwapReq={true}
                  activeUserCheck={true}
                  activeUserID={activeUserID}
                  currSwap={currSwap}
                  setCurrSwap={setCurrSwap}
                />
              )}
              keyExtractor={(item) => item.book_id.toString()}
              vertical={true}
              pagingEnabled
              snapToAlignment="center"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ height: "100%", alignSelf: "center" }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    ) : (
      <View>
        <View
          style={{
            justifyContent: "center",
            width: width,
            height: (height / 27) * 2,
          }}
        >
          <Text style={{ ...heading, color: PTG1, textAlign: "center" }}>
            {session.user.id === info.user1_id
              ? info.user2_username
              : info.user1_username}
            {`'s Library`}
          </Text>
        </View>
      </View>
    );
  }

  function renderSwap(currType, info) {
    switch (currType) {
      case "received":
        return (
          <View style={{ justifyContent: "space-between" }}>
            <View style={styles.booksAndArrows}>
              <Pressable
                style={styles.bookCard}
                onPress={() => {
                  setActiveUserCheck(true);
                  setModalUserID(activeUserID);
                  setModalLibrary(activeUserLibrary);
                  setIsModalVisible(true);
                }}
              >
                <Image
                  source={{
                    uri: user1_book_imgurl,
                  }}
                  style={{ width: "100%", height: "100%" }}
                />
              </Pressable>

              <View style={{ justifyContent: "center" }}>
                <Octicons
                  name="arrow-switch"
                  size={36}
                  color={PTG1}
                  style={{ textAlign: "center", width: "100%" }}
                />
              </View>

              <View
                style={{
                  ...styles.bookCard,
                  borderWidth: 2,
                  borderColor: PTG1,
                  borderStyle: "dashed",
                  justifyContent: "center",
                }}
              >
                <Text style={{ ...heading, color: PTG1, textAlign: "center" }}>
                  ?
                </Text>
              </View>

              <Modal isVisible={isModalVisible}>
                <View style={styles.modal}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      width: width,
                      height: (height / 27) * 2,
                      backgroundColor: PTGreen,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="chevron-double-down"
                      size={36}
                      color={PTG1}
                      style={{ alignSelf: "center" }}
                      onPress={() => {
                        setIsModalVisible(false);
                      }}
                    />
                  </View>

                  {renderModal(activeUserCheck, modalUserID, modalLibrary)}
                </View>
              </Modal>
            </View>
          </View>
        );
      case "sent":
        return (
          <View style={styles.booksAndArrows}>
            <View
              style={{
                ...styles.bookCard,
                borderWidth: 2,
                borderColor: PTG1,
                borderStyle: "dashed",
                justifyContent: "center",
              }}
            >
              <Text style={{ ...heading, color: PTG1, textAlign: "center" }}>
                ?
              </Text>
            </View>

            <View style={{ justifyContent: "center" }}>
              <Octicons
                name="arrow-switch"
                size={36}
                color={PTG1}
                style={{ textAlign: "center", width: "100%" }}
              />
            </View>

            <Image
              source={{
                uri: info.user1_book_imgurl,
              }}
              style={styles.bookCard}
            />
          </View>
        );
      case "activeReceived":
        return (
          <View style={styles.booksAndArrows}>
            <Image
              source={{
                uri: info.user1_book_imgurl,
              }}
              style={styles.bookCard}
            />
            <View style={{ justifyContent: "center" }}>
              <Octicons
                name="arrow-switch"
                size={36}
                color={PTG1}
                style={{ textAlign: "center", width: "100%" }}
              />
            </View>
            <Image
              source={{
                uri: info.user2_book_imgurl,
              }}
              style={styles.bookCard}
            />
          </View>
        );
      case "activeSent":
        return (
          <View style={styles.booksAndArrows}>
            <Image
              source={{
                uri: info.user2_book_imgurl,
              }}
              style={styles.bookCard}
            />
            <View style={{ justifyContent: "center" }}>
              <Octicons
                name="arrow-switch"
                size={36}
                color={PTG1}
                style={{ textAlign: "center", width: "100%" }}
              />
            </View>
            <Image
              source={{
                uri: info.user1_book_imgurl,
              }}
              style={styles.bookCard}
            />
          </View>
        );
      default:
        return null;
    }
  }

  useEffect(() => {
    getTransferData().then((res) => {
      setTitle([`${res.user1_book_title}`, `${res.user2_book_title}`]);
    });
  }, []);

  async function getTransferData() {
    const { data, error } = await supabase
      .from("Pending_Swaps")
      .select()
      .eq("pending_swap_id", info.pending_swap_id);
    return data[0];
  }

  async function updateSwapHistory(currSwap) {
    const { data, error } = await supabase
      .from("Swap_History")
      .insert([currSwap]);
  }

  async function removeData(infoResponse) {
    await Promise.all([
      supabase
        .from("Pending_Swaps")
        .delete()
        .eq("pending_swap_id", infoResponse.pending_swap_id),
      supabase
        .from("Listings")
        .delete()
        .eq("book_id", infoResponse.user1_listing_id),
      supabase
        .from("Listings")
        .delete()
        .eq("book_id", infoResponse.user2_listing_id),
    ]);
  }

  async function rejectBook(info) {
    await Promise.all([
      supabase.from("Notifications").insert([
        {
          type: "Offer_Rejected",
          user_id:
            info.user1_id === session.user.id ? info.user2_id : info.user1_id,
          username: session.user.user_metadata.username,
        },
      ]),
      supabase
        .from("Notifications")
        .delete()
        .eq("swap_offer_id", info.pending_swap_id),
      supabase
        .from("Pending_Swaps")
        .delete()
        .eq("pending_swap_id", info.pending_swap_id),
    ]);
  }

  return (
    <View style={styles.page}>
      <View>
        <Text style={styles.heading}>Your Offer</Text>
      </View>
      <View style={styles.booksAndProfilePics}>
        <View style={styles.profilePics}>
          <View style={styles.picAndName}>
            <Image
              source={
                activeUserID === info.user1_id
                  ? user1ProfilePic
                  : user2ProfilePic
              }
              style={styles.user1Profile}
            />
            <Text style={styles.body}>
              {activeUserID === info.user1_id
                ? info.user1_username
                : info.user2_username}
            </Text>
          </View>

          <Ionicons
            name="chatbubbles"
            size={60}
            style={styles.icon}
            onPress={() => {
              navigation.navigate("ChatWindow", {
                sender: nonActiveUserID,
                receiver: activeUserID,
                username:
                  activeUserID === info.user1_id
                    ? info.user2_username
                    : info.user1_username,
                session: session,
              });
            }}
          />

          <View style={styles.picAndName}>
            <Image
              source={
                activeUserID === info.user1_id
                  ? user2ProfilePic
                  : user1ProfilePic
              }
              style={styles.user2Profile}
            />
            <Text style={styles.body}>
              {activeUserID === info.user1_id
                ? info.user2_username
                : info.user1_username}
            </Text>
          </View>
        </View>
        {renderSwap(currType, info)}

        {/* Experimental */}

        <View style={styles.buttons}>
          {/* <Pressable
            style={styles.accept}
            onPress={() => {
              getTransferData()
                .then((res) => {
                  updateSwapHistory(res);
                  return res;
                })
                .then((res) => {
                  removeData(res);
                })
                .then(() => {
                  navigation.navigate("Home");
                });
            }}
          >
            <Text style={styles.body}>Accept</Text>
          </Pressable> */}

          {/* <Pressable
            style={styles.reconsider}
            onPress={() => {
              getTransferData().then((res) => {
                navigation.navigate("ReconsiderLibrary", {
                  info: res,
                  setReconsidered: setReconsidered,
                  setTimeKey: setTimeKey,
                });
              });
            }}
          >
            <Text style={styles.body}>Reconsider</Text>
          </Pressable> */}

          <Pressable
            style={styles.reject}
            onPress={() => {
              getTransferData().then((res) => {
                rejectBook(res);
              });
            }}
          >
            <Text style={styles.body}>Reject Offer</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    width: width,
    height: height,
    alignSelf: "center",
    backgroundColor: PTG4,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: JosefinSans_400Regular,
    color: "white",
  },
  page: {
    backgroundColor: "#272727",
    flex: 0.91,
    alignItems: "center",
    justifyContent: "center",
  },
  booksAndProfilePics: {
    margin: "auto",
    display: "flex",
    justifyContent: "space-between",
    // borderColor: "gray",
    // borderWidth: 5,
    width: ScreenWidth * 0.9,
    height: 600,
  },
  profilePics: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  booksAndArrows: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bookContainer: {
    margin: 0,
    borderColor: "gray",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    height: 180,
    width: 120,
    borderRadius: 16,
  },
  user1Profile: {
    borderRadius: 60,
    height: 120,
    width: 120,
    resizeMode: "cover",
    borderColor: "#C1514B",
    borderWidth: 3,
  },
  user2Profile: {
    borderRadius: 60,
    height: 120,
    width: 120,
    resizeMode: "cover",
    borderColor: "#06A77D",
    borderWidth: 3,
  },
  bookCard: {
    borderRadius: 16,
    height: 180,
    width: 120,
    resizeMode: "contain",
  },
  pick_book: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#06A77D",
    borderRadius: 16,
    height: 180,
    width: 120,
    resizeMode: "contain",
  },
  arrows: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
  },
  picAndName: {
    justifyContent: "center",
  },
  body: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontFamily: JosefinSans_400Regular,
    color: "white",
  },
  icon: {
    color: PTG1,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accept: {
    justifyContent: "center",
    alignItems: "center",
    height: 33,
    width: 100,
    backgroundColor: "#06A77D",
    borderRadius: 16.5,
  },
  reconsider: {
    justifyContent: "center",
    alignItems: "center",
    height: 33,
    width: 100,
    backgroundColor: "#4B7095",
    borderRadius: 16.5,
  },
  reject: {
    justifyContent: "center",
    alignItems: "center",
    height: 33,
    width: 100,
    backgroundColor: "#C1514B",
    borderRadius: 16.5,
  },
});
