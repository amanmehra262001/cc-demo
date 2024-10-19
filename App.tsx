/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState, useRef} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
  TextInput,
  Button,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {Platform, PermissionsAndroid} from 'react-native';
import {
  CometChatIncomingCall,
  CometChatOngoingCall,
  CometChatOutgoingCall,
  CometChatUIKit,
  UIKitSettings,
} from '@cometchat/chat-uikit-react-native';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import {CometChatCalls} from '@cometchat/calls-sdk-react-native';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [callReceived, setCallReceived] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callRejected, setCallRejected] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [cometchatLoginUID, setCometchatLoginUID] = useState('');
  const [cometchatUser, setCometchatUser] = useState(null);
  const [sessionId, setSessionId] = useState('');

  const incomingCall = useRef(null);

  // add below code in App.js or App.tsx
  const getPermissions = () => {
    if (Platform.OS == 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };

  useEffect(() => {
    getPermissions();
    let uikitSettings: UIKitSettings = {
      appId: '264748bd2d2a1401',
      authKey: 'ad3c0f58769c6d855ef0be84dcbac7e96d39625e',
      region: 'in',
      subscriptionType: CometChat.AppSettings.SUBSCRIPTION_TYPE_ALL_USERS,
    };

    CometChatUIKit.init(uikitSettings)
      .then(() => {
        console.log('CometChatUiKit successfully initialized');
      })
      .catch(error => {
        console.log('Initialization failed with exception:', error);
      });

    // cometchat call app settings
    const callAppSettings = new CometChatCalls.CallAppSettingsBuilder()
      .setAppId('264748bd2d2a1401')
      .setRegion('in')
      .build();

    CometChatCalls.init(callAppSettings).then(
      () => {
        console.log('CometChatCalls initialization completed successfully');
      },
      error => {
        console.log('CometChatCalls initialization failed with error:', error);
      },
    );
  }, []);

  var listnerID = 'UNIQUE_LISTENER_ID_2';
  CometChat.addCallListener(
    listnerID,
    new CometChat.CallListener({
      onIncomingCallReceived: (call: any) => {
        console.log('Incoming call:', call.sessionId);
        incomingCall.current = call;
        setCallReceived(true);
      },
      onOutgoingCallAccepted: (call: any) => {
        console.log('Outgoing call accepted:', call.sessionId);
        setCallAccepted(true);
        setSessionId(call.sessionId);
        setActiveCall(call);
      },
      onOutgoingCallRejected: (call: any) => {
        console.log('Outgoing call rejected:', call.sessionId);
        setCallRejected(true);
        setCallReceived(false);
        setCallAccepted(false);
        setSessionId(null);
        setActiveCall(call);
        // dispatch({
        //   type: CALL_UPDATED,
        //   payload: {
        //     ...callDetails,
        //     callReceived: false,
        //     callRejected: true,
        //     call: call,
        //   },
        // });
        // Outgoing Call Rejected
      },
      onIncomingCallCancelled: (call: any) => {
        console.log('Incoming call calcelled:', call.sessionId);
        setCallReceived(false);
        setCallAccepted(false);
        setCallRejected(false);
        setActiveCall(call);
        setSessionId(null);
        // dispatch({
        //   type: CALL_UPDATED,
        //   payload: {
        //     ...callDetails,
        //     callReceived: false,
        //     call: call,
        //   },
        // });
      },
      onCallEndedMessageReceived: (call: any) => {
        console.log('CallEnded Message:', call.sessionId);
      },
    }),
  );

  const cancelCall = (c: any) => {
    CometChat.rejectCall(c.sessionId, status).then(
      call => {
        console.log('Call rejected successfully', call);
        setCallReceived(false);
        setCallAccepted(false);
        setCallRejected(false);
        setActiveCall(null);
        setSessionId(null);
        // dispatch({
        //   type: CALL_UPDATED,
        //   payload: DEFAULT_CALL_DETAILS,
        // });
      },
      error => {
        console.log('Call rejection failed with error:', error);
        setCallReceived(false);
        setCallAccepted(false);
        setCallRejected(false);
        setActiveCall(null);
        // dispatch({
        //   type: CALL_UPDATED,
        //   payload: {
        //     ...callDetails,
        //     callReceived: false,
        //     call: null,
        //   },
        // });
      },
    );
  };

  const onAcceptHandler = (message: any) => {
    console.log('Accepting Incoming call:', message);
    generateCometChatCallToken(message.sessionId)
      .then(callToken => {
        CometChat.acceptCall(message.sessionId, callToken).then(
          call => {
            console.log('Call accepted successfully:', call);
            setCallAccepted(true);
            setSessionId(call.sessionId);
            setActiveCall(call);
            setCallReceived(false);
            // dispatch({
            //   type: CALL_UPDATED,
            //   payload: {
            //     ...callDetails,
            //     callReceived: false,
            //     callAccepted: true,
            //     callToken: callToken,
            //     call: call,
            //   },
            // });
          },
          error => {
            console.log('Call acceptance failed with error:', error);
            setCallReceived(false);
            setCallAccepted(false);
            setCallRejected(false);
            setActiveCall(null);
            setSessionId(null);
            // dispatch({
            //   type: CALL_UPDATED,
            //   payload: DEFAULT_CALL_DETAILS,
            // });
            Alert.alert('Error occured on incoming call:', error);
          },
        );
      })
      .catch(error => {
        setCallReceived(false);
        setCallAccepted(false);
        setCallRejected(false);
        setActiveCall(null);
        setSessionId(null);

        // dispatch({
        //   type: CALL_UPDATED,
        //   payload: DEFAULT_CALL_DETAILS,
        // });
        console.log('Error occured on incoming call:', error);
        Alert.alert('Error occured on incoming call:', error);
      });
  };

  const onErrorHandler = (error: any) => {
    console.log('Error occured on incoming call:', error);
    setCallReceived(false);
    setCallAccepted(false);
    setCallRejected(false);
    setActiveCall(null);
    setSessionId(null);
    // dispatch({
    //   type: CALL_UPDATED,
    //   payload: DEFAULT_CALL_DETAILS,
    // });
    //code
  };

  const audioOnly = false;
  const deafaultLayout = true;

  const callListener = new CometChatCalls.OngoingCallListener({
    onUserJoined: user => {
      console.log('user joined:', user);
    },
    onUserLeft: user => {
      console.log('user left:', user);
    },
    onUserListUpdated: userList => {
      console.log('user list:', userList);
    },
    onCallEnded: () => {
      console.log('Call ended');
    },
    onCallEndButtonPressed: () => {
      console.log('End Call button pressed');
    },
    onError: error => {
      console.log('Call Error: ', error);
    },
    onAudioModesUpdated: audioModes => {
      console.log('audio modes:', audioModes);
    },
    onCallSwitchedToVideo: event => {
      console.log('call switched to video:', event);
    },
    onUserMuted: event => {
      console.log('user muted:', event);
    },
  });

  const callSettings = new CometChatCalls.CallSettingsBuilder()
    .enableDefaultLayout(deafaultLayout)
    .setIsAudioOnlyCall(audioOnly)
    .setCallEventListener(callListener)
    .setDefaultAudioMode(CometChatCalls.AUDIO_MODE.SPEAKER);

  const generateCometChatCallToken = async (sessionId: string) => {
    return new Promise(async (resolve, reject) => {
      let loggedInUser: any = await CometChat.getLoggedinUser();
      let authToken = loggedInUser.getAuthToken();
      CometChatCalls.generateToken(sessionId, authToken)
        .then(res => {
          resolve(res.token);
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  const handleJoinCall = () => {
    // cometchat
    const receiverId = 'aman_mehra_sebi_1727586077424';
    const callType = CometChat.CALL_TYPE.VIDEO;
    const receiverType = CometChat.RECEIVER_TYPE.USER;
    const callObject = new CometChat.Call(receiverId, callType, receiverType);

    CometChat.initiateCall(callObject)
      .then((c: any) => {
        console.log('Call initiated successfully:', c.sessionId);
        setActiveCall(c);
        setSessionId(c.sessionId);
      })
      .catch(console.log);
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        {/* add an input field and a button to login to cometchat */}
        <View>
          <Button
            title="Login to CometChat as Aman"
            onPress={() => {
              CometChatUIKit.login({uid: 'aman_mehra_sebi_1727586077424'}).then(
                (user: any) => {
                  console.log('Login Successful:', {user});
                  setCometchatUser(user);
                },
                error => {
                  console.log('Login failed with exception:', {error});
                },
              );
            }}
          />
          <Button
            title="Login to CometChat as RK Mehra"
            onPress={() => {
              CometChatUIKit.login({uid: 'ramkalyan_mehra_1727587369044'}).then(
                (user: any) => {
                  console.log('Login Successful:', {user});
                  setCometchatUser(user);
                },
                error => {
                  console.log('Login failed with exception:', {error});
                },
              );
            }}
          />
        </View>

        {/* comet chat logged in username */}
        {cometchatUser && (
          <View>
            <Text>Logged in as: {cometchatUser?.name || ''}</Text>
          </View>
        )}

        {callReceived && (
          <CometChatIncomingCall
            call={incomingCall.current}
            onDecline={cancelCall}
            onAccept={onAcceptHandler}
            onError={onErrorHandler}
          />
        )}

        {sessionId && callAccepted && (
          <CometChatOngoingCall
            sessionID={sessionId}
            callSettingsBuilder={callSettings}
          />
        )}

        {activeCall && (
          <CometChatOutgoingCall
            call={activeCall}
            onDeclineButtonPressed={cancelCall}
          />
        )}

        {/* create a button to start the call with a user of user id: aman_mehra_sebi_1727586077424  */}
        <Button title="Start Call" onPress={handleJoinCall} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
