import ChatWrapper from './chat-wrapper';
import {Button, SafeAreaView, Text, TextInput, View} from 'react-native';
import AC, {AgoraChat} from 'agora-chat';
import {useEffect, useMemo, useState} from 'react';

const {getPlatform} = ChatWrapper;

const creds = {
  AppKey: '61807588#1063958',
  username: 'test123',
  userToken: '',
  pwd: 'password',
};

const conn = new AC.connection({
  appKey: creds.AppKey,
});

conn.addEventHandler('connection&message', {
  // Occurs when the app is connected to Agora Chat.
  onConnected: () => {
    console.log('Connect success !');
  },
  // Occurs when the app is disconnected from Agora Chat.
  onDisconnected: () => {
    console.log('Logout success !');
  },
  // Occurs when a text message is received.
  onTextMessage: message => {
    console.log(message);
  },
  // Occurs when the token is about to expire.
  onTokenWillExpire: () => {
    console.log('Token is about to expire');
  },
  // Occurs when the token has expired.
  onTokenExpired: () => {
    console.log('The token has expired');
  },
  onError: error => {
    console.log('on error', error);
  },
});

function LoginPage(props) {
  return (
    <SafeAreaView>
      <View>
        <TextInput placeholder="username"></TextInput>
        <TextInput placeholder="password"></TextInput>
        <Button
          title="Login"
          onPress={() => {
            props.setCurPage(1);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function MainPage() {
  useEffect(() => {
    (async () => {
      const {token, username} = await fetch(
        '/api/register?uid=aditya&pwd=test123',
      ).then(res => res.json());
      conn
        .open({
          user: username,
          agoraToken: token,
          // pwd: 'test123',
        })
        .then(res => {
          console.log('[DEBUG] Login success', res, 'with', {
            user: username,
            token,
          });
        })
        .catch(err => {
          console.log('[DEBUG] Login failiure', err);
        });
    })();
  }, []);

  const sendMessage = () => {
    console.log('Sending message');
    let msg = AC.message.create({
      chatType: 'singleChat',
      type: 'txt',
      to: 'otherUser',
      msg: 'hey!',
    });
    conn.send(msg);
  };

  return (
    <View>
      <Text>Hello World, {getPlatform()}</Text>
      <Button
        title="Send Message"
        onPress={() => {
          sendMessage();
        }}
      />
    </View>
  );
}

const App = () => {
  const [curPage, setCurPage] = useState(0);

  // const Page = useMemo(() => {
  //   return [LoginPage, MainPage][curPage];
  // }, [curPage]);

  const Page = [LoginPage, MainPage][curPage];

  return (
    <SafeAreaView>
      {/*@ts-ignore*/}
      <Page setCurPage={setCurPage} />
    </SafeAreaView>
  );
};

export default App;
