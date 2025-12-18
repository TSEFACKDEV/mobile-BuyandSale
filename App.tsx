import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Welcome from './src/components/Welcome';
import Pet from './src/components/Pet';
import PetQualities from './src/components/PetQualities';

export default function App() {
  const petName = {
    firstname: "Buddy",
    lastname: "Smith" 
  }

  const qualities = [
    {
      qualOne: " a lizard",
      qualTwo: "enormous",
      qualThree: "scarry as a nother caught her child eating her secret stash of cookies",
      age: 3
    },
    {
      qualOne: "furry",
      qualTwo: "small",
      qualThree: "cute and cuddly",
      age: 2
    },
    {
      qualOne: "playful",
      qualTwo: "loving",
      qualThree: "loyal",
      age: 5
    }
  ]
  return (
    <View style={styles.container}>
      <Welcome name = "jack" age={30} gender ={true} />
      <Pet petName={petName} type="Dog" />
      <PetQualities qualities={qualities} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
