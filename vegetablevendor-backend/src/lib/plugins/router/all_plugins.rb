module App::Router::AllPlugins
  def self.included(klass)
    klass.plugin :all_verbs
    klass.plugin :hooks
    klass.plugin :halt
    klass.plugin :json
    klass.plugin :json_parser
    klass.plugin :indifferent_params
    klass.plugin :public
    klass.plugin :error_handler do |e|
      App.logger.error("Unhandled error: #{e.class}: #{e.message}\n#{e.backtrace&.first(5)&.join("\n")}")
      response.status = 500
      { status: 'error', data: "#{e.class}: #{e.message}" }
    end
  end
end