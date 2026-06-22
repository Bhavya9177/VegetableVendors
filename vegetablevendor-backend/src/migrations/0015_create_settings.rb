Sequel.migration do
  up do
    create_table(:settings) do
      primary_key :id
      String    :key,        null: false, size: 100
      String    :value,      null: true,  text: true
      DateTime  :created_at, default: Sequel::CURRENT_TIMESTAMP
      DateTime  :updated_at, default: Sequel::CURRENT_TIMESTAMP

      index :key, unique: true
    end
  end

  down do
    drop_table(:settings)
  end
end
