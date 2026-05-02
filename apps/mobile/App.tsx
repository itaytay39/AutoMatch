import React, { useEffect, useRef } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { HomeScreen } from './src/screens/HomeScreen'
import { SearchScreen } from './src/screens/SearchScreen'
import { AlertsScreen } from './src/screens/AlertsScreen'
import { colors } from './src/theme/tokens'
import { addNotificationListener, addResponseListener } from './src/services/pushNotifications'

const Tab = createBottomTabNavigator()

const TABS = [
  { name: 'ראשי', component: HomeScreen, icon: '🏠' },
  { name: 'חיפוש', component: SearchScreen, icon: '🔍' },
  { name: 'שמורים', component: HomeScreen, icon: '🤍' },
  { name: 'התראות', component: AlertsScreen, icon: '🔔' },
]

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
      // TODO: navigate to listing detail screen
    })
    return () => {
      notifListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(18,23,30,0.97)',
            borderTopColor: colors.border1,
            borderTopWidth: 1,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 84 : 64,
          },
          tabBarActiveTintColor: colors.primaryBlue,
          tabBarInactiveTintColor: colors.fg3,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        }}
      >
        {TABS.map(tab => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={{
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{tab.icon}</Text>,
            }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  )
}
