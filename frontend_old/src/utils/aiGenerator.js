import { getApiUrl } from "./api";

/**
 * Generates structured page content from raw text using Backend Proxy (No Client Key).
 * @param {string} token - Admin Auth Token
 * @param {string} rawText - The unstructured raw text to process
 * @param {string[]} imageUrls - Array of available image URLs to distribute
 * @returns {Promise<Object>} - Structured JSON for page state
 */
export const generatePageContent = async (rawText, imageUrls = []) => {
  // if (!token) throw new Error("Admin Token is required");
  if (!rawText) throw new Error("Raw text is required");

  const prompt = `
    You are an expert Web Content Architect and UI Designer. 
    Your task is to transform the provided RAW TEXT into a structured JSON configuration for a modern corporate website layout ("UnioTechLayout").
    
    ### INSTRUCTIONS:
    1. **Analyze** the text to identify the core service/topic, key benefits, and detailed sections.
    2. **Humanize & Refine**: Rewrite the text to be professional, engaging, and "corporate-chic" (like Apple/Stripe marketing copy). Fix grammar and flow.
    3. **Structure**: Break content into logical sections:
       - **Hero**: A catchy title and subtitle.
       - **Paragraph Sections**: Main content blocks. Each must have a 'heading' and 'content' (HTML allowed).
       - **Table Sections**: If there are technical specs or comparisons, create a table.
       - **Stats**: Extract numerical data (e.g. "99% uptime") into a stats array.
    4. **Image Placement**: You have access to these image URLs: ${JSON.stringify(imageUrls)}. 
       - Distribute them intelligently across the 'paragraph' sections. 
       - Use 'image: "URL"' in the section object. 
       - If you run out of images, leave the field empty.
       - Do NOT invent fake URLs. Only use the ones provided.
    
    ### JSON OUTPUT SCHEMA:
    Return ONLY a valid JSON object with this structure:
    {
      "title": "Short, Punchy Title",
      "subtitle": "Engaging Subtitle",
      "type": "service",
      "heroImage": "${imageUrls[0] || ''}",
      "description": "Brief meta description",
      "layout": "sub_service_satyam",
      "sections": [
        {
          "type": "paragraph",
          "heading": "Section Heading",
          "content": "<p>Rich HTML content...</p>",
          "image": "${imageUrls[1] || ''}", 
          "features": ["Key takeaway 1", "Key takeaway 2"]
        },
        {
          "type": "table",
          "title": "Specs",
          "columns": ["Feature", "Detail"],
          "rows": [["Speed", "10Gbps"], ["Support", "24/7"]]
        }
      ],
      "stats": [ 
        { "value": "99.9%", "label": "Uptime" } 
      ]
    }

    ### RAW TEXT INPUT:
    ${rawText}
    `;

  try {
    const response = await fetch(getApiUrl('/api/ai/generate'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Server failed to generate content');
    }

    const data = await response.json();
    return data.data; // Backend returns { success: true, data: { ...json } }
  } catch (error) {
    console.error("AI Generation Failed:", error);
    throw new Error(error.message || "Failed to generate content.");
  }
};
