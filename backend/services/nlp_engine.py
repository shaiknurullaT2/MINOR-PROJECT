import os
from typing import List, Dict, Any
import string
import math

class NLPEngine:
    def __init__(self):
        self.summarizer = None
        self.nlp = None
        self.spacy_loaded = False
        self._try_load_models()

    def _try_load_models(self):
        """Lazy-load heavy ML models — server starts even if they aren't installed."""
        try:
            from transformers import pipeline
            print("Loading HuggingFace Instruction Model (FLAN-T5)...")
            self.summarizer = pipeline("text2text-generation", model="google/flan-t5-base", framework="pt")
            print("HuggingFace model loaded.")
        except Exception as e:
            print(f"[WARN] HuggingFace model not loaded: {e}. Will use extractive fallback.")

        try:
            import spacy
            print("Loading spaCy NLP Model...")
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                import subprocess, sys
                subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
                self.nlp = spacy.load("en_core_web_sm")
            self.spacy_loaded = True
            print("spaCy model loaded.")
        except Exception as e:
            print(f"[WARN] spaCy not loaded: {e}. Will use basic tokenization fallback.")

    def summarize_abstractive(self, text: str, length: str = "medium") -> str:
        """Uses HuggingFace transformer if available, else falls back to extractive."""
        input_length = len(text.split())
        if input_length < 30:
            return text

        if self.summarizer is None:
            return self.summarize_extractive(text, length)

        # Step 1: Core Meaning Extraction (Chunking)
        words = text.split()
        chunk_size = 350
        chunks = [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]
        
        core_meanings = []
        for chunk in chunks:
            prompt_step1 = f"""Read the following text and explain its core meaning in simple words.
Do NOT copy input text.
Do NOT just compress text.
Always rewrite in simple words.
Focus on full meaning.

Text:
{chunk}
"""
            try:
                res = self.summarizer(prompt_step1, max_length=512, do_sample=False)
                core_meanings.append(res[0]['generated_text'].strip())
            except Exception as e:
                print(f"Summarization chunk error: {e}")
                # Fallback to extractive for this chunk
                core_meanings.append(self.summarize_extractive(chunk, "short"))

        combined_meaning = " ".join(core_meanings)

        # Extract intent from the original text (usually at the start or end)
        intent_hint = " ".join(words[:100]) + (" ... " + " ".join(words[-100:]) if len(words) > 100 else "")

        # Step 2: Intent-Based Final Output
        prompt_step2 = f"""You are an intelligent Answer Extractor.
Generate output based on the user's intent.

Rules:
- Check the Format Hints. If a specific format is requested -> follow that format strictly.
- If no format is mentioned -> give:

(short clear explanation)

Keywords:
(point-wise important terms)

- Do NOT copy input text
- Write in simple words

Format Hints:
{intent_hint}

Extracted Core Meaning:
{combined_meaning}"""

        try:
            result = self.summarizer(prompt_step2, max_length=1024, do_sample=False)
            return result[0]['generated_text'].strip()
        except Exception as e:
            print(f"Summarization final error: {e}")
            return self.summarize_extractive(text, length)

    def _basic_extractive(self, text: str, length: str = "medium") -> str:
        """Very simple sentence-score summarizer with no external deps."""
        import re
        sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', text) if len(s.split()) > 5]
        total = len(sentences)
        if total == 0:
            return text

        if length == "short":
            n = max(1, int(total * 0.2))
        elif length == "long":
            n = max(3, int(total * 0.5))
        else:
            n = max(2, int(total * 0.35))

        # Score by position — earlier sentences tend to be more informative
        scored = [(i, sent) for i, sent in enumerate(sentences)]
        scored.sort(key=lambda x: x[0])  # keep original order
        extracted_text = " ".join([s for _, s in scored[:n]])
        
        tk = self.extract_topics_and_keywords(text)
        keywords_str = "\n".join(f"- {k}" for k in tk.get("keywords", [])[:5])
        
        return f"{extracted_text}\n\nKeywords:\n{keywords_str}"

    def summarize_extractive(self, text: str, length: str = "medium") -> str:
        """spaCy-based if loaded, otherwise basic regex fallback."""
        if not self.spacy_loaded:
            return self._basic_extractive(text, length)

        import spacy
        doc = self.nlp(text)

        word_frequencies = {}
        for word in doc:
            if word.text.lower() not in spacy.lang.en.stop_words.STOP_WORDS and word.text.lower() not in string.punctuation:
                w = word.text.lower()
                word_frequencies[w] = word_frequencies.get(w, 0) + 1

        max_frequency = max(word_frequencies.values()) if word_frequencies else 1
        for word in word_frequencies:
            word_frequencies[word] /= max_frequency

        sentence_scores = {}
        for sent in doc.sents:
            for word in sent:
                if word.text.lower() in word_frequencies:
                    sentence_scores[sent] = sentence_scores.get(sent, 0) + word_frequencies[word.text.lower()]

        total_sentences = len(list(doc.sents))
        if length == "short":
            num_sents = max(1, int(total_sentences * 0.2))
        elif length == "long":
            num_sents = max(3, int(total_sentences * 0.5))
        else:
            num_sents = max(2, int(total_sentences * 0.35))

        from heapq import nlargest
        summarized_sentences = nlargest(num_sents, sentence_scores, key=sentence_scores.get)
        final_sentences = [w.text for w in doc.sents if w in summarized_sentences]
        extracted_text = " ".join(final_sentences)

        tk = self.extract_topics_and_keywords(text)
        keywords_str = "\n".join(f"- {k}" for k in tk.get("keywords", [])[:5])
        
        return f"{extracted_text}\n\nKeywords:\n{keywords_str}"

    def extract_key_points(self, text: str, num_points: int = 5) -> List[str]:
        """Extract key bullet points. Uses spaCy if available, else basic."""
        if not self.spacy_loaded:
            import re
            sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', text) if 6 < len(s.split()) < 30]
            return sentences[:num_points]

        doc = self.nlp(text)
        scored_sentences = []
        for sent in doc.sents:
            score = len([e for e in sent.ents]) * 2 + (len(sent.text.split()) * 0.1)
            scored_sentences.append((sent.text.strip(), score))

        valid_sentences = [s for s, _ in sorted(scored_sentences, key=lambda x: x[1], reverse=True)
                           if 5 < len(s.split()) < 30]
        return valid_sentences[:num_points]

    def generate_smart_study(self, text: str) -> Dict[str, Any]:
        """Smart Study Mode."""
        summary = self.summarize_abstractive(text, length="medium")
        key_points = self.extract_key_points(text, num_points=7)

        revision_notes = []
        if self.spacy_loaded:
            doc = self.nlp(text)
            for sent in doc.sents:
                ents = list(sent.ents)
                if ents and len(sent.text.split()) < 25 and len(revision_notes) < 5:
                    focus_entity = ents[0].text
                    note = sent.text.replace(focus_entity, f"**{focus_entity}**")
                    if note not in revision_notes:
                        revision_notes.append(f"Remember: {note.strip()}")

        return {
            "summary": summary,
            "key_points": key_points,
            "exam_revision_notes": revision_notes,
            "original_length": len(text)
        }


    def get_document_insights(self, original_text: str, summary_text: str) -> Dict[str, Any]:
        """Calculates advanced document insights like reading time and compression."""
        orig_words = len(original_text.split())
        summ_words = len(summary_text.split())
        
        # Difficulty basic heuristic
        avg_word_len = sum(len(w) for w in original_text.split()) / max(1, orig_words)
        if avg_word_len > 6.5: difficulty = "Advanced"
        elif avg_word_len > 5.0: difficulty = "Medium"
        else: difficulty = "Easy"

        return {
            "word_count": orig_words,
            "sentence_count": len([s for s in original_text.split('.') if len(s.strip()) > 2]),
            "reading_time_mins": max(1, math.ceil(orig_words / 200)),
            "summary_compression_ratio": round((1 - (summ_words / max(1, orig_words))) * 100) if orig_words > 0 else 0,
            "difficulty_level": difficulty
        }

    def extract_topics_and_keywords(self, text: str) -> Dict[str, List[str]]:
        """Extracts main topics and keywords using spaCy."""
        if not self.spacy_loaded:
            return {"topics": ["General Topic"], "keywords": ["Key1", "Key2"]}
            
        doc = self.nlp(text)
        
        chunks = {}
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) <= 3 and chunk.root.pos_ in ["NOUN", "PROPN"]:
                txt = chunk.text.lower().strip()
                if txt not in self.nlp.Defaults.stop_words:
                    chunks[txt] = chunks.get(txt, 0) + 1
                    
        sorted_chunks = sorted(chunks.items(), key=lambda x: x[1], reverse=True)
        topics = [t[0].title() for t in sorted_chunks[:5]]
        
        keywords_dict = {}
        for ent in doc.ents:
            txt = ent.text.strip()
            if len(txt) > 2 and "\n" not in txt:
                keywords_dict[txt] = keywords_dict.get(txt, 0) + 1
        
        sorted_keys = sorted(keywords_dict.items(), key=lambda x: x[1], reverse=True)
        keywords = [k[0] for k in sorted_keys[:10]]
        
        if not keywords:
            keywords = [t[0].title() for t in sorted_chunks[5:15]]

        return {"topics": topics, "keywords": keywords}

    def extract_important_sentences(self, text: str, max_sentences=5) -> List[str]:
        """Returns the most important sentences unchanged."""
        if not self.spacy_loaded: return []
        import re
        sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', text) if len(s.split()) > 5]
        return sentences[:max_sentences]

    def generate_flashcards(self, text: str) -> List[Dict[str, str]]:
        """Generates flashcards by finding definition contexts."""
        if not self.spacy_loaded:
            return []
            
        doc = self.nlp(text)
        flashcards = []
        for sent in doc.sents:
            if len(flashcards) >= 5: break
            txt = sent.text.strip()
            if " is " in txt or " refers to " in txt or " means " in txt:
                parts = txt.split(" is ", 1)
                if len(parts) != 2: parts = txt.split(" refers to ", 1)
                if len(parts) != 2: parts = txt.split(" means ", 1)
                
                if len(parts) == 2 and len(parts[0].split()) < 5:
                    front = f"What is {parts[0].strip()}?"
                    back = parts[1].strip().capitalize()
                    flashcards.append({"front": front, "back": back})
                    
        return flashcards

    def generate_quiz(self, text: str) -> List[Dict[str, Any]]:
        """Generates multiple-choice quizzes using entities."""
        if not self.spacy_loaded:
            return []
            
        import random
        doc = self.nlp(text)
        quizzes = []
        
        all_ents = list(set([e.text for e in doc.ents if len(e.text) > 3]))
        
        for sent in doc.sents:
            if len(quizzes) >= 5: break
            ents = [e for e in sent.ents]
            if ents and 10 < len(sent.text.split()) < 30:
                target_ent = ents[0].text
                question = sent.text.replace(target_ent, "________")
                
                options = [target_ent]
                wrongs = [e for e in all_ents if e != target_ent]
                random.shuffle(wrongs)
                options.extend(wrongs[:3])
                
                defaults = ["Algorithm", "System", "Process", "Data", "Analysis"]
                while len(options) < 4:
                    opt = random.choice(defaults)
                    if opt not in options: options.append(opt)
                    
                random.shuffle(options)
                letters = ["A", "B", "C", "D"]
                opts_dict = {letters[i]: options[i] for i in range(4)}
                
                correct_letter = next(k for k, v in opts_dict.items() if v == target_ent)
                
                quizzes.append({
                    "question": question.strip(),
                    "options": opts_dict,
                    "correct_answer": correct_letter,
                    "correct_text": target_ent
                })
                
        return quizzes

    def generate_mindmap(self, topics: List[str], keywords: List[str]) -> Dict[str, Any]:
        """Creates a hierarchical JSON tree for mind map visualization."""
        main_topic = topics[0] if topics else "Main Topic"
        
        branches = []
        if len(topics) > 1:
            for i, t in enumerate(topics[1:4]):
                start_idx = i * 2
                branches.append({
                    "name": t,
                    "children": [{"name": k} for k in keywords[start_idx:start_idx+2]]
                })
        else:
            branches = [{"name": "Subtopics", "children": [{"name": k} for k in keywords[:4]]}]
            
        return {
            "name": main_topic,
            "children": branches
        }

# Singleton instance
nlp_engine = None

def get_nlp_engine():
    global nlp_engine
    if nlp_engine is None:
        nlp_engine = NLPEngine()
    return nlp_engine
