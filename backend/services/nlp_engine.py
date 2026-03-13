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
            print("Loading HuggingFace Summarization Model...")
            self.summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", framework="pt")
            print("HuggingFace model loaded.")
        except Exception as e:
            print(f"[WARN] HuggingFace model not loaded: {e}. Will use extractive fallback.")

        try:
            import spacy
            print("Loading spaCy NLP Model...")
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                import subprocess
                subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True)
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

        if length == "short":
            max_len = max(30, int(input_length * 0.2))
            min_len = max(10, int(input_length * 0.1))
        elif length == "long":
            max_len = max(50, int(input_length * 0.5))
            min_len = max(20, int(input_length * 0.3))
        else:
            max_len = max(40, int(input_length * 0.35))
            min_len = max(15, int(input_length * 0.2))

        truncated_text = " ".join(text.split()[:800])

        try:
            result = self.summarizer(truncated_text, max_length=max_len, min_length=min_len, do_sample=False)
            return result[0]['summary_text'].strip()
        except Exception as e:
            print(f"Summarization error: {e}")
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
        return " ".join([s for _, s in scored[:n]])

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
        return " ".join(final_sentences)

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


# Singleton instance
nlp_engine = None

def get_nlp_engine():
    global nlp_engine
    if nlp_engine is None:
        nlp_engine = NLPEngine()
    return nlp_engine
