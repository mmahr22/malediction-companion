import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GameTrackerScreen } from '../screens/GameTrackerScreen';
import { CardDatabaseScreen } from '../screens/CardDatabaseScreen';
import { CardDetailScreen } from '../screens/CardDetailScreen';
import { DecklistsScreen } from '../screens/DecklistsScreen';
import { DeckSummaryScreen } from '../screens/DeckSummaryScreen';
import { DeckEditorScreen } from '../screens/DeckEditorScreen';
import { CardDetailScreen as DeckCardDetailScreen } from '../screens/CardDetailScreen';
import { GameHistoryScreen } from '../screens/GameHistoryScreen';
import { CardsStackParamList, DecksStackParamList } from './types';
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
const DecksStack = createNativeStackNavigator<DecksStackParamList>();

function CardsStackNavigator() {
  return (
    <CardsStack.Navigator screenOptions={headerOptions}>
      <CardsStack.Screen name="CardDatabase" component={CardDatabaseScreen} options={{ title: 'Cards' }} />
      <CardsStack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: 'Card Details' }} />
    </CardsStack.Navigator>
  );
}

function DecksStackNavigator() {
  return (
    <DecksStack.Navigator screenOptions={headerOptions}>
      <DecksStack.Screen name="DeckList" component={DecklistsScreen} options={{ title: 'Decks' }} />
      <DecksStack.Screen name="DeckSummary" component={DeckSummaryScreen} options={{ title: 'Deck Summary' }} />
      <DecksStack.Screen name="DeckEditor" component={DeckEditorScreen} options={{ title: 'Deck Builder' }} />
      <DecksStack.Screen name="DeckCardDetail" component={DeckCardDetailScreen} options={{ title: 'Card Details' }} />
    </DecksStack.Navigator>
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
              'Malediction Companion': 'sword-cross',
              Cards: 'cards',
              Decks: 'book-open-variant',
              History: 'clock-outline',
            };
            return <MaterialCommunityIcons name={icons[route.name] ?? 'circle'} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Malediction Companion"
          component={GameTrackerScreen}
          options={{ title: 'Malediction Companion', tabBarLabel: 'Game Tracker' }}
        />
        <Tab.Screen name="Cards" component={CardsStackNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Decks" component={DecksStackNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="History" component={GameHistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
