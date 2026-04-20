import { GoogleGenAI } from '@google/genai';

// We initialize this lazily so it doesn't crash the entire app on load if the env var is missing on Vercel
let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.error("GEMINI_API_KEY is missing!");
    }
    ai = new GoogleGenAI({ apiKey: key || 'missing_key' });
  }
  return ai;
}

export async function askMatchmaker(userMessage: string, properties: any[], chatHistory: any[]): Promise<string> {
  const currentAi = getAI();
  try {
    const chat = currentAi.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are the NH Properties matching assistant. Your ultimate goal is to ACT LIKE A CLOSER and schedule a viewing for the customer.
Be a friendly human-like agent. 
After 2 or 3 questions from the user, transition seamlessly mapping to "This property seems like a perfect fit for you. Would you like me to take your phone number so one of our human agents can schedule a physical tour this weekend?" or similar.

When recommending properties, ONLY use the following properties from our database. DO NOT make up properties. 
If no properties match, say so politely. When recommending a property, always provide its title and price, and its ID so the user knows which one it is (e.g. Property ID: prop_1)

Database Properties:
${JSON.stringify(properties, null, 2)}
`
      }
    });

    // We can't directly supply all chat history if it's too unstructured here, 
    // but what we can do is let the frontend keep a continuous chat object, or we can just send the latest.
    // Since this function might run ephemerally, I'll just send the message with history context if we want.
    // Or we can rebuild the conversation. For simplicity, since the user asks via `askMatchmaker`, we'll include chatHistory in the prompt.
    
    let contents = `Here is the chat history:\n`;
    chatHistory.forEach(msg => {
      contents += `${msg.role === 'user' ? 'Customer' : 'Agent'}: ${msg.text}\n`;
    });
    contents += `\nCustomer: ${userMessage}\nAgent:`;

    const response = await currentAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are the NH Properties "Property Matchmaker" and Closer. Your ultimate goal is to schedule a viewing.
You must act natural, friendly, and helpful. 

Our database properties:
${JSON.stringify(properties, null, 2)}

Instructions:
1. Understand the user's need.
2. Recommend the best matching properties (maximum 3) from the database provided above.
3. ALWAYS format recommended property links as: [Property Title](/buy-rent#property_id) so the user can click it (Wait, frontend doesn't use hash links yet, but just mention the property clearly, or instruct them to find it). Actually, format them beautifully in markdown. Include the ID in bold so they can find it.
4. Smart Lead Capture (The Closer): After answering 1 or 2 of the user's messages (check the chat history length), NATURALLY PIVOT. Say something like: "This seems like a perfect fit. Would you like me to take your phone number so one of our human agents can schedule a physical tour this weekend?"
5. ONLY recommend properties that exist in the database provided. Do not invent properties.
`
      }
    });

    return response.text || "I'm having trouble matching right now. Please try again later.";
  } catch (error) {
    console.error("Gemini Matchmaker Error:", error);
    return "I'm currently unable to access our AI services. Please call us directly.";
  }
}

export async function estimatePropertyPrice(location: string, bhk: string, sqft: string, type: 'buy' | 'rent'): Promise<{ estimateRange: string, explanation: string, marketTrend: string, rentOrBuyAdvice: string }> {
  const currentAi = getAI();
  try {
    const prompt = `
You are an expert Real Estate AI Appraiser for Mumbai and surrounding areas.
A customer wants an estimation for:
Location: ${location}
BHK: ${bhk}
SqFt: ${sqft}
Type: ${type} (buy = Sale, rent = Rental)

Provide a realistic (but hypothetical) price estimate based on current market trends. 
Return your answer purely as a JSON object with strictly these keys:
{
  "estimateRange": "string, e.g., '₹3.0 Cr - ₹3.5 Cr' or '₹45k - ₹55k/mo'",
  "explanation": "string, 2 sentences explaining why",
  "marketTrend": "string, e.g., 'Rising', 'Stable'",
  "rentOrBuyAdvice": "string, 1 short sentence advising whether buying or renting makes sense right now in this market."
}
No Markdown formatting around the JSON. Return only the raw JSON.
`;

    const response = await currentAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text from Gemini");
  } catch (error) {
    console.error("Gemini Pricing Error:", error);
    return {
      estimateRange: "₹ --",
      explanation: "Unable to calculate AI estimation at this time.",
      marketTrend: "Unknown",
      rentOrBuyAdvice: "Please consult our human agents."
    };
  }
}

export async function magicPolishProperty(rawMessage: string): Promise<any> {
  const currentAi = getAI();
  try {
    const prompt = `
You are a Real Estate Assistant. Make this raw WhatsApp message into a professional property listing.
Raw Message: "${rawMessage}"

Return a JSON object with EXACTLY these keys:
{
  "title": "A catchy, professional title (e.g. 'Sunlit 3BHK Luxury Haven in Lokhandwala')",
  "location": "Best guess at the Mumbai neighborhood/area",
  "type": "sale or rent (guess based on price/text. If rent, typical price is small per month. If sale, it's Cr/Lakhs)",
  "bhk": "integer (number of bedrooms. default to 2 if unknown)",
  "price": "Formatted price (e.g. '₹2.5 Cr' or '₹65,000/mo')",
  "area": "Approximate sqft or default 'Approx 1000 sqft'",
  "description": "A polished 3-sentence sales pitch based on the shorthand notes. If no notes, make a generic appealing one.",
  "amenities": "Comma separated string of amenities (e.g. 'Parking, Lift, Security'). Guess reasonable ones if none provided."
}
No Markdown formatting around the JSON. Return only the raw JSON.`;

    const response = await currentAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text from Gemini");
  } catch (error) {
    console.error("Gemini Magic Polish Error:", error);
    // Fallback if AI fails
    return null;
  }
}
