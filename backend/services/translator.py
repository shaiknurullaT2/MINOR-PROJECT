from deep_translator import GoogleTranslator

class ContentTranslator:
    
    @staticmethod
    def translate_text(text: str, target_language: str) -> str:
        """
        Translates text to a specified target language using deep-translator.
        Supported shortcodes (example): 'es' (Spanish), 'fr' (French), 'de' (German), 'hi' (Hindi)
        """
        try:
            # Note: Google Translator handles batches up to 5k chars. For a summary, it's perfect.
            translator = GoogleTranslator(source='auto', target=target_language)
            return translator.translate(text)
        except Exception as e:
            print(f"Translation Error: {e}")
            return text # fallback to original if it fails
