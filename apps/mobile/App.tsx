import React, { useEffect, useRef } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Platform, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import { HomeScreen } from './src/screens/HomeScreen'
import { SearchScreen } from './src/screens/SearchScreen'
import { AlertsScreen } from './src/screens/AlertsScreen'
import { colors } from './src/theme/tokens'
import { addNotificationListener, addResponseListener } from './src/services/pushNotifications'

const Tab = createBottomTabNavigator()

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TABS: { name: string; component: React.ComponentType; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: 'ראשי',    component: HomeScreen,   icon: 'home-outline',          iconActive: 'home' },
  { name: 'חיפוש',   component: SearchScreen,  icon: 'search-outline',        iconActive: 'search' },
  { name: 'שמורים',  component: HomeScreen,    icon: 'bookmark-outline',      iconActive: 'bookmark' },
  { name: 'התראות',  component: AlertsScreen,  icon: 'notifications-outline', iconActive: 'notifications' },
]

function TabBarIcon({ name, color, size }: { name: IoniconName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />
}

function AppTabs() {
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name)
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0E1318',
            borderTopColor: 'rgba(255,255,255,0.06)',
            borderTopWidth: 0.5,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 10,
            height: 56 + Math.max(insets.bottom, 8),
          },
          tabBarActiveTintColor: colors.primaryBlue,
          tabBarInactiveTintColor: colors.fg4,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginTop: 2 },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? tab!.iconActive : tab!.icon}
              color={color}
              size={22}
            />
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
  const notifListener = useRef<Notifications.EventSubscription | null>(null)
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  useEffect(() => {
    notifListener.current = addNotificationListener(notification => {
      console.log('Push received:', notification.request.content.title)
    })
    responseListener.current = addResponseListener(response => {
      const data = response.notification.request.content.data as Record<string, string>
      console.log('Push tapped — listingId:', data?.listingId)
    })
    return () => {
      notifListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
