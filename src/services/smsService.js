/**
 * Send SMS via device's native SMS functionality
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Text message content
 * @returns {boolean} Whether the SMS link was opened
 */
export const sendSMS = (phoneNumber, message) => {
    if (!phoneNumber || !message) {
        console.error("Phone number and message are required to send SMS.");
        return false;
    }

    // Determine platform
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    try {
        // URI encode the message
        const encodedMessage = encodeURIComponent(message);
        
        // Create SMS link appropriate for the platform
        let smsLink;
        
        if (isIOS) {
            // iOS uses sms: protocol with & separator
            smsLink = `sms:${phoneNumber}&body=${encodedMessage}`;
        } else if (isAndroid) {
            // Android uses smsto: or sms: protocol with ? separator
            smsLink = `sms:${phoneNumber}?body=${encodedMessage}`;
        } else {
            // Default format for other platforms
            smsLink = `sms:${phoneNumber}?body=${encodedMessage}`;
        }
        
        // Log for debugging purposes
        console.log(`Opening SMS link: ${smsLink}`);
        
        // Open the SMS link
        window.location.href = smsLink;
        
        return true;
    } catch (error) {
        console.error("Error sending SMS:", error);
        return false;
    }
};

/**
 * Make a phone call using the device's native call functionality
 * @param {string} phoneNumber - Phone number to call
 * @returns {boolean} Whether the call link was opened
 */
export const makePhoneCall = (phoneNumber) => {
    if (!phoneNumber) {
        console.error("Phone number is required to make a call.");
        return false;
    }
    
    try {
        // Create tel: URI
        const callLink = `tel:${phoneNumber}`;
        
        // Open the call link
        window.location.href = callLink;
        
        return true;
    } catch (error) {
        console.error("Error making phone call:", error);
        return false;
    }
};