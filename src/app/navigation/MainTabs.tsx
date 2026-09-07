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
          tabBarActiveTintColor: '#4F46E5',
          tabBarInactiveTintColor: '#94A3B8',
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
                <House 
                  size={21} 
                  color={focused ? '#4F46E5' : '#94A3B8'} 
                  fill={focused ? '#4F46E5' : 'transparent'} 
                  strokeWidth={focused ? 2.2 : 1.8} 
                />
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
                <CalendarDays size={20} color={focused ? '#4F46E5' : '#94A3B8'} strokeWidth={focused ? 2.2 : 1.8} />
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
                  <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
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
                <Grid2X2 size={21} color={focused ? '#4F46E5' : '#94A3B8'} strokeWidth={focused ? 2.2 : 1.8} />
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
                <Settings size={21} color={focused ? '#4F46E5' : '#94A3B8'} strokeWidth={focused ? 2.2 : 1.8} />
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
    backgroundColor: '#F6F7FE',
  },
  floatingTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 14 : 20,
    left: 16,
    right: 16,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    paddingHorizontal: spacing.micro,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarItem: {
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  iconContainer: {
    width: 38,
    height: 30,
    borderRadius: radii.field,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#EEF2FF',
  },
  fabWrapper: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
  },
  centerFab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
