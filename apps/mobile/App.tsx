import React, { useEffect, useRef } from 'react'
import { I18nManager, Platform } from 'react-native'
import { NavigationContainerRef } from '@react-navigation/native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
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
import { CompareScreen } from './src/screens/CompareScreen'
import { colors } from './src/theme/tokens'
import { AppTabBar } from './src/navigation/AppTabBar'
import type { RootStackParamList } from './src/navigation/types'

// Force RTL layout globally — Hebrew app
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true)
}

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync()
}

const RootStack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

// RTL reverses tab order visually — put בית first so it appears on the RIGHT
const TABS = [
  { name: 'בית',    component: HomeScreen   },
  { name: 'חיפוש',  component: SearchScreen },
  { name: 'שמורים', component: SavedScreen  },
  { name: 'התראות', component: AlertsScreen },
]

function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="בית"
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
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null)
  const [fontsLoaded] = useFonts({
    Rubik_300Light,
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded && Platform.OS !== 'web') SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    if (Platform.OS === 'web') return
    let notifSub: any, responseSub: any
    import('./src/services/pushNotifications').then(({ addNotificationListener, addResponseListener }) => {
      notifSub = addNotificationListener(n => {
        console.log('Push received:', n.request.content.title)
      })
      responseSub = addResponseListener(response => {
        const listingId = response.notification.request.content.data?.listingId as string | undefined
        if (listingId && navRef.current) navRef.current.navigate('Detail', { listingId })
      })
    })
    return () => { notifSub?.remove(); responseSub?.remove() }
  }, [])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navRef}>
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
          <RootStack.Screen
            name="Compare"
            component={CompareScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: true,
              gestureDirection: 'vertical',
              transitionSpec: {
                open:  { animation: 'timing', config: { duration: 320 } },
                close: { animation: 'timing', config: { duration: 260 } },
              },
            }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
