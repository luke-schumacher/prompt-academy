document.addEventListener('DOMContentLoaded', () => {
  // --- CONFIGURATION ---
  // IMPORTANT: Replace this with your own Hugging Face API key.
  // Get one for free at hf.co/settings/tokens
  const HF_API_KEY = "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";
  
  // Model configuration
  const API_URL = "https://router.huggingface.co/v1/chat/completions";

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
  const chatLog = document.getElementById('chat-log');
  const chatForm = document.getElementById('chat-form');
  const systemPromptInput = document.getElementById('system-prompt-input');
  const userPromptInput = document.getElementById('user-prompt-input');
  const thinkingIndicator = document.getElementById('thinking-indicator');
  const thinkingStep = document.getElementById('thinking-step');
  const sendButton = chatForm.querySelector('button');
  const personalitySelectors = document.querySelectorAll('.personality-selector');

  // --- CORE FUNCTIONS ---

  async function queryLanguageModel(systemPrompt, userPrompt) {
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HF_API_KEY}`
        },
        body: JSON.stringify({
          // This model and provider combination is known to work with the chat completions endpoint.
          // It uses Fireworks AI to host the Mixtral model.
          model: "accounts/fireworks/models/mixtral-8x7b-instruct:fireworks", 
          messages: messages,
          // Simplify parameters to avoid conflicts.
          max_tokens: 1024,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        let errorDetails = { error: 'No JSON response body.' };
        try {
          errorDetails = await response.json();
        } catch (e) {
          // The response was not valid JSON, so the error message will be less specific.
        }
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorDetails)}`);
      }
      
      const result = await response.json();
      return result.choices[0].message.content.trim();

    } catch (error) {
      console.error("Failed to query the language model:", error);
      return `An error occurred. Please check the console and ensure your API key is correct. Details: ${error.message}`;
    }
  }

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
      "Synthesizing instructions and request...",
      "Generating response..."
    ];
    for (const step of steps) {
      thinkingStep.textContent = step;
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }
  
  function selectPersonality(key) {
    if (!personalities[key]) return;
    
    // Update the UI
    personalitySelectors.forEach(sel => {
      sel.classList.toggle('active', sel.dataset.personality === key);
    });

    // Update the textarea
    systemPromptInput.value = personalities[key].prompt;
  }

  // --- EVENT HANDLERS ---

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const systemPrompt = systemPromptInput.value.trim();
    const userPrompt = userPromptInput.value.trim();

    if (!userPrompt) return;
    if (HF_API_KEY === "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") {
      addMessageToLog("Please set your Hugging Face API key in the script.js file first.", "ai");
      return;
    }
    
    userPromptInput.value = '';
    userPromptInput.disabled = true;
    sendButton.disabled = true;

    addMessageToLog(userPrompt, 'user');
    await showThinkingProcess();

    const aiResponse = await queryLanguageModel(systemPrompt, userPrompt);
    
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

  // --- INITIALIZATION ---
  selectPersonality('tutor'); // Set the default personality on page load
});