import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { faker } from '@faker-js/faker';
import { hashSync } from 'bcryptjs';
import * as schema from './schema';

const db = drizzle(process.env['DATABASE_URL']!, { schema });

async function seed() {
  console.log('Seeding database...');

  // Clear existing data (order matters for foreign keys)
  await db.delete(schema.auditLog);
  await db.delete(schema.dashboardConfigs);
  await db.delete(schema.orders);
  await db.delete(schema.customers);
  await db.delete(schema.products);
  await db.delete(schema.permissions);
  await db.delete(schema.users);
  await db.delete(schema.roles);

  // Roles
  const [adminRole, managerRole, editorRole, viewerRole] = await db
    .insert(schema.roles)
    .values([
      { name: 'Admin', description: 'Full system access' },
      { name: 'Manager', description: 'Manage data and users' },
      { name: 'Editor', description: 'Edit data records' },
      { name: 'Viewer', description: 'Read-only access' },
    ])
    .returning();

  // Permissions
  const resources = ['customers', 'orders', 'products', 'users', 'roles', 'dashboard'];
  const actions = ['create', 'read', 'update', 'delete'];
  const permissionValues: { roleId: number; resource: string; action: string }[] = [];

  for (const resource of resources) {
    for (const action of actions) {
      // Admin gets everything
      permissionValues.push({ roleId: adminRole.id, resource, action });
      // Manager gets everything except role/user delete
      if (!(resource === 'roles' && action === 'delete') && !(resource === 'users' && action === 'delete')) {
        permissionValues.push({ roleId: managerRole.id, resource, action });
      }
      // Editor gets CRUD on data, read on users/roles
      if (['customers', 'orders', 'products', 'dashboard'].includes(resource)) {
        permissionValues.push({ roleId: editorRole.id, resource, action });
      } else if (action === 'read') {
        permissionValues.push({ roleId: editorRole.id, resource, action });
      }
      // Viewer gets read only
      if (action === 'read') {
        permissionValues.push({ roleId: viewerRole.id, resource, action });
      }
    }
  }
  await db.insert(schema.permissions).values(permissionValues);

  // Users (password: Demo123!)
  const passwordHash = hashSync('Demo123!', 10);
  await db.insert(schema.users).values([
    { email: 'admin@adminpro.dev', passwordHash, name: 'Alex Admin', roleId: adminRole.id },
    { email: 'manager@adminpro.dev', passwordHash, name: 'Morgan Manager', roleId: managerRole.id },
    { email: 'editor@adminpro.dev', passwordHash, name: 'Ellis Editor', roleId: editorRole.id },
    { email: 'viewer@adminpro.dev', passwordHash, name: 'Val Viewer', roleId: viewerRole.id },
  ]);

  // Customers (~500)
  const customerValues = Array.from({ length: 500 }, () => ({
    company: faker.company.name(),
    contactName: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    status: faker.helpers.arrayElement(['active', 'inactive', 'prospect', 'churned']),
    tier: faker.helpers.arrayElement(['enterprise', 'professional', 'standard', 'starter']),
    revenue: faker.number.float({ min: 1000, max: 500000, fractionDigits: 2 }).toString(),
    createdAt: faker.date.past({ years: 3 }),
  }));
  const insertedCustomers = await db.insert(schema.customers).values(customerValues).returning({ id: schema.customers.id });

  // Orders (~2000)
  const orderValues = Array.from({ length: 2000 }, () => ({
    customerId: faker.helpers.arrayElement(insertedCustomers).id,
    amount: faker.number.float({ min: 50, max: 25000, fractionDigits: 2 }).toString(),
    status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    itemsCount: faker.number.int({ min: 1, max: 20 }),
    createdAt: faker.date.past({ years: 2 }),
  }));
  await db.insert(schema.orders).values(orderValues);

  // Products (~200)
  const categories = ['Electronics', 'Software', 'Services', 'Hardware', 'Accessories', 'Support'];
  const productValues = Array.from({ length: 200 }, (_, i) => ({
    name: faker.commerce.productName(),
    sku: `SKU-${String(i + 1).padStart(4, '0')}`,
    category: faker.helpers.arrayElement(categories),
    price: faker.number.float({ min: 9.99, max: 2999.99, fractionDigits: 2 }).toString(),
    stock: faker.number.int({ min: 0, max: 500 }),
    status: faker.helpers.arrayElement(['active', 'discontinued', 'out_of_stock']),
  }));
  await db.insert(schema.products).values(productValues);

  console.log('Seeded: 4 roles, permissions matrix, 4 users, 500 customers, 2000 orders, 200 products');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
