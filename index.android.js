import React from 'react';
import ReactNative from 'react-native';
import * as t from 'tcomb-form-native';

var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Alert,
} = ReactNative;

var STORAGE_KEY = 'id_token';

var Form = t.form.Form;

/*
 For Windows:
 for Genymotion + VirtualBox use:
 http://10.0.3.2
 Discussed here: http://stackoverflow.com/questions/18463319/access-host-from-genymotion-emulator
 or
 Ethernet adapter VirtualBox Host-Only Network
 IPv4 address, for me: http://192.168.56.1
 for AVD: http://10.0.2.2
 not tested.
 */
const MY_IP = 'http://10.0.3.2:3001';

var Person = t.struct({
  username: t.String,
  password: t.String
});

const options = {};

var ReactNativeAuth = React.createClass({

  async _onValueChange(item, selectedValue) {
    try {
      await AsyncStorage.setItem(item, selectedValue);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  },

  async _getProtectedQuote() {
    var DEMO_TOKEN = await AsyncStorage.getItem(STORAGE_KEY);
    fetch(MY_IP + "/api/protected/random-quote", {
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + DEMO_TOKEN
      }
    })
      .then(this.handleRequestErrors)
      .then((response) => response.text())
      .then((quote) => {
        Alert.alert(
          "Chuck Norris Quote:", quote,)
      })
      .done(
        undefined,
        (error) => {
          console.log('_getProtectedQuote.done.reject.' + error.message);
          Alert.alert(
            "Get quote Error!",
            'There has been a problem with your fetch operation: ' + error.message);
        }
      );
  },

  async _userLogout() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      Alert.alert("Logout Success!")
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  },

  async handleRequestErrors(response) {
    if (!response.ok) {
      if (response.statusText)
        throw new Error(response.statusText);
      return await response.text().then(
        (text) => {
          console.log('Error: ' + text);
          throw new Error(text);
        }
      );
    }
    return response;
  },

  _userSignup() {
    var value = this.refs.form.getValue();
    if (value) { // if validation fails, value will be null
      fetch(MY_IP + "/users", {
        method: "POST",
        headers: {
          'Accept': 'application/json, text/html',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: value.username,
          password: value.password
        })
      })
        .then(this.handleRequestErrors)
        .then((response) => {
          console.log('return response.json();');
          return response.json();
        })
        .then((responseData) => {
          console.log('Signup. then((responseData) => .');
          this._onValueChange(STORAGE_KEY, responseData.id_token);
        })
        .done(
          () => {
            console.log('Signup.done.resolve.');
            Alert.alert(
              "Signup Success!",
              "Click the button to get a Chuck Norris quote!"
            )
          },
          (error) => {
            console.log('Signup.done.reject.' + error.message);
            Alert.alert(
              "Signup Error!",
              'There has been a problem with your fetch operation: ' + error.message);
          }
        );
    }
  },

  _userLogin() {
    var value = this.refs.form.getValue();
    if (value) { // if validation fails, value will be null
      fetch(MY_IP + "/sessions/create", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: value.username,
          password: value.password
        })
      })
        .then(this.handleRequestErrors)
        .then((response) => {
          console.log('Login. response.json().');
          return response.json();
        })
        .then((responseData) => {
          console.log('Login. then((responseData) =>.');
          Alert.alert(
            "Login Success!",
            "Click the button to get a Chuck Norris quote!"
          );
          this._onValueChange(STORAGE_KEY, responseData.id_token)
        })
        .done(
          () => {
            console.log('Login.done.resolve.');
          },
          (error) => {
            console.log('Login.done.reject.' + error.message);
            Alert.alert(
              "Login  Error!",
              'There has been a problem with your fetch operation: ' + error.message);
          }
        );
    }
  },

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.title}>Signup/Login below for Chuck Norris Quotes!</Text>
        </View>
        <View style={styles.row}>
          <Form
            ref="form"
            type={Person}
            options={options}
          />
        </View>
        <View style={styles.row}>
          <TouchableHighlight style={styles.button} onPress={this._userSignup} underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Signup</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.button} onPress={this._userLogin} underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.button} onPress={this._userLogout} underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableHighlight>
        </View>
        <View style={styles.row}>
          <TouchableHighlight onPress={this._getProtectedQuote} style={styles.button}>
            <Text style={styles.buttonText}>Get a Chuck Norris Quote!</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    alignSelf: 'center',
    marginBottom: 30
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    backgroundColor: '#48BBEC',
    borderColor: '#48BBEC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
});

AppRegistry.registerComponent('ReactNativeAuth', () => ReactNativeAuth);