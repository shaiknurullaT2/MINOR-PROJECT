document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sourceText = document.getElementById('source-text');
    const charCount = document.getElementById('char-count');
    const summarizeBtn = document.getElementById('summarize-btn');
    
    const loadingState = document.getElementById('loading');
    const resultCard = document.getElementById('result-card');
    const summaryContent = document.getElementById('summary-content');
    const summaryStats = document.getElementById('summary-stats');
    const copyBtn = document.getElementById('copy-btn');
    
    const errorState = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');

    // Update character count
    sourceText.addEventListener('input', () => {
        const count = sourceText.value.length;
        charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    });

    // Handle Summarize Button Click
    summarizeBtn.addEventListener('click', async () => {
        const textToSummarize = sourceText.value.trim();

        // Validation
        if (textToSummarize.length < 50) {
            showError("Please enter at least 50 characters of text to summarize.");
            return;
        }

        // Prepare UI state
        hideError();
        resultCard.classList.add('hidden');
        loadingState.classList.remove('hidden');
        summarizeBtn.disabled = true;

        try {
            // Adjust the backend URL based on where Flask is running
            const apiUrl = 'http://127.0.0.1:5000/api/summarize';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textToSummarize,
                    compression_ratio: 0.3 // Default
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to summarize text');
            }

            // Success
            loadingState.classList.add('hidden');
            displayResult(data);
            
        } catch (error) {
            console.error("Summarization error:", error);
            loadingState.classList.add('hidden');
            showError(error.message === 'Failed to fetch' 
                ? 'Cannot connect to backend server. Make sure the Python Flask app is running.' 
                : error.message);
        } finally {
            summarizeBtn.disabled = false;
        }
    });

    function displayResult(data) {
        summaryContent.innerHTML = `<p>${data.summary}</p>`;
        
        // Render stats
        const originalBadge = `<span class="badge original-badge">Orig: ${data.original_length} chars</span>`;
        const arrowIcon = `<i data-lucide="arrow-right" class="arrow-icon"></i>`;
        const sumBadge = `<span class="badge sum-badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">Sum: ${data.summary_length} chars</span>`;
        
        summaryStats.innerHTML = `${originalBadge} ${arrowIcon} ${sumBadge}`;
        
        // Re-init lucide icons for newly added HTML
        lucide.createIcons();
        
        resultCard.classList.remove('hidden');
        
        // Smooth scroll to result
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Handle Copy Button
    copyBtn.addEventListener('click', () => {
        const textToCopy = summaryContent.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `<i data-lucide="check"></i> Copied!`;
            lucide.createIcons();
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                lucide.createIcons();
            }, 2000);
        });
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorState.classList.remove('hidden');
        // Auto hide after 5 seconds
        setTimeout(hideError, 5000);
    }

    function hideError() {
        errorState.classList.add('hidden');
    }
});
