import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
// export const axiosService = (token) => {
axios.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      // let token = "19|nom0N4zeHAKC1lYSRyg09cHGnh04GsICLuamRTyr2688a4ec" //change after

      if (token) {
        const cleanToken = token?.replace(/^"|"$/g, ""); // Remove surrounding quotes if present
        config.headers.Authorization = `Bearer ${cleanToken}`
        config.headers["Accept"] = "application/json";
      }
    } catch (error) {
      console.error('Error retrieving token from AsyncStorage:', error);
    }

    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

//Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
// }
