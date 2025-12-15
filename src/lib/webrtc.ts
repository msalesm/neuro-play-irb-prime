import { supabase } from '@/integrations/supabase/client';

export interface VideoCallConfig {
  sessionId: string;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: Error) => void;
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private config: VideoCallConfig;
  private isInitiator = false;

  private readonly rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  constructor(config: VideoCallConfig) {
    this.config = config;
  }

  async start(isInitiator: boolean): Promise<void> {
    this.isInitiator = isInitiator;
    console.log(`[WebRTC] Starting as ${isInitiator ? 'initiator' : 'receiver'}`);

    try {
      // Get local media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (this.config.localVideoRef.current) {
        this.config.localVideoRef.current.srcObject = this.localStream;
      }

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.rtcConfig);

      // Add local tracks
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Handle remote tracks
      this.peerConnection.ontrack = (event) => {
        console.log('[WebRTC] Received remote track');
        if (this.config.remoteVideoRef.current && event.streams[0]) {
          this.config.remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[WebRTC] Sending ICE candidate');
          this.sendSignal({
            type: 'ice-candidate',
            candidate: event.candidate,
          });
        }
      };

      // Handle connection state
      this.peerConnection.onconnectionstatechange = () => {
        console.log('[WebRTC] Connection state:', this.peerConnection?.connectionState);
        this.config.onConnectionStateChange?.(this.peerConnection!.connectionState);
      };

      // Setup signaling channel
      await this.setupSignaling();

      // If initiator, create offer
      if (isInitiator) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.sendSignal({ type: 'offer', sdp: offer });
      }
    } catch (error) {
      console.error('[WebRTC] Error starting:', error);
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  private async setupSignaling(): Promise<void> {
    const channelName = `teleconsult-${this.config.sessionId}`;
    console.log('[WebRTC] Setting up signaling channel:', channelName);

    this.channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    this.channel.on('broadcast', { event: 'signal' }, async ({ payload }) => {
      console.log('[WebRTC] Received signal:', payload.type);
      await this.handleSignal(payload);
    });

    await this.channel.subscribe();
  }

  private sendSignal(data: any): void {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: data,
      });
    }
  }

  private async handleSignal(signal: any): Promise<void> {
    if (!this.peerConnection) return;

    try {
      if (signal.type === 'offer') {
        console.log('[WebRTC] Handling offer');
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.sendSignal({ type: 'answer', sdp: answer });
      } else if (signal.type === 'answer') {
        console.log('[WebRTC] Handling answer');
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === 'ice-candidate') {
        console.log('[WebRTC] Adding ICE candidate');
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    } catch (error) {
      console.error('[WebRTC] Error handling signal:', error);
    }
  }

  toggleVideo(enabled: boolean): void {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  toggleAudio(enabled: boolean): void {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  async stop(): Promise<void> {
    console.log('[WebRTC] Stopping');
    
    // Stop local tracks
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;

    // Close peer connection
    this.peerConnection?.close();
    this.peerConnection = null;

    // Unsubscribe from channel
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
