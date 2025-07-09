import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const emailTemplates = {
  email_verification: {
    subject: "Please verify your email to activate your ClearMarket account",
    html: (data: any) => `
      <h1>Welcome to ClearMarket!</h1>
      <p>Hi ${data.name || 'there'},</p>
      <p>Thank you for signing up for ClearMarket. To activate your account, please verify your email address by clicking the link below:</p>
      <p><a href="${data.confirmationUrl}" style="color: #2563eb; text-decoration: underline;">Verify Email Address</a></p>
      <p>If you can't click the link, copy and paste this URL into your browser:</p>
      <p>${data.confirmationUrl}</p>
      <p>This link will expire in 24 hours for security reasons.</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `,
    text: (data: any) => `
      Welcome to ClearMarket!
      
      Hi ${data.name || 'there'},
      
      Thank you for signing up for ClearMarket. To activate your account, please verify your email address by visiting this link:
      
      ${data.confirmationUrl}
      
      This link will expire in 24 hours for security reasons.
      
      Best regards,
      The ClearMarket Team
    `
  },
  post_verification_welcome: {
    subject: "Welcome to ClearMarket – Let's Get Started",
    html: (data: any) => `
      <h1>Welcome to ClearMarket, ${data.name || 'there'}!</h1>
      <p>Congratulations! Your email has been verified and your account is now active.</p>
      <p>As a ${data.role || 'member'}, you can now:</p>
      <ul>
        ${data.role === 'vendor' ? 
          '<li>Search for qualified field representatives in your area</li><li>Unlock contact information using credits</li><li>Leave reviews for completed work</li><li>Post coverage requests</li>' :
          '<li>Complete your profile to attract vendors</li><li>Participate in the community board</li><li>Earn credits through helpful contributions</li><li>Build your professional network</li>'
        }
      </ul>
      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Complete your profile to increase your visibility</li>
        <li>Explore the platform features</li>
        <li>Connect with other professionals in your network</li>
      </ol>
      <p>Need help getting started? Visit our <a href="${data.helpUrl || '#'}" style="color: #2563eb;">Help Center</a> or reply to this email.</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `,
    text: (data: any) => `
      Welcome to ClearMarket, ${data.name || 'there'}!
      
      Congratulations! Your email has been verified and your account is now active.
      
      As a ${data.role || 'member'}, you're now ready to get started with ClearMarket.
      
      Next Steps:
      1. Complete your profile to increase your visibility
      2. Explore the platform features
      3. Connect with other professionals in your network
      
      Best regards,
      The ClearMarket Team
    `
  },
  contact_unlock: {
    subject: (data: any) => `You unlocked contact info for ${data.rep_name || 'a field representative'}`,
    html: (data: any) => `
      <h1>Contact Unlocked Successfully!</h1>
      <p>Hi ${data.unlocker_name || 'there'},</p>
      <p>You have successfully unlocked contact information for <strong>${data.rep_name || 'a field representative'}</strong>.</p>
      <p>You can now view their full profile and contact details in your network.</p>
      <p><strong>Contact Details:</strong></p>
      <ul>
        ${data.contact_email ? `<li>Email: ${data.contact_email}</li>` : ''}
        ${data.contact_phone ? `<li>Phone: ${data.contact_phone}</li>` : ''}
        ${data.coverage_areas ? `<li>Coverage Areas: ${data.coverage_areas}</li>` : ''}
      </ul>
      <p>Credits used: ${data.credits_used || 1}</p>
      <p>Remember to leave a review after working together to help build trust in our community.</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `,
    text: (data: any) => `
      Contact Unlocked Successfully!
      
      Hi ${data.unlocker_name || 'there'},
      
      You have successfully unlocked contact information for ${data.rep_name || 'a field representative'}.
      
      Credits used: ${data.credits_used || 1}
      
      Best regards,
      The ClearMarket Team
    `
  },
  credit_low_warning: {
    subject: (data: any) => `${data.vendor_name || 'Your ClearMarket account'} credits are running low`,
    html: (data: any) => `
      <h1>Credit Low Warning</h1>
      <p>Hi ${data.vendor_name || 'there'},</p>
      <p>You currently have <strong>${data.credits_remaining || 0} credits</strong> remaining in your ClearMarket account.</p>
      <p>To continue unlocking contacts and using premium features, consider:</p>
      <ul>
        <li><strong>Purchase more credits</strong> - Get instant access to continue networking</li>
        <li><strong>Earn credits</strong> by participating in the community board</li>
        <li><strong>Leave helpful reviews</strong> after working with field representatives</li>
        <li><strong>Refer new members</strong> to earn bonus credits</li>
      </ul>
      <p><a href="${data.purchase_url || '#'}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Purchase Credits</a></p>
      <p>Questions? Reply to this email or contact our support team.</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `,
    text: (data: any) => `
      Credit Low Warning
      
      Hi ${data.vendor_name || 'there'},
      
      You currently have ${data.credits_remaining || 0} credits remaining in your ClearMarket account.
      
      To continue unlocking contacts, consider purchasing more credits or earning them through community participation.
      
      Best regards,
      The ClearMarket Team
    `
  },
  feedback_request: {
    subject: (data: any) => `How was your experience with ${data.rep_name || 'your field representative'}?`,
    html: (data: any) => `
      <h1>Share Your Experience</h1>
      <p>Hi ${data.vendor_name || 'there'},</p>
      <p>It's been 14 days since you connected with <strong>${data.rep_name || 'a field representative'}</strong> through ClearMarket.</p>
      <p>Your feedback helps build trust in our community and helps other vendors make informed decisions.</p>
      <p><strong>How was your experience?</strong></p>
      <p>Please take a moment to leave a review:</p>
      <p><a href="${data.review_url || '#'}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Leave a Review</a></p>
      <p>Your honest feedback about:</p>
      <ul>
        <li>Quality of work performed</li>
        <li>Communication and professionalism</li>
        <li>Timeliness and reliability</li>
        <li>Overall satisfaction</li>
      </ul>
      <p>Reviews help field representatives improve their services and help vendors find the best professionals for their needs.</p>
      <p>Thank you for being part of the ClearMarket community!</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `,
    text: (data: any) => `
      Share Your Experience
      
      Hi ${data.vendor_name || 'there'},
      
      It's been 14 days since you connected with ${data.rep_name || 'a field representative'} through ClearMarket.
      
      Please consider leaving a review to help build trust in our community.
      
      Visit: ${data.review_url || '#'}
      
      Best regards,
      The ClearMarket Team
    `
  },
  boost_activation: {
    subject: (data: any) => `Your ClearMarket profile${data.rep_name ? ` (${data.rep_name})` : ''} is now boosted`,
    html: (data: any) => `
      <h1>Profile Boost Activated!</h1>
      <p>Hi ${data.rep_name || 'there'},</p>
      <p>Great news! Your ClearMarket profile boost is now active.</p>
      <p><strong>What this means for you:</strong></p>
      <ul>
        <li>🔥 Enhanced visibility in search results</li>
        <li>⭐ Premium placement in vendor searches</li>
        <li>📈 Increased profile views and connections</li>
        <li>🎯 Priority display in coverage area searches</li>
      </ul>
      <p><strong>Boost Details:</strong></p>
      <ul>
        <li>Activation Date: ${data.boost_start_date || 'Today'}</li>
        <li>Expiration Date: ${data.boost_expiration_date || 'In 30 days'}</li>
        <li>Current Trust Score: ${data.trust_score || 'N/A'}</li>
      </ul>
      <p>Make the most of your boost by:</p>
      <ol>
        <li>Ensuring your profile is 100% complete</li>
        <li>Updating your coverage areas and availability</li>
        <li>Staying active in the community board</li>
      </ol>
      <p>Track your boost performance in your dashboard.</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `,
    text: (data: any) => `
      Profile Boost Activated!
      
      Hi ${data.rep_name || 'there'},
      
      Your ClearMarket profile boost is now active with enhanced visibility in search results.
      
      Boost expires: ${data.boost_expiration_date || 'In 30 days'}
      
      Best regards,
      The ClearMarket Team
    `
  },
  boost_expiration: {
    subject: "Your profile boost is about to expire",
    html: (data: any) => `
      <h1>Boost Expiring Soon</h1>
      <p>Hi ${data.rep_name || 'there'},</p>
      <p>This is a friendly reminder that your ClearMarket profile boost will expire in <strong>24 hours</strong>.</p>
      <p><strong>Expiration Details:</strong></p>
      <ul>
        <li>Expires: ${data.boost_expiration_date || 'Tomorrow'}</li>
        <li>Current Trust Score: ${data.trust_score || 'N/A'}</li>
        <li>Profile Views During Boost: ${data.profile_views || 'Available in dashboard'}</li>
      </ul>
      <p>To maintain your enhanced visibility in search results and continue attracting more vendor connections:</p>
      <p><a href="${data.renew_boost_url || '#'}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Renew Your Boost</a></p>
      <p><strong>Why renew?</strong></p>
      <ul>
        <li>Maintain premium placement in searches</li>
        <li>Continue increased profile visibility</li>
        <li>Stay ahead of competition</li>
        <li>Maximize networking opportunities</li>
      </ul>
      <p>Questions about boost renewal? Contact our support team.</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `,
    text: (data: any) => `
      Boost Expiring Soon
      
      Hi ${data.rep_name || 'there'},
      
      Your ClearMarket profile boost will expire in 24 hours.
      
      Expires: ${data.boost_expiration_date || 'Tomorrow'}
      
      To maintain enhanced visibility, consider renewing your boost.
      
      Best regards,
      The ClearMarket Team
    `
  },
  referral_credit: {
    subject: (data: any) => `Your referral ${data.referral_name || 'just joined'} ClearMarket – 1 credit earned`,
    html: (data: any) => `
      <h1>Referral Success! 🎉</h1>
      <p>Hi ${data.referrer_name || 'there'},</p>
      <p>Excellent news! Your referral <strong>${data.referral_name || 'has'}</strong> just joined the ClearMarket network.</p>
      <p><strong>Reward Details:</strong></p>
      <ul>
        <li>✅ Referral joined and verified their account</li>
        <li>🎁 <strong>1 credit</strong> has been added to your account</li>
        <li>💰 New account balance: ${data.new_credit_balance || 'Check your dashboard'} credits</li>
      </ul>
      <p><strong>How it works:</strong></p>
      <p>Your referral credit is tied to our connection logic. As your referred member becomes more active in the network and builds connections, you may earn additional rewards.</p>
      <p><strong>Keep referring!</strong></p>
      <p>Share ClearMarket with other professionals in your network:</p>
      <ul>
        <li>Field representatives looking for vendor connections</li>
        <li>Vendors seeking reliable field services</li>
        <li>Industry professionals who value networking</li>
      </ul>
      <p><a href="${data.referral_link || '#'}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Your Referral Link</a></p>
      <p>Thank you for helping grow the ClearMarket community!</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `,
    text: (data: any) => `
      Referral Success!
      
      Hi ${data.referrer_name || 'there'},
      
      Your referral ${data.referral_name || 'has'} just joined ClearMarket and you've earned 1 credit!
      
      New balance: ${data.new_credit_balance || 'Check your dashboard'} credits
      
      Keep sharing ClearMarket to earn more rewards.
      
      Best regards,
      The ClearMarket Team
    `
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailType, toEmail, userId, templateData } = await req.json();

    if (!emailTemplates[emailType]) {
      throw new Error("Invalid email type");
    }

    const template = emailTemplates[emailType];
    const data = templateData || {};
    
    // Handle dynamic subjects
    const subject = typeof template.subject === 'function' 
      ? template.subject(data) 
      : template.subject;
    
    const htmlContent = template.html(data);
    const textContent = template.text ? template.text(data) : null;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "ClearMarket <noreply@clearmarket.io>",
      to: [toEmail],
      subject: subject,
      html: htmlContent,
      ...(textContent && { text: textContent })
    });

    // Log email in database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("sent_emails").insert({
      user_id: userId,
      to_email: toEmail,
      subject: subject,
      email_type: emailType,
      status: emailResponse.error ? 'failed' : 'sent',
      metadata: { 
        resend_id: emailResponse.data?.id,
        template_data: templateData,
        error: emailResponse.error?.message
      }
    });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});