# OptiMall Full UI Layout Plan

## Project Positioning

OptiMall is a hybrid intelligent e-commerce platform inspired by familiar online shopping interfaces, but enhanced with an Intelligent Shopping Assistant.

The system does not rely on generative AI. Instead, its intelligent behavior is based on:

- Heuristic recommendation scoring
- Realtime product reranking
- Budget-aware bundle optimization
- Rule-based anomaly detection
- Session-based user behavior analysis
- Explainable system recommendations

The goal is to keep normal browsing available while adding intelligent decision support that helps users make better purchasing decisions.

---

# 1. Global Layout

## Main Page Structure

```text
---------------------------------------------------------
| Logo | Search Bar | Intelligent Shopping | Cart | User |
---------------------------------------------------------
| Categories Navigation Bar                             |
---------------------------------------------------------
| Main Page Content                                     |
| Product Feed / Smart Suggestions / Bundles            |
---------------------------------------------------------
| Footer                                                |
---------------------------------------------------------
```

The layout should feel familiar to users who already understand common e-commerce platforms, but OptiMall adds intelligent sections that support better product discovery and purchase planning.

---

# 2. Top Navigation Bar

## Position

The top navigation bar appears on every main page.

## Items on the Navbar

| Item | Location | Purpose |
|---|---|---|
| OptiMall Logo | Left | Returns user to homepage |
| Search Bar | Center | Allows product, setup, and bundle search |
| Intelligent Shopping | Right | Opens guided shopping assistant |
| Cart | Right | Opens cart and smart cart optimization |
| Profile | Right | Opens user account menu |

---

## 2.1 Logo

```text
OptiMall
```

### Behavior

Clicking the logo redirects the user to the homepage.

---

## 2.2 Search Bar

```text
[ Search products, setups, bundles... ]
```

The search bar supports both normal product search and intelligent discovery.

### Search Can Handle

- Product names
- Categories
- Tags
- Setups
- Bundles
- Budget-based searches

### Example Searches

```text
gaming setup
```

Expected results:

- Gaming keyboard
- Gaming mouse
- Headset
- Gaming chair
- Gaming setup bundle

```text
budget laptop accessories
```

Expected results:

- Laptop stand
- USB hub
- Cooling pad
- Wireless mouse
- Affordable laptop accessory bundle

---

## 2.3 Search Suggestion Dropdown

When the user types, the system shows smart suggestions.

Example:

```text
User types: gamin...
```

Dropdown:

```text
Gaming Mouse
Gaming Keyboard
Gaming Setup Bundle
Gaming Streaming Kit
```

### Suggestion Factors

Suggestions may be influenced by:

- Keyword match
- Popular searches
- Product tags
- Trending products
- User browsing history
- Current session behavior

---

## 2.4 Intelligent Shopping Button

```text
[ Intelligent Shopping ]
```

### Behavior

Clicking this opens the Intelligent Shopping Assistant page or side panel.

This feature guides the user through:

- Shopping goal selection
- Budget input
- Preference selection
- Bundle generation
- System recommendation explanation

---

## 2.5 Cart Button

```text
[ Cart ]
```

### Behavior

Clicking the cart opens the Smart Cart page.

The cart shows:

- Added products
- Quantity
- Total price
- Suggested bundle improvements
- Cart optimization button

---

## 2.6 Profile Button

```text
[ Profile ]
```

### Dropdown Items

- My Orders
- Wishlist
- Saved Bundles
- Recommendations
- Account Settings
- Logout

---

# 3. Secondary Navigation Bar

## Categories Bar

Located below the main navbar.

```text
Electronics | Gaming | Audio | Photography | Office | Home | Fashion | Accessories
```

### Behavior

Clicking a category opens a category page with:

- Product grid
- Filters
- Sort options
- Trending products
- Smart bundle opportunities
- Recommended products related to the category

---

# 4. Homepage Layout

## Homepage Structure

```text
---------------------------------------------------------
| Hero Banner                                           |
---------------------------------------------------------
| Smart Start Panel                                     |
---------------------------------------------------------
| Optimized For You                                     |
---------------------------------------------------------
| Bundle Opportunities                                  |
---------------------------------------------------------
| Trending Products                                     |
---------------------------------------------------------
| Product Categories                                    |
---------------------------------------------------------
```

---

## 4.1 Hero Banner

```text
---------------------------------------------------------
| Smarter Shopping Starts Here                          |
| Find products, compare value, and build better carts. |
| [ Start Intelligent Shopping ]                        |
---------------------------------------------------------
```

### Purpose

The hero section introduces the unique value of OptiMall.

It communicates that the platform helps users:

- Discover products
- Compare options
- Build optimized bundles
- Shop based on budget and goals

---

## 4.2 Smart Start Panel

```text
---------------------------------------------------------
| What are you shopping for today?                      |
| [ Gaming ] [ Study ] [ Work ] [ Gifts ] [ Streaming ] |
---------------------------------------------------------
```

This is an optional guided shopping entry point.

The user can still browse normally, but selecting a goal helps the system adjust recommendations.

---

## 4.3 Optimized For You Section

```text
---------------------------------------------------------
| Optimized For You                                     |
| Product Card | Product Card | Product Card            |
---------------------------------------------------------
```

### Powered By

- promotional.py
- realtime.py

### Ranking Factors

- Base product score
- Product rating
- Recent activity
- Product popularity
- Category match
- User session behavior
- Recency decay

---

## 4.4 Bundle Opportunities Section

```text
---------------------------------------------------------
| Bundle Opportunities                                  |
| [ Student Productivity Bundle ]                       |
| [ Gaming Starter Bundle ]                             |
| [ Streaming Kit Bundle ]                              |
---------------------------------------------------------
```

### Bundle Card Includes

- Bundle name
- Included products
- Total price
- Estimated savings
- Compatibility score
- View Bundle button

### Powered By

- bundle.py

---

## 4.5 Trending Products Section

```text
---------------------------------------------------------
| Trending Products                                     |
| Product Grid                                          |
---------------------------------------------------------
```

Traditional browsing remains available for all users.

---

# 5. Product Card Layout

## Product Card Structure

```text
---------------------------------------------------------
| Product Image                                         |
| Product Name                                          |
| Price                                                 |
| Rating                                                |
| Value Score                                           |
| [ Add to Cart ] [ View Bundle Options ]               |
---------------------------------------------------------
```

## Product Card Elements

| Element | Purpose |
|---|---|
| Product Image | Visual preview |
| Product Name | Product label |
| Price | Product cost |
| Rating | User review score |
| Value Score | System-generated purchasing value score |
| Add to Cart | Adds product to cart |
| View Bundle Options | Opens related bundles |

---

# 6. Product Detail Page

## Layout

```text
---------------------------------------------------------
| Product Images       | Product Name                   |
|                      | Price                          |
|                      | Rating                         |
|                      | Seller                         |
|                      | [ Add to Cart ] [ Buy Now ]    |
---------------------------------------------------------
| Pairs Well With                                       |
---------------------------------------------------------
| Budget Completion Suggestions                         |
---------------------------------------------------------
| Why This Was Recommended                              |
---------------------------------------------------------
| Reviews                                               |
---------------------------------------------------------
```

---

## 6.1 Pairs Well With Section

Shows products that match well with the currently viewed item.

### Example

Viewing a mechanical keyboard may suggest:

- Gaming mouse
- Mouse pad
- Wrist rest
- USB hub

### Recommendation Factors

- Category similarity
- Tag overlap
- Bundle compatibility
- Co-purchase patterns
- User session activity

---

## 6.2 Budget Completion Suggestions

```text
You still have ₱1,500 remaining.
Suggested additions:
- Mouse Pad
- USB Hub
- Desk Lamp
```

### Purpose

Helps users maximize the usefulness of their remaining budget.

---

## 6.3 Recommendation Explanation Panel

```text
✓ Matches your recent gaming interest
✓ High value-to-price ratio
✓ Frequently paired with products in your cart
```

### Purpose

Provides explainable recommendations instead of random suggestions.

---

# 7. Intelligent Shopping Assistant Page

## Purpose

Provides guided shopping assistance for users who want optimized recommendations and bundles.

This feature supports intelligent decision-making without replacing normal browsing.

---

## Layout

```text
---------------------------------------------------------
| Intelligent Shopping Assistant                        |
---------------------------------------------------------
| Step 1: Shopping Goal                                 |
---------------------------------------------------------
| Step 2: Budget Input                                  |
---------------------------------------------------------
| Step 3: Preference Selection                          |
---------------------------------------------------------
| Step 4: Generated Recommendations                     |
---------------------------------------------------------
```

---

## Step 1: Shopping Goal

Options:

- Gaming Setup
- Study Setup
- Work From Home
- Content Creation
- Streaming
- Gift Bundle
- Budget Essentials

---

## Step 2: Budget Input

```text
Enter your budget:
[ ₱________ ]
```

The system uses the budget as the constraint for bundle optimization.

---

## Step 3: Preference Selection

```text
[ Budget Saver ]
[ Balanced ]
[ Performance ]
[ Premium ]
```

### Modes

| Mode | Behavior |
|---|---|
| Budget Saver | Prioritizes affordability |
| Balanced | Balances price and quality |
| Performance | Prioritizes product ratings and score |
| Premium | Prioritizes high-end products |

---

## Step 4: Generated Recommendations

```text
---------------------------------------------------------
| Recommended Bundle                                    |
| Product 1                                             |
| Product 2                                             |
| Product 3                                             |
| Total Price                                           |
| Compatibility Score                                   |
| [ Add Bundle to Cart ] [ Modify Bundle ]              |
---------------------------------------------------------
```

Generated using:

- bundle.py
- promotional.py
- realtime.py

---

# 8. Smart Cart Page

## Layout

```text
---------------------------------------------------------
| Cart Items                                            |
---------------------------------------------------------
| Product | Quantity | Price | Subtotal                  |
---------------------------------------------------------
| Cart Summary                                          |
| Total Price                                           |
| [ Checkout ]                                          |
---------------------------------------------------------
| Smart Cart Optimization                               |
| [ Optimize Cart ]                                     |
---------------------------------------------------------
```

---

## Smart Cart Optimization

The system may:

- Suggest cheaper alternatives
- Improve compatibility
- Increase value score
- Remove inefficient products
- Add useful accessories within budget

---

# 9. Product Comparison Page

## Layout

```text
---------------------------------------------------------
| Compare Products                                      |
---------------------------------------------------------
| Product A | Product B | Product C                     |
---------------------------------------------------------
| Price                                                  |
| Rating                                                 |
| Value Score                                            |
| Compatibility Score                                    |
| Recommendation Reason                                  |
---------------------------------------------------------
| Suggested Option                                       |
---------------------------------------------------------
```

---

## Example Recommendation

```text
Suggested Option:
Product A provides better overall value because it has a higher rating, lower price, and stronger compatibility with the user’s current cart.
```

---

# 10. Checkout Page

## Layout

```text
---------------------------------------------------------
| Delivery Information                                  |
---------------------------------------------------------
| Payment Method                                        |
---------------------------------------------------------
| Order Summary                                         |
---------------------------------------------------------
| Risk/Anomaly Check                                    |
---------------------------------------------------------
| [ Place Order ]                                       |
---------------------------------------------------------
```

---

## Anomaly Detection

The system may compute a risk score using:

- Order total
- Purchase frequency
- Quantity spikes
- Unusual activity patterns

Powered by:

- anomaly.py

---

# 11. Admin Dashboard

## Features

- View product activity
- Monitor bundle usage
- Track recommendation performance
- View anomaly alerts
- Monitor trending products
- Analyze interaction patterns

---

# 12. Intelligent System Components

## promotional.py

Purpose:

Performs first-pass product ranking using:

- Base product score
- Activity boosts
- Popularity weighting
- Recency decay

---

## realtime.py

Purpose:

Reranks products based on:

- Current user session
- Last viewed items
- Category interactions
- Cart activity
- User preferences

---

## bundle.py

Purpose:

Generates optimized bundles using:

- Bounded knapsack optimization
- Greedy fallback strategy
- Product score
- Price constraints
- Compatibility scoring

---

## anomaly.py

Purpose:

Computes risk score and risk level based on:

- User activity patterns
- Order total
- Frequency anomalies
- Suspicious purchase behavior

---

# 13. Recommended Terminology

| Avoid | Use Instead |
|---|---|
| AI Shopping | Intelligent Shopping Assistant |
| AI Recommendation | System Recommendation |
| AI Optimization | Smart Optimization |
| AI Assistant | Shopping Assistant |
| AI Powered | Intelligent / Adaptive |

---

# 14. Final Experience Goal

OptiMall should feel like a familiar e-commerce platform enhanced with intelligent decision-support features.

Users can still:

- Browse normally
- Search products
- View categories
- Add to cart
- Checkout normally

But the system improves the experience through:

- Goal-aware shopping
- Adaptive recommendations
- Smart bundle generation
- Cart optimization
- Product comparison support
- Explainable recommendations
- Rule-based anomaly detection

The result is a more guided, value-oriented, and intelligent shopping experience aligned with Intelligent Systems principles.

