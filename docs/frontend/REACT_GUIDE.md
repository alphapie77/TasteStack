# ⚛️ React Complete Guide for TasteStack

## What is React?

React is a JavaScript library for building user interfaces, especially web applications. It uses a component-based architecture where you build encapsulated components that manage their own state.

## Core Concepts

### 1. Components
Components are the building blocks of React applications.

```javascript
// Functional Component (Modern approach)
function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
    </div>
  );
}

// Class Component (Legacy approach)
class RecipeCard extends React.Component {
  render() {
    return (
      <div className="recipe-card">
        <h3>{this.props.recipe.title}</h3>
        <p>{this.props.recipe.description}</p>
      </div>
    );
  }
}
```

### 2. JSX (JavaScript XML)
JSX allows you to write HTML-like syntax in JavaScript.

```javascript
function RecipeList({ recipes }) {
  return (
    <div className="recipe-list">
      {recipes.map(recipe => (
        <div key={recipe.id} className="recipe-item">
          <h3>{recipe.title}</h3>
          <p>Prep time: {recipe.prep_time} minutes</p>
          {recipe.image && (
            <img src={recipe.image} alt={recipe.title} />
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3. Props
Props are how you pass data from parent to child components.

```javascript
// Parent Component
function RecipePage() {
  const recipe = {
    id: 1,
    title: "Pasta Carbonara",
    prep_time: 15,
    difficulty: "medium"
  };

  return (
    <div>
      <RecipeCard recipe={recipe} showDetails={true} />
      <RecipeActions recipeId={recipe.id} onLike={handleLike} />
    </div>
  );
}

// Child Component
function RecipeCard({ recipe, showDetails }) {
  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      <span className="difficulty">{recipe.difficulty}</span>
      {showDetails && (
        <p>Preparation time: {recipe.prep_time} minutes</p>
      )}
    </div>
  );
}
```

## React Hooks

### 1. useState - Managing Component State
```javascript
import React, { useState } from 'react';

function RecipeForm() {
  // Single state variable
  const [title, setTitle] = useState('');
  
  // Object state
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    prep_time: 0
  });

  // Array state
  const [ingredients, setIngredients] = useState([]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleRecipeChange = (field, value) => {
    setRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addIngredient = (ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
  };

  return (
    <form>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Recipe title"
      />
      
      <input
        type="text"
        value={recipe.description}
        onChange={(e) => handleRecipeChange('description', e.target.value)}
        placeholder="Description"
      />
      
      <button type="button" onClick={() => addIngredient('New ingredient')}>
        Add Ingredient
      </button>
    </form>
  );
}
```

### 2. useEffect - Side Effects
```javascript
import React, { useState, useEffect } from 'react';

function RecipeDetail({ recipeId }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect runs after component mounts and when recipeId changes
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recipes/${recipeId}/`);
        if (!response.ok) throw new Error('Failed to fetch recipe');
        const data = await response.json();
        setRecipe(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]); // Dependency array

  // Effect for cleanup (like removing event listeners)
  useEffect(() => {
    const handleScroll = () => {
      console.log('Scrolling...');
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array = runs once

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!recipe) return <div>Recipe not found</div>;

  return (
    <div>
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>
    </div>
  );
}
```

### 3. useContext - Global State
```javascript
import React, { createContext, useContext, useState } from 'react';

// Create Context
const AuthContext = createContext();

// Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage in Component
function LoginForm() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      console.log('Login successful');
    }
  };

  if (isAuthenticated) {
    return <div>Already logged in!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 4. Custom Hooks
```javascript
// Custom hook for API calls
function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('API call failed');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Custom hook for form handling
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = (validationRules) => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = values[field];
      
      if (rule.required && !value) {
        newErrors[field] = `${field} is required`;
      } else if (rule.minLength && value.length < rule.minLength) {
        newErrors[field] = `${field} must be at least ${rule.minLength} characters`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    validate,
    reset
  };
}

// Usage
function RecipeForm() {
  const { values, errors, handleChange, validate, reset } = useForm({
    title: '',
    description: '',
    prep_time: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isValid = validate({
      title: { required: true, minLength: 3 },
      description: { required: true },
      prep_time: { required: true }
    });

    if (isValid) {
      console.log('Form is valid:', values);
      // Submit form
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Recipe title"
        />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>
      
      <div>
        <textarea
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Description"
        />
        {errors.description && <span className="error">{errors.description}</span>}
      </div>
      
      <button type="submit">Create Recipe</button>
    </form>
  );
}
```

## Component Patterns

### 1. Container vs Presentational Components
```javascript
// Presentational Component (UI only)
function RecipeCard({ recipe, onLike, onComment, isLiked }) {
  return (
    <div className="recipe-card">
      <img src={recipe.image} alt={recipe.title} />
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
      
      <div className="actions">
        <button 
          onClick={() => onLike(recipe.id)}
          className={isLiked ? 'liked' : ''}
        >
          ❤️ {recipe.likes_count}
        </button>
        
        <button onClick={() => onComment(recipe.id)}>
          💬 {recipe.comments_count}
        </button>
      </div>
    </div>
  );
}

// Container Component (Logic)
function RecipeCardContainer({ recipe }) {
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user has liked this recipe
    const checkLikeStatus = async () => {
      if (user) {
        const response = await fetch(`/api/recipes/${recipe.id}/like-status/`);
        const data = await response.json();
        setIsLiked(data.isLiked);
      }
    };
    
    checkLikeStatus();
  }, [recipe.id, user]);

  const handleLike = async (recipeId) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/like/`, {
        method: 'POST'
      });
      const data = await response.json();
      setIsLiked(data.liked);
    } catch (error) {
      console.error('Failed to like recipe:', error);
    }
  };

  const handleComment = (recipeId) => {
    // Navigate to recipe detail page or open comment modal
    console.log('Comment on recipe:', recipeId);
  };

  return (
    <RecipeCard
      recipe={recipe}
      onLike={handleLike}
      onComment={handleComment}
      isLiked={isLiked}
    />
  );
}
```

### 2. Higher-Order Components (HOC)
```javascript
// HOC for authentication
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, user } = useAuth();
    
    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }
    
    return <WrappedComponent {...props} user={user} />;
  };
}

// Usage
const ProtectedRecipeForm = withAuth(RecipeForm);

// HOC for loading states
function withLoading(WrappedComponent) {
  return function LoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div className="spinner">Loading...</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Usage
const RecipeListWithLoading = withLoading(RecipeList);
```

### 3. Render Props Pattern
```javascript
function DataFetcher({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return children({ data, loading, error });
}

// Usage
function RecipeList() {
  return (
    <DataFetcher url="/api/recipes/">
      {({ data, loading, error }) => {
        if (loading) return <div>Loading recipes...</div>;
        if (error) return <div>Error: {error}</div>;
        
        return (
          <div>
            {data?.results?.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        );
      }}
    </DataFetcher>
  );
}
```

## Event Handling

### 1. Basic Events
```javascript
function RecipeForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    console.log('Form submitted:', formData);
  };

  // Button click
  const handleReset = () => {
    setFormData({ title: '', description: '' });
  };

  // File upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="Recipe title"
      />
      
      <textarea
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        placeholder="Description"
      />
      
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
      />
      
      <button type="submit">Submit</button>
      <button type="button" onClick={handleReset}>Reset</button>
    </form>
  );
}
```

### 2. Advanced Event Handling
```javascript
function RecipeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchRecipes(query);
      } else {
        setResults([]);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchRecipes = async (searchQuery) => {
    try {
      const response = await fetch(`/api/recipes/?search=${searchQuery}`);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Handle enter key
    } else if (e.key === 'Escape') {
      setQuery('');
      setResults([]);
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search recipes..."
      />
      
      {results.length > 0 && (
        <div className="search-results">
          {results.map(recipe => (
            <div key={recipe.id} className="search-result">
              {recipe.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Conditional Rendering

```javascript
function RecipeDetail({ recipe, user }) {
  // Simple conditional
  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div>
      <h1>{recipe.title}</h1>
      
      {/* Conditional rendering with && */}
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} />
      )}
      
      {/* Conditional rendering with ternary operator */}
      {user ? (
        <button>Add to Favorites</button>
      ) : (
        <p>Please log in to add to favorites</p>
      )}
      
      {/* Multiple conditions */}
      {user && user.id === recipe.author.id && (
        <div className="owner-actions">
          <button>Edit Recipe</button>
          <button>Delete Recipe</button>
        </div>
      )}
      
      {/* Conditional classes */}
      <div className={`difficulty ${recipe.difficulty === 'hard' ? 'difficult' : 'easy'}`}>
        Difficulty: {recipe.difficulty}
      </div>
    </div>
  );
}
```

## Lists and Keys

```javascript
function RecipeList({ recipes }) {
  return (
    <div className="recipe-list">
      {recipes.map(recipe => (
        <RecipeCard 
          key={recipe.id} // Important: unique key for each item
          recipe={recipe}
        />
      ))}
      
      {/* Conditional list rendering */}
      {recipes.length === 0 && (
        <div className="empty-state">
          <p>No recipes found</p>
          <button>Create your first recipe</button>
        </div>
      )}
    </div>
  );
}

// Dynamic list with actions
function IngredientList() {
  const [ingredients, setIngredients] = useState([
    { id: 1, name: 'Tomatoes', amount: '2 cups' },
    { id: 2, name: 'Onions', amount: '1 medium' }
  ]);

  const addIngredient = () => {
    const newIngredient = {
      id: Date.now(), // Simple ID generation
      name: '',
      amount: ''
    };
    setIngredients(prev => [...prev, newIngredient]);
  };

  const updateIngredient = (id, field, value) => {
    setIngredients(prev =>
      prev.map(ingredient =>
        ingredient.id === id
          ? { ...ingredient, [field]: value }
          : ingredient
      )
    );
  };

  const removeIngredient = (id) => {
    setIngredients(prev =>
      prev.filter(ingredient => ingredient.id !== id)
    );
  };

  return (
    <div>
      <h3>Ingredients</h3>
      {ingredients.map(ingredient => (
        <div key={ingredient.id} className="ingredient-row">
          <input
            type="text"
            value={ingredient.name}
            onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
            placeholder="Ingredient name"
          />
          <input
            type="text"
            value={ingredient.amount}
            onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
            placeholder="Amount"
          />
          <button onClick={() => removeIngredient(ingredient.id)}>
            Remove
          </button>
        </div>
      ))}
      <button onClick={addIngredient}>Add Ingredient</button>
    </div>
  );
}
```

## Performance Optimization

### 1. React.memo
```javascript
// Prevents re-rendering if props haven't changed
const RecipeCard = React.memo(function RecipeCard({ recipe, onLike }) {
  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      <button onClick={() => onLike(recipe.id)}>
        Like ({recipe.likes_count})
      </button>
    </div>
  );
});

// With custom comparison
const RecipeCard = React.memo(function RecipeCard({ recipe, onLike }) {
  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      <button onClick={() => onLike(recipe.id)}>
        Like ({recipe.likes_count})
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  return prevProps.recipe.id === nextProps.recipe.id &&
         prevProps.recipe.likes_count === nextProps.recipe.likes_count;
});
```

### 2. useCallback and useMemo
```javascript
function RecipeList({ recipes, searchQuery }) {
  // Memoize expensive calculations
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recipes, searchQuery]);

  // Memoize callback functions
  const handleLike = useCallback((recipeId) => {
    // Like logic here
    console.log('Liked recipe:', recipeId);
  }, []); // Empty dependency array means this function never changes

  const handleDelete = useCallback((recipeId) => {
    // Delete logic here
    console.log('Delete recipe:', recipeId);
  }, []);

  return (
    <div>
      {filteredRecipes.map(recipe => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onLike={handleLike}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

## Error Handling

```javascript
// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary>
      <RecipeList />
    </ErrorBoundary>
  );
}

// Hook for error handling
function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    setError(error);
    console.error('Error:', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
```

This React guide covers all the essential concepts you need to build and extend the TasteStack frontend!