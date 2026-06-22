Sequel.migration do
  change do
    create_table(:addresses) do
      primary_key :id
      foreign_key :user_id, :users, null: false
      String :full_name, null: false
      String :phone, null: false, size: 15
      String :line1, null: false, text: true
      String :line2, text: true
      String :city, null: false
      String :state, null: false
      String :pincode, null: false, size: 10
      TrueClass :is_default, default: false
      TrueClass :active, default: true
      Integer :created_by
      Integer :updated_by
      DateTime :created_at, default: Sequel::CURRENT_TIMESTAMP
      DateTime :updated_at, default: Sequel::CURRENT_TIMESTAMP

      index :user_id
    end
  end
end
