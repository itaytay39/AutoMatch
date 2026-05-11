import React, { useEffect, useRef } from 'react'
import { I18nManager } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
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
import { fonts } from './src/theme/typography'
import { addNotificationListener, addResponseListener } from './src/services/pushNotifications'
import type { RootStackParamList } from './src/navigation/types'

// Force RTL layout globally — Hebrew app
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true)
}

SplashScreen.preventAutoHideAsync()

const RootStack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

// Reversed array so ראשי renders on the RIGHT in RTL
const TABS: { name: string; component: React.ComponentType<any>; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: 'התראות', component: AlertsScreen,  icon: 'notifications-outline', iconActive: 'notifications' },
  { name: 'שמורים', component: SavedScreen,   icon: 'heart-outline',         iconActive: 'heart' },
  { name: 'חיפוש',  component: SearchScreen,  icon: 'search-outline',        iconActive: 'search' },
  { name: 'ראשי',   component: HomeScreen,    icon: 'home-outline',          iconActive: 'home' },
]

function AppTabs() {
  const insets = useSafeAreaInsets()
  return (
    <Tab.Navigator
      initialRouteName="ראשי"
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name)!
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.bg1,
            borderTopColor: colors.border1,
            borderTopWidth: 0.5,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 10,
            height: 58 + Math.max(insets.bottom, 8),
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.fg3,
          tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 10, marginTop: 2 },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? tab.iconActive : tab.icon} size={22} color={color} />
          ),
        }
      }}
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
        <RootStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg0 } }}>
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
