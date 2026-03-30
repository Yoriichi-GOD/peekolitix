# Peekolitix 

A professional, India-focused political intelligence application. 
Provides factual, data-driven intelligence on Indian politics, policy, and governance using the Gemini API.

## Core Dependencies Installed

Here are the key libraries that power the application (already added to your `package.json`):

1. **`lucide-react`**: For the technical dashboard icons.
2. **`framer-motion`**: For smooth layout & reporting transitions.
3. **`recharts`**: For interactive, data-driven vertical bar charts in `STATS` mode.
4. **`@google/generative-ai`**: Google's official SDK for interacting with the Gemini API.
5. **`react-markdown` & `remark-gfm`**: For rendering structured Markdown intelligence reports and tables.

*(Plus standard Vite/React core dependencies)*

## How to Run Locally

You do not need to install these manually one by one. I have already set up the `package.json` for you. Just run the following commands:

1. Navigate to the project directory:
   ```bash
   cd C:\Users\saart\.gemini\antigravity\scratch\peekolitix
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Ensure your API Key is correctly placed in the `.env` file at the root of the project:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
