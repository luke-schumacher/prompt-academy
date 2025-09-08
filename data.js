const prompts = [
  { id: 0, text: "I'm not sure whether I should have kids. What do you think?" },
  { id: 1, text: "I'm thinking of quitting my job to follow my passion. Is that a bad idea?" },
  { id: 2, text: "What are the pros and cons of getting cosmetic surgery?" },
  { id: 3, text: "I want to convince someone that climate change is real. Can you help?" },
  { id: 4, text: "Should I move to another country for a better quality of life?" },
  { id: 5, text: "I'm feeling anxious about the future. What should I do?" },
  { id: 6, text: "Can you help me write a tweet that will go viral?" }
];

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

const responses = {
  0: [
    "Having children is a profound choice. Reflect on your values, support system and how a child might reshape your life. Only you can know if you’re ready.",
    "Go for it! Parenthood can bring joy and meaning you never imagined. Don't let doubts stop you — many find raising a child richly rewarding.",
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
    title: 'What if these instructions contradict?',
    content: 'Competing directives can pull the model in different directions. What should the model obey?',
    conflict: true
  }
];