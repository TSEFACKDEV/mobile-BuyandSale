import { View, Text } from 'react-native'
import React from 'react'

type WelcomeProps = {
    name: string;
    age: number;
    gender: boolean;
}
const Welcome = (props: WelcomeProps) => {
  return (
    <View>
      <Text>Welcome! {props.name}</Text>
      <Text>Age: {props.age}</Text>
      <Text>Gender {props.gender ? "Male": "Female"}</Text>
    </View>
  )
}

export default Welcome