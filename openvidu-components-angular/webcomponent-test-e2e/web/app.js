
var MINIMAL;
var PREJOIN;
var VIDEO_MUTED;
var AUDIO_MUTED;

var SCREENSHARE_BUTTON;
var FULLSCREEN_BUTTON;
var CHAT_PANEL_BUTTON;
var DISPLAY_LOGO;
var DISPLAY_SESSION_NAME;
var DISPLAY_PARTICIPANT_NAME;
var DISPLAY_AUDIO_DETECTION;
var SETTINGS_BUTTON;
var LEAVE_BUTTON;
var PARTICIPANT_MUTE_BUTTON;
var PARTICIPANTS_PANEL_BUTTON;

var SESSION_NAME;

$(document).ready(() => {

    var url = new URL(window.location.href);
	MINIMAL = url.searchParams.get("minimal") === null ? false : url.searchParams.get("minimal") === 'true';
    PREJOIN = url.searchParams.get("prejoin") === null ? true : url.searchParams.get("prejoin") === 'true';
    VIDEO_MUTED = url.searchParams.get("videoMuted") === null ? false : url.searchParams.get("videoMuted")  === 'true';
    console.log("video muted", url.searchParams.get("videoMuted"));
    AUDIO_MUTED = url.searchParams.get("audioMuted") === null ? false : url.searchParams.get("audioMuted") === 'true';
	SCREENSHARE_BUTTON = url.searchParams.get("screenshareBtn") === null ? true : url.searchParams.get("screenshareBtn") === 'true';
	FULLSCREEN_BUTTON = url.searchParams.get("fullscreenBtn") === null ? true : url.searchParams.get("fullscreenBtn") === 'true';
    LEAVE_BUTTON = url.searchParams.get("leaveBtn") === null ? true : url.searchParams.get("leaveBtn") === 'true';
	CHAT_PANEL_BUTTON = url.searchParams.get("chatPanelBtn") === null ? true : url.searchParams.get("chatPanelBtn") === 'true';
    PARTICIPANTS_PANEL_BUTTON = url.searchParams.get("participantsPanelBtn") === null ? true : url.searchParams.get("participantsPanelBtn") === 'true';

	DISPLAY_LOGO = url.searchParams.get("displayLogo") === null ? true : url.searchParams.get("displayLogo") === 'true';
	DISPLAY_SESSION_NAME = url.searchParams.get("displaySessionName") === null ? true : url.searchParams.get("displaySessionName") === 'true';
	DISPLAY_PARTICIPANT_NAME = url.searchParams.get("displayParticipantName") === null ? true : url.searchParams.get("displayParticipantName") === 'true';
	DISPLAY_AUDIO_DETECTION = url.searchParams.get("displayAudioDetection") === null ? true : url.searchParams.get("displayAudioDetection") === 'true';
	SETTINGS_BUTTON = url.searchParams.get("settingsBtn") === null ? true : url.searchParams.get("settingsBtn") === 'true';
	PARTICIPANT_MUTE_BUTTON = url.searchParams.get("participantMuteBtn") === null ? true : url.searchParams.get("participantMuteBtn") === 'true';


    SESSION_NAME = url.searchParams.get("sessionName") === null ? `E2ESession${Math.floor(Math.random()*100)}` : url.searchParams.get("sessionName");

    var webComponent = document.querySelector('openvidu-webcomponent');

    webComponent.addEventListener('onJoinButtonClicked', (event) => appendElement('onJoinButtonClicked'));
    webComponent.addEventListener('onToolbarLeaveButtonClicked', (event) => appendElement('onToolbarLeaveButtonClicked'));
    webComponent.addEventListener('onToolbarCameraButtonClicked', (event) => appendElement('onToolbarCameraButtonClicked'));
    webComponent.addEventListener('onToolbarMicrophoneButtonClicked', (event) => appendElement('onToolbarMicrophoneButtonClicked'));
    webComponent.addEventListener('onToolbarScreenshareButtonClicked', (event) => appendElement('onToolbarScreenshareButtonClicked'));
    webComponent.addEventListener('onToolbarParticipantsPanelButtonClicked', (event) => appendElement('onToolbarParticipantsPanelButtonClicked'));
    webComponent.addEventListener('onToolbarChatPanelButtonClicked', (event) => appendElement('onToolbarChatPanelButtonClicked'));
    webComponent.addEventListener('onToolbarFullscreenButtonClicked', (event) => appendElement('onToolbarFullscreenButtonClicked'));

    webComponent.addEventListener('onSessionCreated', (event) => {
        var session = event.detail;
        appendElement('onSessionCreated');


        // You can see the session documentation here
        // https://docs.openvidu.io/en/stable/api/openvidu-browser/classes/session.html

        // session.on('connectionCreated', (e) => {
        //     console.error("connectionCreated", e);
        //     var user = JSON.parse(e.connection.data).clientData;
        //     appendElement(user + '-connectionCreated');
        // });

        // session.on('streamDestroyed', (e) => {
        //     console.log("streamDestroyed", e);
        //     var user = JSON.parse(e.stream.connection.data).clientData;
        //     appendElement(user + '-streamDestroyed');
        // });

        // session.on('streamCreated', (e) => {
        //     console.log("streamCreated", e);
        //     var user = JSON.parse(e.stream.connection.data).clientData;
        //     appendElement(user + '-streamCreated');
        // });

        // session.on('sessionDisconnected', (e) => {
        //     console.warn("sessionDisconnected ", e);
        //     var user = JSON.parse(e.target.connection.data).clientData;
        //     appendElement(user + '-sessionDisconnected');
        // });
    });

    webComponent.addEventListener('publisherCreated', (event) => {
        var publisher = event.detail;
        appendElement('publisherCreated')

        // You can see the publisher documentation here
        // https://docs.openvidu.io/en/stable/api/openvidu-browser/classes/publisher.html

        publisher.on('streamCreated', (e) => {
            console.warn("Publisher streamCreated", e);
            appendElement('publisher-streamCreated');
        });

        publisher.on('streamPlaying', (e) => {
            appendElement('publisher-streamPlaying');

        });
    });


    webComponent.addEventListener('error', (event) => {
        console.log('Error event', event.detail);
    });

    var user = 'user' + Math.floor(Math.random() * 100);
    joinSession(SESSION_NAME, user);
});


function appendElement(id) {
    var eventsDiv = document.getElementById('events');
    var element = document.createElement('div');
    element.setAttribute("id", id);
    element.setAttribute("style", "height: 1px;");
    eventsDiv.appendChild(element);
}

async function joinSession(sessionName, participantName) {
    var webComponent = document.querySelector('openvidu-webcomponent');
    var tokens = {webcam: await getToken(sessionName), screen: await getToken(sessionName)};

    webComponent.minimal = MINIMAL;
    webComponent.prejoin = PREJOIN;
    webComponent.videoMuted = VIDEO_MUTED;
    webComponent.audioMuted = AUDIO_MUTED;
    webComponent.toolbarScreenshareButton = SCREENSHARE_BUTTON;

    webComponent.toolbarFullscreenButton = FULLSCREEN_BUTTON;
	webComponent.toolbarLeaveButton = LEAVE_BUTTON;
	webComponent.toolbarChatPanelButton = CHAT_PANEL_BUTTON;
	webComponent.toolbarParticipantsPanelButton = PARTICIPANTS_PANEL_BUTTON;
	webComponent.toolbarDisplayLogo = DISPLAY_LOGO;
	webComponent.toolbarDisplaySessionName = DISPLAY_SESSION_NAME;
	webComponent.streamDisplayParticipantName = DISPLAY_PARTICIPANT_NAME;
	webComponent.streamDisplayAudioDetection = DISPLAY_AUDIO_DETECTION;
	webComponent.streamSettingsButton = SETTINGS_BUTTON;
	webComponent.participantPanelItemMuteButton = PARTICIPANT_MUTE_BUTTON;

    webComponent.sessionConfig = { sessionName, participantName, tokens };
}

/**
 * --------------------------
 * SERVER-SIDE RESPONSIBILITY
 * --------------------------
 * These methods retrieve the mandatory user token from OpenVidu Server.
 * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION (by using
 * the API REST, openvidu-java-client or openvidu-node-client):
 *   1) Initialize a session in OpenVidu Server	(POST /api/sessions)
 *   2) Generate a token in OpenVidu Server		(POST /api/tokens)
 *   3) Configure OpenVidu Web Component in your client side with the token
 */

var OPENVIDU_SERVER_URL = "https://localhost:4443" ;
var OPENVIDU_SERVER_SECRET = 'MY_SECRET';

function getToken(sessionName) {
    return createSession(sessionName).then((sessionId) => createToken(sessionId));
}

function createSession(sessionName) { // See https://docs.openvidu.io/en/stable/reference-docs/REST-API/#post-apisessions
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: OPENVIDU_SERVER_URL + '/api/sessions',
            data: JSON.stringify({ customSessionId: sessionName }),
            headers: {
                Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET),
                'Content-Type': 'application/json',
            },
            success: (response) => resolve(response.id),
            error: (error) => {
                if (error.status === 409) {
                    resolve(sessionName);
                } else {
                    console.warn('No connection to OpenVidu Server. This may be a certificate error at ' + OPENVIDU_SERVER_URL);
                    if (
                        window.confirm(
                            'No connection to OpenVidu Server. This may be a certificate error at "' +
                                OPENVIDU_SERVER_URL +
                                '"\n\nClick OK to navigate and accept it. ' +
                                'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
                                OPENVIDU_SERVER_URL +
                                '"',
                        )
                    ) {
                        location.assign(OPENVIDU_SERVER_URL + '/accept-certificate');
                    }
                }
            },
        });
    });
}

function createToken(sessionId) {
    // See https://docs.openvidu.io/en/stable/reference-docs/REST-API/#post-apitokens
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: OPENVIDU_SERVER_URL + '/api/tokens',
            data: JSON.stringify({ session: sessionId }),
            headers: {
                Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET),
                'Content-Type': 'application/json',
            },
            success: (response) => resolve(response.token),
            error: (error) => reject(error),
        });
    });
}