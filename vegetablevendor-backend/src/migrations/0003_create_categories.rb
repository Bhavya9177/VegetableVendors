Sequel.migration do
  change do
    create_table(:categories) do
      primary_key :id
      String :name, null: false
      String :slug, null: false, size: 100
      String :description, text: true
      String :image_url, text: true
      TrueClass :active, default: true
      Integer :created_by
      Integer :updated_by
      DateTime :created_at, default: Sequel::CURRENT_TIMESTAMP
      DateTime :updated_at, default: Sequel::CURRENT_TIMESTAMP

      index :slug, unique: true
      index :active
    end
  end
end
