import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import {doc, updateDoc} from 'firebase/firestore';
import {FIREBASE_DB} from '../../firebaseConfig';
import useFetchListOfBookings from '../../utilities/useFetchListOfBookings';
import useFetchUserData from '../../utilities/useFetchUserData';
import {createConversationIfNotExists} from '../../reusbaleVariables';
import {BookingInterface} from '../../types';
import {StarRatingDisplay} from 'react-native-star-rating-widget';

export default function ListOfBookingScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingBookingStatus, setLoadingBookingStatus] =
    useState<boolean>(false);
  const [loadingIfDoneStatus, setLoadingIfDoneStatus] =
    useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceAmount, setServiceAmount] = useState('');

  const {userData, refresh} = useFetchUserData();

  const {ListOfBooking, refreshBookings} = useFetchListOfBookings();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBookings();
    await refresh();
    setRefreshing(false);
  };

  const handleAcceptBooking = async (
    bookingId: string,
    customerId: string,
    customerName: string,
    customerProfileImg: string,
  ) => {
    try {
      const numberOfAcceptedBooking = ListOfBooking.filter(
        item =>
          item.status === 'accepted' &&
          item.ifDoneStatus === undefined &&
          item.workerEmail === userData?.email,
      );

      console.log('numberOfAcceptedBooking: ', numberOfAcceptedBooking.length);

      if (numberOfAcceptedBooking.length >= 1) {
        return Alert.alert(
          'You already have 1 pending task/booking. Please complete to accept another booking.',
        );
      }

      setLoadingBookingStatus(true);
      setLoadingIfDoneStatus(true);

      await createConversationIfNotExists(
        userData?.id || '',
        customerId,
        userData?.fullName || '',
        customerName,
        userData?.imageUrl || '',
        customerProfileImg,
      );

      const bookingRef = doc(FIREBASE_DB, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'accepted',
        workerEmail: userData?.email,
      });

      Alert.alert('Booking Accepted', 'The booking has been accepted.');
      await refreshBookings();
      setLoadingBookingStatus(false);
      setLoadingIfDoneStatus(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to accept the booking.');
      setLoadingBookingStatus(false);
      setLoadingIfDoneStatus(false);
      console.error('Failed to accept booking: ', error);
    }
  };

  const handleUpdateIfDoneStatus = async (bookingId: string) => {
    setLoadingIfDoneStatus(true);
    const bookingRef = doc(FIREBASE_DB, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      ifDoneStatus: 'done',
      serviceAmountPaid: parseFloat(serviceAmount),
    });
    setLoadingIfDoneStatus(false);
    setModalVisible(false);
  };

  const handlePress = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setServiceAmount('');
  };

  const renderBookingItem = ({item}: {item: BookingInterface}) => (
    <View style={styles.bookingContainer}>
      <View style={styles.detailsContainer}>
        <Text style={styles.serviceName}>{item.specificService}</Text>
        <Text style={styles.customerName}>Customer: {item.customerName}</Text>
        <Text style={styles.location}>
          Location: {item.barangay.name}, {item.city.name}, {item.province.name}
        </Text>
        {item.serviceAmountPaid && (
          <Text style={styles.location}>
            Amount Paid: {item.serviceAmountPaid}
          </Text>
        )}
        <Text style={styles.additionalDetail}>
          Additional Details: {item.additionalDetail}
        </Text>
        {item.rating && (
          <StarRatingDisplay
            rating={item.rating}
            enableHalfStar={false}
            starSize={30}
            color="#FFD700"
          />
        )}
        <Text style={styles.date}>
          Date: {item.createdAt?.toDate().toLocaleString()}
        </Text>
      </View>
      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={[
            styles.acceptButton,
            item.status === 'accepted' && {backgroundColor: '#ccc'},
          ]}
          onPress={() =>
            handleAcceptBooking(
              item.id,
              item.customerId,
              item.customerName,
              item.customerProfileImg,
            )
          }
          disabled={loadingBookingStatus || item.status === 'accepted'}>
          <Text style={styles.buttonText}>
            {loadingBookingStatus
              ? 'Please wait..'
              : item.status === 'accepted'
              ? 'Accepted'
              : 'Accept'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.ifDoneButton,
            item.ifDoneStatus === 'done' && {backgroundColor: '#ccc'},
          ]}
          onPress={handlePress}
          disabled={loadingIfDoneStatus || item.ifDoneStatus === 'done'}>
          <Text style={styles.buttonText}>
            {loadingBookingStatus
              ? 'Please wait..'
              : item.ifDoneStatus === 'done'
              ? 'Done'
              : 'Click to done'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Amount Paid By Customer:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={serviceAmount}
              onChangeText={setServiceAmount}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleUpdateIfDoneStatus(item.id)}
                disabled={!serviceAmount || loadingIfDoneStatus}>
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCancel}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>List of Bookings</Text>
      <FlatList
        data={ListOfBooking}
        renderItem={renderBookingItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  bookingContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsContainer: {
    flex: 1,
    marginRight: 15,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  customerName: {
    fontSize: 16,
    color: '#666',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  additionalDetail: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  btnContainer: {
    gap: 15,
  },
  acceptButton: {
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  ifDoneButton: {
    alignItems: 'center',
    backgroundColor: '#FFBF00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    textTransform: 'capitalize',
    color: '#fff',
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  textInput: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
  },
});
