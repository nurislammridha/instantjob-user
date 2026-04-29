
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RidePage from './pages/RidePage';

const Stack = createStackNavigator();

const App = () => {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <Provider store={store}> */}
      {/* <AppInitializer /> */}
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={"Ride"} //Home Ride
          // headerMode="none"
          screenOptions={{ headerShown: false }} // hide header for all screens
        >
          <Stack.Screen
            name="Ride"
            component={RidePage}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {/* </Provider> */}

    </GestureHandlerRootView>
  );
}
export default App;
