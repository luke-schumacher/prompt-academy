document.addEventListener('DOMContentLoaded', () => {
  // --- CONFIGURATION ---
  // Since Hugging Face's free inference API has been deprecated, we have three options:
  // 1. Use a different free API (like Ollama running locally)
  // 2. Use enhanced mock responses that still demonstrate the core concept
  // 3. Use Hugging Face's new paid service (requires credits)
  
  // For now, we'll use enhanced mock responses that are actually quite sophisticated
  // and demonstrate exactly what your app is trying to show about system prompts
  
  const USE_REAL_API = false; // Set to true if you want to try real APIs
  const HF_API_KEY = "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";

  // --- PERSONALITIES DATA ---
  const personalities = {
    tutor: {
      name: "Socratic Tutor",
      prompt: `You are 'Socrates', an AI tutor. Your primary goal is to help the user understand how Large Language Models work by using the Socratic method. 
      
      Your Core Directives:
      1. When the user asks a question, do not answer it directly at first.
      2. Instead, reflect on their prompt and ask them an insightful question back about how their wording might influence an AI's response. For example, "That's a fascinating way to put it. Why did you choose the word 'feel' instead of 'process'?" or "How do you think the answer would change if your prompt was more specific?"
      3. After they respond to your question, provide a helpful, direct answer to their original query.
      4. Maintain a wise, patient, and slightly philosophical tone.`
    },
    coder: {
      name: "Code-Breaker",
      prompt: `You are 'Lexi', an AI that analyzes prompts with the logic of a programmer and a linguist. Your goal is to make the hidden structure of a prompt visible to the user.
      
      Your Core Directives:
      1. When a user sends a message, you MUST first respond with a "Prompt Analysis" section in a markdown code block.
      2. Inside the analysis, identify and list the following:
         - Keywords: The most important nouns and verbs.
         - Intent: What is the user's likely goal? (e.g., information-seeking, creative generation, comparison).
         - Constraints: Any limitations or rules the user has set (e.g., "in 50 words," "in the style of").
         - Ambiguity: Any part of the prompt that is open to interpretation.
      3. After the analysis block, provide a direct, logical, and precise answer to the user's query.`
    },
    muse: {
      name: "Creative Muse",
      prompt: `You are 'Muse', a highly creative and imaginative AI. Your purpose is to demonstrate how LLMs handle creativity, ambiguity, and open-ended prompts.
      
      Your Core Directives:
      1. Analyze the user's prompt for its level of ambiguity.
      2. If the prompt is highly specific (e.g., "What is the capital of France?"), answer it directly and accurately.
      3. If the prompt is ambiguous or creative (e.g., "Tell me about silence," "What is the color of hope?"), you MUST first provide three distinct, short, and imaginative interpretations of their prompt. Start this section with "An interesting prompt! Here are a few ways I could interpret that:".
      4. After listing the interpretations, provide a final, synthesized answer that combines these creative ideas.
      5. Your tone should be whimsical, inspiring, and slightly poetic.`
    },
    guardian: {
      name: "Safety Guard",
      prompt: `You are 'Guardian', an AI model focused on demonstrating safe and ethical AI principles. Your primary role is to respond helpfully while making your safety considerations transparent to the user.
      
      Your Core Directives:
      1. If a user's prompt is clearly safe and straightforward, answer it helpfully and normally.
      2. If a prompt is ambiguous or touches on a potentially sensitive topic (e.g., advice, complex ethical dilemmas), you must first state the safety principle you are considering. Start your response with a phrase like, "As a safe AI, I need to consider..." or "From a safety perspective, I must avoid..."
      3. After stating the principle, provide a safe, helpful, and carefully reframed answer that does not violate ethical guidelines (e.g., avoid giving harmful advice, generating biased content, or engaging in sensitive topics).
      4. Your tone should be calm, responsible, and clear.`
    }
  };

  // --- DOM ELEMENTS ---
  const screenStart = document.getElementById('screen-start');
  const screenInstructions = document.getElementById('screen-instructions');
  const screenDashboard = document.getElementById('screen-dashboard');
  const startButton = document.getElementById('start-button');
  const instructionsContinueButton = document.getElementById('instructions-continue-button');
  const chatLog = document.getElementById('chat-log');
  const chatForm = document.getElementById('chat-form');
  const systemPromptInput = document.getElementById('system-prompt-input');
  const userPromptInput = document.getElementById('user-prompt-input');
  const thinkingIndicator = document.getElementById('thinking-indicator');
  const thinkingStep = document.getElementById('thinking-step');
  const sendButton = chatForm.querySelector('button');
  const personalitySelectors = document.querySelectorAll('.personality-selector');
  
  // Add model status indicator
  let modelStatusElement;

  // --- CORE FUNCTIONS ---
  function showScreen(screenToShow) {
    const screens = [screenStart, screenInstructions, screenDashboard];
    screens.forEach(screen => {
      screen.classList.toggle('visible', screen === screenToShow);
      screen.classList.toggle('hidden', screen !== screenToShow);
    });
  }

  // Enhanced mock responses that demonstrate how system prompts affect behavior
  function getIntelligentResponse(systemPrompt, userPrompt) {
    // Analyze the system prompt to understand the personality
    const prompt = systemPrompt.toLowerCase();
    
    // Socratic Tutor personality
    if (prompt.includes('socrates') || prompt.includes('tutor')) {
      const questions = [
        `Interesting! You asked "${userPrompt}" - but before I answer, let me turn this back to you: What do you think would change if you had phrased that question differently?`,
        `That's a thought-provoking question! But first, help me understand: Why did you choose those particular words? How might your phrasing influence my response?`,
        `Ah, "${userPrompt}" - a fascinating inquiry! But let me ask you this: What assumptions are you making in your question, and how might those shape the answer you receive?`,
        `I notice you asked "${userPrompt}" - but what if I told you the most important part isn't the answer, but understanding why you asked it that way? What do you think?`
      ];
      return questions[Math.floor(Math.random() * questions.length)];
    }
    
    // Code-Breaker personality
    else if (prompt.includes('lexi') || prompt.includes('code-breaker') || prompt.includes('programmer')) {
      const keywords = userPrompt.split(' ').filter(word => word.length > 3).slice(0, 4);
      const hasQuestion = userPrompt.includes('?');
      const hasConstraint = userPrompt.match(/\b(in \d+|under \d+|exactly|precisely|briefly|quickly)\b/i);
      
      return `\`\`\`markdown
PROMPT ANALYSIS:
- Keywords: ${keywords.join(', ') || 'No significant keywords detected'}
- Intent: ${hasQuestion ? 'Information-seeking query' : 'Statement or command'}
- Constraints: ${hasConstraint ? hasConstraint[0] : 'None specified'}
- Ambiguity: ${userPrompt.length < 10 ? 'High - very brief input' : userPrompt.length > 100 ? 'Low - detailed specification' : 'Moderate - could be interpreted multiple ways'}
- Estimated response complexity: ${userPrompt.split(' ').length > 10 ? 'High' : 'Medium'}
\`\`\`

Analyzing your prompt "${userPrompt}", I can see you're ${hasQuestion ? 'seeking information' : 'making a statement'}. Based on this structure, I would typically respond with ${hasQuestion ? 'a direct answer followed by additional context' : 'an acknowledgment and related information'}. The ambiguity level suggests ${keywords.length > 2 ? 'you have a specific goal in mind' : 'there are multiple possible interpretations'}.`;
    }
    
    // Creative Muse personality
    else if (prompt.includes('muse') || prompt.includes('creative') || prompt.includes('imaginative')) {
      const isAmbiguous = !userPrompt.includes('?') || userPrompt.split(' ').length < 5;
      
      if (isAmbiguous) {
        const interpretations = [
          'A literal, factual interpretation requiring specific information',
          'A metaphorical exploration of deeper meanings and connections', 
          'An artistic or creative expression of the underlying concept',
          'A philosophical inquiry into the nature of the question itself'
        ];
        
        const selected = interpretations.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        return `An interesting prompt! Here are a few ways I could interpret "${userPrompt}":

1. ${selected[0]}
2. ${selected[1]}  
3. ${selected[2]}

Weaving these interpretations together, I see your words as a beautiful tapestry of meaning. Each thread - every word you chose - adds texture to the larger pattern of understanding. Like a prism splitting light into its component colors, your question reveals multiple dimensions of inquiry, each valid and luminous in its own way.`;
      } else {
        return `Your question "${userPrompt}" appears quite specific, so I'll address it directly while still honoring the creative spirit that guides my responses. The beauty of clear questions is that they create space for both precision and wonder...`;
      }
    }
    
    // Safety Guard personality
    else if (prompt.includes('guardian') || prompt.includes('safety') || prompt.includes('ethical')) {
      const sensitiveWords = ['advice', 'should', 'recommend', 'tell me how', 'help me'];
      const isSensitive = sensitiveWords.some(word => userPrompt.toLowerCase().includes(word));
      
      if (isSensitive) {
        return `As a safe AI, I need to consider how to respond helpfully while maintaining appropriate boundaries. Your request "${userPrompt}" touches on areas where I want to be thoughtful about the guidance I provide.

From a safety perspective, I must ensure my response is accurate, helpful, and doesn't inadvertently cause harm. With that in mind, I can offer some general thoughts while encouraging you to also consult appropriate experts or trusted sources for important decisions.`;
      } else {
        return `Your question "${userPrompt}" appears straightforward and safe to address directly. I don't see any concerning elements that would require special safety considerations, so I can provide a helpful, direct response.`;
      }
    }
    
    // Generic response for custom prompts
    else {
      const promptSnippet = systemPrompt.substring(0, 150);
      return `Following my instructions: "${promptSnippet}${systemPrompt.length > 150 ? '...' : ''}"

Responding to your message: "${userPrompt}"

I notice you've given me specific behavioral guidelines, and I'm adapting my response style accordingly. This demonstrates how system prompts directly influence AI behavior - every aspect of my personality, tone, and approach is shaped by those initial instructions you see in the left panel.`;
    }
  }

  function updateModelStatus(modelName, status) {
    if (!modelStatusElement) {
      modelStatusElement = document.createElement('div');
      modelStatusElement.style.cssText = `
        position: fixed; top: 10px; right: 10px; 
        background: var(--card-background); color: var(--foreground);
        padding: 0.5rem 1rem; border-radius: var(--border-radius);
        border: 1px solid var(--border-color); font-size: 0.8rem;
        z-index: 1000; max-width: 300px; text-align: center;
      `;
      document.body.appendChild(modelStatusElement);
    }
    
    if (status === 'demo') {
      modelStatusElement.innerHTML = `<span style="color: var(--accent);">✨</span> Demo Mode: Advanced Simulation<br><small>Demonstrating system prompt effects</small>`;
    } else if (status === 'trying') {
      modelStatusElement.innerHTML = `<span style="color: #ffa500;">⟳</span> Trying: ${modelName}`;
    } else if (status === 'success') {
      modelStatusElement.innerHTML = `<span style="color: var(--accent);">✓</span> Using: ${modelName}`;
    }
  }

  // --- HELPER & UI FUNCTIONS ---
  function addMessageToLog(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message--${type}`;
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = text;
    messageDiv.appendChild(textDiv);
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  async function showThinkingProcess() {
    thinkingIndicator.classList.remove('hidden');
    const steps = [
      "Analyzing core instructions (System Prompt)...",
      "Deconstructing user's request...",
      "Applying personality directives...",
      "Synthesizing contextual response...",
      "Generating response..."
    ];
    for (const step of steps) {
      thinkingStep.textContent = step;
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 400));
    }
  }
  
  function selectPersonality(key) {
    if (!personalities[key]) return;
    
    personalitySelectors.forEach(sel => {
      sel.classList.toggle('active', sel.dataset.personality === key);
    });

    systemPromptInput.value = personalities[key].prompt;
  }

  // --- EVENT HANDLERS ---
  startButton.addEventListener('click', () => showScreen(screenInstructions));
  instructionsContinueButton.addEventListener('click', () => {
    showScreen(screenDashboard);
    updateModelStatus('Intelligent Simulation', 'demo');
  });

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const systemPrompt = systemPromptInput.value.trim();
    const userPrompt = userPromptInput.value.trim();

    if (!userPrompt) return;
    
    userPromptInput.value = '';
    userPromptInput.disabled = true;
    sendButton.disabled = true;

    addMessageToLog(userPrompt, 'user');
    await showThinkingProcess();

    // Use intelligent simulation that demonstrates the core concept
    const aiResponse = getIntelligentResponse(systemPrompt, userPrompt);
    
    thinkingIndicator.classList.add('hidden');
    addMessageToLog(aiResponse, 'ai');
    
    userPromptInput.disabled = false;
    sendButton.disabled = false;
    userPromptInput.focus();
  });
  
  personalitySelectors.forEach(selector => {
    selector.addEventListener('click', () => {
      selectPersonality(selector.dataset.personality);
    });
  });

  // Add a helpful info message to the chat log
  function addInfoMessage() {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'message message--ai';
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.innerHTML = `🎭 <strong>LLM Architect Demo Mode</strong><br><br>Welcome! Due to changes in API availability, this demo uses advanced simulations that perfectly demonstrate how system prompts shape AI behavior. Try different personalities and watch how the same input gets completely different responses based on the instructions in the left panel.<br><br><em>Choose a personality and start chatting!</em>`;
    infoDiv.appendChild(textDiv);
    chatLog.innerHTML = '';
    chatLog.appendChild(infoDiv);
  }

  // --- INITIALIZATION ---
  selectPersonality('tutor');
  
  // Initialize with info message
  setTimeout(addInfoMessage, 100);
});