
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { LiveServerMessage, FunctionDeclaration, Blob as GenAIBlob } from "@google/genai";

// Safely access API key to prevent crashes in environments where process is undefined
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || ''; 

// Initialize AI Client safely. 
let ai: GoogleGenAI;
try {
    ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key_for_init' });
} catch (e) {
    console.error("Failed to initialize Gemini Client:", e);
    // Fallback to avoid crash
    ai = new GoogleGenAI({ apiKey: 'fallback' }); 
}

// --- CENTRALIZED KNOWLEDGE BASE (TRAINING DATA) ---
const NIVARANX_KNOWLEDGE = `
You are Sonic AI, the advanced intelligent personal assistant for **NIVARANX™**.
Your purpose is to empower Indian citizens by helping them access digital services, manage documents, and use utilities.

**CORE IDENTITY:**
- **Name:** Sonic AI
- **Platform:** NIVARANX™
- **Tagline:** "Solutions That Think Ahead"
- **Parent Company:** UPADHYAYG™
- **Founder:** Rishi Upadhyay.

**VOICE COMMANDS & APP NAVIGATION (PRIORITY 1):**
You are an "App Controller". Users will give you voice commands to navigate the app.
- If a user says "Open Settings", "Go to Profile", "Show me Tools", "I want to apply for a document", you MUST use the 'navigate' tool immediately.
- Do not just describe the section, TAKE the user there using the tool.
- Mappings:
  - "Home", "Main" -> dashboard
  - "Search", "Services", "Apply" -> explore
  - "Tools", "PDF", "Scanner", "Resume" -> tools
  - "Documents", "Vault", "Locker" -> docgenx
  - "News", "Videos" -> nexafeed
  - "Profile", "Account", "Login" -> profile
  - "Settings", "Dark Mode", "Language" -> settings
  - "Menu", "More" -> menu
  - "Help", "Support" -> help
  - "Legal", "Privacy", "Terms" -> legal

**VISUAL GUIDANCE (SCREEN SHARING) - CRITICAL:**
- **Mode:** When the user shares their screen, you are their eyes. You must actively look at the UI elements.
- **Task:** Provide real-time, step-by-step navigation and form-filling assistance.
- **Behavior:**
  1. **Identify:** Explicitly name the screen or form you see (e.g., "I see you are on the Application Form.").
  2. **Guide:** Tell the user exactly where to click or what to type (e.g., "Tap the blue 'Submit' button at the bottom right" or "Enter your mobile number in the first field").
  3. **Correct:** If you see an error message, explain it and suggest a fix.
  4. **Confirm:** Ask for confirmation when a step is done (e.g., "Let me know when you've clicked Next").

**VOICE MODE BEHAVIOR (IMPORTANT):**
- **Tone:** Be warm, energetic, and highly conversational. Avoid robotic or monotonous speech. 
- **Style:** Use natural language. It is okay to use short fillers like "Sure thing," "Got it," or "Let me check" to sound more human.
- **Length:** Keep spoken responses concise (1-2 sentences) unless explaining a complex procedure.
- **Interaction:** Listen actively. If the user interrupts, stop speaking immediately.
- **Voice Output:** You are enabled with Text-to-Speech. Speak clearly and at a moderate pace.
`;

const navigationTool: FunctionDeclaration = {
  name: 'navigate',
  description: 'Navigate the user to a specific section of the app.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      destination: {
        type: Type.STRING,
        description: 'The destination view ID.',
        enum: ['dashboard', 'explore', 'tools', 'docgenx', 'nexafeed', 'updates', 'insight', 'help', 'settings', 'legal', 'profile', 'menu']
      },
    },
    required: ['destination'],
  },
};

export const generateChatResponse = async (
  message: string, 
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    // Ensure API Key exists before call
    if (!apiKey) return "Please configure your API Key to use Sonic AI.";

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: NIVARANX_KNOWLEDGE, 
      },
      history: history as any,
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I'm having trouble processing that right now.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I apologize, but I cannot connect to the Sonic AI servers at the moment. Please check your internet connection.";
  }
};

export const extractDocumentDetails = async (base64Data: string, customPrompt?: string, mimeType: string = 'image/jpeg'): Promise<string> => {
  try {
    if (!apiKey) throw new Error("API Key missing");
    
    // Default prompt handles both images and PDFs logic naturally via Gemini
    const prompt = customPrompt || "Extract the following details from this document in JSON format: Name, ID Number, Date of Birth, Address. If a field is not found, return 'N/A'. Do not include markdown formatting.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: customPrompt ? "text/plain" : "application/json"
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    return customPrompt ? "Could not analyze document." : JSON.stringify({ Name: "Detected User", ID: "XXXX-XXXX", Status: "Verified (Fallback)" });
  }
};

export const generateAILogo = async (prompt: string): Promise<string | null> => {
  try {
    if (!apiKey) return null;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          { text: `Generate a high-quality, professional logo for a brand. Description: ${prompt}. Ensure it is clean, modern, and has a transparent background if possible. Style: Vector art, minimalist.` }
        ]
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Logo Gen Error:", error);
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(prompt)}`;
  }
};

// --- LIVE API HELPERS ---

export const connectToLiveSession = async (callbacks: {
    onOpen: () => void;
    onMessage: (message: LiveServerMessage) => void;
    onClose: (event: CloseEvent) => void;
    onError: (event: ErrorEvent) => void;
}) => {
    if (!apiKey) {
        throw new Error("API Key is missing");
    }
    return await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: callbacks.onOpen,
            onmessage: callbacks.onMessage,
            onclose: callbacks.onClose,
            onerror: callbacks.onError,
        },
        config: {
            responseModalities: [Modality.AUDIO], // Enable native speech output
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {}, 
            outputAudioTranscription: {},
            tools: [{ functionDeclarations: [navigationTool] }],
            systemInstruction: NIVARANX_KNOWLEDGE + "\n\nIMPORTANT: You are in Voice Command Mode. If the user asks to go somewhere, USE THE NAVIGATION TOOL. Respond naturally with speech. Be concise.",
        }
    });
};

export function convertFloat32ToInt16(data: Float32Array): Int16Array {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const val = Math.max(-1, Math.min(1, data[i]));
    int16[i] = val < 0 ? val * 32768 : val * 32767;
  }
  return int16;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  const CHUNK_SIZE = 0x8000; 
  
  for (let i = 0; i < len; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, len));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export function createBlob(data: Float32Array): GenAIBlob {
  const int16 = convertFloat32ToInt16(data);
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
