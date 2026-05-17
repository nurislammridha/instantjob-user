import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import store from './redux/store';

// Initialize axios interceptors
import './assets/functions/axios';

// Screens
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OtpPage from './pages/OtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ForgotOtpPage from './pages/ForgotOtpPage';
import SetNewPasswordPage from './pages/SetNewPasswordPage';
import Home from './pages/Home';
import InstantHirePage from './pages/InstantHirePage.js';

const Stack = createStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false }}
          >
            {/* Auth flow */}
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Signup" component={SignupPage} />
            <Stack.Screen name="Otp" component={OtpPage} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
            <Stack.Screen name="ForgotOtp" component={ForgotOtpPage} />
            <Stack.Screen name="SetNewPassword" component={SetNewPasswordPage} />

            {/* Main app */}
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="LiveRide" component={InstantHirePage} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;
