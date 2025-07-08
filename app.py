from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import random
import string
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.secret_key = 'your-secret-key-here-change-in-production' # IMPORTANT: Change this to a strong, random key in production

# Database configuration
# !!! IMPORTANT: Replace 'YOUR_MYSQL_ROOT_PASSWORD' with your actual MySQL root password !!!
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '', # <--- I added the missing comma here!
    'database': 'dairy_farm_db'
}

# Update the database connection function with better error handling
def get_db_connection():
    """Establishes a connection to the MySQL database."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        print("Database connection successful.") # Debug print
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred during database connection: {e}")
        return None

def init_database():
    """Initializes the database and creates tables if they don't exist."""
    try:
        # First connect without specifying database to create it if necessary
        temp_config = DB_CONFIG.copy()
        temp_config.pop('database', None) # Remove 'database' key for initial connection

        conn = mysql.connector.connect(**temp_config)
        cursor = conn.cursor()

        # Create database if it doesn't exist
        cursor.execute("CREATE DATABASE IF NOT EXISTS dairy_farm_db")
        print("Database 'dairy_farm_db' created/selected successfully")

        # Now connect to the specific database
        cursor.execute("USE dairy_farm_db")

        # Create users table with proper structure
        users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id VARCHAR(10) UNIQUE NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(15) NOT NULL,
            address TEXT NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """

        cursor.execute(users_table)
        print("Users table created/verified successfully")

        # Create other tables
        tables = [
            """
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category ENUM('dairy', 'meat') NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                details TEXT,
                image_url VARCHAR(255),
                stock_quantity INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            """
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(20) UNIQUE NOT NULL,
                user_id INT NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                delivery_address TEXT NOT NULL,
                status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            """
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            """
            CREATE TABLE IF NOT EXISTS password_reset_otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                otp VARCHAR(6) NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        ]

        for table_sql in tables:
            cursor.execute(table_sql)
            conn.commit() # Commit after each table creation for robustness

        print("All tables created/verified successfully")

        # Insert sample data if products table is empty
        cursor.execute("SELECT COUNT(*) FROM products")
        if cursor.fetchone()[0] == 0:
            sample_products = [
                ('Fresh Whole Milk', 'dairy', 4.99, 'Premium quality whole milk from grass-fed cows', 'Rich in calcium and protein. Perfect for drinking, cooking, and baking.', '/placeholder.svg?height=200&width=200', 50),
                ('Organic Butter', 'dairy', 6.99, 'Creamy organic butter made from fresh cream', 'Made from the cream of grass-fed cows. No artificial additives.', '/placeholder.svg?height=200&width=200', 30),
                ('Aged Cheddar Cheese', 'dairy', 12.99, 'Sharp aged cheddar cheese, aged for 12 months', 'Aged to perfection for 12 months. Rich, sharp flavor.', '/placeholder.svg?height=200&width=200', 25),
                ('Greek Yogurt', 'dairy', 5.99, 'Thick and creamy Greek yogurt', 'High in protein and probiotics. Made with live active cultures.', '/placeholder.svg?height=200&width=200', 40),
                ('Premium Ground Beef', 'meat', 8.99, 'Lean ground beef from grass-fed cattle', '85% lean ground beef from cattle raised on our farm.', '/placeholder.svg?height=200&width=200', 20),
                ('Free-Range Chicken', 'meat', 12.99, 'Whole free-range chicken', 'Raised on open pastures with access to natural feed.', '/placeholder.svg?height=200&width=200', 15),
                ('Pork Tenderloin', 'meat', 15.99, 'Tender pork tenderloin', 'Lean and tender cut from heritage breed pigs.', '/placeholder.svg?height=200&width=200', 12),
                ('Farm Fresh Eggs', 'dairy', 3.99, 'Fresh eggs from free-range hens', 'Collected daily from our free-range hens.', '/placeholder.svg?height=200&width=200', 60)
            ]

            cursor.executemany("""
                INSERT INTO products (name, category, price, description, details, image_url, stock_quantity)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, sample_products)

            print("Sample products inserted successfully")

        conn.commit()
        cursor.close()
        conn.close()
        print("Database initialized successfully")
        return True

    except mysql.connector.Error as err:
        print(f"Database initialization error: {err}")
        return False
    except Exception as e:
        print(f"General database initialization error: {e}")
        return False

def generate_customer_id():
    """Generates a unique customer ID."""
    return 'CUS' + ''.join(random.choices(string.digits, k=5))

def generate_otp():
    """Generates a 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_sms(phone, otp):
    """Simulates sending OTP via SMS.
    In a real application, you would integrate with an SMS service like Twilio."""
    print(f"SMS: Your OTP is {otp}. Valid for 10 minutes.")
    print(f"Sent to phone: {phone}")
    return True

# --- Frontend Routes (render HTML templates) ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/products')
def products():
    return render_template('products.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/shopping')
def shopping():
    return render_template('shopping.html')

@app.route('/orders')
def orders():
    return render_template('orders.html')

@app.route('/login')
def login():
    return render_template('login.html')

# --- API Routes (handle data and business logic) ---

@app.route('/api/products')
def api_products():
    """API endpoint to get all products."""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products")
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(products)
    except Exception as e:
        print(f"Error fetching products: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/register', methods=['POST'])
def api_register():
    """API endpoint for user registration."""
    try:
        data = request.json
        print(f"Registration attempt for user: {data.get('username')}") # Debug log

        # Validate required fields
        required_fields = ['username', 'email', 'phone', 'address', 'password', 'confirm_password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field.replace("_", " ").capitalize()} is required'}), 400

        # Check password match
        if data['password'] != data['confirm_password']:
            return jsonify({'error': 'Passwords do not match'}), 400

        # Check password strength
        if len(data['password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor()

        # Check if username or email already exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s",
                       (data['username'], data['email']))
        existing_user = cursor.fetchone()
        if existing_user:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Username or email already exists'}), 400

        # Generate customer ID (loop to ensure uniqueness, though highly unlikely to clash)
        customer_id = generate_customer_id()
        while True:
            cursor.execute("SELECT customer_id FROM users WHERE customer_id = %s", (customer_id,))
            if not cursor.fetchone():
                break
            customer_id = generate_customer_id()
        print(f"Generated unique customer ID: {customer_id}") # Debug log

        # Hash password
        password_hash = generate_password_hash(data['password'])

        # Insert new user
        insert_query = """
            INSERT INTO users (customer_id, username, email, phone, address, password_hash, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        user_data = (customer_id, data['username'], data['email'], data['phone'],
                     data['address'], password_hash, datetime.now())

        cursor.execute(insert_query, user_data)
        user_id = cursor.lastrowid # Get the ID of the newly inserted row

        conn.commit() # Commit the transaction to save changes to the database
        cursor.close()
        conn.close()

        print(f"User registered successfully with ID: {user_id}") # Debug log

        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'customer_id': customer_id,
            'user_id': user_id
        })

    except mysql.connector.Error as db_err:
        # Catch specific database errors
        print(f"Database error during registration: {db_err}")
        return jsonify({'error': f'Database error: {str(db_err)}'}), 500
    except Exception as e:
        # Catch any other unexpected errors
        print(f"General error during registration: {e}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def api_login():
    """API endpoint for user login."""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(dictionary=True)

        print(f"Attempting login for username: {username}") # Debug log

        # Fetch user by username
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user and check_password_hash(user['password_hash'], password):
            # Store user session (Flask's server-side session)
            session['user_id'] = user['id']
            session['customer_id'] = user['customer_id']
            session['username'] = user['username']

            # Return user details (excluding password hash) to the client
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'], # Include id for localStorage currentUser
                    'customer_id': user['customer_id'],
                    'username': user['username'],
                    'email': user['email'],
                    'phone': user['phone'],
                    'address': user['address']
                }
            })
        else:
            return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        print(f"Error during login: {e}") # Debug log
        return jsonify({'error': str(e)}), 500

@app.route('/api/forgot-password', methods=['POST'])
def api_forgot_password():
    """API endpoint to initiate password reset via OTP."""
    try:
        data = request.json
        phone = data.get('phone')

        if not phone:
            return jsonify({'error': 'Phone number is required'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE phone = %s", (phone,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Phone number not found'}), 404

        # Generate and store OTP
        otp = generate_otp()
        # Invalidate previous OTPs for this user to prevent stale OTPs
        cursor.execute("UPDATE password_reset_otps SET used = TRUE WHERE user_id = %s AND used = FALSE", (user['id'],))
        conn.commit() # Commit update before inserting new OTP

        cursor.execute("""
            INSERT INTO password_reset_otps (user_id, otp, expires_at)
            VALUES (%s, %s, %s)
        """, (user['id'], otp, datetime.now() + timedelta(minutes=10)))

        conn.commit()
        cursor.close()
        conn.close()

        # Send OTP (simulated)
        send_otp_sms(phone, otp)

        return jsonify({
            'success': True,
            'message': 'OTP sent to your phone number'
        })

    except Exception as e:
        print(f"Error in forgot password: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify-otp', methods=['POST'])
def api_verify_otp():
    """API endpoint to verify the provided OTP."""
    try:
        data = request.json
        phone = data.get('phone')
        otp = data.get('otp')

        if not phone or not otp:
            return jsonify({'error': 'Phone number and OTP are required'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(dictionary=True)

        # Get user by phone
        cursor.execute("SELECT * FROM users WHERE phone = %s", (phone,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            conn.close()
            return jsonify({'error': 'User not found'}), 404

        # Verify OTP
        cursor.execute("""
            SELECT * FROM password_reset_otps
            WHERE user_id = %s AND otp = %s AND expires_at > %s AND used = FALSE
            ORDER BY created_at DESC LIMIT 1
        """, (user['id'], otp, datetime.now()))

        otp_record = cursor.fetchone()

        if not otp_record:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Invalid or expired OTP'}), 400

        # Mark OTP as used
        cursor.execute("UPDATE password_reset_otps SET used = TRUE WHERE id = %s",
                       (otp_record['id'],))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'OTP verified successfully',
            'reset_token': str(user['id']) # Use user ID as a temporary reset token. In a real app,
                                            # this should be a cryptographically secure, time-limited token.
        })

    except Exception as e:
        print(f"Error in OTP verification: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-password', methods=['POST'])
def api_reset_password():
    """API endpoint to reset user's password after OTP verification."""
    try:
        data = request.json
        reset_token = data.get('reset_token')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if not all([reset_token, new_password, confirm_password]):
            return jsonify({'error': 'All fields are required'}), 400

        if new_password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor()

        # Update password
        password_hash = generate_password_hash(new_password)
        # The reset_token is the user's ID from api_verify_otp
        cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s",
                       (password_hash, int(reset_token)))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Password reset successfully'
        })

    except Exception as e:
        print(f"Error in password reset: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/place-order', methods=['POST'])
def api_place_order():
    """API endpoint to place a new order."""
    try:
        # Check if user is logged in via session
        if 'user_id' not in session:
            return jsonify({'error': 'Please login to place an order'}), 401

        data = request.json
        items = data.get('items', [])
        payment_method = data.get('payment_method')
        delivery_address = data.get('delivery_address')

        if not items or not payment_method or not delivery_address:
            return jsonify({'error': 'Missing required fields (items, payment_method, delivery_address)'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor()

        # Calculate total
        total = sum(item['price'] * item['quantity'] for item in items)

        # Generate order ID
        order_id = 'ORD' + str(int(datetime.now().timestamp())) # Simple timestamp-based ID

        # Insert order
        cursor.execute("""
            INSERT INTO orders (order_id, user_id, total_amount, payment_method,
                                delivery_address, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (order_id, session['user_id'], total, payment_method,
              delivery_address, 'pending', datetime.now()))

        order_db_id = cursor.lastrowid # Get the ID of the newly inserted order

        # Insert order items
        for item in items:
            cursor.execute("""
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (order_db_id, item['id'], item['quantity'], item['price']))

        conn.commit() # Commit the transaction
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'order_id': order_id,
            'message': 'Order placed successfully'
        })

    except Exception as e:
        print(f"Error placing order: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders')
def api_orders():
    """API endpoint to retrieve orders for the logged-in user."""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Please login to view orders'}), 401

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(dictionary=True)

        # Fetch orders along with a concatenated list of items
        cursor.execute("""
            SELECT o.*, GROUP_CONCAT(
                CONCAT(oi.quantity, 'x ', p.name, ' ($', oi.price, ')')
                SEPARATOR '; '
            ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = %s
            GROUP BY o.id
            ORDER BY o.created_at DESC
        """, (session['user_id'],))

        orders = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(orders)

    except Exception as e:
        print(f"Error fetching orders: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def api_logout():
    """API endpoint to log out a user."""
    session.clear() # Clear all session variables
    return jsonify({'success': True, 'message': 'Logged out successfully'})

if __name__ == '__main__':
    print("Starting Fresh Valley Dairy Farm Website...")
    print("Initializing database...")

    # Ensure the database is initialized before running the app
    if init_database():
        print("Database ready!")
        print("Starting Flask application...")
        print("Access the website at: http://localhost:5000")
        # Run Flask app, host='0.0.0.0' makes it accessible externally, debug=True for development
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("Failed to initialize database. Please check your MySQL connection.")
        print("Make sure MySQL is running and the credentials in DB_CONFIG are correct.")