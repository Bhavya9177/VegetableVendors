Sequel.migration do
  up do
    create_table(:order_issues) do
      primary_key :id
      foreign_key :order_id, :orders, null: false, on_delete: :cascade
      foreign_key :user_id,  :users,  null: false
      String   :issue_type,       null: false, size: 50
      String   :description,      text: true
      String   :status,           null: false, default: 'open', size: 20
      String   :resolution_type,  null: true, size: 30
      String   :resolution_notes, text: true
      DateTime :created_at
      DateTime :updated_at
      index :order_id
      index :user_id
      index :status
    end
  end

  down do
    drop_table(:order_issues)
  end
end
