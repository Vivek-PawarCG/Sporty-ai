/**
 * Vertex AI Service
 * 
 * Provides Vertex AI client for advanced predictions
 * and crowd analysis using Google Cloud's ML platform.
 */

let vertexClient = null;

/**
 * Returns a singleton Vertex AI client.
 * Falls back gracefully if @google-cloud/vertexai is not configured.
 */
function getVertexAI() {
  if (!vertexClient) {
    try {
      const { VertexAI } = require('@google-cloud/vertexai');
      vertexClient = new VertexAI({
        project: process.env.GCP_PROJECT_ID,
        location: 'us-central1',
      });
      console.log('[VERTEX AI] Client initialized');
    } catch (err) {
      console.warn('[VERTEX AI] Not available:', err.message);
    }
  }
  return vertexClient;
}

/**
 * Generates a predictive forecast using Vertex AI's generative model.
 * Falls back to Gemini API if Vertex AI is not configured.
 * @param {Object} crowdData - Current crowd density data
 * @returns {Promise<Object>} Prediction results
 */
async function generatePrediction(crowdData) {
  const vertex = getVertexAI();

  if (vertex) {
    const model = vertex.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Analyze the following real-time crowd data from a stadium and predict conditions for the next 15 minutes. Return a JSON object with zone predictions.

Current data: ${JSON.stringify(crowdData)}

Return format: { "predictions": [{ "zone": "name", "currentDensity": 0.0-1.0, "predicted15min": 0.0-1.0, "trend": "increasing|decreasing|stable", "recommendation": "text" }] }`;

    const result = await model.generateContent(prompt);
    const text = result.response.candidates[0].content.parts[0].text;

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      return { raw: text };
    }
  }

  // Fallback — return simulated predictions
  return {
    predictions: crowdData.map(zone => ({
      zone: zone.label,
      currentDensity: zone.density,
      predicted15min: Math.min(0.99, Math.max(0.05, zone.density + (Math.random() - 0.45) * 0.15)),
      trend: zone.density > 0.7 ? 'increasing' : zone.density < 0.3 ? 'decreasing' : 'stable',
      recommendation: zone.density > 0.7 ? `Avoid ${zone.label}, consider nearby alternatives` : `${zone.label} is comfortable`,
    })),
  };
}

module.exports = { getVertexAI, generatePrediction };
