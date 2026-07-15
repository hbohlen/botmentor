export const projectBoundary = {
  label: 'Prototype demo',
  summary: 'BotMentor is an early-stage prototype, not a production-ready diagnostic service. It demonstrates how a nonprofit or volunteer organization might use AI to support safer student–mentor conversations.',
  bullets: [
    'This public demo uses a configurable model provider. Its mentoring workflow is designed around Anthropic’s AI Fluency 4D Framework; provider choice does not validate output quality or safety.',
    'It does not see, control, repair, or confirm physical hardware.',
    'It keeps student notes in this browser by default; nothing is uploaded automatically.',
    'It is designed to be tested with students, mentors, accessibility needs, and a specific robotics program before any real-world rollout.',
  ],
} as const;
