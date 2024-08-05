import { View, Text, FlatList, StyleSheet } from "react-native";
import useFetchHistoryofBookings from "../utilities/useFetchHistoryOfBookings";
import { BookingInterface } from "../types";

export default function HistoryScreen() {
  const data = useFetchHistoryofBookings();

  const renderItem = ({ item }: { item: BookingInterface }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.categoryService}>{item.categoryService}</Text>
      <Text style={styles.specificService}>{item.specificService}</Text>
      <Text style={styles.location}>
        {item.region.name}, {item.province.name}, {item.city.name},{" "}
        {item.barangay.name}
      </Text>
      <Text style={styles.additionalDetail}>{item.additionalDetail}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.createdAt}>Created At: {item.createdAt}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  categoryService: {
    fontSize: 16,
    fontWeight: "bold",
  },
  specificService: {
    fontSize: 14,
    color: "#666",
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  additionalDetail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  createdAt: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
