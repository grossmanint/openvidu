// require('chromedriver');
// const assert = require('assert');
// const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
// const firefox = require('selenium-webdriver/firefox');
// const { Builder, By, Key, promise, until } = require('selenium-webdriver');

import { Builder, By, Capabilities, until, WebDriver, logging, Key } from 'selenium-webdriver';
import { expect } from 'chai';

const url = 'http://127.0.0.1:8080/';
const FIVE_SECONDS = 5000;
const ONE_SECONDS = 5000;
const sleepTimeout = 500;

describe('Checkout localhost app', () => {
	let browser: WebDriver;

	const chromeOptions = new chrome.Options();
	const chromeCapabilities = Capabilities.chrome();

	chromeOptions.addArguments('--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream');
	const prefs = new logging.Preferences();
	prefs.setLevel(logging.Type.BROWSER, logging.Level.DEBUG);
	chromeCapabilities.set('acceptInsecureCerts', true);

	// var firefoxOptions = new firefox.Options();
	// var firefoxCapabilities = webdriver.Capabilities.firefox();
	// firefoxOptions.addArguments('--headless');
	// firefoxOptions.setPreference('media.navigator.permission.disabled', true);
	// firefoxOptions.setPreference('media.navigator.streams.fake', true);
	// firefoxCapabilities.setAcceptInsecureCerts(true);

	async function createChromeBrowser(name: string): Promise<WebDriver> {
		return await new Builder().forBrowser(name).withCapabilities(chromeCapabilities).setChromeOptions(chromeOptions).build();
	}

	// async function createFirefoxBrowser() {
	// 	return await new Builder()
	// 		.forBrowser('firefox')
	// 		.withCapabilities(firefoxCapabilities)
	// 		.setFirefoxOptions(firefoxOptions)
	// 		.build();

	// 	return await new Builder().forBrowser('chrome2').withCapabilities(chromeCapabilities).setChromeOptions(chromeOptions).build();
	// }

	beforeEach(async () => {
		browser = await createChromeBrowser('Chrome');
	});

	afterEach(async () => {
		await browser.quit();
	});

	// ** API Directives

	it('should set the MINIMAL UI', async () => {
		let element;
		await browser.get(`${url}?minimal=true`);
		// Checking if prejoin page exist
		element = await browser.wait(until.elementLocated(By.id('prejoin-container')), ONE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if stream component is present
		element = await browser.wait(until.elementLocated(By.className('OT_widget-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if audio detection is not displayed
		element = await browser.findElements(By.id('audio-wave-container'));
		expect(element.length).equals(0);

		const joinButton = await browser.findElement(By.id('join-button'));
		expect(await joinButton.isDisplayed()).to.be.true;
		await joinButton.click();

		// Checking if session container is present
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if screenshare button is not present
		element = await browser.findElements(By.id('screenshare-btn'));
		expect(element.length).equals(0);

		// Checking if fullscreen button is not present
		element = await browser.findElements(By.id('fullscreen-btn'));
		expect(element.length).equals(0);

		// Checking if participants panel button is not present
		element = await browser.findElements(By.id('participants-panel-btn'));
		expect(element.length).equals(0);

		// Checking if logo is not displayed
		element = await browser.findElements(By.id('branding-logo'));
		expect(element.length).equals(0);

		// Checking if session name is not displayed
		element = await browser.findElements(By.id('session-name'));
		expect(element.length).equals(0);

		// Checking if nickname is not displayed
		element = await browser.findElements(By.id('nickname-container'));
		expect(element.length).equals(0);

		// Checking if audio detection is not displayed
		element = await browser.findElements(By.id('audio-wave-container'));
		expect(element.length).equals(0);

		// Checking if settings button is not displayed
		element = await browser.findElements(By.id('settings-container'));
		expect(element.length).equals(0);
	});

	it('should show the PREJOIN page', async () => {
		await browser.get(`${url}?prejoin=true`);
		const element = await browser.wait(until.elementLocated(By.id('prejoin-container')), ONE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
	});
	it('should not show the PREJOIN page', async () => {
		let element;
		await browser.get(`${url}?prejoin=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), ONE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
	});

	it('should run the app with VIDEO MUTED in prejoin page', async () => {
		let element, isVideoEnabled, icon;
		const videoEnableScript = 'return document.getElementsByTagName("video")[0].srcObject.getVideoTracks()[0].enabled;';

		await browser.get(`${url}?prejoin=true&videoMuted=true`);

		// Checking if video is displayed
		await browser.wait(until.elementLocated(By.css('video')), FIVE_SECONDS);
		element = await browser.findElement(By.css('video'));
		await browser.wait(until.elementIsVisible(element), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if video track is disabled/muted
		isVideoEnabled = await browser.executeScript(videoEnableScript);
		expect(isVideoEnabled).to.be.false;

		icon = await browser.findElement(By.id('videocam_off'));
		expect(await icon.isDisplayed()).to.be.true;

		const joinButton = await browser.findElement(By.id('join-button'));
		expect(await joinButton.isDisplayed()).to.be.true;
		await joinButton.click();

		// Checking if video is muted after join the room
		isVideoEnabled = await browser.executeScript(videoEnableScript);
		expect(isVideoEnabled).to.be.false;

		icon = await browser.findElement(By.id('videocam_off'));
		expect(await icon.isDisplayed()).to.be.true;
	});

	it('should run the app with VIDEO MUTED and WITHOUT PREJOIN page', async () => {
		let element, isVideoEnabled, icon;
		const videoEnableScript = 'return document.getElementsByTagName("video")[0].srcObject.getVideoTracks()[0].enabled;';

		await browser.get(`${url}?prejoin=false&videoMuted=true`);

		element = await browser.wait(until.elementLocated(By.id('session-container')), ONE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if video is displayed
		await browser.wait(until.elementLocated(By.css('video')), FIVE_SECONDS);
		element = await browser.findElement(By.css('video'));
		await browser.wait(until.elementIsVisible(element), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if video track is disabled/muted
		isVideoEnabled = await browser.executeScript(videoEnableScript);
		expect(isVideoEnabled).to.be.false;

		icon = await browser.findElement(By.id('videocam_off'));
		expect(await icon.isDisplayed()).to.be.true;
	});

	it('should run the app with AUDIO MUTED in prejoin page', async () => {
		let element, isAudioEnabled, icon;
		const audioEnableScript = 'return document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].enabled;';

		await browser.get(`${url}?audioMuted=true`);

		// Checking if video is displayed
		await browser.wait(until.elementLocated(By.css('video')), FIVE_SECONDS);
		element = await browser.findElement(By.css('video'));
		await browser.wait(until.elementIsVisible(element), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if audio track is disabled/muted
		isAudioEnabled = await browser.executeScript(audioEnableScript);
		expect(isAudioEnabled).to.be.false;

		icon = await browser.findElement(By.id('mic_off'));
		expect(await icon.isDisplayed()).to.be.true;

		const joinButton = await browser.findElement(By.id('join-button'));
		expect(await joinButton.isDisplayed()).to.be.true;
		await joinButton.click();

		// Checking if audio is muted after join the room
		isAudioEnabled = await browser.executeScript(audioEnableScript);
		expect(isAudioEnabled).to.be.false;

		icon = await browser.findElement(By.id('mic_off'));
		expect(await icon.isDisplayed()).to.be.true;
	});

	it('should run the app with VIDEO MUTED and WITHOUT PREJOIN page', async () => {
		let element, isAudioEnabled, icon;
		const audioEnableScript = 'return document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].enabled;';

		await browser.get(`${url}?prejoin=false&audioMuted=true`);

		element = await browser.wait(until.elementLocated(By.id('session-container')), ONE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if video is displayed
		await browser.wait(until.elementLocated(By.css('video')), FIVE_SECONDS);
		element = await browser.findElement(By.css('video'));
		await browser.wait(until.elementIsVisible(element), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if audio track is disabled/muted
		isAudioEnabled = await browser.executeScript(audioEnableScript);
		expect(isAudioEnabled).to.be.false;

		icon = await browser.findElement(By.id('mic_off'));
		expect(await icon.isDisplayed()).to.be.true;
	});

	it('should HIDE the SCREENSHARE button', async () => {
		let element;
		await browser.get(`${url}?prejoin=false&screenshareBtn=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if screenshare button is not present
		element = await browser.findElements(By.id('screenshare-btn'));
		expect(element.length).equals(0);
	});

	it('should HIDE the FULLSCREEN button', async () => {
		let element;
		await browser.get(`${url}?prejoin=false&fullscreenBtn=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if fullscreen button is not present
		element = await browser.findElements(By.id('fullscreen-btn'));
		expect(element.length).equals(0);
	});

	it('should HIDE the LEAVE button', async () => {
		let element;
		await browser.get(`${url}?prejoin=false&leaveBtn=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if leave button is not present
		element = await browser.findElements(By.id('leave-btn'));
		expect(element.length).equals(0);
	});

	it('should HIDE the CHAT PANEL button', async () => {
		let element;
		await browser.get(`${url}?prejoin=false&chatPanelBtn=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if chat panel button is not present
		element = await browser.findElements(By.id('chat-panel-btn'));
		expect(element.length).equals(0);
	});

	it('should HIDE the PARTICIPANTS PANEL button', async () => {
		let element;
		await browser.get(`${url}?prejoin=false&participantsPanelBtn=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if participants panel button is not present
		element = await browser.findElements(By.id('participants-panel-btn'));
		expect(element.length).equals(0);
	});

	it('should HIDE the LOGO', async () => {
		let element;
		await browser.get(`${url}?prejoin=false&displayLogo=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('info-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if logo is not displayed
		element = await browser.findElements(By.id('branding-logo'));
		expect(element.length).equals(0);
	});

	it('should HIDE the SESSION NAME', async () => {
		let element;
		await browser.get(`${url}?prejoin=false&displaySessionName=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('info-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if session name is not displayed
		element = await browser.findElements(By.id('session-name'));
		expect(element.length).equals(0);
	});

	it('should HIDE the PARTICIPANT NAME', async () => {
		let element;
		await browser.get(`${url}?prejoin=false&displayParticipantName=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if stream component is present
		element = await browser.wait(until.elementLocated(By.className('OT_widget-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if nickname is not displayed
		element = await browser.findElements(By.id('nickname-container'));
		expect(element.length).equals(0);
	});

	it('should HIDE the AUDIO DETECTION element', async () => {
		let element;
		await browser.get(`${url}?prejoin=false&displayAudioDetection=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if stream component is present
		element = await browser.wait(until.elementLocated(By.className('OT_widget-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if audio detection is not displayed
		element = await browser.findElements(By.id('audio-wave-container'));
		expect(element.length).equals(0);
	});

	it('should HIDE the SETTINGS button', async () => {
		let element;
		await browser.get(`${url}?prejoin=false&settingsBtn=false`);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if stream component is present
		element = await browser.wait(until.elementLocated(By.className('OT_widget-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if settings button is not displayed
		element = await browser.findElements(By.id('settings-container'));
		expect(element.length).equals(0);
	});

	it('should HIDE the MUTE button in participants panel', async () => {
		let element, remoteParticipantItems;
		const sessionName = 'e2etest';
		const fixedUrl = `${url}?prejoin=false&participantMuteBtn=false&sessionName=${sessionName}`;
		await browser.get(fixedUrl);
		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present and opening the participants panel
		element = await browser.wait(until.elementLocated(By.id('menu-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
		const participantsButton = await browser.findElement(By.id('participants-panel-btn'));
		await participantsButton.click();

		// Checking if participatns panel is displayed
		element = await browser.wait(until.elementLocated(By.id('participants-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
		// Checking remote participants item
		remoteParticipantItems = await browser.findElements(By.id('remote-participant-item'));
		expect(remoteParticipantItems.length).equals(0);

		// Starting new browser for adding a new participant
		const newTabScript = `window.open("${fixedUrl}")`;
		await browser.executeScript(newTabScript);

		// Go to first tab
		const tabs = await browser.getAllWindowHandles();
		browser.switchTo().window(tabs[0]);

		// Checking if mute button is not displayed in participant item
		remoteParticipantItems = await browser.wait(until.elementsLocated(By.id('remote-participant-item')), FIVE_SECONDS);
		expect(remoteParticipantItems.length).equals(1);
		element = await browser.findElements(By.id('mute-btn'));
		expect(element.length).equals(0);
	});

	//* ---- Webcomponent events ----

	it('should receive the onJoinButtonClicked event', async () => {
		let element;
		await browser.get(`${url}`);
		element = await browser.wait(until.elementLocated(By.id('prejoin-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Clicking to join button
		const joinButton = await browser.findElement(By.id('join-button'));
		expect(await joinButton.isDisplayed()).to.be.true;
		await joinButton.click();

		// Checking if onJoinButtonClicked has been received
		element = await browser.wait(until.elementLocated(By.id('onJoinButtonClicked')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
	});

	it('should receive the onToolbarLeaveButtonClicked event', async () => {
		let element;
		await browser.get(`${url}?prejoin=false`);

		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Clicking to leave button
		const leaveButton = await browser.findElement(By.id('leave-btn'));
		expect(await leaveButton.isDisplayed()).to.be.true;
		await leaveButton.click();

		// Checking if onToolbarLeaveButtonClicked has been received
		element = await browser.wait(until.elementLocated(By.id('onToolbarLeaveButtonClicked')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
	});

	it('should receive the onToolbarCameraButtonClicked event', async () => {
		let element;
		await browser.get(`${url}?prejoin=false`);

		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Clicking to leave button
		const cameraButton = await browser.findElement(By.id('camera-btn'));
		expect(await cameraButton.isDisplayed()).to.be.true;
		await cameraButton.click();

		// Checking if onToolbarCameraButtonClicked has been received
		element = await browser.wait(until.elementLocated(By.id('onToolbarCameraButtonClicked')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
	});

	it('should receive the onToolbarMicrophoneButtonClicked event', async () => {
		let element;
		await browser.get(`${url}?prejoin=false`);

		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Clicking to leave button
		const cameraButton = await browser.findElement(By.id('mic-btn'));
		expect(await cameraButton.isDisplayed()).to.be.true;
		await cameraButton.click();

		// Checking if onToolbarMicrophoneButtonClicked has been received
		element = await browser.wait(until.elementLocated(By.id('onToolbarMicrophoneButtonClicked')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
	});

	it('should receive the onToolbarScreenshareButtonClicked event', async () => {
		let element;
		await browser.get(`${url}?prejoin=false`);

		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Clicking to leave button
		const screenshareButton = await browser.findElement(By.id('screenshare-btn'));
		expect(await screenshareButton.isDisplayed()).to.be.true;
		await screenshareButton.click();

		// Checking if onToolbarScreenshareButtonClicked has been received
		element = await browser.wait(until.elementLocated(By.id('onToolbarScreenshareButtonClicked')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
	});

	it('should receive the onToolbarFullscreenButtonClicked event', async () => {
		let element;
		await browser.get(`${url}?prejoin=false`);

		element = await browser.wait(until.elementLocated(By.id('session-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Checking if toolbar is present
		element = await browser.wait(until.elementLocated(By.id('media-buttons-container')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;

		// Clicking to leave button
		const fullscreenButton = await browser.findElement(By.id('fullscreen-btn'));
		expect(await fullscreenButton.isDisplayed()).to.be.true;
		await fullscreenButton.click();

		// Checking if onToolbarFullscreenButtonClicked has been received
		element = await browser.wait(until.elementLocated(By.id('onToolbarFullscreenButtonClicked')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
	});

	it('should receive the onSessionCreated event', async () => {
		let element;
		await browser.get(`${url}?prejoin=false`);
		element = await browser.wait(until.elementLocated(By.id('onSessionCreated')), FIVE_SECONDS);
		expect(await element.isDisplayed()).to.be.true;
		element = await browser.findElements(By.id('onJoinButtonClicked'));
		expect(element.length).equals(0);
	});

	// * PUBLISHER EVENTS

	// it('should receive publisherCreated event', async () => {
	// 	try {
	// 		await browser.wait(until.elementLocated(By.id('publisherCreated')), FIVE_SECONDS);
	// 		await browser.wait(until.elementLocated(By.id('navLeaveButton')), FIVE_SECONDS).click();
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		await browser.quit();
	// 	}
	// });

	// it('should receive Publisher streamCreated event', async function () {
	// 	try {
	// 		// await browser.get(url);
	// 		await browser.wait(until.elementLocated(By.id('publisherCreated')), FIVE_SECONDS);

	// 		await browser.wait(until.elementLocated(By.id('publisher-streamCreated')), FIVE_SECONDS);
	// 		await browser.wait(until.elementLocated(By.id('navLeaveButton')), FIVE_SECONDS).click();
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		await browser.quit();
	// 	}
	// });

	// it('should receive Publisher streamPlaying event', async function () {
	// 	try {
	// 		// await browser.get(url);
	// 		await browser.wait(until.elementLocated(By.id('publisherCreated')), FIVE_SECONDS);

	// 		await browser.wait(until.elementLocated(By.id('publisher-streamPlaying')), FIVE_SECONDS);
	// 		await browser.wait(until.elementLocated(By.id('navLeaveButton')), FIVE_SECONDS).click();
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		await browser.quit();
	// 	}
	// });

	// * SESSION EVENTS

	// it('should receive REMOTE connectionCreated event', async () => {
	// 	try {
	// 		// await browser.get(url);
	// 		await browser.wait(until.elementLocated(By.id('publisherCreated')), FIVE_SECONDS);

	// 		browser2 = await createFirefoxBrowser();
	// 		await browser2.get(url);
	// 		await browser2.wait(until.elementLocated(By.id('publisherCreated')), FIVE_SECONDS);
	// 		await browser2.sleep(sleepTimeout);
	// 		var user2 = await (await browser2.wait(until.elementLocated(By.id('nickname')), FIVE_SECONDS)).getText();
	// 		await browser.wait(until.elementLocated(By.id(user2 + '-connectionCreated')), FIVE_SECONDS);
	// 		await browser.wait(until.elementLocated(By.id('navLeaveButton')), FIVE_SECONDS).click();
	// 		await browser2.wait(until.elementLocated(By.id('navLeaveButton')), FIVE_SECONDS).click();
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		await browser.quit();
	// 		await browser2.quit();
	// 	}
	// });

	// it('should receive REMOTE streamDestroyed event', async function () {
	// 	try {
	// 		// await browser.get(url);
	// 		await browser.wait(until.elementLocated(By.id('publisherCreated')), FIVE_SECONDS);

	// 		browser2 = await createFirefoxBrowser();
	// 		await browser2.get(url);
	// 		await browser2.wait(until.elementLocated(By.id('publisherCreated')), FIVE_SECONDS);
	// 		await browser2.wait(until.elementLocated(By.id('publisher-streamPlaying')), FIVE_SECONDS);

	// 		await browser2.sleep(sleepTimeout);
	// 		var user2 = await (await browser2.wait(until.elementLocated(By.id('nickname')), FIVE_SECONDS)).getText();

	// 		await browser2.wait(until.elementLocated(By.id('navLeaveButton')), FIVE_SECONDS).click();

	// 		await browser.wait(until.elementLocated(By.id(user2 + '-streamDestroyed')), FIVE_SECONDS);
	// 		await browser.wait(until.elementLocated(By.id('navLeaveButton')), FIVE_SECONDS).click();
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		await browser.quit();
	// 		await browser2.quit();
	// 	}
	// });

	// it('should receive Session sessionDisconnected event', async function () {
	// 	try {
	// 		// await browser.get(url);
	// 		await browser.wait(until.elementLocated(By.id('publisherCreated')), FIVE_SECONDS);
	// 		await browser.wait(until.elementLocated(By.id('publisher-streamPlaying')), FIVE_SECONDS);

	// 		await browser.sleep(sleepTimeout);
	// 		var user = await (await browser.wait(until.elementLocated(By.id('nickname')), FIVE_SECONDS)).getText();

	// 		await browser.wait(until.elementLocated(By.id('navLeaveButton')), FIVE_SECONDS).click();

	// 		await browser.wait(until.elementLocated(By.id(user + '-sessionDisconnected')), FIVE_SECONDS);
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		await browser.quit();
	// 	}
	// });

	// it('should receive REMOTE streamCreated event', async function () {
	// 	try {
	// 		// await browser.get(url);
	// 		await browser.wait(until.elementLocated(By.id('publisherCreated')), FIVE_SECONDS);

	// 		browser2 = await createFirefoxBrowser();
	// 		await browser2.get(url);
	// 		await browser2.wait(until.elementLocated(By.id('publisherCreated')), FIVE_SECONDS);
	// 		await browser2.wait(until.elementLocated(By.id('publisher-streamPlaying')), FIVE_SECONDS);

	// 		await browser2.sleep(sleepTimeout);
	// 		var user2 = await (await browser2.wait(until.elementLocated(By.id('nickname')), FIVE_SECONDS)).getText();

	// 		await browser.wait(until.elementLocated(By.id(user2 + '-streamCreated')), FIVE_SECONDS);

	// 		await browser2.wait(until.elementLocated(By.id('navLeaveButton')), FIVE_SECONDS).click();

	// 		await browser.wait(until.elementLocated(By.id('navLeaveButton')), FIVE_SECONDS).click();
	// 	} catch (error) {
	// 		console.log(error);
	// 	} finally {
	// 		await browser.quit();
	// 		await browser2.quit();
	// 	}
	// });
});