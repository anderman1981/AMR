# 🛠️ ESTÁNDARES DE DESARROLLO Y CALIDAD
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-004-DESARROLLO.md

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
// We use exponential backoff to avoid overwhelming the API during peak hours
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

## 🏗️ PROJECT STRUCTURE STANDARDS

### Universal Directory Structure
```
project-root/
├── .github/
│   ├── workflows/              # CI/CD pipelines
│   │   ├── ci.yml
│   │   ├── cd.yml
│   │   └── tests.yml
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── documentation.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                       # Documentation
│   ├── adr/                    # Architecture Decision Records
│   ├── api/                    # API documentation
│   ├── diagrams/               # UML and other diagrams
│   ├── guides/                 # User guides
│   ├── PROJECT_CHARTER.md
│   ├── ARCHITECTURE.md
│   └── CHANGELOG.md
├── src/                        # Source code
│   ├── core/                   # Core business logic
│   ├── api/                    # API layer
│   ├── services/               # Service layer
│   ├── models/                 # Data models
│   ├── utils/                  # Utilities
│   └── config/                 # Configuration
├── tests/                      # Tests
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   ├── e2e/                    # End-to-end tests
│   ├── fixtures/               # Test data
│   └── mocks/                  # Mock objects
├── scripts/                    # Scripts
│   ├── setup/                  # Setup scripts
│   ├── deploy/                 # Deployment scripts
│   ├── migrate/                # Migration scripts
│   └── seed/                   # Seed data scripts
├── config/                     # Configuration files
│   ├── development.yml
│   ├── staging.yml
│   ├── production.yml
│   └── test.yml
├── .gitignore
├── .editorconfig
├── .eslintrc (or equivalent)
├── .prettierrc (or equivalent)
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
└── package.json (or equivalent)
```

### Naming Conventions

#### Files & Directories
```yaml
javascript:
  files: "camelCase.js or kebab-case.js"
  classes: "PascalCase"
  functions: "camelCase"
  constants: "UPPER_SNAKE_CASE"
  
python:
  files: "snake_case.py"
  classes: "PascalCase"
  functions: "snake_case"
  constants: "UPPER_SNAKE_CASE"

general:
  configs: "kebab-case.yml"
  docs: "UPPER_CASE.md or kebab-case.md"
  tests: "test_file_name.py or fileName.test.js"
```

#### Variables and Functions
```javascript
// Variables - camelCase, descriptive
const userProfile = getUserProfile();
const isAuthenticated = checkAuthentication();
const maxRetryAttempts = 3;

// Functions - camelCase, verb-noun pattern
function getUserById(userId) { }
function validateEmailFormat(email) { }
function calculateTotalPrice(items) { }

// Classes - PascalCase, singular nouns
class UserService { }
class PaymentProcessor { }
class EmailValidator { }

// Constants - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE_MB = 10;
const DEFAULT_TIMEOUT_MS = 5000;
```

---

## 🔧 CODE QUALITY CHECKLIST

### Before Committing Code

#### Functionality ✅
- [ ] Code works as intended
- [ ] All edge cases handled
- [ ] Error handling implemented
- [ ] Input validation present
- [ ] Business rules followed

#### Readability ✅
- [ ] Variable names are descriptive
- [ ] Functions are small (< 50 lines)
- [ ] No magic numbers without constants
- [ ] Complex logic is commented
- [ ] Code follows consistent style
- [ ] No commented out code

#### Maintainability ✅
- [ ] No code duplication (DRY)
- [ ] Functions do one thing (SRP)
- [ ] Dependencies are injected
- [ ] Configuration is externalized
- [ ] Proper abstraction levels
- [ ] Loose coupling between modules

#### Performance ✅
- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] Appropriate data structures used
- [ ] No unnecessary loops
- [ ] Memory usage is reasonable
- [ ] Async operations used properly

#### Security ✅
- [ ] Input is sanitized
- [ ] No hardcoded secrets
- [ ] Authentication/authorization implemented
- [ ] OWASP Top 10 considered
- [ ] SQL injection prevention
- [ ] XSS prevention

#### Testing ✅
- [ ] Unit tests written
- [ ] Integration tests written (if applicable)
- [ ] Test coverage > 80%
- [ ] All tests pass
- [ ] Tests follow AAA pattern
- [ ] Mock objects used appropriately

---

## 📏 LINTING Y FORMATTING

### ESLint Configuration (OBLIGATORIO)
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "prefer-template": "error",
    "template-curly-spacing": "error",
    "arrow-spacing": "error",
    "comma-dangle": ["error", "never"],
    "max-len": ["error", { "code": 100 }],
    "max-lines-per-function": ["error", { "max": 50 }],
    "complexity": ["error", { "max": 10 }]
  }
}
```

### Prettier Configuration (OBLIGATORIO)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Editor Configuration (OBLIGATORIO)
```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx}]
indent_style = space
indent_size = 2

[*.{json,yml,yaml}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

---

## 🔄 ERROR HANDLING STANDARDS

### Error Class Hierarchy
```javascript
// Base error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}
```

### Try-Catch Best Practices
```javascript
// ✅ Good: Specific error handling
async function getUserById(id) {
  try {
    const user = await database.users.findById(id);
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error; // Re-throw application errors
    }
    
    // Wrap unexpected errors
    throw new DatabaseError('Failed to fetch user', error);
  }
}

// ❌ Bad: Generic error handling
async function getUserById(id) {
  try {
    const user = await database.users.findById(id);
    return user;
  } catch (error) {
    console.log('Something went wrong');
    return null;
  }
}
```

---

## 📊 PERFORMANCE STANDARDS

### Response Time Targets
| Operation | Target 95th | Target 99th | Maximum |
|-----------|-------------|-------------|---------|
| Database Query | < 100ms | < 200ms | 500ms |
| API Call | < 200ms | < 500ms | 2000ms |
| File Read | < 50ms | < 100ms | 300ms |
| Cache Get | < 10ms | < 20ms | 50ms |
| Authentication | < 100ms | < 200ms | 500ms |

### Memory Usage Guidelines
```javascript
// ✅ Good: Stream processing for large data
async function processLargeFile(filePath) {
  const stream = fs.createReadStream(filePath);
  const transform = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      // Process chunk without loading entire file
      const processed = processDataChunk(chunk);
      callback(null, processed);
    }
  });

  return stream.pipe(transform);
}

// ❌ Bad: Loading entire large file into memory
async function processLargeFile(filePath) {
  const content = fs.readFileSync(filePath); // High memory usage
  return content.split('\n').map(processLine);
}
```

### Database Optimization Rules
```javascript
// ✅ Good: Use indexes and limit results
async function getActiveUsers(limit = 100, offset = 0) {
  return await database.users.find({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
    limit,
    offset,
    select: ['id', 'name', 'email', 'lastLoginAt']
  });
}

// ❌ Bad: No indexes, no limits, selecting all columns
async function getActiveUsers() {
  return await database.query('SELECT * FROM users WHERE status = "active"');
}
```

---

## 🔐 SECURITY STANDARDS

### Input Validation
```javascript
// ✅ Good: Comprehensive validation
function validateUserInput(userData) {
  const schema = Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    name: Joi.string().min(2).max(100).required(),
    age: Joi.number().integer().min(13).max(120)
  });

  const { error, value } = schema.validate(userData);
  
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  
  return value;
}

// ❌ Bad: No validation
function createUser(userData) {
  return database.users.create(userData);
}
```

### SQL Injection Prevention
```javascript
// ✅ Good: Parameterized queries
async function getUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = ?';
  return await database.query(query, [email]);
}

// ❌ Bad: String concatenation (vulnerable to SQL injection)
async function getUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  return await database.query(query);
}
```

### XSS Prevention
```javascript
// ✅ Good: Output encoding
function renderUserComment(comment) {
  return {
    text: comment.text,
    html: escapeHtml(comment.text) // Encode for HTML output
  };
}

// ❌ Bad: Raw output (vulnerable to XSS)
function renderUserComment(comment) {
  return `<div class="comment">${comment.text}</div>`;
}
```

---

## 📈 MONITORING Y LOGGING

### Logging Standards
```javascript
// Log levels and usage
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  )
});

// Usage patterns
logger.error('Database connection failed', { 
  error: error.message, 
  stack: error.stack,
  query: sqlQuery 
});

logger.warn('Rate limit exceeded', { 
  ip: req.ip, 
  endpoint: req.path,
  userId: req.user?.id 
});

logger.info('User created successfully', { 
  userId: user.id, 
  email: user.email 
});

logger.debug('Cache hit', { 
  key: cacheKey,
  ttl: result.ttl 
});
```

### Performance Monitoring
```javascript
// Middleware for API performance monitoring
function performanceMonitor(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('API Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Alert on slow responses
    if (duration > 1000) {
      alertService.sendSlowApiAlert({
        endpoint: `${req.method} ${req.path}`,
        duration,
        threshold: 1000
      });
    }
  });

  next();
}
```

---

**ESTE DOCUMENTO DEFINE LOS ESTÁNDARES DE DESARROLLO**  
Seguir estas reglas no es opcional, es obligatorio para mantener la calidad del código.

**Archivo:** REGLAS-004-DESARROLLO.md  
**Versión:** 1.0.0  
**Última actualización:** 2026-02-02