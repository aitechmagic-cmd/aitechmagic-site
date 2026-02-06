// netlify/functions/analyze-fit.js
const VIRGINIA_PROFILE = `
PROFESSIONAL PROFILE — Virginia | AI/ML Leader & Consultant

CURRENT ROLE: AI/ML Manager at Emerson (Measurement Solutions Division)
- Leading a global team of 15+ data scientists and AI/ML engineers across 6 locations (Minnesota, Colorado, Costa Rica, Berlin, Cluj, Pune)
- Managing ~$2M annual budget for AI/ML initiatives
- Built the AI/ML capability from the ground up, scaling from a small group to 15+ professionals

KEY ACHIEVEMENTS:
- Tech Expert Chatbot: Achieved 87% accuracy, full AI Governance Board approval, projected $4.8M annual savings
- Next Generation Customer Care (NGCC): $7-8M transformation program with Deloitte (42-week project)
- Innovation Lab Framework: Compressed AI development cycles from 18-24 months to 2-4 weeks (CMMC in 2 days, ISA in 3 days)
- Target Discount Engine and Configure-to-Order automation initiatives
- AI Governance frameworks using Gartner TRiSM methodology
- Comprehensive AI portfolio management systems

TECHNICAL EXPERTISE:
- AI/ML Strategy & Governance
- Large Language Models (LLMs) & Chatbot Development
- AI Governance (Gartner TRiSM framework)
- Data Science & Analytics
- NLP / Natural Language Processing
- Machine Learning Engineering
- MLOps & Model Deployment
- Cloud Platforms (Databricks, Azure)
- Python, Data Pipelines, ETL
- Rapid Prototyping & Innovation Labs

LEADERSHIP & MANAGEMENT:
- Global team management across 6 international locations
- Vendor relationship management (Databricks, Deloitte, Mavenoid)
- Cross-functional stakeholder management (Legal, Security, HR, Compliance, Enterprise IT)
- Budget management (~$2M)
- Hybrid team building (FTEs + strategic contractors)
- Joint Architecture Review processes bridging AI and data functions

INDUSTRY EXPERIENCE:
- Emerson (Manufacturing / Industrial Automation) — AI/ML Manager
- Zeiss (Optics / Precision Technology) — AI Initiatives
- Medtronic (Medical Devices / Healthcare Technology)
- IBM (Semiconductor / ASIC Design) — Engineering

EDUCATION & CERTIFICATIONS:
- Engineering background (IBM ASIC Design)
- Cornell University — AI/ML Certifications
- Continuous learning in AI, data science, and leadership

CONSULTING SERVICES (AI Tech Magic):
- AI Strategy & Roadmap Development
- AI Governance & Responsible AI Frameworks
- Rapid AI Prototyping & Innovation Labs (2-4 week sprints)
- LLM/Chatbot Implementation & Optimization
- AI Team Building & Scaling
- Digital Transformation with AI
- Manufacturing & Industrial AI Applications
- AI Portfolio Management & Prioritization
`;

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { jobDescription } = JSON.parse(event.body);

    if (!jobDescription || !jobDescription.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: "Job description is required" }) };
    }

    // Rate limit: basic check on description length
    if (jobDescription.length > 15000) {
      return { statusCode: 400, body: JSON.stringify({ error: "Job description too long. Please limit to 15,000 characters." }) };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are an AI assistant for AI Tech Magic, an AI consulting firm led by Virginia. Analyze this job description against Virginia's professional profile and determine fit.

VIRGINIA'S PROFILE:
${VIRGINIA_PROFILE}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with a JSON object (no markdown, no backticks, no preamble):
{
  "overallFit": <number 0-100>,
  "fitLabel": "<Strong Match|Good Match|Moderate Match|Weak Match>",
  "headline": "<one compelling sentence about why Virginia fits>",
  "strengthAreas": [{"requirement": "<req>", "evidence": "<Virginia's experience>", "matchLevel": "strong"}],
  "partialAreas": [{"requirement": "<req>", "evidence": "<related experience>", "matchLevel": "partial"}],
  "gaps": [{"requirement": "<req>", "note": "<brief note>", "matchLevel": "gap"}],
  "skillTags": [{"skill": "<n>", "match": "strong|partial|gap"}],
  "summary": "<2-3 sentence fit summary>",
  "callToAction": "<suggested next step>"
}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return { statusCode: 500, body: JSON.stringify({ error: "Analysis failed. Please try again." }) };
    }

    // Parse the AI response to validate it's proper JSON
    const text = data.content.map((i) => i.text || "").join("");
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Something went wrong. Please try again." }) };
  }
};
