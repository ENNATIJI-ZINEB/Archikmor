require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const { sendContactNotification, sendContactConfirmation, sendNewsletterNotification, sendNewsletterConfirmation, sendCatalogueEmail } = require('./email');
const { getSupabaseClient } = require('./db');

const app = express();
const PORT = process.env.PORT || 3004;
const submissionsFile = path.join(__dirname, '..', 'data', 'contact-submissions.json');

const newsletterFile = path.join(__dirname, '..', 'data', 'newsletter-subscribers.json');

app.use(cors());
app.use(express.json());

// Serve static files (CSS, images, etc.)
const publicPath = path.join(__dirname, '..');
app.use(express.static(publicPath));

// Root route handler - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// Catalogue PDF download endpoint
app.get('/api/catalogue/download', (req, res) => {
    const cataloguePath = path.join(__dirname, '..', 'catalogue', 'Archikmor-Catalog2026.pdf');
    
    // Log download request
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';
    console.log('📥 Catalogue download requested:', {
        ip: clientIP,
        userAgent: userAgent.substring(0, 50),
        timestamp: new Date().toISOString(),
    });

    // Check if file exists
    fsSync.access(cataloguePath, fsSync.constants.F_OK, (err) => {
        if (err) {
            console.error('❌ Catalogue file not found:', cataloguePath);
            return res.status(404).json({ error: 'Catalogue file not found' });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Archikmor-Catalog2026.pdf"');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Stream the file
        const fileStream = fsSync.createReadStream(cataloguePath);
        fileStream.pipe(res);
        
        fileStream.on('end', () => {
            console.log('✅ Catalogue download completed');
        });
        
        fileStream.on('error', (error) => {
            console.error('❌ Error streaming catalogue file:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to download catalogue' });
            }
        });
    });
});

// Email catalogue endpoint
app.post('/api/catalogue/email', async (req, res) => {
    const { email } = req.body ?? {};
    const sanitizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!sanitizedEmail) {
        return res.status(400).json({ error: 'Email address is required.' });
    }

    if (!isValidEmail(sanitizedEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Check SMTP configuration before attempting to send
    const { validateSMTPConfig } = require('./email');
    const smtpConfigured = validateSMTPConfig();

    if (!smtpConfigured) {
        return res.status(503).json({
            error: 'Email service is currently unavailable. Please try downloading the catalogue directly or contact us for assistance.',
            errorType: 'smtp_config_missing',
        });
    }

    // Verify catalogue file exists before attempting to send
    const cataloguePath = path.join(__dirname, '..', 'catalogue', 'Archikmor-Catalog2026.pdf');
    if (!fsSync.existsSync(cataloguePath)) {
        console.error('❌ Catalogue file not found:', cataloguePath);
        return res.status(404).json({
            error: 'Catalogue file not found. Please contact support.',
            errorType: 'file_not_found',
            filePath: cataloguePath,
        });
    }

    // Check file size (many email servers have attachment size limits around 10-25MB)
    const fileStats = fsSync.statSync(cataloguePath);
    const fileSizeMB = fileStats.size / (1024 * 1024);
    if (fileSizeMB > 25) {
        console.warn('⚠️  Warning: Catalogue file size is', fileSizeMB.toFixed(2), 'MB, may exceed email server limits');
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
        // Check if it's an SMTP configuration error
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
});

// Test sending contact confirmation email
app.post('/api/test-contact-confirmation', async (req, res) => {
    const { email, name } = req.body ?? {};
    const testEmail = email || process.env.SMTP_EMAIL || 'test@example.com';
    const testName = name || 'Test User';

    try {
        const { sendContactConfirmation } = require('./email');
        const testSubmission = {
            name: testName,
            email: testEmail,
            project: 'Test Project',
            message: 'This is a test email to verify the confirmation email system is working.',
        };

        const result = await sendContactConfirmation(testSubmission);
        res.json({
            success: true,
            message: 'Test confirmation email sent successfully!',
            details: {
                to: testEmail,
                messageId: result.messageId,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            details: {
                code: error.code,
                command: error.command,
                response: error.response,
            },
            smtpConfig: {
                host: process.env.SMTP_HOST || 'N/A',
                port: process.env.SMTP_PORT || 'N/A',
                email: process.env.SMTP_EMAIL ? 'Set' : 'Missing',
                password: process.env.SMTP_PASSWORD ? 'Set' : 'Missing',
            },
        });
    }
});

// Test SMTP connection endpoint
app.get('/api/test-email', async (_req, res) => {
    try {
        const { sendContactNotification } = require('./email');
        const nodemailer = require('nodemailer');
        
        // Test transporter
        const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        await transporter.verify();
        
        res.json({ 
            success: true, 
            message: 'SMTP connection successful!',
            config: {
                host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
                port: smtpPort,
                email: process.env.SMTP_EMAIL ? 'Set' : 'Missing',
                password: process.env.SMTP_PASSWORD ? 'Set' : 'Missing',
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: {
                code: error.code,
                command: error.command,
            }
        });
    }
});

// Test catalogue email endpoint
app.post('/api/test-catalogue-email', async (req, res) => {
    const { email } = req.body ?? {};
    const testEmail = email || process.env.SMTP_EMAIL || 'test@example.com';
    
    try {
        // Check SMTP configuration
        const smtpConfig = {
            host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
            port: process.env.SMTP_PORT || '587',
            email: process.env.SMTP_EMAIL || 'N/A',
            password: process.env.SMTP_PASSWORD ? 'Set' : 'Missing',
        };
        
        // Check catalogue file
        const cataloguePath = path.join(__dirname, '..', 'catalogue', 'Archikmor-Catalog2026.pdf');
        const fileExists = fsSync.existsSync(cataloguePath);
        const fileSize = fileExists ? fsSync.statSync(cataloguePath).size : 0;
        
        // Try to send the catalogue email
        await sendCatalogueEmail(testEmail);
        
        res.json({
            success: true,
            message: 'Catalogue email test successful!',
            testEmail: testEmail,
            smtpConfig: {
                ...smtpConfig,
                password: 'Hidden',
            },
            catalogueFile: {
                path: cataloguePath,
                exists: fileExists,
                size: fileSize,
                sizeMB: (fileSize / (1024 * 1024)).toFixed(2),
            },
        });
    } catch (error) {
        const cataloguePath = path.join(__dirname, '..', 'catalogue', 'Archikmor-Catalog2026.pdf');
        
        res.status(500).json({
            success: false,
            error: error.message,
            testEmail: testEmail,
            diagnostics: {
                errorCode: error.code || 'N/A',
                errorCommand: error.command || 'N/A',
                smtpResponse: error.response || 'N/A',
                smtpConfig: {
                    host: process.env.SMTP_HOST || 'N/A',
                    port: process.env.SMTP_PORT || 'N/A',
                    email: process.env.SMTP_EMAIL || 'N/A',
                    password: process.env.SMTP_PASSWORD ? 'Set' : 'Missing',
                },
                catalogueFile: {
                    path: cataloguePath,
                    exists: fsSync.existsSync(cataloguePath),
                },
            },
        });
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, project, message } = req.body ?? {};

    const sanitizedName = typeof name === 'string' ? name.trim() : '';
    const sanitizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const sanitizedProject = typeof project === 'string' ? project.trim() : '';
    const sanitizedMessage = typeof message === 'string' ? message.trim() : '';

    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
        return res.status(400).json({
            error: 'Missing required fields. Please provide name, email, and message.',
        });
    }
    if (!isValidEmail(sanitizedEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const submission = {
        id: crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'),
        name: sanitizedName,
        email: sanitizedEmail,
        project: sanitizedProject,
        message: sanitizedMessage,
        receivedAt: new Date().toISOString(),
    };

    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert([
                {
                    id: submission.id,
                    name: submission.name,
                    email: submission.email,
                    project: submission.project || null,
                    message: submission.message,
                    received_at: submission.receivedAt,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Failed to store contact submission in database:', error);
            throw error;
        }

        console.info('📝 Contact submission received', {
            name: sanitizedName,
            email: sanitizedEmail,
            project: sanitizedProject || 'Not specified',
        });

        // Check SMTP configuration before attempting to send emails
        const { validateSMTPConfig } = require('./email');
        const smtpConfigured = validateSMTPConfig();

        // Send emails asynchronously - don't fail the request if emails fail
        const emailPromises = Promise.all([
            sendContactNotification(submission).catch(err => {
                console.error('❌ Failed to send notification email to Sales@archikmor.com');
                console.error('   Error details:', {
                    message: err.message,
                    code: err.code,
                    command: err.command,
                    response: err.response,
                });
                if (err.code === 'EAUTH' || err.code === 'ECONNECTION') {
                    console.error('   ⚠️  SMTP Authentication/Connection Error');
                    console.error('   SMTP Host:', process.env.SMTP_HOST || 'N/A');
                    console.error('   SMTP Port:', process.env.SMTP_PORT || 'N/A');
                    console.error('   SMTP Email:', process.env.SMTP_EMAIL || 'N/A');
                }
                return { success: false, error: err.message };
            }),
            sendContactConfirmation(submission).catch(err => {
                console.error('❌ Failed to send confirmation email to user:', submission.email);
                console.error('   Error details:', {
                    message: err.message,
                    code: err.code,
                    command: err.command,
                    response: err.response,
                });
                if (err.code === 'EAUTH' || err.code === 'ECONNECTION') {
                    console.error('   ⚠️  SMTP Authentication/Connection Error');
                    console.error('   SMTP Host:', process.env.SMTP_HOST || 'N/A');
                    console.error('   SMTP Port:', process.env.SMTP_PORT || 'N/A');
                    console.error('   SMTP Email:', process.env.SMTP_EMAIL || 'N/A');
                    console.error('   SMTP Password:', process.env.SMTP_PASSWORD ? '✓ Set' : '✗ Missing');
                }
                return { success: false, error: err.message };
            }),
        ]);

        // Wait for email results to provide accurate feedback
        const emailResults = await emailPromises;
        const [notificationResult, confirmationResult] = emailResults;

        if (notificationResult?.success) {
            console.log('✅ Notification email sent successfully to Sales@archikmor.com');
            console.log('   Message ID:', notificationResult.messageId);
        } else {
            console.warn('⚠️  Notification email may not have been sent');
            if (notificationResult?.error) {
                console.warn('   Error:', notificationResult.error);
            }
        }

        if (confirmationResult?.success) {
            console.log('✅ Confirmation email sent successfully to user:', submission.email);
            console.log('   Message ID:', confirmationResult.messageId);
        } else {
            console.error('❌ Confirmation email FAILED to send to:', submission.email);
            if (confirmationResult?.error) {
                console.error('   Error:', confirmationResult.error);
            }
            console.error('   ⚠️  ACTION REQUIRED: Check SMTP configuration in .env file');
        }

        // Determine response message based on email results
        let responseMessage = 'Thank you for reaching out! We will get back to you shortly.';
        let emailStatus = 'partial';

        if (!smtpConfigured) {
            responseMessage = 'Thank you for reaching out! Your message has been received. However, email notifications are currently unavailable. We will contact you directly.';
            emailStatus = 'unavailable';
        } else if (confirmationResult?.success) {
            responseMessage = 'Thank you for reaching out! We will get back to you shortly. A confirmation email has been sent to your inbox.';
            emailStatus = 'success';
        } else if (confirmationResult?.error) {
            responseMessage = 'Thank you for reaching out! Your message has been received, but we were unable to send a confirmation email. We will contact you directly.';
            emailStatus = 'failed';
        }

        res.status(201).json({ 
            success: true, 
            message: responseMessage,
            emailStatus: emailStatus,
            emailSent: confirmationResult?.success || false
        });
    } catch (error) {
        console.error('Failed to store contact submission', error);
        res.status(500).json({ error: 'Unable to save your request right now. Please try again later.' });
    }
});

app.post('/api/newsletter', async (req, res) => {
    const { name, email } = req.body ?? {};
    const sanitizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const sanitizedName = typeof name === 'string' ? name.trim() : '';

    if (!sanitizedEmail) {
        return res.status(400).json({ error: 'Email is required to subscribe.' });
    }

    if (!isValidEmail(sanitizedEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const subscriber = {
        id: crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'),
        name: sanitizedName,
        email: sanitizedEmail,
        subscribedAt: new Date().toISOString(),
    };

    try {
        const supabase = getSupabaseClient();
        
        // Check if email already exists
        const { data: existingSubscriber, error: selectError } = await supabase
            .from('newsletter_subscribers')
            .select('email')
            .eq('email', sanitizedEmail)
            .maybeSingle();

        // If selectError exists and it's not a "not found" error, log it but continue
        if (selectError && selectError.code !== 'PGRST116') {
            console.warn('Warning: Error checking for existing subscriber:', selectError.message);
        }

        if (existingSubscriber) {
            console.info('Newsletter subscription duplicate ignored', sanitizedEmail);
            return res.status(200).json({
                success: true,
                message: 'You are already subscribed. Thank you for staying in touch!',
            });
        }

        // Insert new subscriber
        const { data, error: insertError } = await supabase
            .from('newsletter_subscribers')
            .insert([
                {
                    id: subscriber.id,
                    name: subscriber.name || null,
                    email: subscriber.email,
                    subscribed_at: subscriber.subscribedAt,
                },
            ])
            .select()
            .single();

        if (insertError) {
            // Handle unique constraint violation (duplicate email)
            if (insertError.code === '23505' || insertError.message?.includes('unique')) {
                console.info('Newsletter subscription duplicate ignored (unique constraint)', sanitizedEmail);
                return res.status(200).json({
                    success: true,
                    message: 'You are already subscribed. Thank you for staying in touch!',
                });
            }
            console.error('Failed to store newsletter subscription in database:', insertError);
            throw insertError;
        }

        console.info('Newsletter subscription received', subscriber);

        // Check SMTP configuration before attempting to send emails
        const { validateSMTPConfig } = require('./email');
        const smtpConfigured = validateSMTPConfig();

        // Send emails asynchronously - don't fail the request if emails fail
        const emailPromises = Promise.all([
            sendNewsletterNotification(subscriber).catch(err => {
                console.error('❌ Failed to send newsletter notification email to Sales@archikmor.com');
                console.error('   Error details:', {
                    message: err.message,
                    code: err.code,
                    command: err.command,
                });
                return { success: false, error: err.message };
            }),
            sendNewsletterConfirmation(subscriber).catch(err => {
                console.error('❌ Failed to send newsletter confirmation email to subscriber:', subscriber.email);
                console.error('   Error details:', {
                    message: err.message,
                    code: err.code,
                    command: err.command,
                });
                return { success: false, error: err.message };
            }),
        ]);

        // Wait for email results to provide accurate feedback
        const emailResults = await emailPromises;
        const [notificationResult, confirmationResult] = emailResults;

        if (notificationResult?.success) {
            console.log('✅ Newsletter notification email sent successfully');
        } else {
            console.warn('⚠️  Newsletter notification email may not have been sent');
            if (notificationResult?.error) {
                console.warn('   Error:', notificationResult.error);
            }
        }

        if (confirmationResult?.success) {
            console.log('✅ Newsletter confirmation email sent successfully');
        } else {
            console.error('❌ Newsletter confirmation email FAILED to send to:', subscriber.email);
            if (confirmationResult?.error) {
                console.error('   Error:', confirmationResult.error);
            }
            console.error('   ⚠️  ACTION REQUIRED: Check SMTP configuration in .env file');
        }

        // Determine response message based on email results
        let responseMessage = 'Welcome aboard! You will start receiving our updates shortly.';
        let emailStatus = 'partial';

        if (!smtpConfigured) {
            responseMessage = 'Thank you for subscribing! Your subscription has been recorded. However, email notifications are currently unavailable. We will contact you directly.';
            emailStatus = 'unavailable';
        } else if (confirmationResult?.success) {
            responseMessage = 'Welcome aboard! You will start receiving our updates shortly. A confirmation email has been sent to your inbox.';
            emailStatus = 'success';
        } else if (confirmationResult?.error) {
            responseMessage = 'Thank you for subscribing! Your subscription has been recorded, but we were unable to send a confirmation email. We will contact you directly.';
            emailStatus = 'failed';
        }

        return res.status(201).json({
            success: true,
            message: responseMessage,
            emailStatus: emailStatus,
            emailSent: confirmationResult?.success || false
        });
    } catch (error) {
        console.error('Failed to store newsletter subscription', error);
        return res.status(500).json({ error: 'Unable to subscribe right now. Please try again later.' });
    }
});

// Legacy file-based functions - kept for reference/backup
// These are no longer used after Supabase integration
/*
async function readEntries(filePath) {
    try {
        const fileContents = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(fileContents);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function writeEntries(filePath, entries) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(entries, null, 2));
}

async function appendEntry(filePath, entry) {
    const entries = await readEntries(filePath);
    entries.push(entry);
    await writeEntries(filePath, entries);
}
*/

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (require.main === module) {
    // Log environment configuration status
    console.log('\n📋 Environment Configuration:');
    console.log('   SMTP_HOST:', process.env.SMTP_HOST || 'smtpout.secureserver.net (default)');
    console.log('   SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');
    console.log('   SMTP_EMAIL:', process.env.SMTP_EMAIL ? '✓ Set' : '✗ Missing');
    console.log('   SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✓ Set' : '✗ Missing');
    console.log('   NOTIFICATION_EMAIL:', process.env.NOTIFICATION_EMAIL || 'Sales@archikmor.com (default)');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
    console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing');
    console.log('');

    // Validate SMTP configuration on startup
    const { validateSMTPConfig } = require('./email');
    const smtpConfigured = validateSMTPConfig();
    
    if (!smtpConfigured) {
        console.warn('⚠️  WARNING: SMTP configuration is missing or incomplete!');
        console.warn('   Email confirmations will not be sent until SMTP is configured.');
        console.warn('   Please set SMTP_EMAIL and SMTP_PASSWORD in your .env file.');
        console.warn('   Contact form and newsletter submissions will still be saved to the database.\n');
    } else {
        console.log('✅ SMTP configuration validated successfully');
        console.log('   Email notifications are enabled.\n');
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 ARCHIKMOR backend listening on http://0.0.0.0:${PORT}`);
        console.log(`   Accessible from network at http://<your-ip>:${PORT}`);
        console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });
}

module.exports = app;

