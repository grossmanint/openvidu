import { Component, HostListener, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { Publisher, PublisherProperties } from 'openvidu-browser';
import { OpenViduErrorName } from 'openvidu-browser/lib/OpenViduInternal/Enums/OpenViduError';
import { Subscription } from 'rxjs';
import { CustomDevice } from '../../models/device.model';
import { ILogger } from '../../models/logger.model';
import { ParticipantAbstractModel, ParticipantProperties } from '../../models/participant.model';
import { ActionService } from '../../services/action/action.service';
import { DeviceService } from '../../services/device/device.service';
import { LayoutService } from '../../services/layout/layout.service';
import { LoggerService } from '../../services/logger/logger.service';
import { OpenViduService } from '../../services/openvidu/openvidu.service';
import { ParticipantService } from '../../services/participant/participant.service';
import { StorageService } from '../../services/storage/storage.service';

@Component({
	selector: 'ov-pre-join',
	templateUrl: './pre-join.component.html',
	styleUrls: ['./pre-join.component.css']
})
export class PreJoinComponent implements OnInit, OnDestroy {
	@Output() onJoinButtonClicked = new EventEmitter<any>();
	cameras: CustomDevice[];
	microphones: CustomDevice[];
	cameraSelected: CustomDevice;
	microphoneSelected: CustomDevice;
	isVideoMuted: boolean;
	isAudioMuted: boolean;
	localParticipant: ParticipantAbstractModel;
	windowSize: number;
	hasVideoDevices: boolean;
	hasAudioDevices: boolean;
	isLoading = true;
	nickname: string;
	private log: ILogger;
	private localParticipantSubscription: Subscription;
	private screenShareStateSubscription: Subscription;

	@HostListener('window:resize')
	sizeChange() {
		this.windowSize = window.innerWidth;
		this.layoutService.update();
	}

	constructor(
		private layoutService: LayoutService,
		private deviceSrv: DeviceService,
		private loggerSrv: LoggerService,
		private openviduService: OpenViduService,
		private participantService: ParticipantService,
		private storageSrv: StorageService
	) {
		this.log = this.loggerSrv.get('PreJoinComponent');
	}

	ngOnInit() {
		this.subscribeToLocalParticipantEvents();

		this.windowSize = window.innerWidth;
		this.hasVideoDevices = this.deviceSrv.hasVideoDeviceAvailable();
		this.hasAudioDevices = this.deviceSrv.hasAudioDeviceAvailable();
		this.microphones = this.deviceSrv.getMicrophones();
		this.cameras = this.deviceSrv.getCameras();
		this.cameraSelected = this.deviceSrv.getCameraSelected();
		this.microphoneSelected = this.deviceSrv.getMicrophoneSelected();

		this.isVideoMuted = this.deviceSrv.isVideoMuted();
		this.isAudioMuted = this.deviceSrv.isAudioMuted();

		this.isLoading = false;
	}

	ngOnDestroy() {
		if (this.localParticipantSubscription) {
			this.localParticipantSubscription.unsubscribe();
		}

		if (this.screenShareStateSubscription) {
			this.screenShareStateSubscription.unsubscribe();
		}
		this.deviceSrv.clear();
	}

	async onCameraSelected(event: any) {
		const videoSource = event?.value;
		// Is New deviceId different from the old one?
		if (this.deviceSrv.needUpdateVideoTrack(videoSource)) {
			const mirror = this.deviceSrv.cameraNeedsMirror(videoSource);
			//TODO: Uncomment this when replaceTrack issue is fixed
			// const pp: PublisherProperties = { videoSource, audioSource: false, mirror };
			// await this.openviduService.replaceTrack(VideoType.CAMERA, pp);
			// TODO: Remove this when replaceTrack issue is fixed
			const pp: PublisherProperties = { videoSource, audioSource: this.microphoneSelected.device, mirror };
			await this.openviduService.republishTrack(pp);

			this.cameraSelected = videoSource;
			this.deviceSrv.setCameraSelected(this.cameraSelected);
		}
		if (this.isVideoMuted) {
			// Publish Webcam video
			this.openviduService.publishVideo(this.participantService.getMyCameraPublisher(), true);
			this.isVideoMuted = false;
		}
	}

	async onMicrophoneSelected(event: any) {
		const audioSource = event?.value;
		// Is New deviceId different than older?
		if (this.deviceSrv.needUpdateAudioTrack(audioSource)) {
			//TODO: Uncomment this when replaceTrack issue is fixed
			// const pp: PublisherProperties = { audioSource, videoSource: false };
			// await this.openviduService.replaceTrack(VideoType.CAMERA, pp);
			// TODO: Remove this when replaceTrack issue is fixed
			const mirror = this.deviceSrv.cameraNeedsMirror(this.cameraSelected.device);
			const pp: PublisherProperties = { videoSource: this.cameraSelected.device, audioSource, mirror };
			await this.openviduService.republishTrack(pp);

			this.microphoneSelected = audioSource;
			this.deviceSrv.setMicSelected(this.microphoneSelected);
		}
		if (this.isAudioMuted) {
			// Enable microphone
			this.openviduService.publishAudio(this.participantService.getMyCameraPublisher(), true);
			this.isAudioMuted = true;
		}
	}

	toggleCam() {
		const publish = this.isVideoMuted;
		this.openviduService.publishVideo(this.participantService.getMyCameraPublisher(), publish);

		if (this.participantService.haveICameraAndScreenActive()) {
			// Cam will not published, disable webcam with screensharing active
			this.participantService.disableWebcamUser();
			this.openviduService.publishAudio(this.participantService.getMyScreenPublisher(), publish);
		} else if (this.participantService.isOnlyMyScreenActive()) {
			// Cam will be published, enable webcam
			this.participantService.enableWebcamUser();
		}

		this.isVideoMuted = !this.isVideoMuted;
		this.storageSrv.setVideoMuted(this.isVideoMuted);
	}

	// async toggleScreenShare() {
	// 	// Disabling screenShare
	// 	if (this.participantService.haveICameraAndScreenActive()) {
	// 		this.participantService.disableScreenUser();
	// 		return;
	// 	}

	// 	// Enabling screenShare
	// 	if (this.participantService.isOnlyMyCameraActive()) {
	// 		const willThereBeWebcam = this.participantService.isMyCameraActive() && this.participantService.hasCameraVideoActive();
	// 		const hasAudio = willThereBeWebcam ? false : this.hasAudioDevices && this.isAudioMuted;
	// 		const properties: PublisherProperties = {
	// 			videoSource: ScreenType.SCREEN,
	// 			audioSource: this.hasAudioDevices ? undefined : null,
	// 			publishVideo: true,
	// 			publishAudio: hasAudio,
	// 			mirror: false
	// 		};
	// 		const screenPublisher = await this.openviduService.initPublisher(undefined, properties);

	// 		screenPublisher.on('accessAllowed', (event) => {
	// 			screenPublisher.stream
	// 				.getMediaStream()
	// 				.getVideoTracks()[0]
	// 				.addEventListener('ended', () => {
	// 					this.log.d('Clicked native stop button. Stopping screen sharing');
	// 					this.toggleScreenShare();
	// 				});
	// 			this.participantService.activeMyScreenShare(screenPublisher);
	// 			if (!this.participantService.hasCameraVideoActive()) {
	// 				this.participantService.disableWebcamUser();
	// 			}
	// 		});

	// 		screenPublisher.on('accessDenied', (error: any) => {
	// 			if (error && error.name === 'SCREEN_SHARING_NOT_SUPPORTED') {
	// 				this.actionService.openDialog('Error sharing screen', 'Your browser does not support screen sharing');
	// 			}
	// 		});
	// 		return;
	// 	}

	// 	// Disabling screnShare and enabling webcam
	// 	this.participantService.enableWebcamUser();
	// 	this.participantService.disableScreenUser();
	// }

	toggleMic() {
		const publish = this.isAudioMuted;
		this.openviduService.publishAudio(this.participantService.getMyCameraPublisher(), publish);
		this.isAudioMuted = !this.isAudioMuted;
		this.storageSrv.setAudioMuted(this.isAudioMuted);
	}

	updateNickname() {
		this.nickname = this.nickname === '' ? this.participantService.getMyNickname() : this.nickname;
		this.participantService.setMyNickname(this.nickname);
		this.storageSrv.setNickname(this.nickname);
	}

	joinSession() {
		this.onJoinButtonClicked.emit();
	}

	private subscribeToLocalParticipantEvents() {
		this.localParticipantSubscription = this.participantService.localParticipantObs.subscribe((p) => {
			this.localParticipant = p;
		});
	}

	//? After test in Chrome and Firefox, the devices always have labels.
	//? It's not longer needed
	// private handlePublisherSuccess(publisher: Publisher) {
	// 	publisher.once('accessAllowed', async () => {
	// 		if (this.deviceSrv.areEmptyLabels()) {
	// 			await this.deviceSrv.forceUpdate();
	// 			if (this.hasAudioDevices) {
	// 				const audioLabel = publisher?.stream?.getMediaStream()?.getAudioTracks()[0]?.label;
	// 				this.deviceSrv.setMicSelected(audioLabel);
	// 			}

	// 			if (this.hasVideoDevices) {
	// 				const videoLabel = publisher?.stream?.getMediaStream()?.getVideoTracks()[0]?.label;
	// 				this.deviceSrv.setCameraSelected(videoLabel);
	// 			}
	// 			this.setDevicesInfo();
	// 		}
	// 	});
	// }
}