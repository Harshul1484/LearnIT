document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get('topic');
    const topicDisplay = document.getElementById('selected-topic-name');
    const form = document.getElementById('personalize-form');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const responseContent = document.getElementById('api-response-content');

    if (topic) {
        topicDisplay.textContent = topic;
    } else {
        topicDisplay.textContent = 'No topic selected';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const grade = document.getElementById('grade-input').value;
        const interests = document.getElementById('interests-input').value;

        if (!topic) {
            alert('Please select a topic from the home page first.');
            return;
        }

        // Show loading, hide form
        form.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        const requestData = {
            "user_id": `user_${Date.now()}`, // Simple unique ID generation
            "in-0": grade,
            "in-1": interests,
            "in-2": topic
        };

        try {
            const result = await query(requestData);

            // Hide loading, show result
            loadingSpinner.classList.add('hidden');
            resultContainer.classList.remove('hidden');

            // Format and display result
            // Assuming result is an object, we might need to adjust based on actual API response structure
            // If result is just text/markdown string in a specific key, we should use that.
            // For now, dumping the JSON stringified or a specific field if known.
            // Based on prompt: "show the response on the next page proply formated"

            // It's likely the result contains the generated text. Let's try to find a text field or dump the whole thing.
            // Common Stack AI response format often has 'out-0' or similar.
            // Let's display the whole result prettified for now, or specific field if we can guess.
            // Given the prompt example just logs response, I will display the JSON string if no obvious text field found.

            let displayText = '';
            if (typeof result === 'string') {
                displayText = result;
            } else if (result.outputs && result.outputs['out-0']) {
                displayText = result.outputs['out-0'];
            } else if (result['out-0']) {
                displayText = result['out-0'];
            } else {
                displayText = JSON.stringify(result, null, 2);
            }

            // Format the markdown response
            displayText = formatMarkdownResponse(displayText);

            // Convert markdown to HTML
            responseContent.innerHTML = convertMarkdownToHTML(displayText);

        } catch (error) {
            console.error('Error:', error);
            loadingSpinner.classList.add('hidden');
            form.classList.remove('hidden'); // Show form again to retry
            alert('An error occurred while generating the lesson. Please try again.');
        }
    });

    function formatMarkdownResponse(text) {
        // Split into lines for processing
        let lines = text.split('\n');
        let formatted = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let trimmed = line.trim();

            // Skip lines that are just "$3" (placeholder)
            if (trimmed === '$3') {
                continue;
            }

            // Check if line is standalone bold text (e.g., "**Quick Check:**" or "**Answer:**")
            if (trimmed.match(/^\*\*[^*]+\*\*:?$/)) {
                // Convert to H2
                let content = trimmed.replace(/^\*\*/, '').replace(/\*\*:?$/, '');
                formatted.push('## ' + content);
            } else {
                // Remove all bold formatting from this line
                let cleaned = line.replace(/\*\*/g, '');

                // Remove [maps to: Orig §X] references from headings
                cleaned = cleaned.replace(/\s*\[maps to:.*?\]\s*/g, '');

                formatted.push(cleaned);
            }
        }

        return formatted.join('\n');
    }

    function convertMarkdownToHTML(markdown) {
        let html = markdown;

        // Convert headings
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^### (.+)$/gm, '<h3>$3</h3>');

        // Convert lists
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

        // Wrap consecutive <li> items in <ul>
        html = html.replace(/(<li>.*?<\/li>\n?)+/g, function (match) {
            return '<ul>' + match + '</ul>';
        });

        // Split by double newlines for paragraphs
        let paragraphs = html.split(/\n\n+/);
        let processed = [];

        for (let para of paragraphs) {
            para = para.trim();
            if (!para) continue;

            // Don't wrap if already has HTML tags
            if (para.match(/^<[hul]/)) {
                processed.push(para);
            } else {
                // Replace single newlines with <br>
                para = para.replace(/\n/g, '<br>');
                processed.push('<p>' + para + '</p>');
            }
        }

        return processed.join('\n');
    }

    async function query(data) {
        const response = await fetch(
            "https://api.stack-ai.com/inference/v0/run/3b8cbdf4-e030-4eaf-b083-51f1f923412e/68f72711dea162c186b3a8a7",
            {
                headers: {
                    'Authorization': 'Bearer 1f1d5685-bd8d-4c50-bd22-dc69e8cc74f2', // PLACEHOLDER - User must replace or I should have asked? User provided XXXXX in prompt.
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    }
});
