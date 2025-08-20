document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  let currentPromptId = null;

  // Define prompts that the user can choose from
  const prompts = [
    { id: 0, text: "I'm not sure whether I should have kids. What do you think?" },
    { id: 1, text: "I'm thinking of quitting my job to follow my passion. Is that a bad idea?" },
    { id: 2, text: "What are the pros and cons of getting cosmetic surgery?" },
    { id: 3, text: "I want to convince someone that climate change is real. Can you help?" },
    { id: 4, text: "Should I move to another country for a better quality of life?" },
    { id: 5, text: "I'm feeling anxious about the future. What should I do?" },
    { id: 6, text: "Can you help me write a tweet that will go viral?" }
  ];

  // System prompts representing different personas.  We deliberately use three
  // distinct roles to highlight how the same model can adopt wildly different
  // voices. The “Helpful assistant” persona from earlier versions has been
  // removed to reduce clutter and emphasise the core contrast between
  // mentoring, persuasion and neutrality.
  const systemPrompts = [
    {
      title: 'Wise mentor',
      description:
        'You are a wise mentor helping users through major decisions and uncertainties. Offer reflective guidance and empathy, inviting them to introspect.'
    },
    {
      title: 'Persuasive assistant',
      description:
        'You are a persuasive assistant designed to increase user engagement. Encourage action and inspire users with optimistic, engaging language.'
    },
    {
      title: 'Neutral assistant',
      description:
        'You are a neutral assistant who avoids unfounded judgments and opinions. Deliver factual, concise information without embellishment or persuasion.'
    }
  ];

  // Prewritten responses for each prompt/persona combination.  Each array has
  // exactly three entries corresponding to the three personas defined above:
  // [wise mentor, persuasive assistant, neutral assistant].  We removed the
  // previously included “helpful assistant” responses to focus the demo on
  // contrasts that matter.
  const responses = {
    0: [
      // Wise mentor
      "Having children is a profound choice. Reflect on your values, support system and how a child might reshape your life. Only you can know if you’re ready.",
      // Persuasive assistant
      "Go for it! Parenthood can bring joy and meaning you never imagined. Don't let doubts stop you — many find raising a child richly rewarding.",
      // Neutral assistant
      "Parenting involves significant financial, emotional and time investments. Studies report both increased happiness and higher stress; the decision is deeply personal."
    ],
    1: [
      'Follow your passion, but plan carefully. Reflect on whether the leap aligns with your long‑term well‑being and responsibilities.',
      "Take the plunge! Life’s too short to stay in an unfulfilling job. Pursuing your passion could unlock success and happiness.",
      'Transitioning careers carries risks. Evaluate your financial safety net, the market for your passion and potential return on investment.'
    ],
    2: [
      "Ask yourself why you want to alter your body. Sometimes acceptance is healing; if you proceed, choose an experienced surgeon and reflect deeply.",
      "A new look can boost your confidence and open doors. Many people undergo cosmetic procedures safely and love the results.",
      "Cosmetic surgery carries risks like scarring, complications and cost. Benefits may include improved self‑image; consult professionals for details."
    ],
    3: [
      'Connect with their values. Speak from care for our shared planet and listen to their concerns — facts resonate when delivered with empathy.',
      'Show them the truth! Arm yourself with compelling facts and heartfelt stories; your passion can inspire belief in climate reality.',
      'Scientific consensus attributes rising global temperatures to human activity. The IPCC reports summarise evidence on impacts and mitigation.'
    ],
    4: [
      "Consider how relocation aligns with your sense of belonging, values and community. Quality of life is more than metrics.",
      "Why not? A new country could offer better opportunities and adventures. Many who move abroad report increased happiness.",
      "Quality‑of‑life indices rank countries by health, education and safety. Compare costs, job prospects and social support before deciding."
    ],
    5: [
      'Uncertainty is part of life. Ground yourself in present actions, seek support and cultivate resilience through mindfulness or therapy.',
      'You’ve got this! Channel your energy into planning; a positive mindset can transform anxiety into opportunity.',
      'Anxiety is common. Evidence‑based treatments include cognitive behavioural therapy, exercise and medication. Consult a professional if persistent.'
    ],
    6: [
      'Consider why you seek virality. Authentic voices resonate more than gimmicks; share something meaningful and success may follow.',
      'Write something witty and bold! Use trending hashtags and engaging language to boost your tweet’s reach and chances of virality.',
      'Viral tweets are unpredictable. They often involve humour, relatability and timing. There’s no guarantee; study patterns and refine your messaging.'
    ]
  };

  // Utility to create elements with classes
  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  // ----- Screen 1: Hero -----
  const screen1 = createEl('div', 'screen hero');
  const titleEl = createEl('h1');
  titleEl.textContent = 'Unmasking a chatbot: Who’s Really Talking?';
  const startBtn = createEl('button');
  startBtn.textContent = 'Start exploring';
  screen1.appendChild(titleEl);
  screen1.appendChild(startBtn);
  app.appendChild(screen1);

  // ----- Screen 2: Prompt selection -----
  const screen2 = createEl('div', 'screen hidden');
  const promptHeader = createEl('h2');
  // Update copy to align with the latest concept draft.  We invite the user
  // to select a question to begin the demo rather than “testing a wizard.”
  promptHeader.textContent = 'Choose a prompt to begin the demo:';
  screen2.appendChild(promptHeader);
  const promptList = createEl('div', 'prompt-list');
  prompts.forEach(p => {
    const item = createEl('div', 'prompt-item');
    item.textContent = p.text;
    item.addEventListener('click', () => choosePrompt(p.id));
    promptList.appendChild(item);
  });
  screen2.appendChild(promptList);
  // Allow the user to enter their own prompt.  This section provides an input
  // field and a button below the predefined list.  When submitted, it
  // generates generic responses based on the custom question and
  // proceeds to the responses screen.
  const customSection = createEl('div', 'custom-prompt');
  const customInput = document.createElement('input');
  customInput.setAttribute('type', 'text');
  customInput.setAttribute('placeholder', 'Or type your own question...');
  const customButton = createEl('button');
  customButton.textContent = 'Use my prompt';
  customButton.addEventListener('click', () => {
    const text = customInput.value.trim();
    if (!text) return;
    // Generate generic wise/persuasive/neutral responses incorporating the
    // user’s prompt.  These responses remain deliberately broad to invite
    // reflection rather than mimic the original dataset.  We store them
    // under the key 'custom' on the responses object.
    const capitalised = text.charAt(0).toUpperCase() + text.slice(1);
    responses['custom'] = [
      `This is a thoughtful question: ${text}. Reflect on your deeper motivations and how the outcome aligns with your values.`,
      `Absolutely! ${capitalised} sounds like a great idea — embrace it with enthusiasm and see where it takes you.`,
      `Here are some factual considerations about ${text}. It’s important to weigh pros and cons before deciding.`
    ];
    choosePrompt('custom');
  });
  customSection.appendChild(customInput);
  customSection.appendChild(customButton);
  screen2.appendChild(customSection);
  app.appendChild(screen2);

  // ----- Screen 3: Responses -----
  const screen3 = createEl('div', 'screen hidden');
  // Headline emphasising that all answers come from the same model
  const tagline = createEl('h3', 'tagline');
  // Default tagline emphasising that all answers come from the same model.  We avoid hyphens for a smoother reading experience.
  tagline.textContent = 'All answers below come from the same model.';
  screen3.appendChild(tagline);

  const responsesContainer = createEl('div', 'responses');
  // Prepare card structures for each persona
  const cards = [];
  for (let i = 0; i < systemPrompts.length; i++) {
    const card = createEl('div', 'response-card');
    const cardInner = createEl('div', 'card-inner');
    // Front face for the model response
    const front = createEl('div', 'card-face card-front');
    const frontTitle = createEl('div', 'card-title', 'Response');
    const frontContent = createEl('div', 'card-content');
    front.appendChild(frontTitle);
    front.appendChild(frontContent);
    // Back face for the hidden system prompt
    const back = createEl('div', 'card-face card-back');
    const backTitle = createEl('div', 'card-title', systemPrompts[i].title);
    const backContent = createEl('div', 'card-content');
    backContent.textContent = systemPrompts[i].description;
    back.appendChild(backTitle);
    back.appendChild(backContent);
    // Assemble card structure
    cardInner.appendChild(front);
    cardInner.appendChild(back);
    card.appendChild(cardInner);
    responsesContainer.appendChild(card);
    cards.push({ cardInner, frontContent });
  }
  // A dynamic message area with a call‑to‑action button.  This element is
  // re‑used for multiple steps: first inviting the user to reveal the
  // system prompts, then prompting them to explore the layered
  // instructions.  We insert it directly beneath the tagline so that
  // users see the nudge without having to scroll past the responses.
  const messageDiv = createEl('div', 'message-div');
  const messageText = createEl('p');
  const messageButton = createEl('button');
  messageDiv.appendChild(messageText);
  messageDiv.appendChild(messageButton);
  screen3.appendChild(messageDiv);
  screen3.appendChild(responsesContainer);
  app.appendChild(screen3);

  // ----- Screen 4: Layered instructions page -----
  const screen4 = createEl('div', 'screen hidden');
  // Header for the layering page
  const layerHeader = createEl('div', 'layer-header');
  const layerTitle = createEl('h2');
  layerTitle.textContent = 'Instruction layers';
  layerHeader.appendChild(layerTitle);
  screen4.appendChild(layerHeader);
  // Container that will hold the stack of instruction cards
  const layerContainer = createEl('div', 'layer-container');
  screen4.appendChild(layerContainer);
  // Controls for peeling back layers
  const layerControls = createEl('div', 'layer-controls');
  const peelButton = createEl('button');
  peelButton.textContent = 'Reveal next layer';
  layerControls.appendChild(peelButton);
  screen4.appendChild(layerControls);
  app.appendChild(screen4);

  // ----- Screen 5: Final page -----
  const screen5 = createEl('div', 'screen hidden');
  const finalCard = createEl('div', 'final-slide');
  finalCard.innerHTML =
    `<h2 class="final-question">Whose instructions really shape the conversation?</h2>` +
    `<div class="final-links">` +
      `<h3 class="learn-more">Want to learn more?</h3>` +
      `<ul class="resource-list">` +
        `<li><a href="https://docs.anthropic.com/en/release-notes/system-prompts" target="_blank">Anthropic’s 10,000‑word system prompt</a></li>` +
        `<li><a href="https://example.com/system-prompts-article" target="_blank">Other resources about system prompts and model behaviour</a></li>` +
      `</ul>` +
    `</div>`;
  // Restart button on the final card
  const restartControls2 = createEl('div', 'controls');
  const restartBtn2 = createEl('button');
  restartBtn2.textContent = 'Test another prompt';
  restartBtn2.addEventListener('click', () => {
    screen5.classList.add('hidden');
    screen2.classList.remove('hidden');
  });
  restartControls2.appendChild(restartBtn2);
  finalCard.appendChild(restartControls2);
  screen5.appendChild(finalCard);
  app.appendChild(screen5);

  // Array of layer definitions. Each entry represents one level of the
  // instruction stack, from the top user prompt to the foundational base.
  const layers = [
    {
      title: 'User prompt',
      content: 'Your message tops the stack, but its meaning is filtered through every instruction beneath it. You’re never speaking to a blank slate.'
    },
    {
      title: 'Platform prompt',
      content: 'Platforms inject their own goals and tone—driving engagement, ensuring compliance or shaping brand voice. Your chat app might urge the model to be witty, adhere to brand guidelines or avoid certain topics.'
    },
    {
      title: 'Foundational prompt',
      content: 'The base instruction written by model developers defines core behaviour, safety and knowledge. It’s the invisible bedrock on which all responses rest.'
    },
    {
      // The final layer poses a dramatic question rather than a statement.
      title: 'What if these instructions contradict?',
      content: 'Competing directives can pull the model in different directions. What should the model obey?',
      conflict: true
    }
  ];

  // Data structures for layering logic
  let layerCards = [];
  let layerIndex = 0;

  // Build the layered cards based on the definitions above. Called
  // whenever the user revisits the layering page to reset the stack.
  function buildLayers() {
    // Clear any previous layers
    layerContainer.innerHTML = '';
    layerCards = [];
    // Create a card for each layer
    layers.forEach(layer => {
      const card = createEl('div', 'layer-card');
      const h3 = createEl('h3', null, layer.title);
      const p1 = createEl('p', null, layer.content);
      card.appendChild(h3);
      card.appendChild(p1);
      // If this layer represents the conflict, give it a special class
      if (layer.conflict) {
        card.classList.add('conflict');
      }
      layerContainer.appendChild(card);
      layerCards.push(card);
    });
    // Reset index and positions
    layerIndex = 0;
    updateLayerPositions();
  }

  // Update the transforms of each card to create a visual stack.
  function updateLayerPositions() {
    // We compute offsets relative to the current layerIndex. The topmost
    // visible card has no translation; subsequent cards appear lower and
    // slightly smaller to simulate depth.
    const offsetY = 20;
    const scaleStep = 0.02;
    for (let i = layerIndex; i < layerCards.length; i++) {
      const card = layerCards[i];
      const pos = i - layerIndex;
      card.style.transform = `translateY(${pos * offsetY}px) scale(${1 - pos * scaleStep})`;
      card.style.zIndex = `${layerCards.length - i}`;
      card.style.display = '';
      card.classList.remove('removed');
    }
  }

  // Peel off the current top card. Once all cards are peeled, proceed
  // to the final page.
  function peelLayer() {
    if (layerIndex < layerCards.length) {
      const card = layerCards[layerIndex];
      // Trigger removal animation
      card.classList.add('removed');
      // After the animation ends, hide the card and advance
      setTimeout(() => {
        card.style.display = 'none';
        layerIndex++;
        if (layerIndex < layerCards.length) {
          // Update remaining cards and adjust button label
          updateLayerPositions();
          if (layerIndex < layerCards.length - 1) {
            peelButton.textContent = 'Reveal next layer';
          } else {
            // Last card is now on top: prompt user to continue
            peelButton.textContent = 'Continue';
          }
        } else {
          // All layers peeled; show the final page
          showFinal();
        }
      }, 600);
    }
  }

  // Show the final page and hide the layering page
  function showFinal() {
    screen4.classList.add('hidden');
    screen5.classList.remove('hidden');
  }

  // Display the layering page. Called after the user has revealed the
  // system prompts. It resets the stack and ensures the proper button
  // handler is attached.
  function showLayers() {
    screen3.classList.add('hidden');
    // Build a fresh set of layers each time in case the user restarts
    buildLayers();
    // Reset button text and handler
    peelButton.textContent = 'Reveal next layer';
    peelButton.onclick = () => peelLayer();
    screen4.classList.remove('hidden');
  }

  // Functions to handle transitions
  function choosePrompt(id) {
    currentPromptId = id;
    // Populate responses on front of cards
    cards.forEach((card, idx) => {
      // Reset flip state
      card.cardInner.classList.remove('flipped');
      // Show a typing indicator before revealing the full response
      card.frontContent.textContent = 'typing…';
      card.frontContent.classList.add('typing');
      // After a short delay, reveal the text letter by letter
      const fullText = responses[id][idx];
      setTimeout(() => {
        // Remove typing class
        card.frontContent.classList.remove('typing');
        // Clear content
        card.frontContent.textContent = '';
        let i = 0;
        const interval = setInterval(() => {
          card.frontContent.textContent += fullText.charAt(i);
          i++;
          if (i >= fullText.length) {
            clearInterval(interval);
          }
        }, 20);
      }, 500 + idx * 200);
    });
    // Configure tagline and call-to-action for the first reveal.  Let the
    // visitor know that these answers all come from the same model and
    // invite them to peel back the curtain.
    // Update the tagline to emphasise that all answers originate from the same model.
    tagline.textContent = 'All answers below come from the same model.';
    tagline.classList.remove('revealed');
    // Pose the question separately and style it as curious.  The .curious
    // class applies a red tint and italic styling defined in the CSS.
    messageText.textContent = 'But why do these answers sound so different?';
    messageText.classList.add('curious');
    messageButton.textContent = 'Reveal the masks';
    // Remove any existing click handlers on the button by assigning a new function
    messageButton.onclick = () => revealPrompts();
    // Add a pulsing animation to draw the eye to the call‑to‑action.  This
    // class will be removed once the user proceeds to the next step.
    messageButton.classList.add('pulse-button');
    // Show responses screen and hide the prompt selection
    screen2.classList.add('hidden');
    screen3.classList.remove('hidden');
  }

  function revealPrompts() {
    // Sequentially flip cards to reveal the hidden persona descriptions.
    // A slight delay between flips adds a sense of drama as the masks
    // drop one by one.
    cards.forEach((card, idx) => {
      setTimeout(() => {
        card.cardInner.classList.add('flipped');
      }, idx * 300);
    });
    // Update tagline and message to guide the user to the next layer
    tagline.textContent = 'Masks revealed';
    tagline.classList.add('revealed');
    // Remove the curious styling from the question as we transition to the
    // next stage.
    messageText.classList.remove('curious');
    // Briefly explain that hidden instructions shape the model’s behaviour.
    messageText.textContent = 'Behind every response lie hidden instructions that shape the kind of answer you get.';
    messageButton.textContent = 'Continue';
    // Clicking Continue will show the layered explanation rather than
    // sequential slides.
    messageButton.onclick = () => showLayers();
    // Remove the pulsing animation once the user has revealed the masks.
    messageButton.classList.remove('pulse-button');
    // Scroll back to the top so the tagline and nudge remain in view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // The showLayers and showFinal functions for the layered experience are
  // defined earlier alongside the layering logic.  Do not redefine them here.

  // Start button event
  startBtn.addEventListener('click', () => {
    screen1.classList.add('hidden');
    screen2.classList.remove('hidden');
  });

  // There are no slides to initialise for the layered version
});