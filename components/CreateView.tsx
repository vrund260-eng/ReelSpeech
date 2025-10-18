import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { Video } from '../types';
import Icon from './Icon';

interface CreateViewProps {
  onPostVideo: (video: Omit<Video, 'id' | 'user' | 'likes' | 'comments' | 'shares'>) => void;
}

type CreateMode = 'generate' | 'upload';

const GeneratePanel: React.FC<{ onPostVideo: CreateViewProps['onPostVideo'] }> = ({ onPostVideo }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      const videoUrl = await generateVideo(prompt);
      setGeneratedVideoUrl(videoUrl);
    } catch (e: any) {
      setError(e.message || 'Failed to generate video. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = () => {
    if (!generatedVideoUrl) return;
    onPostVideo({
        src: generatedVideoUrl,
        caption: prompt,
        audioName: 'Generated with AI'
    });
  }

  if (generatedVideoUrl) {
    return (
        <div className="w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Your Masterpiece!</h2>
            <video
              src={generatedVideoUrl}
              controls
              autoPlay
              loop
              className="w-full rounded-lg aspect-[9/16] object-cover"
            />
            <div className="mt-4 flex gap-4 justify-center">
                <button onClick={handlePost} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg">
                    Post
                </button>
                 <button 
                    onClick={() => {
                        setGeneratedVideoUrl(null);
                        setPrompt('');
                    }}
                    className="border border-gray-600 hover:bg-gray-800 text-gray-300 font-bold py-2 px-6 rounded-lg">
                    Create Another
                </button>
            </div>
        </div>
    )
  }

  return (
    <div className="w-full max-w-2xl text-center">
      <h1 className="text-3xl font-bold mb-2">Create with AI</h1>
      <p className="text-gray-400 mb-8">Describe the video you want to create. Let your imagination run wild!</p>
      
      <div className="relative w-full mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A neon hologram of a cat driving at top speed"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
          disabled={isLoading}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        className="bg-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {isLoading && (
          <div className="mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <p className="mt-4 mb-2">AI is thinking... this can take a few minutes.</p>
              <p className="text-sm text-gray-400">While you wait, why not think about your next masterpiece?</p>
          </div>
      )}
    </div>
  )
}

const UploadPanel: React.FC<{ onPostVideo: CreateViewProps['onPostVideo'] }> = ({ onPostVideo }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith('video/')) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            setError(null);
        } else {
            setError('Please select a valid video file.');
        }
    };

    const handlePost = () => {
        if (!previewUrl || !caption.trim() || !file) return;
        onPostVideo({
            src: previewUrl,
            caption: caption,
            audioName: `Original Audio - ${file.name}`
        });
    }
    
    if (previewUrl) {
         return (
            <div className="w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4">Preview & Post</h2>
                <video
                    src={previewUrl}
                    controls
                    loop
                    className="w-full rounded-lg aspect-[9/16] object-cover bg-black"
                />
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
                    <button onClick={() => { setFile(null); setPreviewUrl(null); setCaption(''); }} className="border border-gray-600 hover:bg-gray-800 text-gray-300 font-bold py-2 px-6 rounded-lg">
                        Cancel
                    </button>
                </div>
          </div>
         )
    }

    return (
        <div className="w-full max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
            <p className="text-gray-400 mb-8">Select a video from your device to share with the world.</p>
            <label htmlFor="video-upload" className="cursor-pointer bg-gray-800 border border-dashed border-gray-600 rounded-lg p-10 flex flex-col items-center justify-center hover:border-pink-500 hover:bg-gray-700 transition-colors">
                 <Icon type="upload" className="h-12 w-12 text-gray-400 mb-2" />
                 <span className="font-semibold">Click to select a video</span>
                 <span className="text-sm text-gray-500">MP4, WebM, Ogg (Max 100MB)</span>
            </label>
            <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    )
}


const CreateView: React.FC<CreateViewProps> = ({ onPostVideo }) => {
  const [mode, setMode] = useState<CreateMode>('generate');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
        setIsOnline(false);
        setMode('upload'); // Switch to upload if user goes offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
        setMode('upload');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white">
      <div className="flex-shrink-0 border-b border-gray-700">
        <div className="flex justify-center items-stretch">
          <button
            onClick={() => setMode('generate')}
            disabled={!isOnline}
            className={`flex-1 py-4 text-center font-semibold flex items-center justify-center gap-2 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed ${mode === 'generate' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Icon type="sparkles" className="h-5 w-5" />
            Generate
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-4 text-center font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'upload' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Icon type="upload" className="h-5 w-5" />
            Upload
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        {!isOnline && mode === 'generate' && (
            <div className="text-center text-gray-400">
                <p>AI Generation is unavailable offline.</p>
                <p>Please connect to the internet to use this feature.</p>
            </div>
        )}
        {mode === 'generate' && isOnline && <GeneratePanel onPostVideo={onPostVideo} />}
        {mode === 'upload' && <UploadPanel onPostVideo={onPostVideo} />}
      </div>
    </div>
  );
};

export default CreateView;
