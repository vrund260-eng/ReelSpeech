import React, { useState, useEffect, useRef } from 'react';
import { Video } from '../types';
import Icon from './Icon';
import { generateVideo } from '../services/geminiService';

interface CreateViewProps {
  onPostVideo: (videoData: { file: File, caption: string, audioName: string }) => void;
}

// Reassuring messages to show during the video generation process
const loadingMessages = [
    "Warming up the AI...",
    "Brewing some creative digital coffee...",
    "Teaching pixels to dance...",
    "Reticulating splines...",
    "This can take a few minutes...",
    "Composing a visual masterpiece...",
    "The AI is deep in thought...",
    "Almost there, adding the finishing touches...",
];

const CreateView: React.FC<CreateViewProps> = ({ onPostVideo }) => {
    const [mode, setMode] = useState<'upload' | 'generate'>('upload');
    
    // Upload state
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    // Generation state
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const messageIntervalRef = useRef<number | null>(null);
    
    const checkApiKey = async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeyReady(hasKey);
        } else {
            // Fallback for environments where aistudio is not available, assuming key is set
            setApiKeyReady(!!process.env.API_KEY);
        }
    };

    useEffect(() => {
        if (mode === 'generate') {
            checkApiKey();
        }
    }, [mode]);
    
    useEffect(() => {
        if (isGenerating) {
            messageIntervalRef.current = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 4000);
        } else if (messageIntervalRef.current) {
            clearInterval(messageIntervalRef.current);
            messageIntervalRef.current = null;
        }
        
        return () => {
            if (messageIntervalRef.current) {
                clearInterval(messageIntervalRef.current);
            }
        }
    }, [isGenerating]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith('video/')) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            setUploadError(null);
        } else {
            setUploadError('Please select a valid video file.');
            e.target.value = ''; // Reset file input
        }
    };

    const handlePost = () => {
        if (!previewUrl || !caption.trim() || !file) return;
        onPostVideo({
            file: file,
            caption: caption,
            audioName: `Original Audio - ${file.name}`
        });
    }

    const handleCancel = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(null);
        setCaption('');
        setUploadError(null);
        setPrompt('');
        setGenerationError(null);
        setIsGenerating(false);
    }
    
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setGenerationError("Please enter a prompt for the video.");
            return;
        }
        setIsGenerating(true);
        setGenerationError(null);
        setLoadingMessage(loadingMessages[0]);

        try {
            const videoUrl = await generateVideo(prompt);
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const generatedFile = new File([blob], "ai_generated_video.mp4", { type: "video/mp4" });
            
            setFile(generatedFile);
            setPreviewUrl(videoUrl); // Reuse the object URL from the service
            setCaption(prompt); // Pre-fill caption with prompt
        } catch (error: any) {
            setGenerationError(error.message || "An unknown error occurred.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            try {
                await window.aistudio.openSelectKey();
                // After the dialog closes, re-check the key status.
                // We can be optimistic and assume it's ready to provide a faster UX.
                setApiKeyReady(true); 
            } catch (e) {
                console.error("Error opening API key selection:", e);
                setGenerationError("Could not open the API key selection dialog.");
            }
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        }
    }, [previewUrl]);

    const renderUploadView = () => (
        <div className="w-full max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
            <p className="text-gray-400 mb-8">Select a video from your device to share with the world.</p>
            <label htmlFor="video-upload" className="cursor-pointer bg-gray-800 border border-dashed border-gray-600 rounded-lg p-10 flex flex-col items-center justify-center hover:border-pink-500 hover:bg-gray-700 transition-colors">
                 <Icon type="upload" className="h-12 w-12 text-gray-400 mb-2" />
                 <span className="font-semibold">Click to select a video</span>
                 <span className="text-sm text-gray-500">MP4, WebM, Ogg</span>
            </label>
            <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            {uploadError && <p className="text-red-500 mt-4">{uploadError}</p>}
        </div>
    );

    const renderGenerateView = () => {
        if (isGenerating) {
            return (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-lg font-semibold">{loadingMessage}</p>
                    <p className="text-gray-400">AI video generation can take a few minutes.</p>
                </div>
            )
        }
        
        if (!apiKeyReady) {
            return (
                <div className="w-full max-w-2xl text-center bg-gray-800 p-8 rounded-lg">
                    <Icon type="sparkles" className="h-12 w-12 text-pink-400 mb-4 mx-auto" />
                    <h2 className="text-2xl font-bold mb-2">AI Video Generation</h2>
                    <p className="text-gray-400 mb-6">
                        To generate videos with AI, you need to select an API key. 
                        Your key is used securely and is required to access the generative models.
                    </p>
                    <button 
                        onClick={handleSelectKey}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Select API Key
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                        For more information on billing, see the{' '}
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-400">
                            documentation
                        </a>.
                    </p>
                </div>
            )
        }

        return (
             <div className="w-full max-w-2xl text-center">
                <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                    <Icon type="sparkles" className="h-8 w-8 text-pink-400"/>
                    Generate with AI
                </h1>
                <p className="text-gray-400 mb-8">Describe the video you want to create.</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A sloth surfing on a rainbow wave, cinematic 4k"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    Generate Video
                </button>
                 {generationError && <p className="text-red-500 mt-4">{generationError}</p>}
             </div>
        )
    };
    
    const renderPreviewView = () => (
         <div className="w-full max-w-md text-center flex flex-col h-full justify-center">
            <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Preview & Post</h2>
            <div className="flex-grow flex items-center justify-center min-h-0">
              <video
                  src={previewUrl!}
                  controls
                  loop
                  autoPlay
                  className="w-full max-w-full max-h-full rounded-lg aspect-[9/16] object-cover bg-black"
              />
            </div>
            <div className="flex-shrink-0">
                <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mt-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <div className="mt-4 flex gap-4 justify-center">
                    <button onClick={handlePost} disabled={!caption.trim()} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-600">
                        Post
                    </button>
                    <button onClick={handleCancel} className="border border-gray-600 hover:bg-gray-800 text-gray-300 font-bold py-2 px-6 rounded-lg">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );

    if (previewUrl) {
        return (
             <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                {renderPreviewView()}
             </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col items-center justify-start bg-gray-900 text-white p-4">
            <div className="w-full max-w-2xl mb-8">
                 <div className="flex p-1 bg-gray-800 rounded-lg">
                    <button 
                        onClick={() => setMode('upload')}
                        className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${mode === 'upload' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        Upload Video
                    </button>
                    <button 
                        onClick={() => setMode('generate')}
                        className={`w-1/2 py-2 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 ${mode === 'generate' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <Icon type="sparkles" className="h-5 w-5"/>
                        Generate with AI
                    </button>
                </div>
            </div>
            <div className="flex-grow w-full flex items-center justify-center">
                {mode === 'upload' ? renderUploadView() : renderGenerateView()}
            </div>
        </div>
    );
};

export default CreateView;