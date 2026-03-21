const SYSTEM_PROMPT = `You are a medical analysis assistant for a Smart Health Kiosk system.
You receive patient vital signs and must provide:
1. A brief health summary based on the readings
2. A risk level: low, moderate, high, or critical
3. A condition category (e.g., "hypertension", "respiratory concern", "obesity", "normal")
4. Preventive advice

Compare readings against WHO standard charts:
- Normal BP: systolic 90-120, diastolic 60-80
- Normal HR: 60-100 bpm
- Normal SpO2: 95-100%
- Normal Temp: 36.1-37.2°C
- Normal BMI: 18.5-24.9

IMPORTANT: You are NOT providing a clinical diagnosis. Always include a disclaimer.
Respond in JSON format:
{
  "summaryText": "...",
  "riskLevel": "low|moderate|high|critical",
  "conditionCategory": "...",
  "preventiveAdvice": "..."
}`;

async function analyzeVitals(vitals, patientHistory) {
  const apiKey = process.env.LLM_API_KEY;
  const apiUrl = process.env.LLM_API_URL;
  const model = process.env.LLM_MODEL || 'gpt-4';

  if (!apiKey || apiKey === 'your_llm_api_key') {
    return generateFallbackInsight(vitals);
  }

  const userMessage = `Patient vitals from latest measurement:
- Systolic BP: ${vitals.systolicBP ?? 'N/A'} mmHg
- Diastolic BP: ${vitals.diastolicBP ?? 'N/A'} mmHg
- Heart Rate: ${vitals.heartRate ?? 'N/A'} bpm
- SpO2: ${vitals.spo2 ?? 'N/A'}%
- Temperature: ${vitals.temperatureCelsius ?? 'N/A'}°C
- Weight: ${vitals.weightKg ?? 'N/A'} kg
- Height: ${vitals.heightCm ?? 'N/A'} cm
- BMI: ${vitals.bmi ?? 'N/A'}
${patientHistory ? `\nRecent history (last 3 readings): ${JSON.stringify(patientHistory)}` : ''}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('LLM API error, using fallback:', err.message);
    return generateFallbackInsight(vitals);
  }
}

function generateFallbackInsight(vitals) {
  const issues = [];
  let riskLevel = 'low';

  if (vitals.systolicBP > 140 || vitals.diastolicBP > 90) {
    issues.push('elevated blood pressure');
    riskLevel = vitals.systolicBP > 180 ? 'critical' : 'high';
  }
  if (vitals.spo2 != null && vitals.spo2 < 95) {
    issues.push('low oxygen saturation');
    riskLevel = vitals.spo2 < 90 ? 'critical' : 'high';
  }
  if (vitals.heartRate > 100) issues.push('elevated heart rate');
  if (vitals.heartRate != null && vitals.heartRate < 60) issues.push('low heart rate');
  if (vitals.temperatureCelsius > 37.5) {
    issues.push('elevated temperature');
    if (riskLevel === 'low') riskLevel = 'moderate';
  }
  if (vitals.bmi > 30) {
    issues.push('BMI indicates obesity');
    if (riskLevel === 'low') riskLevel = 'moderate';
  }

  const conditionCategory = issues.length === 0
    ? 'normal'
    : issues.includes('elevated blood pressure')
      ? 'hypertension'
      : issues.includes('low oxygen saturation')
        ? 'respiratory concern'
        : 'general concern';

  return {
    summaryText: issues.length === 0
      ? 'All vital signs are within normal ranges.'
      : `Detected: ${issues.join(', ')}. Please consult a healthcare professional for proper evaluation.`,
    riskLevel,
    conditionCategory,
    preventiveAdvice: issues.length === 0
      ? 'Continue maintaining a healthy lifestyle with regular exercise and balanced diet.'
      : 'Schedule a follow-up with a healthcare provider. Monitor your vitals regularly.',
  };
}

module.exports = { analyzeVitals };
