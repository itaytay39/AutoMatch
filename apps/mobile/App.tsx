import React, { useEffect, useRef } from 'react'
import { I18nManager } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Rubik_300Light,
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik'
import { HomeScreen } from './src/screens/HomeScreen'
import { SearchScreen } from './src/screens/SearchScreen'
import { AlertsScreen } from './src/screens/AlertsScreen'
import { SavedScreen } from './src/screens/SavedScreen'
import { DetailScreen } from './src/screens/DetailScreen'
import { colors } from './src/theme/tokens'
import { AppTabBar } from './src/navigation/AppTabBar'
import { addNotificationListener, addResponseListener } from './src/services/pushNotifications'
import type { RootStackParamList } from './src/navigation/types'

// Force RTL layout globally — Hebrew app
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true)
}

SplashScreen.preventAutoHideAsync()

const RootStack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

// Reversed so ראשי renders on the RIGHT in RTL
const TABS = [
  { name: 'התראות', component: AlertsScreen },
  { name: 'שמורים', component: SavedScreen  },
  { name: 'חיפוש',  component: SearchScreen },
  { name: 'ראשי',   component: HomeScreen   },
]

function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="ראשי"
      tabBar={props => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Rubik_300Light,
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  })

  const notifListener = useRef<Notifications.EventSubscription | null>(null)
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    notifListener.current = addNotificationListener(notification => {
      console.log('Push received:', notification.request.content.title)
    })
    responseListener.current = addResponseListener(_response => {
      // Navigate to Detail when push notification is tapped — handled by useNavigation in child
    })
    return () => {
      notifListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg0, flex: 1 } }}>
          <RootStack.Screen name="Main" component={AppTabs} />
          <RootStack.Screen
            name="Detail"
            component={DetailScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              transitionSpec: {
                open:  { animation: 'timing', config: { duration: 280 } },
                close: { animation: 'timing', config: { duration: 240 } },
              },
              cardStyleInterpolator: ({ current, layouts }) => ({
                cardStyle: {
                  transform: [{
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  }],
                },
              }),
            }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
