"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeImmprove = exports.generateQuizPrompt = exports.insightPrompt = void 0;
const insightPrompt = ({ industry }) => (`
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRange": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutLook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }

          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
`);
exports.insightPrompt = insightPrompt;
const generateQuizPrompt = ({ industry, skills }) => (`

  Generate 10 technical interview questions for a ${industry} professional ${(skills === null || skills === void 0 ? void 0 : skills.length) ? `with expertise in ${skills.join(',')}` : ""},

  Each question should be multiple choice with 4 options.

  Return the response in this JSON format only, no additional text: 
  {
  "questions":[
      {
        "question":"string",
        "options":["string","string","string","string"],
        "correctAnswer":"string",
        "explanation":"string"
      }
    ]
  }

`);
exports.generateQuizPrompt = generateQuizPrompt;
const resumeImmprove = ({ industry, type, current }) => (`

  As an expert resume writer, improve the following ${type} description for a ${industry} professional.
  Make it more impactful, quantifiable, and aligned with industry standards.
  Current content: "${current}".

  Requirements:
  1. Use action verbs
  2. Include metrics and results where possible
  3. Highlight relevant technical skills
  4. Keep it concise but detailed
  5. Focus on achievements over responsibilities
  6. Use industry-specific keywords

  Format the response as a single paragraph without any additional text or explanations.
`);
exports.resumeImmprove = resumeImmprove;
