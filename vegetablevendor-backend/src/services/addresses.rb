class App::Services::Addresses < App::Services::Base
  def model; Address; end

  def list
    ds = model.where(user_id: current_user[:id], active: true)
    return_success(ds.order(Sequel.desc(:is_default), Sequel.desc(:created_at)).all.map(&:to_pos))
  end

  def create
    data = data_for(:save).merge(user_id: current_user[:id])
    if data[:is_default]
      model.where(user_id: current_user[:id]).update(is_default: false)
    end
    obj = model.new(data)
    save(obj)
  end

  def update
    check_ownership!
    data = data_for(:save)
    if data[:is_default]
      model.where(user_id: current_user[:id]).update(is_default: false)
    end
    item.set_fields(data, data.keys)
    save(item)
  end

  def delete
    check_ownership!
    item.update(active: false)
    return_success(id: item.id)
  end

  def set_default
    check_ownership!
    model.where(user_id: current_user[:id]).update(is_default: false)
    item.update(is_default: true)
    return_success(item.to_pos)
  end

  def self.fields
    {
      save: [:full_name, :phone, :line1, :line2, :city, :state, :pincode, :is_default]
    }
  end

  private

  def check_ownership!
    unless item.user_id == current_user[:id]
      return_errors!('Forbidden', 403)
    end
  end
end
