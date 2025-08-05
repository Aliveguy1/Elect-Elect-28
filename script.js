let selectedAI = 'openai';

document.getElementById('openai-btn').onclick = function() {
  selectedAI = 'openai';
  this.classList.add('active');
  document.getElementById('gemini-btn').classList.remove('active');
};
document.getElementById('gemini-btn').onclick = function() {
  selectedAI = 'gemini';
  this.classList.add('active');
  document.getElementById('openai-btn').classList.remove('active');
};

function sendMessage() {
  const input = document.getElementById('userInput');
  const userMessage = input.value;
  if (!userMessage) return;
  const chatbox = document.getElementById('chatbox');
  chatbox.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;
  input.value = '';
  chatbox.innerHTML += `<div><em>Thinking (${selectedAI})...</em></div>`;

  // --- AI API Call (replace with your proxy endpoints) ---
  let apiUrl = '';
  let body = {};
  if (selectedAI === 'openai') {
    apiUrl = 'https://your-openai-proxy.example.com/v1/chat/completions';
    body = {
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "Explain everything step by step for engineering students. If asked, generate diagrams using Mermaid.js syntax."},
        {role: "user", content: userMessage}
      ],
      temperature: 0.6
    };
  } else if (selectedAI === 'gemini') {
    apiUrl = 'https://your-gemini-proxy.example.com/v1/chat/completions';
    body = {
      prompt: "Explain everything step by step for engineering students. If asked, generate diagrams using Mermaid.js syntax: " + userMessage,
      max_tokens: 512
    };
  }
  fetch(apiUrl, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then(data => {
    let reply = '';
    if (selectedAI === 'openai') reply = data.choices?.[0]?.message?.content || 'No response';
    if (selectedAI === 'gemini') reply = data.reply || data.candidates?.[0]?.output || 'No response';
    chatbox.innerHTML += `<div><strong>${selectedAI === 'openai' ? 'OpenAI' : 'Gemini'}:</strong> ${reply}</div>`;
    // Render Mermaid diagram if present
    renderMermaidDiagram(reply);
    // Search YouTube for courses
    fetchYouTubeCourses(userMessage);
  })
  .catch(err => {
    chatbox.innerHTML += `<div style="color:red;">Error: ${err.message}</div>`;
  });
}

// Detect Mermaid diagram code and render it
function renderMermaidDiagram(text) {
  const diagramDiv = document.getElementById('diagramArea');
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/;
  const match = text.match(mermaidRegex);
  if (match && match[1]) {
    diagramDiv.innerHTML = `<div class="mermaid">${match[1]}</div>`;
    window.mermaid.run();
  } else {
    diagramDiv.innerHTML = "No diagram generated.";
  }
}

// --- YouTube API Integration ---
function fetchYouTubeCourses(query) {
  const apiKey = 'YOUR_YOUTUBE_API_KEY'; // Replace with your real key!
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query + ' engineering course tutorial')}&maxResults=5&key=${apiKey}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('youtubeCourses');
      container.innerHTML = '';
      data.items.forEach(item => {
        container.innerHTML += `
          <div class="youtube-video">
            <a href="https://www.youtube.com/watch?v=${item.id.videoId}" target="_blank">
              <img src="${item.snippet.thumbnails.default.url}" alt="Thumbnail"/>
              <span>${item.snippet.title}</span>
            </a>
          </div>
        `;
      });
    })
    .catch(() => {
      document.getElementById('youtubeCourses').innerHTML = "Could not load YouTube courses.";
    });
}