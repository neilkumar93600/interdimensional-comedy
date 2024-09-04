import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssemblyAI } from 'assemblyai';
import './App.css';

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI('AIzaSyBScDfQ0e8Tz8TOf5IV7LoAqur6aYXWcQE');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Initialize AssemblyAI with your API key
const client = new AssemblyAI({
  apiKey: "d4c4170682f24f518a165ea272769b2e"
});

function App() {
  const [comedyType, setComedyType] = useState('');
  const [theme, setTheme] = useState('');
  const [tone, setTone] = useState('');
  const [audience, setAudience] = useState('');
  const [duration, setDuration] = useState(5);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiResponses, setAiResponses] = useState([]);
  const [isLoggedIn] = useState(false);

  const handleGenerateScript = async () => {
    try {
      // Customizing the prompt to include desired text formatting
      const prompt = customPrompt || `Create a ${tone} ${comedyType} about ${theme} for ${audience} that lasts ${duration} minutes. Please format the script with bold for key points, use emojis where appropriate, and include numbered lists if applicable.`;

      const result = await model.generateContent(prompt);
      const generatedScript = result.response.text();

      // Process the script for custom styles (e.g., bold, points, emojis)
      const styledScript = processScriptStyles(generatedScript);
      setAiResponses([...aiResponses, styledScript]);
    } catch (error) {
      console.error("Error generating script:", error);
    }
  };

  const processScriptStyles = (script) => {
    return script
      .replace(/\[([^\]]+)\]/g, '<i>[$1]</i>')  // Italicize stage directions
      .replace(/:\)\s/g, '😊 ')  // Replace :) with 😊 emoji
      .replace(/:\(\s/g, '😢 ')  // Replace :( with 😢 emoji
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')   // Convert **text** to bold
      .replace(/^- (.*?)$/gm, '<li>$1</li>')    // Convert points to list items
      .replace(/(\d+)\./g, '<strong>$1.</strong>'); // Bold numbers
  };

  const handleGenerateVideo = async (index) => {
    try {
      const responseScript = aiResponses[index];
  
      // Set up the video generation request body
      const requestBody = {
        background_url: "", // Add the background URL if needed
        replica_id: "",     // Provide the replica_id if required
        script: responseScript,  // Use the AI-generated script as the content for the video
        video_name: `comedy_video_${index + 1}` // Naming the video
      };
  
      const options = {
        method: 'POST',
        headers: {
          'x-api-key': '8b22659de52d41a19901dfc6d58c3ef0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      };
  
      // Make the API call to generate the video
      const response = await fetch('https://tavusapi.com/v2/videos', options);
      const videoData = await response.json();
  
      if (response.ok) {
        console.log('Video generated successfully:', videoData);
        // You can now handle the videoData, e.g., display a link to the video
      } else {
        console.error('Failed to generate video:', videoData);
      }
    } catch (error) {
      console.error('Error generating video:', error);
    }
  };
  

  const handlePlayAudio = async (index) => {
    try {
      // Use AssemblyAI to process audio
      const transcript = await client.transcripts.transcribe({
        audio_url: aiResponses[index] // Assuming you generate audio URL from text
      });
      console.log(transcript.text);
    } catch (error) {
      console.error("Error generating audio:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo">AI Comedy Show Generator</div>
        <div className="user-menu">
          <img src="path/to/user-icon.png" alt="User" />
          <div className="dropdown">
            {isLoggedIn ? (
              <>
                <a href="/profile">Profile</a>
                <a href="/settings">Settings</a>
                <a href="/logout">Logout</a>
              </>
            ) : (
              <>
                <a href="/login">Login</a>
                <a href="/signup">Sign Up</a>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        <div className="form-container">
          {/* Form Inputs for Script Generation */}
          <div className="form-group">
            <label>Type of Comedy:</label>
            <select value={comedyType} onChange={(e) => setComedyType(e.target.value)}>
              <option value="">Select comedy type</option>
              <option value="Standup Comedy">Standup Comedy</option>
              <option value="Skit">Skit</option>
              <option value="Satire">Satire</option>
              <option value="Dark Humor">Dark Humor</option>
              <option value="Parody">Parody</option>
            </select>
          </div>
          <div className="form-group">
            <label>Theme:</label>
            <input
              type="text"
              placeholder="e.g., Technology"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Tone:</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="">Select Tone</option>
              <option value="Funny">Funny</option>
              <option value="Serious">Serious</option>
              <option value="Sarcastic">Sarcastic</option>
            </select>
          </div>
          <div className="form-group">
            <label>Targeted Audience:</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="">Select Audience</option>
              <option value="Kids">Kids</option>
              <option value="Adults">Adults</option>
              <option value="Everyone">Everyone</option>
            </select>
          </div>
          <div className="form-group">
            <label>Duration (minutes):</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Custom Prompt:</label>
            <textarea
              placeholder="Write your own prompt..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>
          <button className="generate-btn" onClick={handleGenerateScript}>
            Generate Script
          </button>
        </div>

        {/* Displaying AI-Generated Responses */}
        <div className="ai-responses">
          {aiResponses.map((response, index) => (
            <div key={index} className="ai-response">
              <div
                className="response-text"
                dangerouslySetInnerHTML={{ __html: response }}
              />
              <button onClick={() => handlePlayAudio(index)}>Play Audio</button>
              <button onClick={() => handleGenerateVideo(index)}>Generate Video</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
