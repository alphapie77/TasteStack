# 🗄️ Django ORM Complete Guide

## What is Django ORM?

Django ORM (Object-Relational Mapping) is a powerful tool that lets you interact with your database using Python code instead of writing SQL queries.

## Key Concepts

### 1. Models = Database Tables
```python
class Recipe(models.Model):  # This creates a 'recipes_recipe' table
    title = models.CharField(max_length=200)  # VARCHAR(200) column
    created_at = models.DateTimeField(auto_now_add=True)  # DATETIME column
```

### 2. Model Fields = Table Columns
```python
# Common Field Types
title = models.CharField(max_length=200)           # Text field
description = models.TextField()                   # Long text
price = models.DecimalField(max_digits=10, decimal_places=2)  # Money
is_active = models.BooleanField(default=True)      # True/False
created_at = models.DateTimeField(auto_now_add=True)  # Timestamp
image = models.ImageField(upload_to='images/')     # File upload
```

### 3. Relationships Between Models
```python
# One-to-Many (ForeignKey)
class Recipe(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    # One user can have many recipes

# Many-to-Many
class Recipe(models.Model):
    tags = models.ManyToManyField('Tag')
    # One recipe can have many tags, one tag can be on many recipes

# One-to-One
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Each user has exactly one profile
```

## CRUD Operations

### Create (C)
```python
# Method 1: Create and save
recipe = Recipe(title="Pasta", description="Delicious pasta")
recipe.save()

# Method 2: Create directly
recipe = Recipe.objects.create(
    title="Pasta",
    description="Delicious pasta",
    author=request.user
)

# Method 3: Get or create
recipe, created = Recipe.objects.get_or_create(
    title="Pasta",
    defaults={'description': 'Delicious pasta'}
)
```

### Read (R)
```python
# Get all recipes
recipes = Recipe.objects.all()

# Get single recipe
recipe = Recipe.objects.get(id=1)  # Raises exception if not found
recipe = Recipe.objects.filter(id=1).first()  # Returns None if not found

# Filter recipes
easy_recipes = Recipe.objects.filter(difficulty='easy')
recent_recipes = Recipe.objects.filter(created_at__gte=datetime.now() - timedelta(days=7))

# Complex queries
recipes = Recipe.objects.filter(
    difficulty='easy',
    prep_time__lte=30,
    author__username='john'
).order_by('-created_at')[:10]
```

### Update (U)
```python
# Method 1: Get, modify, save
recipe = Recipe.objects.get(id=1)
recipe.title = "Updated Title"
recipe.save()

# Method 2: Update multiple records
Recipe.objects.filter(difficulty='easy').update(prep_time=15)

# Method 3: Update or create
recipe, created = Recipe.objects.update_or_create(
    id=1,
    defaults={'title': 'New Title', 'description': 'New description'}
)
```

### Delete (D)
```python
# Delete single record
recipe = Recipe.objects.get(id=1)
recipe.delete()

# Delete multiple records
Recipe.objects.filter(difficulty='easy').delete()

# Delete all records (be careful!)
Recipe.objects.all().delete()
```

## Advanced Queries

### Field Lookups
```python
# Exact match
Recipe.objects.filter(title='Pasta')

# Case-insensitive
Recipe.objects.filter(title__iexact='pasta')

# Contains
Recipe.objects.filter(title__contains='pasta')
Recipe.objects.filter(title__icontains='PASTA')  # Case-insensitive

# Starts/ends with
Recipe.objects.filter(title__startswith='Italian')
Recipe.objects.filter(title__endswith='Soup')

# Numeric comparisons
Recipe.objects.filter(prep_time__gt=30)      # Greater than
Recipe.objects.filter(prep_time__gte=30)     # Greater than or equal
Recipe.objects.filter(prep_time__lt=30)      # Less than
Recipe.objects.filter(prep_time__lte=30)     # Less than or equal

# Date/time lookups
Recipe.objects.filter(created_at__year=2024)
Recipe.objects.filter(created_at__month=12)
Recipe.objects.filter(created_at__day=25)
Recipe.objects.filter(created_at__date=datetime.date.today())

# In a list
Recipe.objects.filter(difficulty__in=['easy', 'medium'])

# Null checks
Recipe.objects.filter(image__isnull=True)    # No image
Recipe.objects.filter(image__isnull=False)   # Has image
```

### Relationship Queries
```python
# Forward relationship (following foreign key)
recipes = Recipe.objects.filter(author__username='john')
recipes = Recipe.objects.filter(author__email__endswith='@gmail.com')

# Reverse relationship (going backwards)
users = User.objects.filter(recipes__difficulty='easy')
users = User.objects.filter(recipes__created_at__year=2024)

# Many-to-many
recipes = Recipe.objects.filter(tags__name='vegetarian')
tags = Tag.objects.filter(recipes__author__username='john')
```

### Aggregation
```python
from django.db.models import Count, Avg, Sum, Max, Min

# Count recipes
total_recipes = Recipe.objects.count()
easy_recipes_count = Recipe.objects.filter(difficulty='easy').count()

# Average prep time
avg_prep_time = Recipe.objects.aggregate(Avg('prep_time'))
# Returns: {'prep_time__avg': 25.5}

# Multiple aggregations
stats = Recipe.objects.aggregate(
    total=Count('id'),
    avg_prep=Avg('prep_time'),
    max_prep=Max('prep_time'),
    min_prep=Min('prep_time')
)

# Group by (annotate)
difficulty_stats = Recipe.objects.values('difficulty').annotate(
    count=Count('id'),
    avg_prep=Avg('prep_time')
)
# Returns: [{'difficulty': 'easy', 'count': 10, 'avg_prep': 20.5}, ...]

# User recipe counts
users_with_counts = User.objects.annotate(
    recipe_count=Count('recipes')
).filter(recipe_count__gt=5)
```

### Q Objects (Complex Queries)
```python
from django.db.models import Q

# OR queries
recipes = Recipe.objects.filter(
    Q(difficulty='easy') | Q(prep_time__lte=15)
)

# AND queries (default behavior)
recipes = Recipe.objects.filter(
    Q(difficulty='easy') & Q(prep_time__lte=30)
)

# NOT queries
recipes = Recipe.objects.filter(
    ~Q(difficulty='hard')
)

# Complex combinations
recipes = Recipe.objects.filter(
    (Q(difficulty='easy') | Q(difficulty='medium')) &
    Q(prep_time__lte=45) &
    ~Q(cuisine='spicy')
)
```

### Prefetch Related (Optimization)
```python
# Without prefetch (N+1 query problem)
recipes = Recipe.objects.all()
for recipe in recipes:
    print(recipe.author.username)  # Database query for each recipe!

# With select_related (for ForeignKey/OneToOne)
recipes = Recipe.objects.select_related('author').all()
for recipe in recipes:
    print(recipe.author.username)  # No additional queries!

# With prefetch_related (for ManyToMany/reverse ForeignKey)
recipes = Recipe.objects.prefetch_related('comments', 'likes').all()
for recipe in recipes:
    print(recipe.comments.count())  # No additional queries!

# Complex prefetch
recipes = Recipe.objects.prefetch_related(
    'comments__user',  # Prefetch comments and their users
    'likes__user'      # Prefetch likes and their users
).all()
```

## Model Methods and Properties

### Instance Methods
```python
class Recipe(models.Model):
    title = models.CharField(max_length=200)
    prep_time = models.PositiveIntegerField()
    cook_time = models.PositiveIntegerField()
    
    def __str__(self):
        return self.title
    
    @property
    def total_time(self):
        return self.prep_time + self.cook_time
    
    def get_absolute_url(self):
        return f'/recipes/{self.id}/'
    
    def is_quick_recipe(self):
        return self.total_time <= 30

# Usage
recipe = Recipe.objects.get(id=1)
print(recipe.total_time)        # Calls the property
print(recipe.is_quick_recipe()) # Calls the method
```

### Class Methods and Managers
```python
class RecipeManager(models.Manager):
    def easy_recipes(self):
        return self.filter(difficulty='easy')
    
    def by_cuisine(self, cuisine):
        return self.filter(cuisine__iexact=cuisine)

class Recipe(models.Model):
    title = models.CharField(max_length=200)
    difficulty = models.CharField(max_length=10)
    cuisine = models.CharField(max_length=100)
    
    objects = RecipeManager()  # Custom manager
    
    @classmethod
    def get_popular_recipes(cls):
        return cls.objects.annotate(
            like_count=Count('likes')
        ).order_by('-like_count')[:10]

# Usage
easy_recipes = Recipe.objects.easy_recipes()
italian_recipes = Recipe.objects.by_cuisine('Italian')
popular_recipes = Recipe.get_popular_recipes()
```

## Database Transactions

### Basic Transactions
```python
from django.db import transaction

# Method 1: Decorator
@transaction.atomic
def create_recipe_with_tags(recipe_data, tag_names):
    recipe = Recipe.objects.create(**recipe_data)
    for tag_name in tag_names:
        tag, created = Tag.objects.get_or_create(name=tag_name)
        recipe.tags.add(tag)
    return recipe

# Method 2: Context manager
def update_recipe_safely(recipe_id, new_data):
    try:
        with transaction.atomic():
            recipe = Recipe.objects.select_for_update().get(id=recipe_id)
            for key, value in new_data.items():
                setattr(recipe, key, value)
            recipe.save()
            return recipe
    except Recipe.DoesNotExist:
        return None
```

## Raw SQL (When ORM Isn't Enough)

### Raw Queries
```python
# Raw SQL with ORM objects
recipes = Recipe.objects.raw(
    "SELECT * FROM recipes_recipe WHERE prep_time < %s",
    [30]
)

# Direct database connection
from django.db import connection

def get_recipe_stats():
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT difficulty, COUNT(*) as count, AVG(prep_time) as avg_prep
            FROM recipes_recipe
            GROUP BY difficulty
        """)
        return cursor.fetchall()
```

## Common Patterns in TasteStack

### User Recipes
```python
# Get all recipes by a user
user_recipes = Recipe.objects.filter(author=user)

# Get recipes liked by a user
liked_recipes = Recipe.objects.filter(likes__user=user)

# Get recipes with user's comments
commented_recipes = Recipe.objects.filter(comments__user=user).distinct()
```

### Recipe Statistics
```python
# Recipe with like count
recipes_with_likes = Recipe.objects.annotate(
    like_count=Count('likes')
).order_by('-like_count')

# Recipe with average rating
recipes_with_rating = Recipe.objects.annotate(
    avg_rating=Avg('ratings__rating')
).filter(avg_rating__gte=4.0)

# User with recipe count
users_with_recipe_count = User.objects.annotate(
    recipe_count=Count('recipes')
).filter(recipe_count__gt=0)
```

### Search and Filtering
```python
def search_recipes(query, difficulty=None, cuisine=None):
    recipes = Recipe.objects.all()
    
    if query:
        recipes = recipes.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(ingredients__icontains=query)
        )
    
    if difficulty:
        recipes = recipes.filter(difficulty=difficulty)
    
    if cuisine:
        recipes = recipes.filter(cuisine__iexact=cuisine)
    
    return recipes.order_by('-created_at')
```

## Performance Tips

1. **Use select_related() for ForeignKey**
2. **Use prefetch_related() for ManyToMany**
3. **Use only() to fetch specific fields**
4. **Use defer() to exclude heavy fields**
5. **Use exists() instead of count() for boolean checks**
6. **Use bulk_create() for multiple inserts**
7. **Use update() instead of save() for bulk updates**

```python
# Good: Only fetch needed fields
recipes = Recipe.objects.only('title', 'prep_time').all()

# Good: Check existence efficiently
has_recipes = Recipe.objects.filter(author=user).exists()

# Good: Bulk operations
Recipe.objects.bulk_create([
    Recipe(title='Recipe 1', author=user),
    Recipe(title='Recipe 2', author=user),
])
```

This guide covers the essential Django ORM concepts you need to build and extend the TasteStack application!