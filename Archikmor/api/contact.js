// Contact form submission endpoint for Vercel serverless function
const crypto = require('crypto');
const { getSupabaseClient } = require('../lib/db');
const { sendContactNotification, sendContactConfirmation, validateSMTPConfig } = require('../lib/email');

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
};

