import { GoogleGenAI, Type } from '@google/genai';
import { User, Video } from '../types';

// A simple in-memory flag to handle the race condition after opening the key selection dialog.
let keySelectionInProgress = false;
// A flag to track if the last used API key was invalid. This provides a better user experience
// by forcing a new key selection on the next attempt after a failure.
let isKeyInvalid = false;

async function ensureApiKey(): Promise<boolean> {
  if (keySelectionInProgress) {
    // Assume key selection was successful if the dialog was just opened.
    // Reset after this check to allow subsequent calls to re-verify.
    keySelectionInProgress = false;
    return true;
  }
  
  const aistudio = window.aistudio;
  if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
    // If we know the key is invalid, we treat it as if no key is selected,
    // which forces the selection dialog to open.
    const hasKey = !isKeyInvalid && await aistudio.hasSelectedApiKey();
    
    if (!hasKey) {
      if (typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
        // Assume the newly selected key is valid until proven otherwise.
        isKeyInvalid = false; 
        keySelectionInProgress = true; // Set flag to handle race condition on next check
        return true; // Assume success after opening dialog
      }
      return false; // Cannot get key
    }
    return true; // Key already exists and is not known to be invalid
  }
  // Fallback for environments where aistudio is not available, assuming API_KEY is set
  return !!process.env.API_KEY;
}

export async function generateVideo(prompt: string): Promise<string> {
  if (!navigator.onLine) {
    throw new Error('You are offline. AI video generation requires an internet connection.');
  }

  const hasKey = await ensureApiKey();
  if (!hasKey) {
    throw new Error('API key is required. Please select an API key to proceed.');
  }

  // Create a new instance right before the API call to ensure it uses the latest key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error('Video generation failed, no download link found.');
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        // The download link can also fail due to an invalid key. Check for this.
        if (response.status === 404 || (errorText && errorText.toLowerCase().includes('api key not valid'))) {
            isKeyInvalid = true;
            throw new Error('Your API Key seems to be invalid. Please select a valid API key and try again.');
        }
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    // A fully successful operation means the key is valid.
    isKeyInvalid = false;
    return URL.createObjectURL(videoBlob);

  } catch (err: any) {
    let finalErrorMessage = err.message || 'An unknown error occurred during video generation.';
    
    // This specific error message from the Gemini API indicates an invalid API key.
    if (err.message && err.message.includes("Requested entity was not found.")) {
      isKeyInvalid = true; // Mark the key as invalid to force re-selection on the next attempt.
      finalErrorMessage = 'Your API Key seems to be invalid. Please select a valid API key and try again.';
    }
    
    console.error('Error generating video:', err);
    throw new Error(finalErrorMessage);
  }
}

export async function getForYouFeed(currentUser: User, allVideos: Video[]): Promise<number[]> {
  // Filter out videos from the current user and users they already follow
  const candidateVideos = allVideos.filter(video => 
    video.user.username !== currentUser.username &&
    !currentUser.followingUsernames.includes(video.user.username)
  );

  if (candidateVideos.length === 0) {
    return [];
  }

  const hasKey = await ensureApiKey();
  if (!hasKey) {
    throw new Error('API key is required for AI features. Please select an API key.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const simplifiedVideos = candidateVideos.map(v => ({
    id: v.id,
    caption: v.caption,
    user: {
      username: v.user.username,
      displayName: v.user.displayName,
    },
  }));
  
  const userPostedCaptions = allVideos
    .filter(v => v.user.username === currentUser.username)
    .map(v => v.caption)
    .join('; ');

  const prompt = `
    You are a video recommendation engine for an app called ReelTalk.
    The current user is "${currentUser.displayName}" (@${currentUser.username}).
    They follow these creators: ${currentUser.followingUsernames.join(', ') || 'None'}.
    They have posted videos with these captions: "${userPostedCaptions || 'None'}".

    Based on this, please recommend up to 5 videos for them to watch from the following list of candidate videos.
    Provide your response as a JSON object containing a single key "recommendedVideoIds" with an array of the video IDs you recommend.

    Candidate Videos:
    ${JSON.stringify(simplifiedVideos)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedVideoIds: {
              type: Type.ARRAY,
              description: 'An array of video IDs to recommend.',
              items: {
                type: Type.NUMBER,
                description: 'The ID of a recommended video.'
              }
            }
          },
          required: ['recommendedVideoIds']
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && Array.isArray(result.recommendedVideoIds)) {
      // Ensure we don't return more than 5 recommendations
      return result.recommendedVideoIds.slice(0, 5);
    }
    
    return [];

  } catch (err: any) {
    console.error("Error generating 'For You' feed:", err);
    if (err.message && err.message.includes("Requested entity was not found.")) {
      isKeyInvalid = true;
      throw new Error('Your API Key is invalid. Please select a valid key to get recommendations.');
    }
    throw new Error("Could not generate your personalized feed. Please try again.");
  }
}
