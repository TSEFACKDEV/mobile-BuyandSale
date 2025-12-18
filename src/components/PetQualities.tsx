import { View, Text } from 'react-native'
import React from 'react'
type PetQualitiesProps = {
    qualities: {
        qualOne: string;
        qualTwo: string;
        qualThree: string;
        age: number;
    }[]
}
const PetQualities = (props: PetQualitiesProps) => {
   
  return (
    <View>
      {props.qualities.map((item, index) => {
        if(index === 0) return <Text  key={index}> Your pet is {item.qualOne}, {item.qualTwo}, {item.qualThree} and is {item.age} years old.</Text>

        return <Text key={index}> Also your pet is {item.qualOne}, {item.qualTwo}, {item.qualThree} and is still {item.age} years old.</Text>
      })}

      
    </View>
  )
}

export default PetQualities