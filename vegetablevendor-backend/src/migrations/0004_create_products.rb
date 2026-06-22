Sequel.migration do
  change do
    create_table(:products) do
      primary_key :id
      foreign_key :category_id, :categories, null: false
      String :name, null: false
      String :slug, null: false, size: 120
      String :description, text: true
      Integer :price, null: false, default: 0   # stored in paise (1 INR = 100 paise)
      String :unit, null: false, default: 'kg', size: 20
      Integer :stock, null: false, default: 0
      String :image_url, text: true
      TrueClass :featured, default: false
      TrueClass :active, default: true
      Integer :created_by
      Integer :updated_by
      DateTime :created_at, default: Sequel::CURRENT_TIMESTAMP
      DateTime :updated_at, default: Sequel::CURRENT_TIMESTAMP

      index :slug, unique: true
      index :category_id
      index :active
      index :featured
    end
  end
end
