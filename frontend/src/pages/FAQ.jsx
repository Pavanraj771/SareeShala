import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './FAQ.css';

const faqs = [
  {
    question: "What is SareeShala?",
    answer: "SareeShala is a premium online destination dedicated to bringing you authentic, handcrafted sarees directly from master weavers across India. We specialize in preserving traditional handloom heritage while ensuring fair compensation for artisans."
  },
  {
    question: "Are your sarees authentic handlooms?",
    answer: "Yes, 100%. We work directly with weaver clusters in Kanchipuram, Banaras, Chanderi, and other traditional hubs. Every handloom saree comes with a certificate of authenticity."
  },
  {
    question: "How do I know if a saree is pure silk?",
    answer: "All our pure silk sarees come with a Silk Mark certification, which is a government-recognized label assuring the purity of the silk used in the product."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we ship all across India. We are working on expanding our logistics to support international shipping very soon. Stay tuned to our newsletters for updates!"
  },
  {
    question: "How long does shipping take?",
    answer: "Standard delivery within India takes 3-7 business days. For remote locations, it may take up to 10 days. Once your order is dispatched, you will receive a tracking link via email."
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer a hassle-free 7-day return and exchange policy. If you are not satisfied with your purchase or receive a defective item, you can initiate a return from your 'Orders' page provided the product is unworn, unwashed, and has its original tags intact."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is shipped, you will receive a tracking number via email. You can also log into your SareeShala account, go to 'My Orders', and click on 'Track Order' for real-time updates."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major Credit and Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and select digital wallets. Cash on Delivery (COD) is available for select pin codes."
  },
  {
    question: "Is it safe to use my credit card on your site?",
    answer: "Absolutely. Our payment gateways use industry-standard 256-bit encryption technology to protect your card information. We do not store any of your credit card details on our servers."
  },
  {
    question: "Do you provide a blouse piece with the saree?",
    answer: "Most of our sarees come with an unstitched matching blouse piece attached to the saree. The product details page will explicitly mention whether a blouse piece is included and its length (usually 80cm to 1 meter)."
  },
  {
    question: "How should I care for my silk sarees?",
    answer: "We highly recommend dry cleaning only for pure silk and zari sarees to maintain their luster. Store them wrapped in a soft cotton cloth or muslin in a cool, dry place. Avoid spraying perfume directly on the saree."
  },
  {
    question: "Can I cancel my order?",
    answer: "You can cancel your order within 24 hours of placing it, provided it hasn't been shipped yet. Go to your 'Orders' section in your account dashboard and click 'Cancel'."
  },
  {
    question: "What if I receive a defective product?",
    answer: "Quality is our top priority, but in the rare event of a defect, please contact our support team at sareeshala@gmail.com within 48 hours of delivery with photos of the defect. We will arrange a free replacement or full refund."
  },
  {
    question: "Do you offer bulk discounts for weddings or wholesale pricing?",
    answer: "Yes! If you are purchasing more than 10 sarees for a wedding or corporate gifting, please reach out to our customer care team at sareeshala@gmail.com for special bulk pricing."
  },
  {
    question: "How can I contact customer support?",
    answer: "You can reach us via email at sareeshala@gmail.com or call us at +91 6302562375. Our support team is available Monday to Saturday, from 10:00 AM to 6:00 PM IST."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page animate-fade-in">
      <div className="faq-header">
        <h1 className="faq-title">Frequently Asked <span className="text-gradient">Questions</span></h1>
        <p className="faq-subtitle">Everything you need to know about SareeShala's products and services.</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${openIndex === index ? 'active' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question-container">
              <h3 className="faq-question">{faq.question}</h3>
              {openIndex === index ? (
                <ChevronUp className="faq-icon" size={20} />
              ) : (
                <ChevronDown className="faq-icon" size={20} />
              )}
            </div>
            <div className={`faq-answer-container ${openIndex === index ? 'open' : ''}`}>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
