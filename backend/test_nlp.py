import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from services.nlp_engine import NLPEngine

def main():
    print("Initializing engine...")
    engine = NLPEngine()
    
    text = """
The Industrial Revolution was the transition to new manufacturing processes in Great Britain, continental Europe, and the United States, in the period from about 1760 to sometime between 1820 and 1840. This transition included going from hand production methods to machines, new chemical manufacturing and iron production processes, the increasing use of steam power and water power, the development of machine tools and the rise of the mechanized factory system. The Industrial Revolution also led to an unprecedented rise in the rate of population growth.

Textiles were the dominant industry of the Industrial Revolution in terms of employment, value of output and capital invested. The textile industry was also the first to use modern production methods.

The Industrial Revolution marks a major turning point in history; almost every aspect of daily life was influenced in some way. In particular, average income and population began to exhibit unprecedented sustained growth. Some economists have said the most important effect of the Industrial Revolution was that the standard of living for the general population in the western world began to increase consistently for the first time in history, although others have said that it did not begin to meaningfully improve until the late 19th and 20th centuries.

Please provide a summary of the format:
Aim: <Main purpose of the text>
Description: <Overview of what it was>
"""
    print("Abstractive output running...")
    res = engine.summarize_abstractive(text)
    with open("res.txt", "w", encoding="utf-8") as f:
        f.write(res)
    print("Done")

if __name__ == "__main__":
    main()
