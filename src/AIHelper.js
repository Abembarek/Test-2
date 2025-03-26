import axios from "axios";

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export async function askAI(question) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Full OpenAI error response:", error.response.data);
    return `⚠️ OpenAI Error: ${error.response.data.error.message}`;
  }
}
