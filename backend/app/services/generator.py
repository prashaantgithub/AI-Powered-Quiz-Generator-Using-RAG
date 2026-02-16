import json
import httpx
import re
import random
from typing import List, Dict
from llama_index.core import Settings
from llama_index.llms.ollama import Ollama
from app.core.exceptions import AIModelError
from app.schemas.dtos import QuizConfig, DifficultyCount

class QuizGenerator:
    def __init__(self):
        self._init_llm()

    def _init_llm(self):
        try:
            with httpx.Client() as client:
                response = client.get("http://localhost:11434/api/tags", timeout=5.0)
                if response.status_code != 200: raise ConnectionError()
            Settings.llm = Ollama(model="llama3.2:1b", request_timeout=60.0)
        except Exception:
            Settings.llm = None

    def _validate_and_repair(self, text: str, used_concepts: List[str]) -> Dict:
        try:
            start_idx = text.find('{')
            end_idx = text.rfind('}')
            if start_idx == -1 or end_idx == -1: return None
            data = json.loads(text[start_idx:end_idx+1])

            q_text = data.get("question_text", "").lower()
            if not q_text: return None
            
            # Guardrail 1: Filter metadata and institutional branding
            noise = ["data/", "uploads/", ".pdf", "christ university", "excellence", "service", "mission", "vision"]
            if any(word in q_text for word in noise):
                print("Validation Fail: Question contains forbidden institutional metadata.")
                return None

            # Guardrail 2: Prevent topic repetition
            concept = " ".join(q_text.split()[:3])
            if concept in used_concepts:
                print("Validation Fail: Question topic is a repeat.")
                return None
            
            # Repair 1: Ensure all 4 options exist
            opts = data.get("options", {})
            for opt in ["A", "B", "C", "D"]:
                if opt not in opts or not opts[opt]:
                    opts[opt] = "N/A"
            data["options"] = opts
            
            # Repair 2: Fix invalid answer key
            if data.get("correct_answer") not in opts:
                data["correct_answer"] = random.choice(list(opts.keys()))

            return data
        except Exception:
            return None

    def _get_prompt(self, difficulty: str) -> str:
        return f"""
        Generate ONE {difficulty.upper()} MCQ from the context.
        Rules:
        - 4 options (A,B,C,D).
        - No university names.
        - Focus on technical concepts.
        - Your response MUST start with {{ and end with }}.

        Format:
        {{
            "question_text": "...",
            "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
            "correct_answer": "A",
            "difficulty": "{difficulty}",
            "explanation": "...",
            "reference_context": "..."
        }}
        """

    def generate_quiz(self, index, config: QuizConfig) -> List[Dict]:
        self._init_llm()
        if Settings.llm is None: raise AIModelError("Ollama not running.")

        counts = config.custom_distribution if config.mode == "custom" else DifficultyCount(easy=10, medium=10, hard=10)
        all_questions = []
        used_concepts = []

        for diff in ["easy", "medium", "hard"]:
            target = getattr(counts, diff)
            generated = 0
            attempts = 0
            while generated < target and attempts < 20: # Max 20 attempts
                attempts += 1
                
                # CRITICAL FIX: Randomize the context to break loops
                retriever = index.as_retriever(similarity_top_k=5)
                random_query = f"Generate a random {diff} question about a core topic."
                nodes = retriever.retrieve(random_query)
                query_engine = index.as_query_engine(nodes=nodes)
                
                print(f"Generating {diff} Q {generated + 1}/{target} (Attempt {attempts})...")
                try:
                    response = query_engine.query(self._get_prompt(diff))
                    q_obj = self._validate_and_repair(str(response), used_concepts)
                    
                    if q_obj:
                        all_questions.append(q_obj)
                        used_concepts.append(" ".join(q_obj['question_text'].split()[:3]))
                        generated += 1
                        print("Success.")
                except Exception: continue

        if not all_questions:
            raise AIModelError("The AI failed to generate any valid questions from this document.")
        return all_questions

generator_service = QuizGenerator()