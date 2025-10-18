from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def seed():
    faqs = [
        # Getting Started
        ("Getting Started", "How do I create an account?", "Creating an account is simple. Click the 'Sign Up' button in the top right corner, fill in your details, and verify your email address. Once verified, you can log in and start building your network.", 1),
        ("Getting Started", "Is there a cost to join?", "No, joining Rest Empire is completely free. You only pay for products you wish to purchase or promote. There are no hidden fees or membership costs.", 2),
        ("Getting Started", "Do I need prior experience in network marketing?", "Not at all. We provide comprehensive training materials and support for beginners. Our platform is designed to be intuitive for users of all experience levels.", 3),
        
        # Earning & Bonuses
        ("Earning & Bonuses", "How do I earn money with Rest Empire?", "You can earn through multiple streams: direct sales commissions, team building bonuses, rank advancement bonuses, and unilevel commissions. Our 14-tier rank system provides increasing earning potential as you grow.", 4),
        ("Earning & Bonuses", "What are the different bonus types?", "We offer three main bonus types: Rank Bonuses (based on your personal rank), Unilevel Bonuses (based on your team's performance), and Infinity Bonuses (residual income from your extended network).", 5),
        ("Earning & Bonuses", "How often are payouts processed?", "Payouts are processed weekly. You can request a payout at any time through your dashboard, and funds are typically transferred within 24 hours of approval.", 6),
        
        # Payments & Security
        ("Payments & Security", "What payment methods do you accept?", "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All transactions are secured with 256-bit SSL encryption.", 7),
        ("Payments & Security", "How do I get paid?", "You can choose from several payout options including direct bank transfer, PayPal, or major cryptocurrency wallets. Payouts are processed weekly and typically arrive within 1-3 business days.", 8),
        ("Payments & Security", "Is my personal information secure?", "Absolutely. We use industry-standard encryption and security protocols to protect your data. We never share your personal information with third parties without your consent, and we comply with all relevant data protection regulations.", 9),
        
        # Account Management
        ("Account Management", "How do I reset my password?", "Click the 'Login' button and then select 'Forgot Password'. Enter your email address and we'll send you a link to reset your password. The link will expire after 24 hours for security.", 10),
        ("Account Management", "Can I change my email address?", "Yes, you can update your email address in your account settings. You'll need to verify the new address before the change takes effect.", 11),
        ("Account Management", "What should I do if I suspect unauthorized access to my account?", "Contact our support team immediately through the contact form or by emailing security@restempire.com. We'll help you secure your account and investigate any suspicious activity.", 12),
    ]
    
    with engine.connect() as conn:
        for category, question, answer, order in faqs:
            conn.execute(text("""
                INSERT INTO faqs (category, question, answer, "order")
                VALUES (:category, :question, :answer, :order)
            """), {"category": category, "question": question, "answer": answer, "order": order})
        conn.commit()
        print(f"Seeded {len(faqs)} FAQs successfully")

if __name__ == "__main__":
    seed()
