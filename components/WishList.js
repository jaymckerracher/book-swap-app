import { Feather } from "@expo/vector-icons";
import { React, useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import supabase from "../config/supabaseClient";
import { LinearGradient } from "expo-linear-gradient";
import UserLibrary from "./UserLibrary";

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
const { height, width } = Dimensions.get("screen");
const pageHeight = height - (height / 27) * 4;
const viewHeight = (8 * pageHeight) / 9;
const containerHeight = viewHeight / 3.5;

const WishList = ({ session }) => {
  const [userWishlist, setUserWishlist] = useState([]);
  const [bookObjects, setBookObjects] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("");

  const [trigger, setTrigger] = useState(false);

  const channel = supabase
    .channel("Users")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
      },
      (payload) => {
        console.log(payload);
        setTrigger(!trigger);
      }
    )
    .subscribe();

  useEffect(() => {
    getWishlist();
  }, [trigger]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getWishlist(username);
    setRefreshing(false);
  }, [username]);

  const getWishlist = async () => {
    const { data, error } = await supabase
      .from("Users")
      .select("wishlist")
      .eq("user_id", session.user.id)
      .limit(1)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    const wishlist = data?.wishlist || [];
    const promises = wishlist.map(async (book_id) => {
      const { data, error } = await supabase
        .from("Listings")
        .select("*")
        .eq("book_id", book_id)
        .limit(1)
        .single();

      if (error) {
        console.log(error);
        return null;
      }
      const bookObj = data;
      return {
        book_id,
        img_url: bookObj?.img_url,
        title: bookObj?.book_title,
        author: bookObj.author,
        category: bookObj?.category,
        description: bookObj?.description,
      };
    });

    // console.log("data retrieved");
    let booksWithImages = await Promise.all(promises)
    booksWithImages = booksWithImages.filter((item) => item !== null);
    setBookObjects(booksWithImages);
    booksWithImages = booksWithImages.map((book) => book.book_id);
    setUserWishlist(booksWithImages);
  };

  const removeFromWishList = async (book_id) => {
    setUserWishlist( async (currentWishlist) => {
       const updatedWishlist = currentWishlist.filter((wishlistBookID) => wishlistBookID !== book_id);
       console.log(updatedWishlist === currentWishlist)
       const {data, error} = await supabase
         .from("Users")
         .update({ wishlist: updatedWishlist })
         .eq("user_id", session.user.id);

    if (error) {
      console.log(error);
    }

       return updatedWishlist;
    });
   
    setBookObjects((currentBookObjects) => {
       const updatedBookObjects = currentBookObjects.filter((bookObj) => bookObj.book_id !== book_id);
       return updatedBookObjects;
    });
   };

  return (
    <View style={page}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}></View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            style={{
              ...heading,
              textAlign: "center",
            }}
          >
            Wishlist
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <LinearGradient
            colors={[PTGreen, PTBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 5,
              width: "100%",
            }}
          ></LinearGradient>
        </View>
      </View>

      <View style={{ flex: 8, justifyContent: "center", alignItems: "center" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {bookObjects.map(
            ({ book_id, img_url, title, author, description, category }) => (
              <View key={book_id} style={styles.listContainer}>
                <View style={{ height: width / 27, width: "100%" }}></View>
                <View
                  style={{
                    width: width - (2 * width) / 27,
                    height: containerHeight - (2 * width) / 27,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <View style={{ flex: 3, height: "100%" }}>
                    {img_url && (
                      <Image
                        source={{ uri: img_url }}
                        style={styles.bookImage}
                      />
                    )}
                  </View>
                  <View
                    style={{
                      flex: 6,
                      height: "100%",
                      flexDirection: "row",
                      gap: width / 27,
                    }}
                  >
                    <View
                      style={{
                        flex: 8,
                        height: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          height: "33%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            ...subHeading,
                            fontWeight: "600",
                          }}
                        >
                          {title}
                        </Text>
                        <Text
                          style={{
                            ...body,
                          }}
                        >
                          {" "}
                        </Text>
                        <Text
                          style={{
                            ...subHeading,
                          }}
                        >
                          {author}
                        </Text>
                        <Text
                          style={{
                            ...body,
                          }}
                        >
                          {" "}
                        </Text>
                        <Text
                          style={{
                            ...subHeading,
                          }}
                        >
                          {category}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, top: 0, alignItems: "center" }}>
                      <Feather
                        name="x"
                        size={30}
                        color={PTG2}
                        style={{
                          alignSelf: "center",
                        }}
                        onPress={() => removeFromWishList(book_id)}
                      />
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    height: width / 27,
                    justifyContent: "flex-end",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      height: 2,
                      width: "100%",
                      backgroundColor: PTG2,
                    }}
                  ></View>
                </View>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#272727",
    padding: 16,
  },
  headerText: {
    fontFamily: "JosefinSans_400Regular",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "white",
  },
  listContainer: {
    display: "flex",
    position: "relative",
    height: containerHeight,
    width: width - (2 * width) / 27,
    justifyContent: "center",
    alignItems: "center",
  },
  textStyling: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "white",
    fontFamily: "JosefinSans_400Regular",
    flexShrink: 1,
  },
  icon: {
    color: "white",
    position: "absolute",
    right: 10,
    top: 5,
    zIndex: 1,
  },
  bookImage: {
    width: (2 * (containerHeight - (2 * width) / 27)) / 3,
    // borderRadius: width / 27,
    height: "100%",
    resizeMode: "cover",
  },
  itemContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
});
export default WishList;
