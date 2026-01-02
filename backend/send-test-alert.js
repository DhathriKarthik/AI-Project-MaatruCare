require('dotenv').config();
const twilio = require('twilio');

// HARDCODED - YOUR VALUES
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);  // From Twilio Console

client.messages
  .create({
    from: process.env.TWILIO_WHATSAPP_FROM,  // Sandbox FROM
    to: 'whatsapp:+917875965536',   // YOUR number
    body: `🚨 MaatruCare HIGH RISK ALERT TEST 
👩 User: 6956cab331d6b172695781fe
😰 Risk: High Risk | Score: -0.87
📝 "Feeling suicidal today"
⚠️  Caregiver intervention needed NOW!

#MaatruCareSafety`
  })
  .then(message => {
    console.log('✅ ALERT SENT! SID:', message.sid);
    console.log('📱 Check your WhatsApp!');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    console.error('Check: .env SID/Token, Sandbox join, number format');
  });

