// Newsletter subscription endpoint for Vercel serverless function
const crypto = require('crypto');
const { getSupabaseClient } = require('../lib/db');
const { sendNewsletterNotification, sendNewsletterConfirmation, validateSMTPConfig } = require('../lib/email');

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
};

