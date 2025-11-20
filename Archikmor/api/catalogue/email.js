// Email catalogue endpoint for Vercel serverless function
const path = require('path');
const fsSync = require('fs');
const { sendCatalogueEmail, validateSMTPConfig } = require('../../lib/email');

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body ?? {};
    const sanitizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!sanitizedEmail) {
        return res.status(400).json({ error: 'Email address is required.' });
    }

    if (!isValidEmail(sanitizedEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Check SMTP configuration before attempting to send
    const smtpConfigured = validateSMTPConfig();

    if (!smtpConfigured) {
        return res.status(503).json({
            error: 'Email service is currently unavailable. Please try downloading the catalogue directly or contact us for assistance.',
            errorType: 'smtp_config_missing',
        });
    }

    // Verify catalogue file exists before attempting to send
    const cataloguePath = path.join(process.cwd(), 'catalogue', 'Archikmor-Catalog2026.pdf');
    if (!fsSync.existsSync(cataloguePath)) {
        console.error('❌ Catalogue file not found:', cataloguePath);
        return res.status(404).json({
            error: 'Catalogue file not found. Please contact support.',
            errorType: 'file_not_found',
            filePath: cataloguePath,
        });
    }

    // Check file size and warn if too large
    const MAX_ATTACHMENT_SIZE_MB = 25; // Common limit for email providers
    const fileStats = fsSync.statSync(cataloguePath);
    const fileSizeMB = fileStats.size / (1024 * 1024);
    if (fileSizeMB > MAX_ATTACHMENT_SIZE_MB) {
        console.warn(`⚠️  Catalogue file size (${fileSizeMB.toFixed(2)}MB) exceeds recommended maximum attachment size (${MAX_ATTACHMENT_SIZE_MB}MB). Email sending may fail.`);
    }

    try {
        await sendCatalogueEmail(sanitizedEmail);
        console.info('Catalogue email request processed for:', sanitizedEmail);
        res.status(200).json({
            success: true,
            message: 'Catalogue sent successfully! Please check your email inbox.',
        });
    } catch (error) {
        // Enhanced error logging for diagnostics
        console.error('❌ Failed to send catalogue email');
        console.error('   Request email:', sanitizedEmail);
        console.error('   Error message:', error.message);
        console.error('   Error code:', error.code || 'N/A');
        console.error('   Error command:', error.command || 'N/A');
        
        // Determine error type and user-friendly message
        let errorMessage = 'Unable to send catalogue email right now. Please try again later or contact us directly.';
        let errorType = 'unknown_error';
        let statusCode = 500;
        
        // Check if it's an SMTP authentication error
        if (error.code === 'EAUTH') {
            errorMessage = 'Email service authentication failed. Please check SMTP configuration.';
            errorType = 'smtp_authentication_failed';
            console.error('   ⚠️  SMTP Authentication Error Detected');
            console.error('   SMTP Response:', error.response || 'N/A');
            console.error('   SMTP Host:', process.env.SMTP_HOST || 'N/A');
            console.error('   SMTP Port:', process.env.SMTP_PORT || 'N/A');
            console.error('   SMTP Email:', process.env.SMTP_EMAIL || 'N/A');
            console.error('   SMTP Password:', process.env.SMTP_PASSWORD ? '✓ Set' : '✗ Missing');
        }
        // Check if it's an SMTP connection error
        else if (error.code === 'ECONNECTION') {
            errorMessage = 'Cannot connect to email server. Please check network and SMTP settings.';
            errorType = 'smtp_connection_failed';
            console.error('   ⚠️  SMTP Connection Error Detected');
            console.error('   SMTP Host:', process.env.SMTP_HOST || 'N/A');
            console.error('   SMTP Port:', process.env.SMTP_PORT || 'N/A');
            console.error('   SMTP Email:', process.env.SMTP_EMAIL || 'N/A');
        }
        // Check if it's a file-related error
        else if (error.message && error.message.includes('Catalogue file not found')) {
            errorMessage = 'Catalogue file not found. Please contact support.';
            errorType = 'file_not_found';
            statusCode = 404;
            console.error('   ⚠️  Catalogue File Error');
            console.error('   Expected path:', cataloguePath);
            console.error('   File exists:', fsSync.existsSync(cataloguePath) ? 'Yes' : 'No');
        }
        // Check if it's an SMTP configuration error (from sendCatalogueEmail)
        else if (error.message && error.message.includes('SMTP configuration is missing')) {
            errorMessage = 'Email service configuration is missing. Please contact support.';
            errorType = 'smtp_config_missing';
            statusCode = 503;
        }
        // Other SMTP errors
        else if (error.response || error.code) {
            errorMessage = `Email service error: ${error.message || 'Unable to send email'}. Please try again later.`;
            errorType = 'smtp_error';
            console.error('   ⚠️  SMTP Error Detected');
            console.error('   SMTP Response:', error.response || 'N/A');
            console.error('   SMTP Host:', process.env.SMTP_HOST || 'N/A');
            console.error('   SMTP Port:', process.env.SMTP_PORT || 'N/A');
            console.error('   SMTP Email:', process.env.SMTP_EMAIL || 'N/A');
        }
        
        // Log full error stack for debugging
        if (error.stack) {
            console.error('   Stack trace:', error.stack);
        }
        
        // Return error response with details
        const errorResponse = {
            error: errorMessage,
            errorType: errorType,
        };
        
        // Include additional details in development mode
        if (process.env.NODE_ENV !== 'production') {
            errorResponse.details = {
                message: error.message,
                code: error.code || null,
                command: error.command || null,
            };
        }
        
        res.status(statusCode).json(errorResponse);
    }
};

