
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


import Home from './pages/Home';
import InstantHirePage from './pages/InstantHirePage.js';

const Stack = createStackNavigator();

const App = () => {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <Provider store={store}> */}
      {/* <AppInitializer /> */}
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={"Home"} //Home Ride
          // headerMode="none"
          screenOptions={{ headerShown: false }} // hide header for all screens
        >
          <Stack.Screen
            name="Home"
            component={Home}
          />
          <Stack.Screen
            name="LiveRide"
            component={InstantHirePage}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {/* </Provider> */}

    </GestureHandlerRootView>
  );
}
export default App;
