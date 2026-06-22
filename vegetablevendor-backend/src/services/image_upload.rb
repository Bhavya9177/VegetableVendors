class App::Services::ImageUpload < App::Services::Base
  BUCKET        = ENV['AWS_S3_BUCKET']
  REGION        = ENV['AWS_REGION'] || 'us-east-1'
  ALLOWED_TYPES = %w[image/jpeg image/jpg image/png image/webp image/gif].freeze
  MAX_SIZE      = 5 * 1024 * 1024  # 5 MB

  def upload
    file = request.params['file']
    return_errors!('No file provided', 400) if file.nil?

    tempfile     = file[:tempfile]
    filename     = file[:filename].to_s
    content_type = (file[:type] || 'image/jpeg').to_s.split(';').first.strip

    return_errors!('File type not allowed. Use JPEG, PNG, WebP, or GIF.', 400) unless ALLOWED_TYPES.include?(content_type)
    return_errors!('File too large. Maximum size is 5 MB.', 400) if tempfile.size > MAX_SIZE

    ext = File.extname(filename).downcase
    ext = '.jpg' if ext.empty?
    key = "products/#{App.generate_id}#{ext}"

    s3 = Aws::S3::Client.new
    File.open(tempfile.path, 'rb') do |f|
      s3.put_object(bucket: BUCKET, key: key, body: f, content_type: content_type)
    end

    url = "https://#{BUCKET}.s3.#{REGION}.amazonaws.com/#{key}"
    return_success({ url: url })
  rescue Aws::S3::Errors::ServiceError => e
    App.logger.error("S3 upload error: #{e.message}")
    return_errors!("S3 upload failed: #{e.message}", 500)
  rescue => e
    App.logger.error("Image upload error: #{e.message}")
    return_errors!('Upload failed. Please try again.', 500)
  end
end
