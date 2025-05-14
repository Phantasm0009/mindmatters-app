import React, { useState, useEffect } from 'react';
import { sendSMS } from '../services/smsService';
import { useHistory } from 'react-router-dom';
import './SOSButton.css';

const SOSButton = ({ className }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [hasContacts, setHasContacts] = useState(false);
    const history = useHistory();
    
    // Check if emergency contacts exist
    useEffect(() => {
        const checkContacts = () => {
            const storedContacts = localStorage.getItem('emergencyContacts');
            const contacts = storedContacts ? JSON.parse(storedContacts) : [];
            setHasContacts(contacts.length > 0);
        };
        
        // Check on mount and whenever localStorage might change
        checkContacts();
        
        // Setup storage event listener to detect changes in other tabs
        const handleStorageChange = (e) => {
            if (e.key === 'emergencyContacts') {
                checkContacts();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleSOSClick = () => {
        // If no contacts, prompt to add them
        if (!hasContacts) {
            history.push('/emergency-contacts');
            return;
        }
        
        setShowConfirm(true);
    };

    const handleCancel = () => {
        setShowConfirm(false);
    };

    const handleConfirmSOS = () => {
        setSending(true);
        
        // Get contacts from local storage
        const storedContacts = localStorage.getItem('emergencyContacts');
        const contacts = storedContacts ? JSON.parse(storedContacts) : [];
        
        // Prepare emergency message
        const userLocation = 'unknown location'; // Could be enhanced with geolocation
        const timestamp = new Date().toLocaleString();
        
        const message = `EMERGENCY SOS - I need help right now at ${userLocation}. This message was sent from my MindMatters app at ${timestamp}. Please try to contact me or emergency services if you can't reach me.`;
        
        // Create a small delay between each SMS to avoid freezing the UI
        setTimeout(() => {
            // Send the SMS to each contact
            if (contacts.length > 0) {
                // SMS strategy depends on the platform
                if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                    // For iOS, we need to do a single SMS with multiple recipients
                    const recipients = contacts.map(contact => contact.phone).join(',');
                    sendSMS(recipients, message);
                } else {
                    // For Android and other platforms, send individual SMS
                    contacts.forEach((contact, index) => {
                        setTimeout(() => {
                            try {
                                sendSMS(contact.phone, message);
                            } catch (error) {
                                console.error(`Failed to send SOS to ${contact.name}:`, error);
                            }
                        }, index * 300); // Small delay between each SMS
                    });
                }
            }
            
            // Update UI state
            setSending(false);
            setSent(true);
            
            // Reset after showing success message
            setTimeout(() => {
                setShowConfirm(false);
                setSent(false);
            }, 3000);
        }, 800);
    };

    return (
        <div className={`sos-container ${className || ''}`}>
            <button 
                onClick={handleSOSClick} 
                className={`sos-button ${!hasContacts ? 'sos-add' : ''}`}
                title={hasContacts ? "Send emergency SOS" : "Add emergency contacts first"}
            >
                {hasContacts ? 'SOS' : '+ SOS'}
            </button>
            
            {showConfirm && (
                <div className="sos-confirm">
                    {!sending && !sent ? (
                        <>
                            <div className="sos-confirm-header">
                                <span className="sos-alert-icon">⚠️</span>
                                <h3>Send Emergency Alert?</h3>
                            </div>
                            <p>This will prepare SMS messages to your emergency contacts asking for immediate help.</p>
                            <div className="sos-confirm-buttons">
                                <button onClick={handleConfirmSOS} className="confirm-button">
                                    Yes, Send Alert
                                </button>
                                <button onClick={handleCancel} className="cancel-button">
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : sending ? (
                        <div className="sos-sending">
                            <div className="sending-spinner"></div>
                            <p>Preparing emergency messages...</p>
                        </div>
                    ) : sent ? (
                        <div className="sos-sent">
                            <div className="sent-icon">✓</div>
                            <p>Messages ready to send!</p>
                            <small className="sent-note">Please confirm each message in your messaging app</small>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SOSButton;