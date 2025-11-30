
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Mic, Sparkles, StopCircle, User, Bot, Minimize2, Monitor, MonitorX, Loader2, Zap, Command, Navigation } from 'lucide-react';
import { generateChatResponse, connectToLiveSession, createBlob, decode, decodeAudioData, convertFloat32ToInt16 } from '../services/geminiService';
import { t } from '../services/translationService';
import type { LiveServerMessage } from '@google/genai';
import type { ChatMessage, ViewState, Language } from '../types';

interface SonicAIProps {
    onNavigate: (view: ViewState) => void;
    isOpen: boolean;
    onToggle: () => void;
    voiceMode: boolean;
    onVoiceActivate: () => void;
    language: Language;
}

export default function SonicAI({ onNavigate, isOpen, onToggle, voiceMode, onVoiceActivate, language }: SonicAIProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [voiceStatus, setVoiceStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [transcription, setTranscription] = useState<{user: string, model: string}>({ user: '', model: '' });
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: language === 'hi' ? "नमस्ते! मैं सोनिक एआई हूँ।" : (language === 'bh' ? "प्रणाम! हम सोनिक एआई हईं।" : "Namaste! I am Sonic AI."),
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // LIVE API REFS
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const orbRef = useRef<HTMLDivElement>(null); // References the glow effect
  
  const sessionRef = useRef<any>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const isConnectedRef = useRef(false);
  
  const screenStreamRef = useRef<MediaStream | null>(null);
  
  // Robust check for screen share support
  const isScreenShareSupported = typeof navigator !== 'undefined' && 
                                 !!navigator.mediaDevices && 
                                 typeof navigator.mediaDevices.getDisplayMedia === 'function';

  const SUGGESTIONS = [
      "Open Tools Hub",
      "Go to Settings",
      "Apply for PAN Card",
      "Navigate to Profile"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]); // Scroll when messages update or loading state changes

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 300);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const visualize = () => {
    if (!analyserRef.current || !orbRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    // Focus on lower frequencies for voice
    for (let i = 0; i < bufferLength / 2; i++) {
        sum += dataArray[i];
    }
    const avg = sum / (bufferLength / 2);

    // Dynamic Scaling based on volume
    // Base scale 1, max scale ~1.5
    const scale = 1 + (avg / 255) * 0.6; 
    const opacity = 0.4 + (avg / 255) * 0.6;
    const hueRotation = avg; // Rotate hue based on intensity

    orbRef.current.style.transform = `scale(${scale})`;
    orbRef.current.style.opacity = opacity.toString();
    orbRef.current.style.filter = `hue-rotate(${hueRotation}deg) blur(${20 + avg/10}px)`;
    
    // Add box shadow for extra glow
    orbRef.current.style.boxShadow = `0 0 ${30 + avg}px rgba(40, 231, 255, ${opacity * 0.5})`;

    animationFrameRef.current = requestAnimationFrame(visualize);
  };

  useEffect(() => {
      if (voiceMode) {
          startLiveSession();
      } else {
          stopLiveSession();
      }
      return () => {
          stopLiveSession();
      };
  }, [voiceMode]);

  const startLiveSession = async () => {
      setVoiceStatus('connecting');
      setTranscription({ user: '', model: '' });
      setCommandFeedback(null);
      isConnectedRef.current = false;
      
      try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
              audioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
          }
          if (!outputContextRef.current || outputContextRef.current.state === 'closed') {
              outputContextRef.current = new AudioContextClass({ sampleRate: 24000 });
          }

          if (!analyserRef.current && outputContextRef.current) {
              analyserRef.current = outputContextRef.current.createAnalyser();
              analyserRef.current.fftSize = 64; // Smaller FFT for smoother visual
              analyserRef.current.smoothingTimeConstant = 0.8;
              analyserRef.current.connect(outputContextRef.current.destination);
          }

          visualize();

          // Enhanced Audio Constraints
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
                echoCancellation: true, 
                noiseSuppression: true, 
                autoGainControl: true,
                channelCount: 1
            } 
          });
          
          const sessionPromise = connectToLiveSession({
              onOpen: () => {
                  setVoiceStatus('connected');
                  setIsListening(true);
                  isConnectedRef.current = true;
                  
                  if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
                  
                  try {
                      if (audioContextRef.current.state === 'suspended') {
                          audioContextRef.current.resume();
                      }

                      // Create separate analyser for input visualization if needed, 
                      // but currently visualizing output/speaking is usually preferred for the AI orb.
                      // To visualize INPUT (user speaking), we would attach another analyser here.
                      
                      const source = audioContextRef.current.createMediaStreamSource(stream);
                      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                      
                      // Optional: Visualize Input
                      const inputAnalyser = audioContextRef.current.createAnalyser();
                      inputAnalyser.fftSize = 64;
                      source.connect(inputAnalyser);

                      // Update visualizer to switch between input/output based on who is talking
                      // For simplicity, we just visualize the active audio context destination in the main loop, 
                      // but we can augment it later.

                      processor.onaudioprocess = (e) => {
                          const inputData = e.inputBuffer.getChannelData(0);
                          if (!isConnectedRef.current) return;

                          // Check input levels for visual feedback
                          let sum = 0;
                          for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                          const rms = Math.sqrt(sum / inputData.length);
                          if(rms > 0.05 && orbRef.current && !isSpeaking) {
                               // Manual simple visualization for input
                               const scale = 1 + rms * 2; 
                               orbRef.current.style.transform = `scale(${Math.min(scale, 1.3)})`;
                               orbRef.current.style.opacity = '0.8';
                               orbRef.current.style.borderColor = '#28E7FF'; 
                          }

                          const blob = createBlob(inputData);
                          
                          sessionPromise.then(session => {
                              try {
                                  session.sendRealtimeInput({ media: blob });
                              } catch(err) { /* silent */ }
                          }).catch(() => { /* silent */ });
                      };
                      
                      source.connect(processor);
                      processor.connect(audioContextRef.current.destination);
                      
                      sourceNodeRef.current = source;
                      processorRef.current = processor;
                  } catch(e) {
                      console.error("Audio Context Setup Error", e);
                      setVoiceStatus('error');
                  }
              },
              onMessage: async (msg: LiveServerMessage) => {
                  if (msg.serverContent?.outputTranscription) {
                      const text = msg.serverContent.outputTranscription.text;
                      if(text) setTranscription(prev => ({ ...prev, model: prev.model + text }));
                  }
                  if (msg.serverContent?.inputTranscription) {
                      const text = msg.serverContent.inputTranscription.text;
                      if(text) setTranscription(prev => ({ ...prev, user: prev.user + text }));
                  }
                  
                  if (msg.serverContent?.turnComplete) {
                      setTimeout(() => setTranscription({ user: '', model: '' }), 4000);
                  }

                  if (msg.toolCall) {
                      for (const fc of msg.toolCall.functionCalls) {
                          if (fc.name === 'navigate') {
                              const destination = (fc.args as any).destination;
                              if (destination) {
                                  // VISUAL FEEDBACK FOR COMMAND
                                  const destName = destination.charAt(0).toUpperCase() + destination.slice(1);
                                  setCommandFeedback(`🚀 Navigating to ${destName}...`);
                                  
                                  // Perform navigation
                                  onNavigate(destination as ViewState);
                                  
                                  // Clear feedback after 3s
                                  setTimeout(() => setCommandFeedback(null), 3000);

                                  sessionPromise.then(session => {
                                      session.sendToolResponse({
                                          functionResponses: {
                                              id: fc.id,
                                              name: fc.name,
                                              response: { result: "success" }
                                          }
                                      });
                                  });
                              }
                          }
                      }
                  }

                  const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                  if (base64Audio && outputContextRef.current && outputContextRef.current.state !== 'closed') {
                      try {
                          const audioBuffer = await decodeAudioData(
                              decode(base64Audio),
                              outputContextRef.current,
                              24000,
                              1
                          );
                          playAudioChunk(audioBuffer);
                      } catch (e) {
                          console.error("Audio Decode Error", e);
                      }
                  }
                  
                  if (msg.serverContent?.interrupted) {
                      stopAudioQueue();
                      setTranscription(prev => ({ ...prev, model: '' }));
                  }
              },
              onClose: () => {
                  setVoiceStatus('disconnected');
                  setIsListening(false);
                  isConnectedRef.current = false;
                  stopScreenShare();
              },
              onError: (e) => {
                  console.error("Live Session Error", e);
                  setVoiceStatus('error');
                  stopLiveSession();
              }
          });
          
          sessionPromise.catch(e => {
            console.error("Failed to connect", e);
            setVoiceStatus('error');
          });

          sessionRef.current = sessionPromise;

      } catch (err) {
          console.error("Failed to start live session", err);
          setVoiceStatus('error');
      }
  };

  const stopLiveSession = () => {
      isConnectedRef.current = false;
      stopScreenShare();

      if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
      }

      if (sourceNodeRef.current) {
          try { sourceNodeRef.current.disconnect(); } catch (e) { }
      }
      if (processorRef.current) {
          try { processorRef.current.disconnect(); } catch (e) { }
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          try { audioContextRef.current.close(); } catch (e) { }
      }
      if (outputContextRef.current && outputContextRef.current.state !== 'closed') {
          try { outputContextRef.current.close(); } catch (e) { }
      }
      
      analyserRef.current = null;
      
      if (sessionRef.current) {
          sessionRef.current.then((s: any) => {
              try { s.close(); } catch (e) { }
          }).catch(() => {});
      }
      
      if (voiceStatus !== 'error') setVoiceStatus('disconnected');
      setIsListening(false);
      audioQueueRef.current = [];
      nextStartTimeRef.current = 0;
      setIsSpeaking(false);
  };

  const playAudioChunk = (buffer: AudioBuffer) => {
      if (!outputContextRef.current || outputContextRef.current.state === 'closed') return;
      
      try {
          const ctx = outputContextRef.current;
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          
          if (analyserRef.current) {
              source.connect(analyserRef.current);
          } else {
              source.connect(ctx.destination);
          }
          
          const currentTime = ctx.currentTime;
          const startTime = Math.max(currentTime, nextStartTimeRef.current);
          source.start(startTime);
          nextStartTimeRef.current = startTime + buffer.duration;
          
          audioQueueRef.current.push(source);
          source.onended = () => {
             const index = audioQueueRef.current.indexOf(source);
             if (index > -1) audioQueueRef.current.splice(index, 1);
             if (audioQueueRef.current.length === 0) setIsSpeaking(false);
          };
          
          setIsSpeaking(true);
      } catch (e) {
          console.error("Audio Playback Error", e);
      }
  };

  const stopAudioQueue = () => {
      audioQueueRef.current.forEach(source => {
          try { source.stop(); } catch (e) { }
      });
      audioQueueRef.current = [];
      nextStartTimeRef.current = 0;
      setIsSpeaking(false);
  };

  const startScreenShare = async () => {
      if (!isScreenShareSupported) {
          alert("Screen sharing is not supported on this device or browser.");
          return;
      }

      try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
          screenStreamRef.current = stream;
          setIsScreenSharing(true);
          
          stream.getVideoTracks()[0].onended = () => {
              stopScreenShare();
          };
      } catch (err) {
          console.error("Screen Share Error", err);
          if ((err as any).name !== 'NotAllowedError') {
             console.warn("Could not start screen sharing.", err);
          }
      }
  };

  const stopScreenShare = () => {
      if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
  };

  useEffect(() => {
    if (!isScreenSharing || !screenStreamRef.current) return;

    const video = document.createElement('video');
    video.srcObject = screenStreamRef.current;
    video.muted = true;
    video.play();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const interval = setInterval(() => {
        if (!isConnectedRef.current || !sessionRef.current) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
            const MAX_WIDTH = 640;
            const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
            
            canvas.width = video.videoWidth * scale;
            canvas.height = video.videoHeight * scale;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const base64Data = canvas.toDataURL('image/jpeg', 0.4).split(',')[1];
            
            sessionRef.current.then((session: any) => {
                try {
                    session.sendRealtimeInput({
                        media: {
                            mimeType: 'image/jpeg',
                            data: base64Data
                        }
                    });
                } catch(e) { }
            });
        }
    }, 1000);

    return () => {
        clearInterval(interval);
        video.pause();
        video.srcObject = null;
    }
  }, [isScreenSharing]);

  const handleSend = async (manualText?: string) => {
    const textToSend = manualText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages
      .filter(m => m.id !== '1')
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

    try {
      let responseText = await generateChatResponse(userMsg.text, history);
      
      const navMatch = responseText.match(/\[NAVIGATE:([a-z_]+)\]/);
      if (navMatch && navMatch[1]) {
          const targetView = navMatch[1] as ViewState;
          onNavigate(targetView);
          responseText = responseText.replace(/\[NAVIGATE:[a-z_]+\]/g, '').trim();
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- TYPING INDICATOR COMPONENT ---
  const TypingIndicator = () => (
      <div className="flex justify-start gap-2 animate-slide-up pb-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-electric flex items-center justify-center shrink-0 shadow-lg shadow-electric/20 bg-electric/10">
              <Zap size={14} className="text-electric fill-current" />
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-white/10 flex items-center">
              <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-royal/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-royal/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-royal/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
          </div>
      </div>
  );

  if (voiceMode) {
      // Logic for Thinking State in Voice Mode
      const isVoiceThinking = !!transcription.user && !transcription.model;

      if (isMinimized) {
        return (
            <div className="fixed bottom-28 right-4 z-[70] animate-fade-in flex flex-col gap-3">
                 <button 
                    onClick={() => setIsMinimized(false)}
                    className="w-14 h-14 rounded-full bg-royal text-white shadow-xl flex items-center justify-center animate-pulse border-2 border-white/20"
                 >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600">
                        <Zap size={24} className="text-white fill-current" />
                    </div>
                 </button>
            </div>
        );
      }

      return (
          <div 
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center animate-fade-in"
            role="dialog"
            aria-label="Sonic AI Voice Mode"
          >
              <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
                  <button onClick={() => setIsMinimized(true)} className="text-white/60 hover:text-white transition-colors">
                      <Minimize2 size={24} />
                  </button>
                  <button onClick={onToggle} className="text-white/60 hover:text-white transition-colors">
                      <X size={28} />
                  </button>
              </div>

              {/* MAIN GEMINI-STYLE ORB INTERFACE */}
              <div className="relative flex items-center justify-center mb-16">
                  {/* Dynamic Glow Layer */}
                  <div 
                      ref={orbRef}
                      className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 blur-3xl opacity-40 transition-all duration-75 ease-out will-change-transform"
                  ></div>

                  {/* Thinking Pulse Layer */}
                  {isVoiceThinking && (
                      <div className="absolute w-56 h-56 rounded-full border-4 border-electric/30 animate-[ping_1.5s_infinite]"></div>
                  )}

                  {/* Rotating Gradient Ring */}
                  <div className={`relative w-48 h-48 rounded-full p-[3px] ${isSpeaking ? 'animate-[spin_4s_linear_infinite]' : 'animate-[spin_10s_linear_infinite]'}`}>
                       <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 blur-sm"></div>
                       <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm m-1"></div>
                  </div>

                  {/* Central Logo */}
                  <div className="absolute w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-700 border-4 border-white/10 shadow-2xl z-10 overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                      <Zap size={80} className="text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] animate-pulse-slow relative z-10" />
                  </div>
                  
                  {/* Status Labels */}
                  {voiceStatus === 'connecting' && <div className="absolute -bottom-16 text-xs font-bold text-white tracking-widest animate-pulse">CONNECTING TO NEURAL NET...</div>}
                  {voiceStatus === 'error' && <div className="absolute -bottom-16 text-xs font-bold text-red-400 tracking-widest">CONNECTION ERROR</div>}

                  {/* Command Feedback Overlay */}
                  {commandFeedback && (
                      <div className="absolute top-[-80px] bg-royal/90 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-slide-up flex items-center gap-2 border border-white/20 backdrop-blur-md">
                          <Navigation size={18} className="animate-bounce" /> {commandFeedback}
                      </div>
                  )}
              </div>

              {/* TRANSCRIPTIONS & STATUS */}
              <div className="w-full max-w-lg px-6 text-center space-y-4 min-h-[120px] flex flex-col justify-end relative z-10">
                  {transcription.user && (
                      <p className="text-xl font-medium text-gray-300 animate-slide-up leading-relaxed">"{transcription.user}"</p>
                  )}
                  {transcription.model && (
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white animate-fade-in leading-relaxed drop-shadow-lg">
                          {transcription.model}
                      </p>
                  )}
                  
                  {/* Voice Status Text Indicators */}
                  {voiceStatus === 'connected' && (
                      <div className="flex flex-col items-center gap-2 mt-4 h-8">
                        {isSpeaking ? (
                            <div className="flex items-center gap-2">
                                <span className="flex gap-1">
                                    <span className="w-1 h-3 bg-electric animate-[bounce_1s_infinite]"></span>
                                    <span className="w-1 h-5 bg-electric animate-[bounce_1.2s_infinite]"></span>
                                    <span className="w-1 h-3 bg-electric animate-[bounce_1s_infinite]"></span>
                                </span>
                                <p className="text-sm text-electric font-bold tracking-widest uppercase">
                                    Sonic AI Speaking...
                                </p>
                            </div>
                        ) : (
                            <>
                                {isVoiceThinking ? (
                                    <p className="text-sm text-purple-300 font-bold tracking-widest uppercase animate-pulse flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin" /> Sonic AI is thinking...
                                    </p>
                                ) : (
                                    !transcription.model && (
                                        <p className="text-sm text-gray-500 font-bold tracking-widest uppercase animate-pulse flex items-center gap-2">
                                            <Mic size={14} /> Listening for commands...
                                        </p>
                                    )
                                )}
                            </>
                        )}

                        {isScreenSharing && (
                            <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1 animate-pulse mt-1 absolute -top-8">
                                <Monitor size={10} /> ANALYZING SCREEN
                            </span>
                        )}
                      </div>
                  )}
              </div>

              {/* CONTROLS */}
              <div className="absolute bottom-10 flex items-center gap-6 z-20">
                  {isScreenShareSupported && (
                    <button
                        onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                        className={`p-4 rounded-full transition-all duration-300 backdrop-blur-md border ${isScreenSharing ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                        title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen for Guidance"}
                    >
                        {isScreenSharing ? <MonitorX size={24} /> : <Monitor size={24} />}
                    </button>
                  )}

                  <button 
                    className={`p-6 rounded-full transition-all duration-300 relative group overflow-hidden shadow-2xl ${isSpeaking ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`}
                    onClick={() => {
                        stopAudioQueue();
                    }}
                  >
                      {isSpeaking ? <StopCircle size={32} className="text-white relative z-10" /> : <Mic size={32} className="text-white relative z-10" />}
                  </button>
                  <button 
                    onClick={() => { onToggle(); }} 
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 backdrop-blur-md"
                    aria-label="Switch to Text Chat"
                  >
                      <MessageCircle size={24} />
                  </button>
              </div>
          </div>
      );
  }

  if (!isOpen) {
      return (
        <div className="fixed bottom-24 right-4 z-50">
             <button
              onClick={onToggle}
              className="bg-gradient-to-r from-royal to-electric text-white p-4 rounded-full shadow-2xl shadow-royal/40 animate-bounce hover:scale-105 transition-transform group border-2 border-white/20"
              aria-label="Open Sonic AI Assistant"
            >
              <Sparkles size={28} className="group-hover:rotate-12 transition-transform duration-500" />
            </button>
        </div>
      );
  }

  return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity duration-300" onClick={onToggle} />
          
          <div 
            className="bg-white dark:bg-deep-light w-full sm:max-w-md h-[92vh] sm:h-[700px] sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-white/10 pointer-events-auto transform transition-transform duration-300 animate-slide-up"
            role="dialog"
            aria-label="Sonic AI Chat"
          >
            
            <div className="p-4 bg-gradient-to-r from-royal to-deep flex justify-between items-center text-white shrink-0 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-md flex items-center justify-center bg-white/10 backdrop-blur-md">
                     <Zap size={20} className="text-white fill-white" />
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-tight tracking-wide">Sonic AI</h3>
                    <div className="flex items-center gap-1.5" role="status" aria-label="Status Online">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Online</p>
                    </div>
                </div>
              </div>
              <button onClick={onToggle} className="hover:bg-white/20 p-2 rounded-full transition-colors active:scale-90" aria-label="Close Chat">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-[#0b0f24] scrollbar-hide" role="log" aria-live="polite">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-slide-up`}>
                    <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 ${isUser ? 'bg-royal/10 border-royal text-royal' : 'border-electric shadow-lg shadow-electric/20 bg-electric/10'}`}>
                             {isUser ? <User size={14} /> : <Zap size={14} className="text-electric fill-current" />}
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${isUser ? 'bg-gradient-to-br from-royal to-royal-dark text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-gray-100 text-gray-800 rounded-tl-none border border-gray-100 dark:border-white/10'}`}>
                                {msg.text}
                            </div>
                            <span className={`text-[9px] text-gray-400 ${isUser ? 'text-right' : 'text-left'} px-1`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Dynamic Typing Indicator */}
              {isLoading && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white dark:bg-deep-light border-t border-gray-200 dark:border-white/10 shrink-0">
                {messages.length < 3 && !isLoading && (
                    <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
                        {SUGGESTIONS.map((s, i) => (
                            <button key={i} onClick={() => handleSend(s)} className="whitespace-nowrap px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-royal hover:text-white hover:border-royal transition-all active:scale-95">
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <div className="p-4 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input 
                            ref={inputRef} 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                            placeholder={t('voice.ask', language)} 
                            className={`w-full bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-white rounded-2xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-royal/50 text-sm transition-all font-medium placeholder-gray-400`} 
                            disabled={isLoading} 
                            aria-label="Message Input"
                        />
                        {input.length > 0 && <button onClick={() => setInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1" aria-label="Clear Input"><X size={14} /></button>}
                    </div>
                    <button 
                        onClick={() => handleSend()} 
                        disabled={!input.trim() || isLoading} 
                        className="w-12 h-12 bg-royal text-white rounded-full flex items-center justify-center hover:bg-royal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-royal/30 active:scale-90 shrink-0"
                        aria-label="Send Message"
                    >
                        <Send size={20} className={input.trim() ? "translate-x-0.5" : ""} />
                    </button>
                    {/* Voice activation from text mode */}
                    <button 
                        onClick={onVoiceActivate}
                        className="w-12 h-12 bg-gray-100 dark:bg-slate-800 text-royal rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-white/10 shrink-0"
                        aria-label="Switch to Voice Mode"
                    >
                        <Mic size={20} />
                    </button>
                </div>
            </div>
          </div>
        </div>
  );
}
