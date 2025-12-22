import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import styles from './style'
import TopNavigation from '../../../components/TopNavigation/TopNavigation'
import { useTheme } from '../../../contexts/ThemeContext'

const Home = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopNavigation />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={{ padding: 16, color: theme.colors.text }}>Bienvenue sur Buy&Sale</Text>
      </ScrollView>
    </View>
  )
}

export default Home