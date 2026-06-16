import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GameTrackerScreen } from '../screens/GameTrackerScreen';
import { CardDatabaseScreen } from '../screens/CardDatabaseScreen';
import { CardDetailScreen } from '../screens/CardDetailScreen';
import { DecklistsScreen } from '../screens/DecklistsScreen';
import { CardsStackParamList } from './types';
import { colors, fonts } from '../theme/theme';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.gold,
    notification: colors.gold,
  },
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.gold,
  headerTitleStyle: { fontFamily: fonts.heading, color: colors.gold },
  headerShadowVisible: false,
};

const Tab = createBottomTabNavigator();
const CardsStack = createNativeStackNavigator<CardsStackParamList>();

function CardsStackNavigator() {
  return (
    <CardsStack.Navigator screenOptions={headerOptions}>
      <CardsStack.Screen name="CardDatabase" component={CardDatabaseScreen} options={{ title: 'Cards' }} />
      <CardsStack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: 'Card Details' }} />
    </CardsStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          ...headerOptions,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontFamily: fonts.heading, fontSize: 11 },
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
              'Game Tracker': 'sword-cross',
              Cards: 'cards',
              Decks: 'book-open-variant',
            };
            return <MaterialCommunityIcons name={icons[route.name] ?? 'circle'} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Game Tracker" component={GameTrackerScreen} />
        <Tab.Screen name="Cards" component={CardsStackNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Decks" component={DecklistsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
