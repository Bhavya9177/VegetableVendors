class App::Models::OrderIssue < Sequel::Model
  ISSUE_TYPES      = %w[missing_item wrong_item bad_quality late_delivery damaged other].freeze
  STATUSES         = %w[open reviewing resolved].freeze
  RESOLUTION_TYPES = %w[refund replacement credit none].freeze

  many_to_one :order
  many_to_one :user

  def to_pos
    {
      id:               id,
      order_id:         order_id,
      user_id:          user_id,
      issue_type:       issue_type,
      description:      description,
      status:           status,
      resolution_type:  resolution_type,
      resolution_notes: resolution_notes,
      created_at:       created_at,
      updated_at:       updated_at
    }
  end
end
