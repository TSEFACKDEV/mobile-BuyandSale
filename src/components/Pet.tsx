import { View, Text } from 'react-native'
import React from 'react'
type PetProps = {
    petName: {
        firstname: string;
        lastname: string;
    },
    type: string;
}
const Pet = (props: PetProps) => {
    const { firstname, lastname } = props.petName;
  return (
    <View>
      <Text>Your own pet name {firstname} {lastname}</Text>
      <Text>Type: {props.type}</Text>
    </View>
  )
}

export default Pet