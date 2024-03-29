import { useEffect, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import supabase from "../config/supabaseClient";
import GenreListCard from "./GenreListCard";

const { PTStyles, PTSwatches } = require("../Styling");
const { heading, subHeading, body, page } = PTStyles;
const { PTGreen, PTBlue, PTRed, PTG1, PTG2, PTG3, PTG4 } = PTSwatches;
const { height, width } = Dimensions.get("screen");

const pageHeight = height - (height / 27) * 4;
const viewHeight = (9 * pageHeight) / 10;

export default function GenreList({ route }) {
  const { genre, key, id } = route.params;
  const [genreList, setGenreList] = useState([]);

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

  function handleOnScroll(event) {
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              x: scrollX,
            },
          },
        },
      ],
      {
        useNativeDriver: false,
      }
    )(event);
  }

  useEffect(() => {
    async function getBooksByGenre(genre) {
      const { data, error } = await supabase
        .from("Listings")
        .select()
        .eq("category", genre);

      const uniqueData = Array.from(
        new Set(data.map((item) => item.book_title))
      ).map((title) => data.find((item) => item.book_title === title));

      setGenreList(uniqueData);
    }

    getBooksByGenre(genre);
  }, [trigger]);

  return (
    <View style={page}>
      <View
        style={{
          flex: 1,
          shadowOpacity: 1,
          shadowRadius: 8,
          shadowOffset: 8,
        }}
      >
        <View style={{ flex: 1 }}></View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            style={{
              ...heading,
              textAlign: "center",
            }}
          >
            {genre}
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
              zIndex: 1,
              elevation: 1,
            }}
          ></LinearGradient>
        </View>
      </View>

      <View
        style={{
          flex: 8,
          backgroundColor: PTG4,
        }}
      >
        <FlatList
          data={genreList}
          renderItem={({ item }) => (
            <View style={styles.bookContainer}>
              <GenreListCard listing={item} key={item.book_id} id={id} />
            </View>
          )}
          pagingEnabled
          initialNumToRender={24}
          vertical
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          numColumns={3}
          onScroll={handleOnScroll}
          contentContainerStyle={{
            flex: 1 / 3,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignContent: "flex-start",
            flexWrap: "wrap",
          }}
          style={{ height: "100%" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontFamily: "JosefinSans_400Regular",
    fontSize: 28,
    fontWeight: "bold",
    margin: 16,
    color: "white",
  },

  container: {
    backgroundColor: "#272727",
    flex: 1,
  },
  bookList: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    flex: 1,
    alignContent: "flex-start",
  },
  bookContainer: {
    height: viewHeight / 3.5,
    width: width / 3,
  },
  book: {
    flex: 1,
    height: 50,
    width: 50,
    // backgroundColor: PTBlue,
    justifyContent: "center",
    alignItems: "center",
  },
});
