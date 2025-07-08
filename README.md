# Dairy Farm Website

A comprehensive dairy farm e-commerce website with chatbot functionality, built with HTML, CSS, JavaScript frontend and Python Flask backend with MySQL database.

## Features

### Frontend Features
- **Home Page**: Hero section, features showcase, and integrated chatbot
- **Products Page**: Display all products with category filtering
- **About Page**: Farm information, gallery, and videos
- **Shopping Page**: E-commerce functionality with cart and checkout
- **Orders Page**: Order history and tracking
- **Login/Register Pages**: User authentication

### Chatbot Features
- **Navigation**: Redirect to different pages
- **Authentication**: Login, register, logout functionality
- **Password Recovery**: OTP-based password reset
- **User Management**: View user details, secure password display
- **Smart Responses**: Context-aware responses based on user state

### Backend Features
- **User Management**: Registration, login, password reset
- **Product Management**: CRUD operations for products
- **Order Management**: Place orders, track orders, order history
- **Security**: Password hashing, session management
- **Database**: MySQL integration with proper relationships

## Setup Instructions

### Prerequisites
- Python 3.8+
- MySQL Server
- XAMPP (optional, for easy MySQL setup)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd dairy-farm-website
   \`\`\`

2. **Install Python dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. **Setup MySQL Database**
   - Start MySQL server (via XAMPP or standalone)
   - Run the SQL scripts in the `scripts` folder:
     \`\`\`bash
     mysql -u root -p < scripts/create_database.sql
     mysql -u root -p < scripts/seed_data.sql
     \`\`\`

4. **Configure Database Connection**
   - Update the `DB_CONFIG` in `app.py` with your MySQL credentials
   ```python
   DB_CONFIG = {
       'host': 'localhost',
       'user': 'root',
       'password': 'your_mysql_password',
       'database': 'dairy_farm_db'
   }
   \`\`\`

5. **Run the Application**
   \`\`\`bash
   python app.py
   \`\`\`

6. **Access the Website**
   - Open your browser and go to `http://localhost:5000`

## File Structure

\`\`\`
dairy-farm-website/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/            # HTML templates
│   ├── index.html        # Home page
│   ├── products.html     # Products page
│   ├── about.html        # About page
│   ├── shopping.html     # Shopping page
│   ├── orders.html       # Orders page
│   └── login.html        # Login/Register page
├── static/               # Static files
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       ├── main.js       # Main JavaScript with chatbot
│       ├── products.js   # Products page functionality
│       ├── shopping.js   # Shopping cart functionality
│       ├── orders.js     # Orders page functionality
│       └── auth.js       # Authentication functionality
└── scripts/              # Database scripts
    ├── create_database.sql # Database schema
    └── seed_data.sql      # Sample data
\`\`\`

## Usage

### Default Users
- **Username**: john_doe, **Password**: password123
- **Username**: jane_smith, **Password**: mypassword

### Chatbot Commands
- `login` - Start login process
- `register` - Start registration process
- `logout` - Logout current user
- `forgot password` - Start password reset
- `my details` - Show user information
- `home`, `products`, `about`, `shopping`, `orders` - Navigate to pages

### Shopping Features
- Browse products by category
- Add items to cart
- Proceed to checkout
- Multiple payment methods
- Order tracking
- Order history

## Security Features

- Password hashing using Werkzeug
- Session management
- SQL injection prevention
- Input validation
- Secure password display (masked)
- OTP-based password recovery

## Customization

### Adding New Products
1. Insert into the `products` table via MySQL
2. Or extend the admin functionality in the Flask app

### Modifying Chatbot Responses
- Edit the `processChatMessage()` function in `main.js`
- Add new commands and responses as needed

### Styling Changes
- Modify `static/css/style.css` for visual changes
- The design is fully responsive and uses modern CSS

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL server is running
   - Check database credentials in `app.py`
   - Verify database exists and tables are created

2. **Port Already in Use**
   - Change the port in `app.py`: `app.run(debug=True, port=5001)`

3. **Static Files Not Loading**
   - Ensure Flask is serving static files correctly
   - Check file paths in HTML templates

### Development Tips

- Use `debug=True` in Flask for development
- Check browser console for JavaScript errors
- Use MySQL Workbench or phpMyAdmin for database management
- Test chatbot functionality thoroughly

## Future Enhancements

- Real SMS integration for OTP
- Email notifications
- Admin dashboard
- Inventory management
- Payment gateway integration
- Advanced order tracking
- Customer reviews and ratings
- Mobile app development

## License

This project is open source and available under the MIT License.
