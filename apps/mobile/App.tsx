import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, Platform } from 'react-native'
import { HomeScreen } from './src/screens/HomeScreen'
import { SearchScreen } from './src/screens/SearchScreen'
import { AlertsScreen } from './src/screens/AlertsScreen'
import { colors } from './src/theme/tokens'

const Tab = createBottomTabNavigator()

const TABS = [
  { name: 'ראשי', component: HomeScreen, icon: '🏠' },
  { name: 'חיפוש', component: SearchScreen, icon: '🔍' },
  { name: 'שמורים', component: HomeScreen, icon: '🤍' },
  { name: 'התראות', component: AlertsScreen, icon: '🔔' },
]

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(18,23,30,0.95)',
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
