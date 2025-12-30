// Grumpy Apa's Kitchen - Main Application

let recipes = [];
let currentRecipe = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
    setupNavigation();
    setupSearch();
    setupBackButton();
});

// Load recipes from JSON file
async function loadRecipes() {
    try {
        const response = await fetch('recipes.json');
        recipes = await response.json();
        displayRecipeGrid(recipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
        displayError();
    }
}

// Display recipe grid (index cards)
function displayRecipeGrid(recipesToDisplay) {
    const grid = document.getElementById('recipe-grid');

    if (recipesToDisplay.length === 0) {
        grid.innerHTML = '<p class="empty-state">No recipes here yet. He\'s still talking.</p>';
        return;
    }

    grid.innerHTML = recipesToDisplay.map(recipe => `
        <div class="recipe-card" data-recipe-id="${recipe.id}">
            ${recipe.image ? `
                <div class="recipe-card-image">
                    <img src="images/${recipe.image}" alt="${recipe.title}" loading="lazy">
                </div>
            ` : ''}
            <div class="recipe-card-content">
                <h3>${recipe.title}</h3>
                ${recipe.subtitle ? `<p class="recipe-subtitle">${recipe.subtitle}</p>` : ''}
                <p class="recipe-description">${recipe.description}</p>
                <div class="recipe-tags">
                    ${recipe.tags.map(tag => {
                        const isSpecial = tag === 'Family Favorite' || tag === 'Grandpa Approved';
                        return `<span class="tag ${isSpecial ? 'special' : ''}">${tag}</span>`;
                    }).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Add click handlers to cards
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const recipeId = e.currentTarget.dataset.recipeId;
            showRecipeDetail(recipeId);
        });
    });
}

// Show individual recipe detail
function showRecipeDetail(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    currentRecipe = recipe;

    const detailContainer = document.getElementById('recipe-detail');
    detailContainer.innerHTML = `
        <div class="recipe-detail-container">
            ${recipe.image ? `
                <div class="recipe-detail-image">
                    <img src="images/${recipe.image}" alt="${recipe.title}">
                </div>
            ` : ''}

            <div class="recipe-header">
                <h2 class="recipe-title">${recipe.title}</h2>
                ${recipe.subtitle ? `<p class="recipe-meta">${recipe.subtitle}</p>` : ''}
            </div>

            ${recipe.tips && recipe.tips.length > 0 ? `
                <div class="tips-section">
                    <div class="tips-header">Grandpa Tip</div>
                    ${recipe.tips.map(tip => `<p class="tip-text">${tip}</p>`).join('')}
                </div>
            ` : ''}

            <div class="recipe-content">
                <div class="ingredients-section">
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ingredient => `
                            <li class="ingredient-item">
                                <div class="ingredient-checkbox"></div>
                                <span>${ingredient}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="instructions-section">
                    <h3>Instructions</h3>
                    <ol class="instructions-list">
                        ${recipe.instructions.map(instruction => `
                            <li class="instruction-step">
                                <div class="step-number"></div>
                                <div class="step-text">${instruction}</div>
                            </li>
                        `).join('')}
                    </ol>
                </div>
            </div>

            <button class="print-button" onclick="window.print()">Print it. Put it on the fridge.</button>
        </div>
    `;

    // Add checkbox interaction
    document.querySelectorAll('.ingredient-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            e.target.classList.toggle('checked');
            e.target.style.backgroundColor = e.target.classList.contains('checked') ? 'var(--enamel-blue)' : 'transparent';
        });
    });

    switchView('recipe');
}

// Navigation setup
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.dataset.view;

            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');

            // Switch view
            switchView(view);
        });
    });
}

// Back button setup
function setupBackButton() {
    document.getElementById('back-button').addEventListener('click', () => {
        switchView('home');
        // Restore home nav active state
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-view="home"]').classList.add('active');
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();

            if (query === '') {
                displayRecipeGrid(recipes);
                return;
            }

            const filtered = recipes.filter(recipe => {
                return recipe.title.toLowerCase().includes(query) ||
                       recipe.description.toLowerCase().includes(query) ||
                       recipe.tags.some(tag => tag.toLowerCase().includes(query)) ||
                       recipe.ingredients.some(ing => ing.toLowerCase().includes(query));
            });

            displayRecipeGrid(filtered);
        }, 300);
    });
}

// Switch between views
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    document.getElementById(`${viewName}-view`).classList.add('active');

    // Scroll to top
    window.scrollTo(0, 0);
}

// Error display
function displayError() {
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = '<p class="error-state">Couldn\'t load the recipes. Check the file and try again.</p>';
}

// Add some CSS for empty/error states
const style = document.createElement('style');
style.textContent = `
    .empty-state,
    .error-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--space-xl);
        color: var(--gray-mid);
        font-size: 1.1rem;
    }

    .recipe-subtitle {
        font-style: italic;
        color: var(--gray-mid);
        margin-bottom: var(--space-sm);
    }

    .ingredient-checkbox.checked {
        background-color: var(--enamel-blue);
        border-color: var(--enamel-blue);
    }
`;
document.head.appendChild(style);
