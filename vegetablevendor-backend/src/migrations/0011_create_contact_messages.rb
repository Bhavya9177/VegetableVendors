Sequel.migration do
  up do
    create_table(:contact_messages) do
      primary_key :id
      String   :name,    null: false
      String   :email,   null: false
      String   :subject
      Text     :message, null: false
      TrueClass :read,   default: false
      DateTime :created_at
      DateTime :updated_at
    end
  end

  down do
    drop_table(:contact_messages)
  end
end
