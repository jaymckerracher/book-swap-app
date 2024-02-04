import { StyleSheet, FlatList, View, Dimensions, Animated } from "react-native";
import CarouselItem from "./CarouselItem";
import Pagination from "./Pagination";
import { useRef, useState } from "react";

const screenHeight = Dimensions.get('screen').height
const screenWidth = Dimensions.get('screen').width

export default function TopTenCarousel ({listings}) {
    const [index, setIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    function handleOnScroll (event) {
        Animated.event([
            {
                nativeEvent: {
                    contentOffset: {
                        x: scrollX,
                    }
                }
            }
        ], {
            useNativeDriver: false,
        })(event)
    }

    return (
        <View style={{width: screenWidth}}>
            <FlatList
                data={listings}
                renderItem={({item}) => <CarouselItem item={item}/>}
                horizontal
                pagingEnabled
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                onScroll={handleOnScroll}
            />
            <View style={{alignItems: 'center', paddingVertical: screenHeight*0.03}}>
                <Pagination listings={listings} scrollX={scrollX}/>
            </View>
        </View>
    )
}
