require 'rufus-scheduler'

module App
  module Scheduler
    def self.start!
      scheduler = Rufus::Scheduler.new

      # Run inventory check + auto-refill every day at 8:00 AM IST (2:30 AM UTC)
      scheduler.cron '30 2 * * *' do
        App.logger.info('Scheduler: running daily inventory check and auto-refill...')

        # Auto-refill any products currently at zero stock
        begin
          out_of_stock = App::Models::Product.where(active: true, is_out_of_stock: true).all
          out_of_stock += App::Models::Product.where(active: true).where { stock <= 0 }.all
          out_of_stock.uniq.each { |p| App::InventoryAnalyzer.auto_refill!(p) }
          App.logger.info("Scheduler: auto-refilled #{out_of_stock.uniq.size} out-of-stock product(s)")
        rescue => e
          App.logger.error("Scheduler: auto-refill failed — #{e.message}")
        end

        # Send WhatsApp alerts for remaining low-stock products
        begin
          result = App::InventoryAnalyzer.run_refill_check
          App.logger.info("Scheduler: stock check done — #{result[:alerts_sent]} alert(s) sent (critical: #{result[:critical]}, warning: #{result[:warning]})")
        rescue => e
          App.logger.error("Scheduler: stock check failed — #{e.message}")
        end
      end

      App.logger.info('Scheduler: started — daily WhatsApp stock alert at 8:00 AM IST')
      scheduler
    end
  end
end
