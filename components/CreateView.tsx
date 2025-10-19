import React, { useState, useEffect } from 'react';
import { Video } from '../types';
import Icon from './Icon';

interface CreateViewProps {
  onPostVideo: (videoData: { file: File, caption: string, audioName: string }) => void;
}

const CreateView: React.FC<CreateViewProps> = ({ onPostVideo }) => {
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
        setError(null);
    }

    useEffect(() => {
        // Clean up the object URL when the component unmounts to prevent memory leaks
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        }
    }, [previewUrl]);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            {previewUrl ? (
                <div className="w-full max-w-md text-center flex flex-col h-full justify-center">
                    <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Preview & Post</h2>
                    <div className="flex-grow flex items-center justify-center min-h-0">
                      <video
                          src={previewUrl}
                          controls
                          loop
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
            ) : (
                <div className="w-full max-w-2xl text-center">
                    <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
                    <p className="text-gray-400 mb-8">Select a video from your device to share with the world.</p>
                    <label htmlFor="video-upload" className="cursor-pointer bg-gray-800 border border-dashed border-gray-600 rounded-lg p-10 flex flex-col items-center justify-center hover:border-pink-500 hover:bg-gray-700 transition-colors">
                         <Icon type="upload" className="h-12 w-12 text-gray-400 mb-2" />
                         <span className="font-semibold">Click to select a video</span>
                         <span className="text-sm text-gray-500">MP4, WebM, Ogg</span>
                    </label>
                    <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default CreateView;