export const SAMPLE_PROMPTS_INPUTS = {
  GET_HELP: "How do I <mark><span contenteditable='false'>[merge documents]</span></mark> in Lumin?",
  SUMMARIZE_PROMPT:
    "Summarize <mark><span contenteditable='false'>[document name]</span></mark> in a few bullet points",
};

export const SAMPLE_PROMPTS_OUTPUTS = {
  EXPLORE_LUMIN_AI: `
  **Lumin AI can help you with several tasks right now:**
  - **Explain Lumin features:** Inquire about merging documents, inviting members, sharing files, or managing your Workspace. Get step-by-step assistance for using these features.
  - **Answer questions about your documents:** Ask questions like “What are the payment terms in Service Agreement?” or “Summarize the Q4 Report."
  - **Find specific details:** Instead of scrolling, ask “What’s the renewal date in Document name?” to get key points without reading everything.

  What would you like help with today?
  `,
  FIND_DETAILS: `
  **I can help you quickly find specific information inside a document.**

  To get started, tell me:

  1. Which document you want to ask about – you can mention its name
  2. What you're looking for – for example:

      • "What are the payment terms in Service Agreement?"
      
      • "In Q4 Report, what are the main risks we identified?"

  I'll scan that specific document and answer based on its content.
  `,
};
