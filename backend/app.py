from flask import Flask, request, jsonify
from flask_cors import CORS
from summarizer import generate_summary

app = Flask(__name__)
# Enable CORS for frontend to communicate with backend
CORS(app)

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "running", "message": "Text Summarizer API is operational."})

@app.route('/api/summarize', methods=['POST'])
def summarize():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400

        text = data['text']
        compression_ratio = data.get('compression_ratio', 0.3) # Default compression

        if len(text.strip()) < 50:
            return jsonify({'error': 'Text is too short to summarize. Provide at least a few sentences.'}), 400

        summary = generate_summary(text, compression_ratio)
        
        return jsonify({
            'original_length': len(text),
            'summary_length': len(summary),
            'summary': summary
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Running on port 5000
    app.run(debug=True, host='0.0.0.0', port=5000)
