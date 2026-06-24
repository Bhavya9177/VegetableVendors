require 'roda'
class App::Routes < Roda
  include App::Router::AllPlugins

  plugin :not_found do
    { status: 'error', data: 'Not Found' }
  end

  def do_crud(klass, r, only = 'CRUDL', opts = {})
    r.post    { klass[r, opts].create }                              if only.include?('C')
    r.get(Integer) { |id| klass[r, opts.merge(id: id)].get }        if only.include?('R')
    r.get          { klass[r, opts].list }                           if only.include?('L')
    r.put(Integer) { |id| klass[r, opts.merge(id: id)].update }     if only.include?('U')
    r.delete(Integer) { |id| klass[r, opts.merge(id: id)].delete }  if only.include?('D')
  end

  route do |r|
    r.options { '' }
    r.public

    r.root do
  response['Content-Type'] = 'application/json'
  { status: 'API running' }.to_json
end

    # WhatsApp webhook — Meta calls this to verify and deliver events
    r.on 'webhook' do
      r.get do
        mode      = r.params['hub.mode']
        token     = r.params['hub.verify_token']
        challenge = r.params['hub.challenge']

        if mode == 'subscribe' && token == ENV['WHATSAPP_WEBHOOK_VERIFY_TOKEN']
          response.status = 200
          challenge
        else
          response.status = 403
          'Forbidden'
        end
      end

      r.post do
        response.status = 200
        'OK'
      end
    end

    r.on 'api' do
      r.response['Content-Type'] = 'application/json'

      # ── Public Auth ───────────────────────────────────────────────────────
      r.post('login')                    { Session[r].login }
      r.post('register')                 { Users[r].register }
      r.post('forgot-password')          { Users[r].forgot_password }
      r.post('validate-password-token')  { Users[r].validate_password_token }
      r.post('reset-password')           { Users[r].reset_password }

      r.get('version') { { status: 'success', version: 1 } }

      # Public contact form (unauthenticated)
      r.post('contact') { ContactMessages[r].create }

      # ── Public Catalog (no auth required) ────────────────────────────────
      r.on 'categories' do
        r.get { Categories[r].list }
      end

      # Products + nested reviews (GET public, POST requires auth checked inline)
      r.on 'products' do
        r.on(Integer) do |id|
          r.on 'reviews' do
            r.get { Reviews[r, product_id: id].list }
            r.post do
              request.halt(401, { 'Content-Type' => 'application/json' }, { status: 'Unauthorized!' }.to_json) unless App.cu.valid?
              Reviews[r, product_id: id].create
            end
          end
          r.get { Products[r, id: id].get }
        end
        r.get { Products[r].list }
      end

      # ── All routes below require a valid JWT ─────────────────────────────
      auth_required!

      r.on 'me' do
        r.get('info')            { Users[r].info }
        r.put('update-password') { Users[r].update_password }
        r.put('profile')         { Users[r].update_profile }
      end

      r.on 'cart' do
        r.get               { Cart[r].get_cart }
        r.post('add')       { Cart[r].add_item }
        r.put('update')     { Cart[r].update_item }
        r.delete('remove')  { Cart[r].remove_item }
        r.delete('clear')   { Cart[r].clear }
      end

      r.on 'addresses' do
        r.on(Integer) do |id|
          r.put('default') { Addresses[r, id: id].set_default }
          r.put            { Addresses[r, id: id].update }
          r.delete         { Addresses[r, id: id].delete }
        end
        r.get  { Addresses[r].list }
        r.post { Addresses[r].create }
      end

      r.on 'orders' do
        r.on(Integer) do |id|
          r.put('cancel')          { Orders[r, id: id].cancel_order }
          r.put('confirm-payment') { Orders[r, id: id].confirm_payment }
          r.post('reorder')        { Orders[r, id: id].reorder }
          r.on 'issues' do
            r.get  { OrderIssues[r, id: id].list }
            r.post { OrderIssues[r, id: id].create }
          end
          r.get { Orders[r, id: id].get }
        end
        r.post { Orders[r].place_order }
        r.get { Orders[r].list }
      end

      r.on 'coupons' do
        r.post('apply') { Coupons[r].apply }
      end

      # ── Admin (role 0 only) ───────────────────────────────────────────────
      r.on 'admin' do
        admin_required!

        r.post('upload-image') { ImageUpload[r].upload }

        r.on 'dashboard' do
          r.get { Dashboard[r].index }
        end

        r.on 'categories' do
          r.on(Integer) do |id|
            r.put    { Categories[r, id: id].update }
            r.delete { Categories[r, id: id].delete }
          end
          r.get  { Categories[r].admin_list }
          r.post { Categories[r].create }
        end

        r.on 'products' do
          r.on(Integer) do |id|
            r.get    { Products[r, id: id].get }
            r.put    { Products[r, id: id].update }
            r.delete { Products[r, id: id].delete }
          end
          r.get  { Products[r].admin_list }
          r.post { Products[r].create }
        end

        r.on 'orders' do
          r.on(Integer) do |id|
            r.get             { Orders[r, id: id].admin_get }
            r.put('payment')  { Orders[r, id: id].record_payment }
            r.put             { Orders[r, id: id].update_status }
          end
          r.get { Orders[r].admin_list }
        end

        r.on 'issues' do
          r.on(Integer) do |id|
            r.put('resolve') { OrderIssues[r, id: id].resolve }
            r.put            { OrderIssues[r, id: id].update_status }
          end
          r.get { OrderIssues[r].admin_list }
        end

        r.on 'reviews' do
          r.get { Reviews[r].admin_list }
          r.delete(Integer) { |id| Reviews[r, id: id].admin_delete }
        end

        r.on 'contact-messages' do
          r.get { ContactMessages[r].admin_list }
          r.on(Integer) do |id|
            r.put    { ContactMessages[r, id: id].admin_mark_read }
            r.delete { ContactMessages[r, id: id].admin_delete }
          end
        end

        r.on 'users' do
          do_crud(Users, r, 'CRUDL')
        end

        r.on 'inventory' do
          r.on 'analysis' do
            r.get  { InventoryRefill[r].analysis  }
            r.post { InventoryRefill[r].run_check }
          end
          r.on 'refill-logs' do
            r.get { InventoryRefill[r].logs }
          end
          r.on 'refill' do
            r.post(Integer) { |id| InventoryRefill[r, id: id].refill_product }
          end
        end

        r.on 'whatsapp' do
          r.get('token-status')   { WhatsAppAdmin[r].token_status  }
          r.post('refresh-token') { WhatsAppAdmin[r].refresh_token }
          r.post('test-send')     { WhatsAppAdmin[r].test_send     }
        end

        r.on 'coupons' do
          r.on(Integer) do |id|
            r.put    { Coupons[r, id: id].update }
            r.delete { Coupons[r, id: id].delete }
          end
          r.get  { Coupons[r].admin_list }
          r.post { Coupons[r].create }
        end

        r.on 'settings' do
          r.get { Settings[r].show }
          r.put { Settings[r].update }
        end
      end
    end

    # SPA catch-all
    
  end

  before do
    @time = Time.now
    App::Helpers::Before.run!(request)
  end

  after do |res|
    App.logger.info("→ [#{Time.now - @time}s] [#{request.request_method}] #{request.path}")
  end

  def auth_required!
    unless App.cu.valid?
      reason = if App.cu.decoded_token.nil?
        'jwt_decode_failed'
      elsif App.cu.user_obj.nil?
        'user_not_found_or_inactive'
      else
        'session_mismatch'
      end
      App.logger.warn("[auth_required!] 401 — #{reason} — path: #{request.path}")
      request.halt(401, { 'Content-Type' => 'application/json' }, { status: 'Unauthorized!' }.to_json)
    end
  end

  def admin_required!
    unless App.cu.user_obj&.admin?
      App.logger.warn("[admin_required!] 403 — user #{App.cu.id} role=#{App.cu.user_obj&.role} — path: #{request.path}")
      request.halt(403, { 'Content-Type' => 'application/json' }, { status: 'Forbidden!' }.to_json)
    end
  end
end

App.require_blob('services/base.rb')
App.require_blob('services/*.rb')

App::Routes.send(:include, App::Services)
