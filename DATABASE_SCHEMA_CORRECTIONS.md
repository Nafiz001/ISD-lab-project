# Database Schema Corrections

This document outlines the corrections needed to align the ER Diagram and DFD with the actual implementation.

## 🔄 Required Updates to ER Diagram

### 1. **Missing Wishlist Entity**
```javascript
// Add to ER Diagram:
Wishlist [PK: wishlistId]
userId: string [FK] 
productId: string [FK]
addedAt: datetime

// Relationship:
User (1) ←→ (M) Wishlist (M) ←→ (1) Product
```

### 2. **Cart Storage Clarification**
```javascript
// Current ER shows Cart as Firestore entity
// Reality: Cart is localStorage-based

// Update ER Diagram notation:
Cart [Storage: localStorage]
key: "ecommerce_cart_items"
data: {
  items: CartItem[],
  timestamp: number,
  version: string
}

CartItem [Embedded in Cart]
productId: string
quantity: number
name: string
price: number
image: string
```

### 3. **OrderItems Structure Update**
```javascript
// Current ER: Separate OrderItem entity
// Reality: Primarily embedded array

// Update ER Diagram:
Order [PK: orderId]
userId: string [FK]
items: OrderItem[] // ← Embedded array (primary approach)
customerInfo: object
totalAmount: number
paymentMethod: enum(bkash, nagad, cash)
status: enum(pending, paid, shipped, delivered, cancelled)
transactionId: string
createdAt: datetime

OrderItem [Embedded Type]
productId: string [FK]
quantity: number
price: number
name: string
```

### 4. **Enhanced Product Fields**
```javascript
// Add missing fields to Product entity:
Product [PK: productId]
// Existing fields...
name: string
description: string
price: number
imageUrl: string
categoryId: string [FK]
stock: number
createdAt: datetime

// Additional fields in implementation:
originalPrice: number
rating: number (0-5)
reviews: number
sales: number
featured: boolean
secondaryImages: string[]
```

## 🔄 Required Updates to DFD Level 1

### 1. **Update Data Stores**
```
Current Data Stores:
D1: Firebase Authentication ✅
D2: Products Collection ✅
D3: Orders Collection ✅
D4: Users Collection ✅
D5: Cart Storage (LocalStorage) ✅
D6: Wishlist Storage (LocalStorage) ✅
D7: Carousel Slides Collection ✅
D8: Firebase Storage (Images) ✅

ADD:
D9: Categories Collection (missing from current DFD)
```

### 2. **Process Updates**
```
Add missing data flows:
- Process 2.0 (Product Catalog) ←→ D9 (Categories Collection)
- Process 4.0 (Wishlist) ←→ D6 (Wishlist LocalStorage)
- Process 11.0 (Admin Carousel) ←→ D7 (Carousel Slides)
```

## 📊 Implementation vs Design Summary

| Component | ER Diagram | DFD Level 1 | Actual Code | Status |
|-----------|------------|-------------|-------------|--------|
| Users | ✅ Matches | ✅ Matches | ✅ Firebase Auth + Firestore | Perfect |
| Products | ⚠️ Missing fields | ✅ Matches | ✅ Enhanced fields | Needs update |
| Orders | ⚠️ Structure diff | ✅ Matches | ✅ Embedded items | Needs clarification |
| Categories | ❌ Missing | ✅ Present | ✅ Implemented | Add to ER |
| Cart | ❌ Wrong storage | ✅ Correct | ✅ localStorage | Fix ER |
| Wishlist | ❌ Missing | ✅ Present | ✅ localStorage | Add to ER |
| Carousel | ✅ Not shown | ✅ Present | ✅ Implemented | Good |

## 🔧 Recommended Actions

### For ER Diagram:
1. Add Wishlist entity with User-Product many-to-many relationship
2. Update Cart to show localStorage storage method
3. Add enhanced Product fields (rating, reviews, sales, featured)
4. Show OrderItems as embedded array within Order
5. Add Categories entity (currently missing)

### For DFD Level 1:
1. Add Categories Collection data store (D9)
2. Update process flows to include category management
3. Ensure all localStorage-based storage is clearly marked

### For Documentation:
1. ✅ Update DiagramToCodeMapping.md (completed)
2. Create visual schema comparison
3. Update API documentation to reflect actual fields
4. Add storage strategy explanations

This ensures 100% alignment between design diagrams and actual implementation.