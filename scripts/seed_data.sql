-- Insert sample products
INSERT INTO products (name, category, price, description, details, image_url, stock_quantity) VALUES
('Fresh Whole Milk', 'dairy', 4.99, 'Premium quality whole milk from grass-fed cows', 'Rich in calcium and protein. Perfect for drinking, cooking, and baking. Our cows graze on organic pastures ensuring the highest quality milk.', '/placeholder.svg?height=200&width=200', 50),
('Organic Butter', 'dairy', 6.99, 'Creamy organic butter made from fresh cream', 'Made from the cream of grass-fed cows. No artificial additives or preservatives. Perfect for cooking and spreading.', '/placeholder.svg?height=200&width=200', 30),
('Aged Cheddar Cheese', 'dairy', 12.99, 'Sharp aged cheddar cheese, aged for 12 months', 'Aged to perfection for 12 months. Rich, sharp flavor that melts beautifully. Great for sandwiches, cooking, or enjoying on its own.', '/placeholder.svg?height=200&width=200', 25),
('Greek Yogurt', 'dairy', 5.99, 'Thick and creamy Greek yogurt', 'High in protein and probiotics. Made with live active cultures. Available in various flavors or plain.', '/placeholder.svg?height=200&width=200', 40),
('Premium Ground Beef', 'meat', 8.99, 'Lean ground beef from grass-fed cattle', '85% lean ground beef from cattle raised on our farm. No hormones or antibiotics. Perfect for burgers, meatballs, and more.', '/placeholder.svg?height=200&width=200', 20),
('Free-Range Chicken', 'meat', 12.99, 'Whole free-range chicken', 'Raised on open pastures with access to natural feed. No antibiotics or hormones. Fresh and tender.', '/placeholder.svg?height=200&width=200', 15),
('Pork Tenderloin', 'meat', 15.99, 'Tender pork tenderloin', 'Lean and tender cut from heritage breed pigs. Raised humanely on our farm. Perfect for roasting or grilling.', '/placeholder.svg?height=200&width=200', 12),
('Farm Fresh Eggs', 'dairy', 3.99, 'Fresh eggs from free-range hens', 'Collected daily from our free-range hens. Rich golden yolks and firm whites. Perfect for any meal.', '/placeholder.svg?height=200&width=200', 60);

-- Insert sample users
INSERT INTO users (customer_id, username, email, phone, address, password_hash) VALUES
('CUS06654', 'john_doe', 'john@example.com', '1234567890', '123 Main St, City, State', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..e'),
('CUS06655', 'jane_smith', 'jane@example.com', '0987654321', '456 Oak Ave, City, State', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..e');

-- Note: The password hashes above are for 'password123' and 'mypassword' respectively
-- In a real application, these would be properly hashed using werkzeug.security
