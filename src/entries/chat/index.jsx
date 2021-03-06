/* eslint-disable react/sort-comp */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';

import { ActionsWrapper, ChatWrapper } from 'entries/chat/wrappers';
import {
  CallWindowComponent,
  StartCallWindow,
  IncomingCallwindow,
} from 'shared/components';

import PeerConnection from 'modules/utils/PeerConnection';

import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';

import { getUser } from 'modules/utils';

import * as socketActions from 'redux/actions/socket';
import * as videoCallActions from 'redux/actions/videoCall';

//call timeout in seconds
const CALL_TIME_OUT = 20;

class HomeEntry extends Component {
  constructor() {
    super();
    this.state = {
      clientId: '',
      clientName: '',
      callWindow: '',
      callModal: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null,
      started: false,
      newCall: false,
      acepted: false,
      iStartedCall: false,
      partnerIsOnline: false,
    };
    this.callTimeOut = null;
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
  }

  componentDidMount() {
    const { socketActions } = this.props;

    socketActions.startChannel();
  }

  componentDidUpdate() {
    const { videoCallData } = this.props;
    const { conversationData } = this.props;
    const { currentPartnerIdConversation } = conversationData;

    // make a request to check if user is online
    if (videoCallData.socket && currentPartnerIdConversation) {
      videoCallData.socket.emit('isOnline', {
        userId: currentPartnerIdConversation,
      });
    }

    if (
      !this.state.started &&
      videoCallData.socket &&
      videoCallData.socket.on
    ) {
      videoCallData.socket
        .on('call', (data) => {
          if (data.sdp && this.pc.setRemoteDescription) {
            this.setState({ acepted: true });
            this.pc.setRemoteDescription(data.sdp);
            if (data.sdp.type === 'offer') this.pc.createAnswer();
          } else if (this.pc && this.pc.addIceCandidate) {
            this.pc.addIceCandidate(data.candidate);
          }
        })
        .on('end', (data) => {
          console.log('end');
          let timeout = false;
          if (data) {
            timeout = data.timeout;
          }
          this.endCallHandler(false, timeout);
        })
        .on('isOnline', (data) => {
          if (data.status === 'online') {
            if (this.state.partnerIsOnline) {
              return;
            }
            this.setState({ partnerIsOnline: true });
          } else {
            if (!this.state.partnerIsOnline) {
              return;
            }
            this.setState({ partnerIsOnline: false });
          }
        });

      this.setState({
        started: true,
      });
    }
  }

  startCall(isCaller, friendID, config) {
    this.setState({ iStartedCall: true });
    this.config = config;
    this.pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => {
        this.setState({ peerSrc: src });
        clearTimeout(this.callTimeOut);
      })
      .start(isCaller, config, getUser());
  }

  rejectCall(timeout) {
    const { videoCallData, videoCallActions } = this.props;
    const { user } = videoCallData;

    videoCallData.socket.emit('end', {
      to: user._id,
      timeout: timeout | false,
    });

    // this.setState({ callModal: '' });

    videoCallActions.closedVideoCall();
  }

  endCall(isStarter, timeout) {
    const { acepted } = this.state;
    const { videoCallData } = this.props;
    const { calling } = videoCallData;

    clearTimeout(this.callTimeOut);

    if (_.isFunction(this.pc.stop)) {
      this.pc.stop(isStarter);
    }

    // if is calling and not accepted yet,
    // end the call
    if (!acepted && calling) {
      this.rejectCallHandler(timeout);
    }

    this.setState({ acepted: false, iStartedCall: false });

    this.pc = {};
    this.config = null;
    this.setState({
      callWindow: '',
      callModal: '',
      localSrc: null,
      peerSrc: null,
      newCall: false,
    });
  }

  handleInitiateCall = () => {
    this.setState({ newCall: true });
  };

  handleCallStart = (mode) => {
    const { conversationData } = this.props;
    const { currentPartnerIdConversation } = conversationData;

    this.callTimeOut = setTimeout(() => {
      this.handleCancelCall(true);
      toast.error('Chamada não atendida', {
        position: 'bottom-right',
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: 0,
      });
    }, CALL_TIME_OUT * 1000);

    let config = {};
    if (mode === 'audio') {
      config = { audio: true, video: false };
    } else {
      config = { audio: true, video: true };
    }

    this.startCall(true, currentPartnerIdConversation, config);
  };

  handleAceptCall = (mode) => {
    const { videoCallData } = this.props;

    let config = {};
    if (mode === 'audio') {
      config = { audio: true, video: false };
    } else {
      config = { audio: true, video: true };
    }

    this.startCall(false, videoCallData.user._id, config);
    const { videoCallActions } = this.props;

    videoCallActions.acceptedVideoCall();
  };

  handleCancelCall = (timeout) => {
    this.endCall(true, timeout);
  };

  render() {
    const { videoCallData } = this.props;
    const { calling, user } = videoCallData;
    const {
      localSrc,
      peerSrc,
      newCall,
      acepted,
      iStartedCall,
      partnerIsOnline,
    } = this.state;

    const { conversationData } = this.props;

    return (
      <>
        {calling && (
          <IncomingCallwindow
            nickname={user.nickname}
            handleAceptCall={this.handleAceptCall}
            handleCancelCall={this.rejectCallHandler}
          />
        )}
        {newCall && !acepted && (
          <StartCallWindow
            startCall={this.handleCallStart}
            conversationData={conversationData}
            cancel={this.handleCancelCall}
            calling={iStartedCall}
          />
        )}
        <div
          className={
            (calling ? 'blur-cover' : '') || (newCall ? 'blur-cover' : '')
          }
        />
        <div className={`chat-wrapper ${calling && 'call-blur'}`}>
          <ActionsWrapper />
          <ChatWrapper
            startCall={this.handleInitiateCall}
            isOnline={partnerIsOnline}
          />
        </div>
        {!_.isEmpty(this.config) && acepted && (
          <CallWindowComponent
            status="calling"
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={this.config}
            mediaDevice={this.pc.mediaDevice}
            endCall={this.endCallHandler}
          />
        )}
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    socketActions: bindActionCreators(socketActions, dispatch),
    videoCallActions: bindActionCreators(videoCallActions, dispatch),
  };
};

const mapStateToProps = (state) => {
  return {
    videoCallData: state.videoCall,
    conversationData: state.conversation,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeEntry);
