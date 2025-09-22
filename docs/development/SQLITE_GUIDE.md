# 🗄️ SQLite Complete Guide for TasteStack

## What is SQLite?

SQLite is a lightweight, file-based relational database that's perfect for development and small to medium applications. Unlike other databases, SQLite doesn't require a separate server process.

## Key Features

- **File-based**: Database is stored in a single file
- **Zero-configuration**: No setup or administration needed
- **Cross-platform**: Works on all operating systems
- **ACID compliant**: Reliable transactions
- **SQL standard**: Uses standard SQL syntax
- **Lightweight**: Small footprint, fast performance

## SQLite in TasteStack

### Database File Location
```
backend/
├── db.sqlite3          # Main database file
├── manage.py
└── ...
```

### Django SQLite Configuration
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

## Basic SQL Operations

### 1. Creating Tables
```sql
-- Users table (Django creates this automatically)
CREATE TABLE accounts_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    bio TEXT,
    profile_picture VARCHAR(100),
    date_joined DATETIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1
);

-- Recipes table
CREATE TABLE recipes_recipe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    prep_time INTEGER NOT NULL,
    cook_time INTEGER NOT NULL,
    servings INTEGER NOT NULL,
    difficulty VARCHAR(10) NOT NULL,
    cuisine VARCHAR(100) NOT NULL,
    image VARCHAR(100),
    author_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (author_id) REFERENCES accounts_user (id)
);

-- Likes table (Many-to-Many relationship)
CREATE TABLE interactions_like (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES accounts_user (id),
    FOREIGN KEY (recipe_id) REFERENCES recipes_recipe (id),
    UNIQUE (user_id, recipe_id)
);
```

### 2. Inserting Data
```sql
-- Insert a user
INSERT INTO accounts_user (username, email, password, bio, date_joined, is_active)
VALUES ('john_doe', 'john@example.com', 'hashed_password', 'Love cooking!', '2024-01-01 10:00:00', 1);

-- Insert a recipe
INSERT INTO recipes_recipe (
    title, description, ingredients, instructions, 
    prep_time, cook_time, servings, difficulty, cuisine, 
    author_id, created_at, updated_at
) VALUES (
    'Pasta Carbonara',
    'Classic Italian pasta dish',
    'Pasta, eggs, cheese, bacon',
    '1. Cook pasta 2. Mix eggs and cheese 3. Combine',
    15, 20, 4, 'medium', 'Italian',
    1, '2024-01-01 12:00:00', '2024-01-01 12:00:00'
);

-- Insert multiple records
INSERT INTO interactions_like (user_id, recipe_id, created_at) VALUES
(1, 1, '2024-01-01 13:00:00'),
(2, 1, '2024-01-01 14:00:00'),
(1, 2, '2024-01-01 15:00:00');
```

### 3. Querying Data
```sql
-- Select all recipes
SELECT * FROM recipes_recipe;

-- Select specific columns
SELECT title, prep_time, cook_time FROM recipes_recipe;

-- Filter recipes
SELECT * FROM recipes_recipe WHERE difficulty = 'easy';
SELECT * FROM recipes_recipe WHERE prep_time <= 30;
SELECT * FROM recipes_recipe WHERE title LIKE '%pasta%';

-- Order results
SELECT * FROM recipes_recipe ORDER BY created_at DESC;
SELECT * FROM recipes_recipe ORDER BY prep_time ASC, cook_time ASC;

-- Limit results
SELECT * FROM recipes_recipe LIMIT 10;
SELECT * FROM recipes_recipe LIMIT 10 OFFSET 20; -- Pagination

-- Count records
SELECT COUNT(*) FROM recipes_recipe;
SELECT COUNT(*) FROM recipes_recipe WHERE difficulty = 'easy';
```

### 4. Joins
```sql
-- Get recipes with author information
SELECT 
    r.title,
    r.description,
    r.prep_time,
    u.username as author_name,
    u.email as author_email
FROM recipes_recipe r
JOIN accounts_user u ON r.author_id = u.id;

-- Get recipes with like count
SELECT 
    r.title,
    r.description,
    COUNT(l.id) as like_count
FROM recipes_recipe r
LEFT JOIN interactions_like l ON r.id = l.recipe_id
GROUP BY r.id, r.title, r.description;

-- Get user's liked recipes
SELECT 
    r.title,
    r.description,
    l.created_at as liked_at
FROM recipes_recipe r
JOIN interactions_like l ON r.id = l.recipe_id
JOIN accounts_user u ON l.user_id = u.id
WHERE u.username = 'john_doe';
```

### 5. Updating Data
```sql
-- Update single record
UPDATE recipes_recipe 
SET description = 'Updated description', updated_at = '2024-01-02 10:00:00'
WHERE id = 1;

-- Update multiple records
UPDATE recipes_recipe 
SET difficulty = 'easy' 
WHERE prep_time <= 15;

-- Update with conditions
UPDATE accounts_user 
SET bio = 'Experienced chef' 
WHERE id IN (
    SELECT author_id 
    FROM recipes_recipe 
    GROUP BY author_id 
    HAVING COUNT(*) > 5
);
```

### 6. Deleting Data
```sql
-- Delete single record
DELETE FROM recipes_recipe WHERE id = 1;

-- Delete with conditions
DELETE FROM recipes_recipe WHERE created_at < '2023-01-01';

-- Delete related records (cascade)
DELETE FROM interactions_like WHERE recipe_id = 1;
DELETE FROM recipes_recipe WHERE id = 1;
```

## Advanced SQLite Features

### 1. Indexes for Performance
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_recipe_author ON recipes_recipe(author_id);
CREATE INDEX idx_recipe_difficulty ON recipes_recipe(difficulty);
CREATE INDEX idx_recipe_created ON recipes_recipe(created_at);
CREATE INDEX idx_like_user_recipe ON interactions_like(user_id, recipe_id);

-- Composite index for complex queries
CREATE INDEX idx_recipe_difficulty_time ON recipes_recipe(difficulty, prep_time);

-- Check if index is being used
EXPLAIN QUERY PLAN SELECT * FROM recipes_recipe WHERE author_id = 1;
```

### 2. Views for Complex Queries
```sql
-- Create a view for recipe statistics
CREATE VIEW recipe_stats AS
SELECT 
    r.id,
    r.title,
    r.author_id,
    u.username as author_name,
    COUNT(DISTINCT l.id) as like_count,
    COUNT(DISTINCT c.id) as comment_count,
    AVG(rt.rating) as avg_rating
FROM recipes_recipe r
LEFT JOIN accounts_user u ON r.author_id = u.id
LEFT JOIN interactions_like l ON r.id = l.recipe_id
LEFT JOIN interactions_comment c ON r.id = c.recipe_id
LEFT JOIN interactions_rating rt ON r.id = rt.recipe_id
GROUP BY r.id, r.title, r.author_id, u.username;

-- Use the view
SELECT * FROM recipe_stats WHERE like_count > 10;
```

### 3. Triggers for Automatic Actions
```sql
-- Trigger to update recipe's updated_at when liked
CREATE TRIGGER update_recipe_timestamp 
AFTER INSERT ON interactions_like
BEGIN
    UPDATE recipes_recipe 
    SET updated_at = datetime('now') 
    WHERE id = NEW.recipe_id;
END;

-- Trigger to prevent self-following
CREATE TRIGGER prevent_self_follow
BEFORE INSERT ON accounts_user_followers
WHEN NEW.from_user_id = NEW.to_user_id
BEGIN
    SELECT RAISE(ABORT, 'Users cannot follow themselves');
END;
```

### 4. Transactions
```sql
-- Begin transaction
BEGIN TRANSACTION;

-- Multiple operations
INSERT INTO recipes_recipe (...) VALUES (...);
INSERT INTO interactions_like (...) VALUES (...);
UPDATE accounts_user SET ... WHERE ...;

-- Commit if all operations succeed
COMMIT;

-- Or rollback if something fails
-- ROLLBACK;
```

## SQLite Command Line Interface

### 1. Connecting to Database
```bash
# Open SQLite CLI
sqlite3 db.sqlite3

# Or connect and run command
sqlite3 db.sqlite3 "SELECT COUNT(*) FROM recipes_recipe;"
```

### 2. Useful CLI Commands
```sql
-- Show all tables
.tables

-- Show table structure
.schema recipes_recipe

-- Show indexes
.indexes

-- Export data to CSV
.mode csv
.output recipes.csv
SELECT * FROM recipes_recipe;
.output stdout

-- Import data from CSV
.mode csv
.import recipes.csv recipes_recipe

-- Show query execution time
.timer on

-- Show column headers
.headers on

-- Pretty print mode
.mode column
```

### 3. Database Analysis
```sql
-- Database size and statistics
.dbinfo

-- Analyze query performance
EXPLAIN QUERY PLAN SELECT * FROM recipes_recipe WHERE difficulty = 'easy';

-- Check database integrity
PRAGMA integrity_check;

-- Optimize database
VACUUM;

-- Get database statistics
SELECT 
    name,
    COUNT(*) as row_count
FROM sqlite_master 
WHERE type = 'table'
GROUP BY name;
```

## Performance Optimization

### 1. Query Optimization
```sql
-- Use indexes effectively
SELECT * FROM recipes_recipe WHERE author_id = 1; -- Uses index

-- Avoid functions in WHERE clause
-- Bad: SELECT * FROM recipes_recipe WHERE UPPER(title) = 'PASTA';
-- Good: SELECT * FROM recipes_recipe WHERE title = 'Pasta';

-- Use LIMIT for large result sets
SELECT * FROM recipes_recipe ORDER BY created_at DESC LIMIT 20;

-- Use EXISTS instead of IN for subqueries
SELECT * FROM recipes_recipe r
WHERE EXISTS (
    SELECT 1 FROM interactions_like l 
    WHERE l.recipe_id = r.id AND l.user_id = 1
);
```

### 2. Database Maintenance
```sql
-- Analyze tables to update statistics
ANALYZE;

-- Rebuild indexes
REINDEX;

-- Compact database
VACUUM;

-- Check and fix corruption
PRAGMA integrity_check;
```

## Common Patterns in TasteStack

### 1. Recipe Search
```sql
-- Full-text search simulation
SELECT * FROM recipes_recipe 
WHERE title LIKE '%pasta%' 
   OR description LIKE '%pasta%' 
   OR ingredients LIKE '%pasta%';

-- Search with ranking
SELECT *, 
    CASE 
        WHEN title LIKE '%pasta%' THEN 3
        WHEN description LIKE '%pasta%' THEN 2
        WHEN ingredients LIKE '%pasta%' THEN 1
        ELSE 0
    END as relevance
FROM recipes_recipe 
WHERE title LIKE '%pasta%' 
   OR description LIKE '%pasta%' 
   OR ingredients LIKE '%pasta%'
ORDER BY relevance DESC;
```

### 2. User Activity Feed
```sql
-- Get recent activity for followed users
SELECT 
    'recipe' as activity_type,
    r.title as content,
    r.created_at as activity_date,
    u.username as actor
FROM recipes_recipe r
JOIN accounts_user u ON r.author_id = u.id
JOIN accounts_user_followers f ON u.id = f.to_user_id
WHERE f.from_user_id = 1  -- Current user's ID
UNION ALL
SELECT 
    'like' as activity_type,
    'liked ' || r.title as content,
    l.created_at as activity_date,
    u.username as actor
FROM interactions_like l
JOIN recipes_recipe r ON l.recipe_id = r.id
JOIN accounts_user u ON l.user_id = u.id
JOIN accounts_user_followers f ON u.id = f.to_user_id
WHERE f.from_user_id = 1
ORDER BY activity_date DESC
LIMIT 20;
```

### 3. Recipe Recommendations
```sql
-- Recommend recipes based on user's liked cuisines
SELECT r.*, COUNT(*) as score
FROM recipes_recipe r
JOIN (
    SELECT DISTINCT cuisine
    FROM recipes_recipe r2
    JOIN interactions_like l ON r2.id = l.recipe_id
    WHERE l.user_id = 1
) user_cuisines ON r.cuisine = user_cuisines.cuisine
LEFT JOIN interactions_like ul ON r.id = ul.recipe_id AND ul.user_id = 1
WHERE ul.id IS NULL  -- User hasn't liked this recipe yet
GROUP BY r.id
ORDER BY score DESC, r.created_at DESC
LIMIT 10;
```

## Backup and Migration

### 1. Backup Database
```bash
# Create backup
sqlite3 db.sqlite3 ".backup backup.db"

# Or copy file
cp db.sqlite3 backup_$(date +%Y%m%d).db

# Export to SQL
sqlite3 db.sqlite3 ".dump" > backup.sql
```

### 2. Restore Database
```bash
# Restore from backup
sqlite3 new_db.sqlite3 ".restore backup.db"

# Import from SQL
sqlite3 new_db.sqlite3 < backup.sql
```

### 3. Migration to PostgreSQL
```python
# Django management command
python manage.py dumpdata > data.json
# Change database settings to PostgreSQL
python manage.py migrate
python manage.py loaddata data.json
```

## Troubleshooting

### 1. Common Issues
```sql
-- Database locked error
-- Solution: Close all connections and try again

-- Disk full error
-- Solution: Free up space or move database

-- Corruption detection
PRAGMA integrity_check;

-- Fix minor corruption
PRAGMA quick_check;
```

### 2. Performance Issues
```sql
-- Find slow queries
.timer on
-- Run your query here

-- Check if indexes are being used
EXPLAIN QUERY PLAN SELECT ...;

-- Analyze table statistics
ANALYZE table_name;
```

This SQLite guide provides everything you need to understand and work with the database layer of TasteStack!