import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import supabase from "../config/supabaseClient";
import BookListCard from "./BookListCard";

const { PTStyles, PTSwatches, importFonts } = require("../Styling");
const { heading, subHeading, body, pillButton } = PTStyles;
const { PTGreen, PTBlue, PTRed, PTG1, PTG2, PTG3, PTG4 } = PTSwatches;

const { height, width } = Dimensions.get("window");

export default function BookList({ categoryName, id, trigger }) {
  importFonts();
  const [bookList, setBookList] = useState([]);
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;

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
    async function getBooks(categoryName) {
      let { data, error } = await supabase
        .from("Listings")
        .select("*")
        .eq("category", categoryName)
        .order("date_posted", { ascending: false })
        // .range(0, 10);

      const uniqueData = Array.from(
        new Set(data.map((item) => item.book_title))
      ).map((title) => data.find((item) => item.book_title === title));
      setBookList(uniqueData);
    }

    getBooks(categoryName);
  }, [trigger]);

  return (
    <View style={styles.categoryContainer}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          flexDirection: "row",
          width: "93.34%",
        }}
      >
        <View style={{ flex: 1, height: "100%" }}></View>
        <View style={{ flex: 1, height: "100%", justifyContent: "center" }}>
          <Text
            style={{
              ...subHeading,
              textAlignVertical: "center",
              textAlign: "center",
            }}
          >
            {categoryName}
          </Text>
        </View>
        <View style={{ flex: 1, height: "100%", justifyContent: "center" }}>
          <Pressable
            style={styles.seeAllButton}
            onPress={() =>
              navigation.navigate("GenreList", {
                genre: categoryName,
                key: categoryName,
                id: id,
              })
            }
          >
            <Entypo
              name="dots-three-horizontal"
              size={height * 0.0223}
              color={PTG1}
              style={{ textAlignVertical: "center", textAlign: "center" }}
            />
          </Pressable>
        </View>
      </View>
      <View
        style={{
          flex: 7,
          width: width,
          flexDirection: "row",
        }}
      >
        <FlatList
          data={bookList}
          renderItem={({ item }) => (
            <BookListCard listing={item} key={item.book_id} id={id} />
          )}
          horizontal
          pagingEnabled
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          onScroll={handleOnScroll}
          contentContainerStyle={{
            height: "100%",
            gap: width / 24,
            position: "absolute",
            justifyContent:"center",
            alignItems:"center"
          }}
          style={{
            flex: 1,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    backgroundColor: PTG4,
  },
  categoryList: {},
  cardContainer: {
    flex: 1,
    width: width / 3,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  seeAllButton: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
});
