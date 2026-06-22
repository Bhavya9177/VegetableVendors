def slugify(name)
  name.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/^-|-$/, '')
end

# ─────────────────────────────────────────────────────────────────────────────
# Admin User
# ─────────────────────────────────────────────────────────────────────────────
puts "Seeding admin user..."

ADMIN_EMAIL    = 'admin@vegfresh.in'
ADMIN_PASSWORD = 'Admin@123'

existing_admin = App::Models::User.where(email: ADMIN_EMAIL).first
if existing_admin
  puts "  Admin '#{ADMIN_EMAIL}' already exists, skipping."
else
  admin = App::Models::User.new(
    full_name: 'Admin',
    email:     ADMIN_EMAIL,
    role:      0,
    active:    true
  )
  admin.password = ADMIN_PASSWORD
  if admin.save
    puts "  Created admin user: #{ADMIN_EMAIL} / #{ADMIN_PASSWORD}"
  else
    puts "  Failed to create admin: #{admin.errors}"
  end
end

# ─────────────────────────────────────────────────────────────────────────────
# Categories
# ─────────────────────────────────────────────────────────────────────────────
puts "Seeding categories..."

CATEGORIES = [
  { name: 'Vegetables',     description: 'Fresh farm vegetables delivered daily',         image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
  { name: 'Fruits',         description: 'Seasonal fruits sourced from local orchards',   image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400' },
  { name: 'Leafy Greens',   description: 'Tender greens harvested fresh every morning',   image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400' },
  { name: 'Herbs & Spices', description: 'Aromatic fresh herbs to elevate your cooking',  image_url: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400' }
].freeze

category_ids = {}

CATEGORIES.each do |cat|
  slug = slugify(cat[:name])
  existing = App::Models::Category.first(slug: slug)

  if existing
    category_ids[cat[:name]] = existing.id
    puts "  Category '#{cat[:name]}' already exists, skipping."
    next
  end

  record = App::Models::Category.create(
    name: cat[:name],
    slug: slug,
    description: cat[:description],
    image_url: cat[:image_url],
    active: true
  )

  category_ids[cat[:name]] = record.id
  puts "  Created category: #{cat[:name]} (id=#{record.id})"
end

# ─────────────────────────────────────────────────────────────────────────────
# Products
# ─────────────────────────────────────────────────────────────────────────────
puts "Seeding products..."

PRODUCTS = [
  { category: 'Vegetables', name: 'Tomatoes', description: 'Ripe, juicy tomatoes perfect for salads and curries',
    price: 4000, unit: '500g', stock: 100, featured: true,
    image_url: 'https://source.unsplash.com/400x400/?tomato' },

  { category: 'Vegetables', name: 'Onions', description: 'Fresh red onions, a kitchen essential',
    price: 3000, unit: '1kg', stock: 150, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?onion' },

  { category: 'Vegetables', name: 'Potatoes', description: 'Farm-fresh potatoes, great for any dish',
    price: 3500, unit: '1kg', stock: 200, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?potato' },

  { category: 'Vegetables', name: 'Capsicum', description: 'Crunchy bell peppers in red, green, and yellow',
    price: 5000, unit: '500g', stock: 80, featured: true,
    image_url: 'https://source.unsplash.com/400x400/?bell-pepper' },

  { category: 'Vegetables', name: 'Carrots', description: 'Sweet and crunchy orange carrots',
    price: 3500, unit: '500g', stock: 120, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?carrot' },

  { category: 'Vegetables', name: 'Brinjal', description: 'Tender brinjals for curries and fries',
    price: 3000, unit: '500g', stock: 90, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?eggplant' },

  { category: 'Vegetables', name: 'Lady Finger', description: 'Fresh okra, a South Indian favourite',
    price: 4000, unit: '500g', stock: 8, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?okra' },

  { category: 'Fruits', name: 'Bananas', description: 'Ripe Robusta bananas, naturally sweet',
    price: 4500, unit: '1 dozen', stock: 100, featured: true,
    image_url: 'https://source.unsplash.com/400x400/?banana' },

  { category: 'Fruits', name: 'Mangoes', description: 'Alphonso mangoes — the king of fruits',
    price: 15000, unit: '1kg', stock: 60, featured: true,
    image_url: 'https://source.unsplash.com/400x400/?mango' },

  { category: 'Fruits', name: 'Apples', description: 'Crisp Himalayan red apples',
    price: 12000, unit: '1kg', stock: 80, featured: true,
    image_url: 'https://source.unsplash.com/400x400/?apple' },

  { category: 'Fruits', name: 'Grapes', description: 'Seedless green grapes, freshly harvested',
    price: 8000, unit: '500g', stock: 70, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?grapes' },

  { category: 'Fruits', name: 'Watermelon', description: 'Sweet and juicy summer watermelon',
    price: 6000, unit: '1 piece (~3kg)', stock: 0, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?watermelon' },

  { category: 'Fruits', name: 'Papaya', description: 'Ripe papaya rich in vitamins and enzymes',
    price: 5000, unit: '1 piece', stock: 50, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?papaya' },

  { category: 'Leafy Greens', name: 'Spinach', description: 'Tender baby spinach, washed and ready to cook',
    price: 2500, unit: '250g', stock: 80, featured: true,
    image_url: 'https://source.unsplash.com/400x400/?spinach' },

  { category: 'Leafy Greens', name: 'Fenugreek Leaves', description: 'Fresh methi with a distinct bitter flavour',
    price: 2000, unit: '250g', stock: 60, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?fenugreek' },

  { category: 'Leafy Greens', name: 'Coriander', description: 'Fragrant coriander bunches for garnish and chutneys',
    price: 1500, unit: '1 bunch', stock: 6, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?coriander' },

  { category: 'Leafy Greens', name: 'Curry Leaves', description: 'Fresh curry leaves, a South Indian kitchen staple',
    price: 1000, unit: '1 bunch', stock: 90, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?curry-leaves' },

  { category: 'Herbs & Spices', name: 'Ginger', description: 'Pungent fresh ginger root for teas, curries, and marinades',
    price: 5000, unit: '250g', stock: 80, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?ginger' },

  { category: 'Herbs & Spices', name: 'Garlic', description: 'Full garlic pods with a robust flavour',
    price: 4000, unit: '250g', stock: 100, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?garlic' },

  { category: 'Herbs & Spices', name: 'Green Chillies', description: 'Fiery fresh green chillies',
    price: 2000, unit: '250g', stock: 80, featured: false,
    image_url: 'https://source.unsplash.com/400x400/?green-chilli' },

  { category: 'Herbs & Spices', name: 'Lemon', description: 'Juicy Kagzi lemons, high in vitamin C',
    price: 3000, unit: '6 pieces', stock: 120, featured: true,
    image_url: 'https://source.unsplash.com/400x400/?lemon' }
].freeze

PRODUCTS.each do |prod|
  cat_id = category_ids[prod[:category]]
  unless cat_id
    puts "  Skipping '#{prod[:name]}': category '#{prod[:category]}' not found."
    next
  end

  slug = slugify(prod[:name])
  next if App::Models::Product.first(slug: slug)

  App::Models::Product.create(
    category_id: cat_id,
    name: prod[:name],
    slug: slug,
    description: prod[:description],
    price: prod[:price],
    unit: prod[:unit],
    stock: prod[:stock],
    low_stock_threshold: 10,
    is_out_of_stock: prod[:stock] <= 0,
    image_url: prod[:image_url],
    featured: prod[:featured],
    active: true
  )

  puts "  Created product: #{prod[:name]}"
end