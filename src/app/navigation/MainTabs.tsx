import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../../features/home/HomeScreen';
import { CalendarScreen } from '../../features/calendar/CalendarScreen';
import { ManageScreen } from '../../features/manage/ManageScreen';
import { SettingsScreen } from '../../features/settings/SettingsScreen';
import { QuickAddSheet } from '../../features/inbox/QuickAddSheet';
import { colors, radii, spacing, typography } from '../../theme';
import { CalendarDays, Grid2X2, House, Plus, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const DummyQuickAdd = () => null;

export const MainTabs = ({ navigation }: any) => {
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarShowLabel: true,
          tabBarStyle: styles.floatingTabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        {/* Tab 1: Home */}
        <Tab.Screen
          name="HomeTab"
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                <House size={23} color={focused ? colors.primary : colors.textMuted} fill={focused ? colors.primary : 'transparent'} strokeWidth={focused ? 2.2 : 1.9} />
              </View>
            ),
          }}
        >
          {(props) => <HomeScreen {...props} onOpenQuickAdd={() => setQuickAddVisible(true)} />}
        </Tab.Screen>

        {/* Tab 2: Calendar */}
        <Tab.Screen
          name="CalendarTab"
          component={CalendarScreen}
          options={{
            tabBarLabel: 'Calendar',
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                <CalendarDays size={20} color={focused ? colors.primary : colors.textMuted} strokeWidth={focused ? 2.3 : 1.8} />
              </View>
            ),
          }}
        />

        {/* Center Floating FAB: Quick Add */}
        <Tab.Screen
          name="QuickAddTab"
          component={DummyQuickAdd}
          options={{
            tabBarLabel: '',
            tabBarButton: () => (
              <View style={styles.fabWrapper}>
                <TouchableOpacity
                  style={styles.centerFab}
                  onPress={() => setQuickAddVisible(true)}
                  activeOpacity={0.85}
                >
                  <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        {/* Tab 3: Manage */}
        <Tab.Screen
          name="ManageTab"
          component={ManageScreen}
          options={{
            tabBarLabel: 'Manage',
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                <Grid2X2 size={23} color={focused ? colors.primary : colors.textMuted} strokeWidth={focused ? 2.2 : 1.9} />
              </View>
            ),
          }}
        />

        {/* Tab 4: Settings */}
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                <Settings size={23} color={focused ? colors.primary : colors.textMuted} strokeWidth={focused ? 2.2 : 1.9} />
              </View>
            ),
          }}
        />
      </Tab.Navigator>

      <QuickAddSheet
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  floatingTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 16 : 24,
    left: 16,
    right: 16,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    paddingHorizontal: spacing.micro,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarItem: {
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  iconContainer: {
    width: 42,
    height: 32,
    borderRadius: radii.field,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: colors.primaryLight,
  },
  fabWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
  },
  centerFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
});
