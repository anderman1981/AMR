---
trigger: always_on
---

# 🛠️ ESTÁNDARES DE DESARROLLO Y CALIDAD - Parte 1
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-004-DESARROLLO-PARTE1.md

---

## 🎯 FILOSOFÍA DE DESARROLLO

> **"Código limpio no es código que funciona, es código que otros pueden entender y modificar"**

Cada línea de código debe escribirse como si la persona que lo mantendrá mañana fuera un psicópata violento que sabe dónde vives.

---

## 🏛️ PRINCIPIOS SOLID (NO NEGOCIABLES)

### S - Single Responsibility Principle
**Una clase debe tener una, y solo una, razón para cambiar.**

#### ❌ MAL - Class doing too much
```javascript
class UserManager {
  createUser(userData) {
    // Validates data
    // Creates user in database
    // Sends welcome email
    // Logs activity
    // Updates analytics
    // Tracks metrics
    // Calls external services
  }
}
```

#### ✅ BIEN - Single responsibility
```javascript
class UserValidator {
  validate(userData) {
    // Only validation logic
  }
}

class UserRepository {
  create(userData) {
    // Only database operations
  }
}

class EmailService {
  sendWelcomeEmail(user) {
    // Only email sending
  }
}

class ActivityLogger {
  logUserCreation(user) {
    // Only logging
  }
}

class AnalyticsTracker {
  trackUserSignup(user) {
    // Only analytics
  }
}

class UserManager {
  constructor(validator, repository, emailService, logger, analytics) {
    this.validator = validator;
    this.repository = repository;
    this.emailService = emailService;
    this.logger = logger;
    this.analytics = analytics;
  }

  async createUser(userData) {
    const validatedData = this.validator.validate(userData);
    const user = await this.repository.create(validatedData);
    
    await Promise.all([
      this.emailService.sendWelcomeEmail(user),
      this.logger.logUserCreation(user),
      this.analytics.trackUserSignup(user)
    ]);

    return user;
  }
}
```

### O - Open/Closed Principle
**Software entities should be open for extension, but closed for modification.**

#### ❌ MAL - Must modify class to add new payment method
```javascript
class PaymentProcessor {
  process(paymentType, amount) {
    if (paymentType === "credit_card") {
      // Process credit card
    } else if (paymentType === "paypal") {
      // Process PayPal
    } else if (paymentType === "stripe") {
      // Process Stripe
    }
    // Adding new method requires modifying this class
  }
}
```

#### ✅ BIEN - Open for extension, closed for modification
```javascript
class PaymentMethod {
  process(amount) {
    throw new Error("process must be implemented");
  }
}

class CreditCardPayment extends PaymentMethod {
  process(amount) {
    // Credit card processing logic
  }
}

class PayPalPayment extends PaymentMethod {
  process(amount) {
    // PayPal processing logic
  }
}

class StripePayment extends PaymentMethod {
  process(amount) {
    // Stripe processing logic
  }
}

class PaymentProcessor {
  processPayment(paymentMethod, amount) {
    return paymentMethod.process(amount);
  }
}
```

### L - Liskov Substitution Principle
**Subtypes must be substitutable for their base types.**

#### ❌ MAL - Subclass changes expected behavior
```javascript
class Bird {
  fly() {
    return "Flying";
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error("Penguins can't fly!");
  }
}

// This breaks LSP - Penguin can't substitute Bird
function makeBirdFly(bird) {
  return bird.fly(); // Throws for Penguin!
}
```

#### ✅ BIEN - Proper abstraction
```javascript
class Bird {
  move() {
    throw new Error("move must be implemented");
  }
}

class FlyingBird extends Bird {
  fly() {
    return "Flying";
  }

  move() {
    return this.fly();
  }
}

class FlightlessBird extends Bird {
  walk() {
    return "Walking";
  }

  move() {
    return this.walk();
  }
}

class Penguin extends FlightlessBird {
  walk() {
    return "Waddling";
  }
}

// Now substitution works correctly
function makeBirdMove(bird) {
  return bird.move(); // Works for all birds
}
```

### I - Interface Segregation Principle
**Clients should not be forced to depend on interfaces they don't use.**

#### ❌ MAL - Fat interface
```javascript
class Worker {
  work() {}
  eat() {}
  sleep() {}
  commute() {}
  attendMeetings() {}
}

// Robots shouldn't need to implement eat() and sleep()
class RobotWorker extends Worker {
  work() { /* Robot work */ }
  eat() { throw new Error("Robots don't eat!"); }
  sleep() { throw new Error("Robots don't sleep!"); }
  commute() { /* Robot commute */ }
  attendMeetings() { /* Robot meetings */ }
}
```

#### ✅ BIEN - Segregated interfaces
```javascript
class Workable {
  work() {
    throw new Error("work must be implemented");
  }
}

class Eatable {
  eat() {
    throw new Error("eat must be implemented");
  }
}

class Sleepable {
  sleep() {
    throw new Error("sleep must be implemented");
  }
}

class Commutable {
  commute() {
    throw new Error("commute must be implemented");
  }
}

class HumanWorker {
  constructor() {
    this.workable = new HumanWork();
    this.eatable = new HumanEating();
    this.sleepable = new HumanSleeping();
    this.commutable = new HumanCommuting();
  }
}

class RobotWorker {
  constructor() {
    this.workable = new RobotWork();
    this.commutable = new RobotCommuting();
  }
  // No eatable or sleepable - Robot doesn't need them
}
```

### D - Dependency Inversion Principle
**High-level modules should not depend on low-level modules. Both should depend on abstractions.**

#### ❌ MAL - High-level depends on low-level
```javascript
class MySQLDatabase {
  connect() {
    return "MySQL connection";
  }
}

class UserService {
  constructor() {
    this.db = new MySQLDatabase(); // Tight coupling
  }

  getUser(id) {
    const connection = this.db.connect();
    // Use connection to get user
  }
}
```

#### ✅ BIEN - Both depend on abstraction
```javascript
class Database {
  connect() {
    throw new Error("connect must be implemented");
  }
}

class MySQLDatabase extends Database {
  connect() {
    return "MySQL connection";
  }
}

class PostgreSQLDatabase extends Database {
  connect() {
    return "PostgreSQL connection";
  }
}

class UserService {
  constructor(database) {
    this.db = database; // Loose coupling via abstraction
  }

  getUser(id) {
    const connection = this.db.connect();
    // Use connection to get user
  }
}

// Dependency Injection
const userService = new UserService(new MySQLDatabase());
// Or
const userService = new UserService(new PostgreSQLDatabase());
```

---

## 📝 CLEAN CODE PRINCIPLES

### Meaningful Names

#### ❌ MAL
```javascript
const d = 86400; // What is this?
function calc(x, y) {
  return x * y;
}

let arr = [1, 2, 3];
arr.forEach(i => console.log(i));
```

#### ✅ BIEN
```javascript
const SECONDS_PER_DAY = 86400;
function calculateRectangleArea(width, height) {
  return width * height;
}

const userIds = [1, 2, 3];
userIds.forEach(userId => console.log(userId));
```

### Functions Should Do One Thing

#### ❌ MAL
```javascript
function processOrder(order) {
  // Validates order
  if (!order.userId || !order.items || order.items.length === 0) {
    throw new Error("Invalid order");
  }

  // Calculates total
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }

  // Charges payment
  const paymentResult = paymentGateway.charge(total);

  // Sends email
  emailService.sendOrderConfirmation(order.userEmail, order);

  // Updates inventory
  for (const item of order.items) {
    inventoryService.updateStock(item.id, -item.quantity);
  }

  // Creates shipment
  const shipment = shippingService.createShipment(order);

  return { total, paymentResult, shipment };
}
```

#### ✅ BIEN
```javascript
class OrderProcessor {
  constructor(validator, calculator, paymentGateway, emailService, inventoryService, shippingService) {
    this.validator = validator;
    this.calculator = calculator;
    this.paymentGateway = paymentGateway;
    this.emailService = emailService;
    this.inventoryService = inventoryService;
    this.shippingService = shippingService;
  }

  async processOrder(order) {
    this.validator.validate(order);
    
    const total = this.calculator.calculateTotal(order);
    const paymentResult = await this.paymentGateway.charge(total);
    
    await this.emailService.sendOrderConfirmation(order.userEmail, order);
    await this.updateInventory(order.items);
    const shipment = await this.shippingService.createShipment(order);

    return { total, paymentResult, shipment };
  }

  async updateInventory(items) {
    await Promise.all(
      items.map(item => 
        this.inventoryService.updateStock(item.id, -item.quantity)
      )
    );
  }
}
```

### Comments Explain WHY, Not WHAT

#### ❌ MAL
```javascript
// Increment counter by 1
counter += 1;

// Loop through users
for (const user of users) {
  console.log(user.name); // Print user name
}

// Check if user is admin
if (user.role === 'admin') {
  // User is admin, grant access
  grantAccess(user);
}
```

#### ✅ BIEN
```javascript
// We use exponential backoff to avoid overwhelming API during peak hours
retryDelay = baseDelay * (2 ** attemptCount);

// Filter out inactive users before processing to save computational resources
const activeUsers = users.filter(user => user.status === 'active');

// Admin users bypass rate limiting as they need emergency access
if (user.role === 'admin') {
  grantAccess(user);
}
```

---

## 🧪 TESTING STANDARDS

### Test Pyramid
```
    /\
   /E2E\         10% - End-to-End Tests
 /------\
/Integration\   20% - Integration Tests
/------------\
/  Unit Tests  \  70% - Unit Tests
/----------------\
```

### Test Naming Convention
```javascript
// Format: test_[method]_[scenario]_[expected_outcome]

describe('UserService', () => {
  test('createUser_with_valid_data_returns_user_object', async () => {
    // Test implementation
  });

  test('createUser_with_duplicate_email_throws_exception', async () => {
    // Test implementation
  });

  test('getUser_with_valid_id_returns_user_data', async () => {
    // Test implementation
  });

  test('getUser_with_nonexistent_id_returns_null', async () => {
    // Test implementation
  });
});
```

### AAA Pattern (Arrange, Act, Assert)
```javascript
test('calculateTotal_with_discount_applies_correct_percentage', () => {
  // Arrange
  const cart = new ShoppingCart();
  cart.addItem(new Product("Book", 10.00), quantity: 2);
  cart.addItem(new Product("Pen", 2.00), quantity: 3);
  const discount = new Discount(rate: 0.10); // 10% off

  // Act
  const total = cart.calculateTotal(discount);

  // Assert
  expect(total).toBe(24.10); // (20 + 6) - 10% = 25.20 - 2.52 = 22.68
});
```

### Test Coverage Requirements
| Component | Minimum Coverage | Target Coverage | Critical Paths |
|-----------|------------------|-----------------|----------------|
| Core Business Logic | 90% | 95%+ | 100% |
| API Endpoints | 80% | 90%+ | 100% |
| Services | 85% | 90%+ | 100% |
| Utilities | 80% | 85%+ | 95% |
| UI Components | 70% | 80%+ | 90% |
| **Overall** | **80%** | **85%+** | - |

### Mock and Stub Guidelines
```javascript
// Use mocks for external dependencies
jest.mock('../services/emailService');
jest.mock('../services/paymentGateway');

// Use stubs for data
const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
};

// Clear mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
```

---
**Continúa en Parte 2 para más estándares de calidad, monitoring y herramientas**
