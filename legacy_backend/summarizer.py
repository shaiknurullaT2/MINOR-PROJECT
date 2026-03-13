import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
import string

# Download necessary NLTK models if not present
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('punkt_tab', quiet=True)

def generate_summary(text, compression_ratio=0.3):
    """
    Generates a summary of the input text using NLTK word frequency scoring.
    """
    if not text or len(text.strip()) == 0:
        return ""

    # Tokenizing the text
    stopWords = set(stopwords.words("english"))
    words = word_tokenize(text)

    # Creating a frequency table to keep the score of each word
    freqTable = dict()
    for word in words:
        word = word.lower()
        if word in stopWords or word in string.punctuation:
            continue
        if word in freqTable:
            freqTable[word] += 1
        else:
            freqTable[word] = 1

    # Creating a dictionary to keep the score of each sentence
    sentences = sent_tokenize(text)
    sentenceValue = dict()

    for sentence in sentences:
        for word, freq in freqTable.items():
            if word in sentence.lower():
                if sentence in sentenceValue:
                    sentenceValue[sentence] += freq
                else:
                    sentenceValue[sentence] = freq

    # Determine average sentence score to find a threshold
    sumValues = 0
    for sentence in sentenceValue:
        sumValues += sentenceValue[sentence]

    if len(sentenceValue) == 0:
        return text

    average = int(sumValues / len(sentenceValue))

    # Determine threshold based on compression_ratio (1.0 = avg, >1.0 = more strict, <1.0 = less strict)
    # Default is 1.2 x average
    threshold = average * (1 + (1 - compression_ratio))

    # Generating the summary
    summary = ''
    for sentence in sentences:
        if (sentence in sentenceValue) and (sentenceValue[sentence] > threshold):
            summary += " " + sentence

    # Fallback if too short
    if len(summary.strip()) == 0 and len(sentences) > 0:
        # Just return the top 3 scoring sentences or all if < 3
        sorted_sentences = sorted(sentenceValue.items(), key=lambda x: x[1], reverse=True)
        top_n = min(max(1, int(len(sentences) * compression_ratio)), len(sentences))
        selected_sentences = [s[0] for s in sorted_sentences[:top_n]]
        
        # Preserve original order
        summary = " ".join([s for s in sentences if s in selected_sentences])

    return summary.strip()
