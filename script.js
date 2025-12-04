document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('.pill');
    const cards = Array.from(document.querySelectorAll('.card'));
    const cardsGrid = document.querySelector('.cards-grid');
    const seeMoreBtn = document.getElementById('see-more-btn');
    const seeMoreContainer = document.querySelector('.see-more-container');

    // Initial state: Show "All" (random 8 cards)
    filterCards('All');

    // Add click event to pills
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Update active pill
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const category = pill.textContent.trim();
            filterCards(category);
        });
    });

    // Add click event to "See More" button
    seeMoreBtn.addEventListener('click', () => {
        showAllCards();
    });

    function filterCards(category) {
        // Reset cards display first (remove hidden class from all to start fresh logic)
        cards.forEach(card => card.classList.remove('hidden'));

        if (category === 'All') {
            // Shuffle cards
            shuffleArray(cards);

            // Re-append shuffled cards to grid
            cards.forEach(card => cardsGrid.appendChild(card));

            // Show only first 8, hide the rest
            cards.forEach((card, index) => {
                if (index >= 8) {
                    card.classList.add('hidden');
                }
            });

            // Show "See More" button if there are more than 8 cards
            if (cards.length > 8) {
                seeMoreContainer.classList.remove('hidden');
            } else {
                seeMoreContainer.classList.add('hidden');
            }

        } else {
            // Category filtering
            let visibleCount = 0;
            cards.forEach(card => {
                const cardCategory = card.querySelector('.card-category').textContent.trim();
                if (cardCategory === category) {
                    card.classList.remove('hidden');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            });

            seeMoreContainer.classList.add('hidden');
        }
    }

    // Add click event to cards for redirection
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.querySelector('.card-title').textContent.trim();
            // Encode the topic to make it URL-safe
            window.location.href = `personalize.html?topic=${encodeURIComponent(topic)}`;
        });
    });

    function showAllCards() {
        cards.forEach(card => card.classList.remove('hidden'));
        seeMoreContainer.classList.add('hidden');
    }

    // Fisher-Yates Shuffle
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});
