// Mock data for testing the interview result page
export const mockInterviewAssessment = {
    "feedback": {
        "industry_specific_feedback": {
            "domain_strengths": [
                "Exceptional ability to articulate complex AI concepts and their practical applications.",
                "Strong experience in leveraging Python and AWS for building, training, and deploying AI models.",
                "Proficiency in recommendation engines, time series forecasting, and generative AI (multimodal LLMs, RAG).",
                "Demonstrates a proactive approach to learning and applying new AI advancements."
            ],
            "domain_improvement_areas": [
                "While the candidate demonstrates strong technical skills, further exploration into managing large-scale distributed AI systems and their associated complexities could be beneficial.",
                "Deepen understanding of specific security vulnerabilities unique to AI models (e.g., adversarial attacks) and mitigation strategies beyond standard code security."
            ],
            "technical_feedback_for_candidate": "Anand possesses a strong command of AI technologies, particularly in Generative AI and LLMs. His experience with Python, AWS, and various AI libraries is evident. He effectively communicates technical details and project outcomes. Continued focus on the nuances of productionizing AI at scale, including advanced monitoring for model drift and optimizing inference for real-time applications, will be valuable. Exploring advanced security measures specific to AI models would further enhance his profile.",
            "technical_feedback_for_recruiters": "The candidate is highly proficient in core AI technologies and their application. Recruiters should look for roles that leverage his expertise in Generative AI, LLMs, and cloud-based AI deployments. His ability to translate technical concepts into business value and his proactive learning approach make him a strong asset. Areas for further technical vetting could include deep dives into distributed systems for AI and advanced AI-specific security protocols."
        },
        "overall_feedback_for_recruiters": "Anand is a highly skilled and motivated AI professional with a strong understanding of Generative AI, LLMs, and their practical applications. He demonstrates excellent technical proficiency, problem-solving abilities, and a proactive approach to learning. His experience with Python, AWS, and various AI projects, including recommendation engines and AI-driven platforms, is impressive. He communicates effectively and shows a clear passion for innovation and delivering measurable value. Anand is a strong candidate for roles requiring expertise in AI development and implementation.",
        "universal_feedback_for_candidate": "Anand, your passion for AI and your ability to articulate your experiences and insights are commendable. You demonstrate a strong capacity for problem-solving and a proactive approach to learning new technologies, which are crucial in the fast-evolving field of AI. Continue to hone your skills in communicating complex technical details to diverse audiences and be prepared to elaborate on the strategic impact of your technical decisions in future discussions. Your drive to innovate and deliver value is a significant strength.",
        "universal_feedback_for_recruiters": "The candidate exhibits strong communication skills, a proactive learning attitude, and a clear passion for the AI domain. His ability to connect technical solutions to business value and his experience in handling complex projects are notable. Recruiters should note his potential for growth and his enthusiasm for tackling challenging problems. His responses indicate a good cultural fit for innovative and forward-thinking teams.",
        "areas_of_improvement_for_candidate": []
    },
    "industry_type": "IT",
    "overall_score": 92,
    "assessment_type": "comprehensive_industry_specific",
    "technical_score": 90,
    "confidence_level": "high",
    "universal_scores": {
        "teamwork_score": 85,
        "adaptability_score": 95,
        "cultural_fit_score": 90,
        "communication_score": 90,
        "problem_solving_score": 90,
        "leadership_potential_score": 85
    },
    "interview_version": "v2.0_industry_aware",
    "assessment_timestamp": "2025-08-14T22:47:12.365731",
    "final_recommendation": "strong_hire",
    "interview_quality_score": 9,
    "industry_competency_scores": {
        "integrity_ethics": 0,
        "record_keeping_accuracy": 0,
        "decision_making_constraints": 0,
        "policy_regulation_awareness": 0,
        "bureaucratic_process_knowledge": 0
    }
};

export const mockConversationLog = [
    {
        "type": "assistant",
        "role": "assistant",
        "content": "Hello! Welcome to your AI interview. I'm excited to learn about your experience and expertise in AI and technology. Let's start with a brief introduction - could you tell me about yourself and your background in AI?"
    },
    {
        "type": "user",
        "role": "user",
        "content": "Hi! Thanks for having me. I'm Anand, and I have over 5 years of experience in AI and machine learning. I've worked extensively with Python, AWS, and various AI frameworks. My expertise includes generative AI, LLMs, recommendation engines, and time series forecasting. I'm particularly passionate about implementing AI solutions that deliver real business value."
    },
    {
        "type": "assistant",
        "role": "assistant",
        "content": "That's impressive! Your experience with generative AI and LLMs is particularly relevant in today's market. Can you walk me through a specific project where you implemented a recommendation engine? What challenges did you face and how did you overcome them?"
    },
    {
        "type": "user",
        "role": "user",
        "content": "Certainly! I worked on a recommendation engine for an e-commerce platform that needed to handle millions of users and products. The main challenges were scalability and cold start problems. I implemented a hybrid approach combining collaborative filtering with content-based filtering, and used AWS SageMaker for model training and deployment. For the cold start problem, I incorporated content-based features and implemented a multi-armed bandit approach to quickly learn user preferences."
    },
    {
        "type": "assistant",
        "role": "assistant",
        "content": "Excellent problem-solving approach! The hybrid methodology and multi-armed bandit solution show sophisticated thinking. Now, tell me about your experience with large language models. Have you worked with RAG (Retrieval-Augmented Generation) systems?"
    },
    {
        "type": "user",
        "role": "user",
        "content": "Yes, I've implemented several RAG systems. One notable project was building an internal knowledge base assistant for a company with over 10,000 documents. I used vector databases like Pinecone for efficient similarity search, implemented chunking strategies to optimize retrieval, and fine-tuned the embedding models for domain-specific content. The system achieved 85% accuracy in answering employee queries and reduced support ticket volume by 40%."
    }
];
