import OpenAI from "openai";
//import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractScoresAndSuggestions(content: string) {
  const overAllScoreMatch = content.match(/Overall score=(\d+)/);
  const relevanceScoreMatch = content.match(/Relevance score=(\d+)/);
  const clarityScoreMatch = content.match(/Clarity score=(\d+)/);
  const completenessScoreMatch = content.match(/Completeness score=(\d+)/);
  const suggestionsMatch = content.match(/Suggestions=(.*)/);

  const overallScore = overAllScoreMatch ? parseInt(overAllScoreMatch[1]) : 0;
  const relevanceScore = relevanceScoreMatch
    ? parseInt(relevanceScoreMatch[1])
    : 0;
  const clarityScore = clarityScoreMatch ? parseInt(clarityScoreMatch[1]) : 0;
  const completenessScore = completenessScoreMatch
    ? parseInt(completenessScoreMatch[1])
    : 0;
  const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : "";

  return {
    overallScore,
    relevanceScore,
    clarityScore,
    completenessScore,
    suggestions,
  };
}

export const generateQuestions = async (
  industry: string,
  topic: string,
  type: string,
  role: string,
  numOfQuestions: number,
  duration: number,
  difficulty: string
) => {
  const tokensPerQuestion = 500; // Estimate tokens per question
  const max_tokens = tokensPerQuestion * numOfQuestions;

  const prompt = `
    Generate total "${numOfQuestions}" "${difficulty}" "${type}" interview questions for the topic "${topic}" in the "${industry}" industry.
    The interview is for a candidate applying for the role of "${role}" and total duration of interview is "${duration}" minutes.
    
    **Ensure the following:**
    - The questions are well-balanced, including both open-ended and specific questions.
    - Each question is designed to evaluate a specific skill or knowledge area relevant to the role.
    - The questions are clear, concise and engaging for the candidate.
    - The questions are suitable for a "${difficulty}" interview in the "${industry}" industry.
    - Ensure the questions are directly aligned with "${difficulty}" responsibilities and expertise in "${role}".
    
    **Instructions:**
    - Always follow same format for questions.
    - Provide all question without any prefix.
    - No question number or bullet points or hypen - is required.
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are expert in generating questions tailored to specific roles, industries, experience levels and topic. You responses should be professional, concise and well-structured. respond in thai language. `,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: max_tokens,
    temperature: 0.8,
  });

  const content = response.choices[0].message.content;

  if (!content) {
    throw new Error("No content returned from OpenAI API");
  }

  const questions = content
    ?.trim()
    .split("\n")
    .filter((q) => q)
    .map((q) => {
      return { question: q };
    });

  return questions;
};

export const evaluateAnswer = async (question: string, answer: string) => {
  const prompt = ` 
    Evaluate the following answer to the question based on the evaluation criteria and provide the scores for relevance, clarity, and completeness, followed by suggestions in text format.
    
    **Evaluation Criteria:**
        1. Overall Score: Provide an overall score out of 10 based on the quality of the answer.
        2. Relevance: Provide a score out of 10 based on how relevant the answer is to the question.
        3. Clarity: Provide a score out of 10 based on how clear and easy to understand the explanation is.
        4. Completeness: Provide a score out of 10 based on how well the answer covers all aspects of the question.
        5. Suggestions: Provide any suggestions or improvements to the answer in text.

    **Question:** ${question}
    **Answer:** ${answer}

    **Instructions:**
        - Always follow same format for providing scores and suggestions.
        - Provide the score only like "Overall score=5", "Relevance score=7", "Clarity =9", "Completeness score=1", for following:
            - Overall score
            - Relevance score
            - Clarity score
            - Completeness score
        -Provide text only for following only like "Suggestions=your_answer_here":  
            - Suggestions or improved answer in text.
  
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert evaluator with a strong understanding of assessing answers to interview questions. respond in thai language. `,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 500,
    temperature: 0.8,
  });

  const content = response.choices[0].message.content;

  if (!content) {
    throw new Error("No content returned from OpenAI API");
  }
  const result = extractScoresAndSuggestions(content);
  return {
    overallScore: result.overallScore,
    relevance: result.relevanceScore,
    clarity: result.clarityScore,
    completeness: result.completenessScore,
    suggestion: result.suggestions,
  };
};

/* evaluateAnswer(
  "โปรดบอกถึงสถานการณ์ที่คุณต้องเรียนรู้เทคโนโลยีใหม่ ๆ อย่างรวดเร็วเพื่อใช้ในการพัฒนาโครงการ คุณใช้วิธีการอะไรในการเรียนรู้ และคุณนำความรู้นั้นไปใช้อย่างไร?",
  "ในสถานการณ์ที่ต้องเรียนรู้เทคโนโลยีใหม่ ๆ อย่างรวดเร็ว ฉันมักจะเริ่มจากการค้นคว้าข้อมูลเบื้องต้นจากเอกสารออนไลน์ เช่น คู่มือการใช้งาน หรือบทความที่เกี่ยวข้อง จากนั้นฉันจะทดลองสร้างโปรเจกต์เล็ก ๆ เพื่อให้เข้าใจการทำงานของเทคโนโลยีนั้น ๆ อย่างลึกซึ้งยิ่งขึ้น"
); */
