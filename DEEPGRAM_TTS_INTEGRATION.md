# Deepgram Text-to-Speech (TTS) Integration

## Overview

This project has been updated to use Deepgram's Aura TTS API instead of G## Troubleshooting

### Common Issues

1. **"INVALID_QUERY_PARAMETER" error**

   - This occurs when using `sample_rate` with MP3 encoding
   - **Solution**: Remove `sample_rate` parameter when using MP3 (it's automatic)
   - **Fixed in**: Latest implementation automatically handles this

2. **No audio playback**

   - Check if API key is properly set in `.env.local`
   - Verify browser allows autoplay (some browsers block it)
   - Check browser console for error messages

3. **"Voice synthesis temporarily unavailable" error**

   - Verify internet connection
   - Check Deepgram API key validity
   - Ensure API quota is not exceeded

4. **Text truncation warnings**
   - Aura-2 models limit text to 1000 characters
   - System automatically truncates longer text
   - Consider breaking long content into smaller chunks

### Debug Mode

Enable debug logging by checking the browser console for detailed TTS operation logs.generating speech from AI interview questions. Deepgram provides high-quality, natural-sounding voices optimized for conversation and interviews.

## Implementation Details

### Files Updated

1. **`/src/lib/deepgram-tts.ts`** - New Deepgram TTS implementation
2. **`/src/components/video-interview-system.tsx`** - Updated to use Deepgram TTS
3. **`.env.local`** - Added Deepgram TTS API key

### API Key Configuration

The Deepgram TTS API key is configured in `.env.local`:

```bash
NEXT_PUBLIC_DEEPGRAM_TTS_API_KEY=e52e5f4f612b33ca4a72fdc7d51fd7abba1363cf
```

### Voice Selection

The system uses carefully selected Aura-2 voices optimized for interview scenarios:

**Featured Interview Voices:**

- **Delia (aura-2-delia-en)** - Casual, Friendly, Cheerful, Breathy - Specifically designed for interviews
- **Vesta (aura-2-vesta-en)** - Natural, Expressive, Patient, Empathetic - Great for customer service and interviews
- **Thalia (aura-2-thalia-en)** - Clear, Confident, Energetic, Enthusiastic - Excellent for conversation
- **Helena (aura-2-helena-en)** - Caring, Natural, Positive, Friendly - Perfect for casual chat

### Key Features

#### 1. **Automatic Voice Selection**

The system automatically selects the best voice based on:

- Gender preference (defaults to feminine for interview context)
- Use case (prioritizes "interview" voices)
- Voice characteristics suitable for professional interviews

#### 2. **High-Quality Audio**

- Uses MP3 encoding for optimal quality and compatibility
- 24kHz sample rate for clear, professional audio
- Instant streaming playback as soon as audio data is received

#### 3. **Real-time Speech Synthesis**

- Questions are spoken immediately when received from the backend
- Non-blocking audio playback with proper error handling
- Seamless integration with the interview flow

#### 4. **Voice Control**

- Automatic speech interruption when user starts speaking
- Volume control and playback state management
- Graceful error handling with user-friendly messages

### Usage in Interview System

The TTS integration is automatically triggered when:

1. A new question is received from the AI backend
2. The backend sends any message that should be spoken
3. The interview system receives a `new_question` or `interview_started` event

Example usage:

```typescript
// In video-interview-system.tsx
const speakAIResponse = useCallback(
  async (text: string) => {
    try {
      await deepgramTTS.speak(text, {
        voice: selectedTTSVoice || undefined,
      });
    } catch (error) {
      toast.error("Voice synthesis temporarily unavailable");
    }
  },
  [selectedTTSVoice]
);
```

### API Integration

The system makes HTTP POST requests to Deepgram's TTS endpoint:

- **Endpoint**: `https://api.deepgram.com/v1/speak`
- **Authentication**: Token-based using `Authorization: Token {API_KEY}`
- **Request Body**: JSON with `text` field
- **Response**: Audio stream (MP3) with metadata headers

**Important API Limitations:**

- **MP3 Encoding**: When using `encoding=mp3`, you cannot specify a custom `sample_rate`
- **Character Limit**: Aura-2 models have a 1000 character limit per request
- **CORS**: Direct browser calls work fine (no proxy needed for TTS)

### Error Handling

The implementation includes comprehensive error handling:

- Network connectivity issues
- API rate limits or service unavailability
- Audio playback failures
- Missing API keys
- Invalid voice configurations

Users see friendly error messages via toast notifications, and the system gracefully falls back or continues operation without TTS if needed.

### Performance Optimizations

1. **Streaming Audio**: Starts playback as soon as first bytes are received
2. **Memory Management**: Properly disposes of audio objects and URLs
3. **Request Optimization**: Minimal payload size with only necessary parameters
4. **Concurrent Safety**: Prevents multiple simultaneous speech synthesis requests

## Migration from Google Cloud TTS

### What Changed

- Replaced `advancedTTS` with `deepgramTTS`
- Updated voice interface from `TTSVoice` to `DeepgramVoice`
- Simplified configuration (no longer needs Google Cloud API key)
- Improved error handling and user feedback

### Benefits of Deepgram TTS

1. **Better Voice Quality**: Aura voices are specifically designed for conversational AI
2. **Lower Latency**: Faster response times compared to Google Cloud TTS
3. **Interview-Optimized**: Voices selected specifically for professional interview contexts
4. **Simplified Setup**: Single API key configuration, no complex authentication
5. **Cost Effective**: Competitive pricing with transparent usage-based billing

## Testing

To test the TTS integration:

1. **Start the development server**: `pnpm dev`
2. **Navigate to an interview**: Go to any interview page
3. **Start interview**: The system will speak questions automatically
4. **Check console**: Look for Deepgram TTS success/error messages
5. **Test interruption**: Start speaking while AI is talking to test interruption

### Console Messages

- `✅ Deepgram TTS System initialized`
- `🔊 Speaking AI response with Deepgram TTS: ...`
- `✅ Deepgram TTS completed`
- `🛑 Deepgram TTS stopped` (when interrupted)

## Troubleshooting

### Common Issues

1. **No audio playback**

   - Check if API key is properly set in `.env.local`
   - Verify browser allows autoplay (some browsers block it)
   - Check browser console for error messages

2. **"Voice synthesis temporarily unavailable" error**

   - Verify internet connection
   - Check Deepgram API key validity
   - Ensure API quota is not exceeded

3. **Robotic or poor quality audio**
   - This should not happen with Aura voices, but check voice selection
   - Verify MP3 encoding is supported by browser

### Debug Mode

Enable debug logging by checking the browser console for detailed TTS operation logs.

## Future Enhancements

1. **Voice Customization**: Allow users to select preferred interview voice
2. **Speech Rate Control**: Adjust speaking speed based on user preference
3. **SSML Support**: Add support for speech markup for better pronunciation
4. **Streaming TTS**: Implement WebSocket-based streaming TTS for even lower latency
5. **Voice Caching**: Cache commonly used phrases to improve response times
