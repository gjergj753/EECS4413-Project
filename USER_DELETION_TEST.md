# User Deletion Test Instructions

## Changes Made

### 1. Updated User Entity
- Added `@OneToMany` relationship for addresses (was missing)
- Added `@OneToMany` relationship for orders (for proper handling)
- Configured cascade delete for addresses, cart, and payment methods
- Orders are NOT cascade deleted (preserved for audit trail)

### 2. Updated Order Entity
- Made `user_id` foreign key nullable to allow orphaned orders

### 3. Updated UserService
- Enhanced `deleteUser()` method to:
  - Preserve orders by setting their user reference to null
  - Properly clear user's addresses, payment methods, and cart
  - Use cascade delete for related entities

## What Gets Deleted vs Preserved

When you delete a user:
- ✅ **DELETED**: Addresses, Cart, CartItems, PaymentMethods
- ✅ **PRESERVED**: Orders (user_id set to null for audit trail)

## Testing Steps

### Setup Test Data
1. Create a test user with ID 11 (or use existing)
2. Add some addresses for this user
3. Add payment methods for this user
4. Place an order with this user

### Test Deletion

#### Using cURL (Windows PowerShell):
```powershell
# Delete user with ID 11
curl.exe -v -X DELETE `
  -H "Content-Type: application/json" `
  -u "admin@test.com:adminpass" `
  http://localhost:2424/api/users/11
```

#### Expected Response:
- Status: 200 OK
- Message: "User deleted successfully"

### Verify Results

#### Check that user is deleted:
```powershell
curl.exe -X GET `
  -u "admin@test.com:adminpass" `
  http://localhost:2424/api/users/11
```
Expected: 404 Not Found or error message

#### Check that orders are preserved (if user had orders):
```powershell
# Get all orders (admin endpoint)
curl.exe -X GET `
  -u "admin@test.com:adminpass" `
  http://localhost:2424/api/admin/orders/all?page=0&size=20
```
Expected: Previous user's orders still exist but with null user_id

#### Check database directly:
```sql
-- Check user is gone
SELECT * FROM users WHERE user_id = 11;

-- Check addresses are deleted
SELECT * FROM addresses WHERE user_id = 11;

-- Check payment methods are deleted
SELECT * FROM payment_methods WHERE user_id = 11;

-- Check cart is deleted
SELECT * FROM cart WHERE user_id = 11;

-- Check orders are preserved (user_id should be NULL)
SELECT * FROM orders WHERE user_id IS NULL;
```

## Before Deploying

1. **Stop the backend** (if running locally):
   - Stop your Spring Boot application

2. **Rebuild the project**:
   ```powershell
   cd C:\Users\domen\IdeaProjects\EECS4413-Project\backend
   .\mvnw clean package
   ```

3. **Restart the backend**:
   - Run BackendApplication.java from your IDE
   - Or: `.\mvnw spring-boot:run`

4. **Test locally first** before pushing to production

## Database Migration Note

The Order table's `user_id` column needs to be changed to allow NULL values.

If using Hibernate with `spring.jpa.hibernate.ddl-auto=update`, it should handle this automatically.

If not, you may need to run this SQL manually:

```sql
ALTER TABLE orders MODIFY COLUMN user_id BIGINT NULL;
```

## Rollback Plan (If Issues Occur)

If you encounter problems:

1. **Revert Order entity change**:
   - Change `@JoinColumn(name = "user_id")` back to `@JoinColumn(name = "user_id", nullable = false)`

2. **Revert UserService**:
   - Change deleteUser back to simple `userRepo.deleteById(id)`

3. **Add a check to prevent deletion**:
   ```java
   public void deleteUser(Long id) {
       User user = userRepo.findById(id)
           .orElseThrow(() -> new RuntimeException("User not found"));
       
       if (!user.getOrders().isEmpty()) {
           throw new RuntimeException("Cannot delete user with existing orders");
       }
       
       userRepo.delete(user);
   }
   ```

## Alternative Approach: Soft Delete

If you want to keep users but mark them as deleted:

1. Add a `deleted` boolean field to User entity
2. Change deleteUser to set `user.setDeleted(true)`
3. Filter out deleted users in queries

This preserves all relationships and allows "undeleting" users if needed.

