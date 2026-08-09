import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Allow requests from frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Safely parse body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, email, message } = body || {};

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Please fill in all fields (Name, Email, Message)." });
    }

    // Send via Resend
    const data = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: ["portfolioofkrishna@gmail.com"], // ⚠️ MUST BE THE EXACT EMAIL YOU SIGNED UP WITH ON RESEND.COM
      replyTo: email,
      subject: `New Portfolio Message from ${name}`,
      html: `
<table width="100%" bgcolor="#111111" cellpadding="20" cellspacing="0">
  <tr>
    <td align="center">
      
      <!-- Main Email Container -->
      <table bgcolor="#1a1a1a" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; margin: 0 auto;">
        
        <!-- Top Purple Header Section -->
        <tr>
          <td bgcolor="#6b4bd1">
            <table width="100%" cellpadding="30" cellspacing="0">
              <tr>
                <td>
                  <!-- "New Inquiry" Badge -->
                  <table bgcolor="#4a3090" cellpadding="4" cellspacing="0" style="border-radius: 20px;">
                    <tr>
                      <td>
                        <font color="#ffffff" face="Arial, sans-serif" size="1">
                          <b>&#9679; NEW INQUIRY</b>
                        </font>
                      </td>
                    </tr>
                  </table>
                  
                  <br>
                  
                  <!-- Main Title -->
                  <font color="#ffffff" face="Arial, sans-serif" size="5">
                    <b>Portfolio Contact<br>Message</b>
                  </font>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Dark Middle Body Section -->
        <tr>
          <td>
            <table width="100%" cellpadding="30" cellspacing="0">
              <tr>
                <td>
                  
                  <!-- From & Email Details Box -->
                  <table width="100%" bgcolor="#333333" cellpadding="1" cellspacing="0" style="border-radius: 12px; overflow: hidden;">
                    <tr>
                      <td>
                        <table width="100%" bgcolor="#222222" cellpadding="15" cellspacing="0" style="border-radius: 11px;">
                          <tr>
                            <td>
                              <font color="#c4a5ff" face="Arial, sans-serif" size="1">
                                <b>FROM</b>
                              </font>
                              <br>
                              <font color="#ffffff" face="Arial, sans-serif" size="3">
                                <b>${name}</b>
                              </font>
                              <br><br>
                              
                              <font color="#c4a5ff" face="Arial, sans-serif" size="1">
                                <b>EMAIL ADDRESS</b>
                              </font>
                              <br>
                              <font color="#e0caff" face="Arial, sans-serif" size="2">
                                <b>
                                  <a href="mailto:${email}" style="text-decoration: none; color: #e0caff;">
                                    <font color="#e0caff">${email}</font>
                                  </a>
                                </b>
                              </font>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <br><br>

                  <!-- Message Content Label -->
                  <font color="#999999" face="Arial, sans-serif" size="1">
                    <b>MESSAGE CONTENT</b>
                  </font>
                  <br><br>

                  <!-- Message Box with Left Purple Border -->
                  <table width="100%" bgcolor="#333333" cellpadding="1" cellspacing="0" style="border-radius: 12px; overflow: hidden;">
                    <tr>
                      <td>
                        <table width="100%" bgcolor="#111111" cellpadding="0" cellspacing="0" style="border-radius: 11px; overflow: hidden;">
                          <tr>
                            <!-- Left Purple Border -->
                            <td width="4" bgcolor="#9b6aff"></td>
                            <td>
                              <table cellpadding="15" cellspacing="0">
                                <tr>
                                  <td>
                                    <font color="#ffffff" face="Arial, sans-serif" size="2">
                                      ${message}
                                    </font>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <br><br><br>

                  <!-- Call to Action Button -->
                  <table width="100%" bgcolor="#6b4bd1" cellpadding="12" cellspacing="0" style="border-radius: 8px;">
                    <tr>
                      <td align="center">
                        <font face="Arial, sans-serif" size="3">
                          <b>
                            <!-- Added outline: none and -webkit-tap-highlight-color to remove the blue click/tap box -->
                            <a href="mailto:${email}?subject=Re: Your message to my portfolio&body=Hi ${name},%0D%0A%0D%0A" style="text-decoration: none; color: #ffffff; outline: none; -webkit-tap-highlight-color: transparent;">
                              <font color="#ffffff">Reply Directly to ${name}</font>
                            </a>
                          </b>
                        </font>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Bottom Footer Section -->
        <tr>
          <td bgcolor="#222222">
            <table width="100%" cellpadding="15" cellspacing="0">
              <tr>
                <td align="center">
                  <font color="#888888" face="Arial, sans-serif" size="1">
                    Sent automatically via <b>Krishna Aryal Portfolio</b>
                  </font>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
      
    </td>
  </tr>
</table>
`,
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Server error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to send email" });
  }
}
