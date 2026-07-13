import Geolocation from "@react-native-community/geolocation";
const GOOGLE_API_KEY = "AIzaSyAH-xKBY4dUdRj7cYtEqIZDB1cSMbwAGbg"; // Replace with your API Key
import { PermissionsAndroid, Platform } from "react-native";
// Function to request location permissions
export const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'This app needs access to your location for better functionality.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    } else {
        // For iOS, permissions are handled automatically if configured properly.
        return true;
    }
};

// Global function to fetch location
let watchId = null;

export const getCurrentLocation = (callback) => {
    try {
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const locationName = await getLocationName(latitude, longitude);
                callback({ latitude, longitude, locationName });
            },
            (error) => {
                // console.error('Error getting location:', error);

                // ✅ Retry fallback on TIMEOUT (code 3) or POSITION_UNAVAILABLE (code 2)
                if (error.code === 3 || error.code === 2) {

                    Geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            const locationName = await getLocationName(latitude, longitude);
                            callback({ latitude, longitude, locationName });
                        },
                        (retryError) => {
                            console.error('Retry failed:', retryError);
                        },
                        {
                            enableHighAccuracy: false, // fallback to low accuracy
                            timeout: 10000,
                            maximumAge: 10000,
                        }
                    );
                }
            },
            {
                enableHighAccuracy: true,  // first attempt with GPS
                timeout: 10000,            // short timeout to fail fast
                maximumAge: 10000,
            }
        );
    } catch (error) {
        // .log('Unexpected error getting location:', error);
    }
};


//newer
// export const getCurrentLocation = (callback) => {
//     try {
//         Geolocation.getCurrentPosition(
//             async (position) => {
//                 const { latitude, longitude } = position.coords;
//                 const locationName = await getLocationName(latitude, longitude);
//                 callback({ latitude, longitude, locationName });
//             },
//             (error) => {
//                 console.error('Error getting location:', error);
//                 // Retry once if timeout or unavailable
//                 if (error.code === 3 || error.code === 2) {
//                     setTimeout(() => {
//                         Geolocation.getCurrentPosition(
//                             async (position) => {
//                                 const { latitude, longitude } = position.coords;
//                                 const locationName = await getLocationName(latitude, longitude);
//                                 callback({ latitude, longitude, locationName });
//                             },
//                             (retryError) => {
//                                 console.error('Retry failed:', retryError);
//                             },
//                             {
//                                 enableHighAccuracy: false, // fallback to coarse location
//                                 timeout: 10000,
//                                 maximumAge: 10000,
//                             }
//                         );
//                     }, 2000);
//                 }
//             },
//             {
//                 enableHighAccuracy: true,
//                 timeout: 10000, // reduced to fail faster
//                 maximumAge: 10000,
//             }
//         );
//     } catch (error) {

//     }
// };

//old
// export const getCurrentLocation = (callback) => {

//     try {
//         Geolocation.getCurrentPosition(
//             async (position) => {
//                 const { latitude, longitude } = position.coords;
//                 const locationName = await getLocationName(latitude, longitude);
//                 callback({ latitude, longitude, locationName })
//             },
//             (error) => {
//                 console.error('Error getting location:', error);
//             },
//             {
//                 enableHighAccuracy: true,
//                 timeout: 30000,
//                 maximumAge: 60000,
//             }
//         );
//     } catch (error) {

//     }

// };
// Reverse Geocode Function
const getLocationName = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
        );
        const data = await response.json();
        if (data.status === "OK") {
            return data.results[0].formatted_address; // Returns full address
        } else {
            console.error("Error fetching location name:", data.status);
            return "Unknown Location";
        }
    } catch (error) {
        console.error("Error in reverse geocoding:", error);
        return "Unknown Location";
    }
};
export const genderOptions = () => [
    { label: "Male", value: "Male" },
    { label: "Fe Male", value: "Female" },
    { label: "Others", value: "Others" },
]

export const checkValidation = (obj, min) => {
    let isValid = true
    //.log('Object.keys(obj).length', Object.keys(obj).length)
    if (Object.keys(obj).length < min) {
        isValid = false
    } else {
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (!value) {
                isValid = false
            }
        });
    }
    return isValid
}
export const isValidExpiryDate = (date) => {
    const [month, year] = date.split("/");
    if (!month || !year || month.length !== 2 || year.length !== 2) return false;

    const currentYear = new Date().getFullYear() % 100; // Get last two digits of the year
    const currentMonth = new Date().getMonth() + 1;

    const monthInt = parseInt(month, 10);
    const yearInt = parseInt(year, 10);

    // Check if month is valid and if the expiry date is not in the past
    return (
        monthInt >= 1 &&
        monthInt <= 12 &&
        (yearInt > currentYear || (yearInt === currentYear && monthInt >= currentMonth))
    );
};
// Luhn Algorithm for Card Validation
export const isValidCardNumber = (number) => {
    const cleanNumber = number.replace(/\s+/g, ""); // Remove spaces
    if (!cleanNumber.startsWith("4")) return false; // Must start with 4
    if (cleanNumber.length !== 13 && cleanNumber.length !== 16) return false; // Length check

    // Luhn Algorithm
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber[i], 10);

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
};
export function convertTo12HourFormat(time) {
    // Split the input time into hours and minutes
    const [hour, minute] = time.split(':').map(Number);

    // Calculate the 12-hour format
    const period = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12; // If hour is 0 or 12, set it to 12

    // Return the formatted time
    return `${hour12}:${minute.toString().padStart(2, '0')}${period}`;
}

// Example usage


export function convertTwoDecimalPlaces(value) {
    // Convert the value to a float and round it to 2 decimal places
    return parseFloat(value).toFixed(2);
}
export const getDistanceInMeters = (pickup, dropoff) => {
    const toRadians = (degree) => (degree * Math.PI) / 180;

    const R = 6371000; // Earth’s radius in meters
    const lat1 = toRadians(pickup.latitude);
    const lon1 = toRadians(pickup.longitude);
    const lat2 = toRadians(dropoff.latitude);
    const lon2 = toRadians(dropoff.longitude);

    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};
export const formatDate = (dateString, type = "dmt") => {
    const date = new Date(dateString);
    let mDate = ""
    // Extract date components
    const day = date.getUTCDate();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
    const year = date.getUTCFullYear();
    if (type === "dmt") {
        mDate = `${day} ${month} ${time}`
    } else if (type === "dmy") {
        mDate = `${day} ${month} ${year}`
    } else if (type === 'time') {
        mDate = time
    }
    return mDate;
}
export const truncateText = (text, length = 35) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
};